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
      $('script, style, nav, header, footer, aside, .ad, .advertisement, [role="banner"], [role="navigation"]').remove();
      let mainContent = $('article').text() || $('main').text() || $('body').text();
      mainContent = mainContent.replace(/\s+/g, ' ').trim();
      textToProcess = mainContent.substring(0, 15000);
    } else {
      return NextResponse.json({ error: 'Please enter a valid news URL or paste news text content.' }, { status: 400 });
    }

    if (textToProcess.length < 30) {
      return NextResponse.json({ error: 'Could not extract enough readable content to generate an article.' }, { status: 400 });
    }

    // 3. Editorial Gemini Prompt
    const prompt = `
You are an expert, independent journalist for "Bharat News Bulletin (BNB)", a premium Indian digital news publication.
Your task is to read the provided source news text and rewrite it completely into a new, high-quality, professional, ready-to-publish news report. 
Do not plagiarize. Rewrite in a neutral, objective, and clear editorial tone. 
Keep sentences engaging and easy to read.

CRITICAL EDITORIAL FORMATTING RULES FOR THE "content" FIELD:
1. Do NOT clutter the article with sub-headings (do NOT use <h2> or <h3> headings inside the content unless essential).
2. Write the article in smooth, well-structured HTML paragraphs (<p>).
3. Start directly with a strong lead/brief introductory paragraph (<p>).
4. Follow with detailed, well-written narrative body paragraphs (<p>).
5. If there is a key highlight, crucial quote, or important takeaway, include EXACTLY ONE clean callout blockquote (<blockquote class="border-l-4 border-blue-600 pl-4 py-2 my-4 italic text-gray-800 font-medium bg-gray-50 rounded-r">...</blockquote>).
6. Ensure the story flows naturally as clean paragraphs without choppy headings.
7. After the article paragraphs, add a line starting with **Important notes:** followed by any additional bullet points or remarks, each separated by line breaks.

Respond ONLY with a valid JSON object matching this exact structure, with no markdown code blocks wrapping the JSON:
{
  "title": "A short, catchy headline (MAXIMUM 6-8 words, highly SEO optimized)",
  "subheadline": "A 1-2 sentence summary of the article",
  "category": "The main category (e.g. business, technology, health, india, world, sports, entertainment, startups)",
  "categories": ["tag1", "tag2"],
  "seo_keywords": "comma, separated, list, of, keywords",
  "content": "The full article rewritten in HTML format following the paragraph and blockquote rules above. Do NOT wrap in a single parent div."
}

Source News Text:
"""
${textToProcess}
"""
    `;

    const modelsToTry = ["gemini-flash-latest", "gemini-3.5-flash", "gemini-2.5-flash"];
    let aiResponse = "";
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        aiResponse = result.response.text();
        break; // Success! Exit retry loop
      } catch (error: any) {
        console.warn(`Model ${modelName} failed:`, error.message);
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
          throw new Error("All AI models are currently overloaded. Please try again in a few minutes.");
        }
      }
    }
    
    // Clean up markdown codeblock wrapper if included
    aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsedData = JSON.parse(aiResponse);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', aiResponse);
      return NextResponse.json({ error: 'AI generated invalid data format.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
