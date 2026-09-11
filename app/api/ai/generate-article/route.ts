import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { url, text, content } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const rawDirectText = (text || content || '').trim();
    let textToProcess = '';

    if (rawDirectText && rawDirectText.length >= 20) {
      // 1. Direct text content provided by user
      textToProcess = rawDirectText.substring(0, 15000);
    } else if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      // 2. Scrape the URL
      let html = '';
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch URL');
        html = await response.text();
      } catch (error: any) {
        return NextResponse.json({ error: 'Could not fetch the provided URL. Ensure it is a valid, publicly accessible article.' }, { status: 400 });
      }

      // Extract text using Cheerio
      const $ = cheerio.load(html);
      // Aggressive cleanup of non-article elements
      $('script, style, nav, header, footer, aside, .ad, .advertisement, [role="banner"], [role="navigation"], .related, .recommended, .trending, .comments, .sidebar, .tags, .newsletter, .share, .social, .outbrain, .taboola').remove();
      
      let mainContent = $('article').text() || $('main').text() || $('.article-content').text() || $('body').text();
      mainContent = mainContent.replace(/\s+/g, ' ').trim();
      textToProcess = mainContent.substring(0, 15000);
    } else {
      return NextResponse.json({ error: 'Please enter a valid news URL or paste news text content.' }, { status: 400 });
    }

    if (textToProcess.length < 30) {
      return NextResponse.json({ error: 'Could not extract enough readable content to generate an article.' }, { status: 400 });
    }

    // 3. Editorial Gemini Prompt (Pass 1 - Generation)
    const systemInstruction = `
You are a source-grounded news editor. The supplied source is your ONLY factual knowledge for this task. 
Every factual statement in your output MUST be directly supported by the source. 
You may paraphrase, reorganise and shorten the source, but you may NOT add external facts, assumptions, predictions, interpretations, causal relationships or broader conclusions. 
If a claim cannot be supported by the supplied source, omit it. Never fill missing information using your general knowledge.
Do NOT invent connections between separate developments.
Use neutral newsroom language. AVOID AI-style phrases like "firing on all cylinders", "game-changing", "massive boom", "historic shift", "reshaping the global landscape", "soaring demand" unless explicitly supported by the source.
SOURCE ACCURACY > ARTICLE LENGTH. Never add unsupported content just to make an article longer.
`;

    const promptPass1 = `
${systemInstruction}

Your task is to read the provided source news text and rewrite it completely into a new, high-quality, professional, ready-to-publish news report following the strict grounding rules.

CRITICAL EDITORIAL FORMATTING RULES FOR THE "content" FIELD:
1. Do NOT clutter the article with sub-headings (do NOT use <h2> or <h3> headings inside the content unless essential).
2. Write the article in smooth, well-structured HTML paragraphs (<p>).
3. Start directly with a strong lead/brief introductory paragraph (<p>).
4. Follow with detailed, well-written narrative body paragraphs (<p>).
5. If there is a key highlight, crucial quote, or important takeaway, include EXACTLY ONE clean callout blockquote (<blockquote class="border-l-4 border-blue-600 pl-4 py-2 my-4 italic text-gray-800 font-medium bg-gray-50 rounded-r">...</blockquote>).
6. Ensure the story flows naturally as clean paragraphs without choppy headings.
7. Naturally bold (wrap in <strong> tags) 2-4 important SEO keywords or key phrases within the paragraphs to improve search engine visibility.
8. After the article paragraphs, add a line starting with **Important notes:** followed by any additional bullet points or remarks, each separated by line breaks.

CATEGORY TAXONOMY RULES:
You MUST assign categories ONLY from this exact allowed list:
[India, Business, Economy, Markets, Banking & Finance, Companies, Startups, Technology, Automobile, Energy, Agriculture, Real Estate, Trade & Exports, Policy & Regulations, Employment, Infrastructure, Healthcare & Pharma, Consumer & Retail, International Business, MSME]
- Select 2-4 relevant categories. If the story is primarily about India, include "India".
- Do NOT make up new category names. Use ONLY the exact strings provided above.

Respond ONLY with a valid JSON object matching this exact structure, with no markdown code blocks wrapping the JSON:
{
  "title": "A short, catchy headline (MAXIMUM 6-8 words, highly SEO optimized)",
  "subheadline": "A 1-2 sentence summary of the article",
  "category": "The SINGLE most relevant Primary Category from the allowed list",
  "categories": ["Category 1", "Category 2", "Category 3"],
  "seo_keywords": "comma, separated, list, of, keywords",
  "content": "The full article rewritten in HTML format following the paragraph and blockquote rules above. Do NOT wrap in a single parent div."
}

Source News Text:
"""
${textToProcess}
"""
    `;

    const modelsToTry = ["gemini-1.5-flash", "gemini-flash-latest"];
    let pass1Response = "";
    
    // Pass 1: Initial Generation
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(promptPass1);
        pass1Response = result.response.text();
        break; 
      } catch (error: any) {
        console.warn(`Pass 1 Model ${modelName} failed:`, error.message);
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
          throw new Error("All AI models are currently overloaded for Pass 1. Please try again in a few minutes.");
        }
      }
    }
    
    // Pass 2: Fact-Check Validation
    const promptPass2 = `
You are a strict fact-checker and validator. 

Source Text:
"""
${textToProcess}
"""

Generated Article JSON:
"""
${pass1Response}
"""

Review the Generated Article against the Source Text.
Identify any statement in the 'content', 'title', or 'subheadline' that is:
- unsupported by the source
- exaggerated
- inferred
- speculative
- factually changed
- incorrectly connected to another fact

Return the EXACT SAME JSON structure, but rewrite or completely remove any offending statements. 
Do NOT add new information. If the article is already perfectly grounded, return it exactly as-is.

Respond ONLY with the corrected JSON object matching the original structure, with no markdown code blocks wrapping the JSON.
`;

    let finalAiResponse = pass1Response; // Fallback to pass1 if pass2 completely fails
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(promptPass2);
        finalAiResponse = result.response.text();
        break; 
      } catch (error: any) {
        console.warn(`Pass 2 Model ${modelName} failed:`, error.message);
        // If Pass 2 fails, we still have pass1Response as a fallback, so we don't throw an error here immediately unless we want to strictly fail. We'll proceed with pass1Response.
      }
    }

    // Clean up markdown codeblock wrapper if included
    finalAiResponse = finalAiResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsedData = JSON.parse(finalAiResponse);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error('Failed to parse Gemini validation response as JSON:', finalAiResponse);
      // Fallback to pass 1 JSON parsing if pass 2 returned invalid JSON
      try {
          const pass1Clean = pass1Response.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsedDataPass1 = JSON.parse(pass1Clean);
          return NextResponse.json(parsedDataPass1);
      } catch (e) {
          return NextResponse.json({ error: 'AI generated invalid data format in both passes.' }, { status: 500 });
      }
    }

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
