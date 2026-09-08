import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    // 1. Scrape the URL
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

    // 2. Extract text using Cheerio
    const $ = cheerio.load(html);
    
    // Remove scripts, styles, nav, headers, footers, sidebars to get just the core content
    $('script, style, nav, header, footer, aside, .ad, .advertisement, [role="banner"], [role="navigation"]').remove();
    
    // Try to get article body directly if possible, otherwise fallback to body
    let mainContent = $('article').text() || $('main').text() || $('body').text();
    
    // Clean up whitespace
    mainContent = mainContent.replace(/\s+/g, ' ').trim();

    // Limit text length to avoid token limits (first 10,000 characters should be enough for an article)
    const textToProcess = mainContent.substring(0, 10000);

    if (textToProcess.length < 100) {
      return NextResponse.json({ error: 'Could not extract enough readable content from this URL.' }, { status: 400 });
    }

    // 3. Process with Gemini
    const prompt = `
You are an expert, independent journalist for "The Echo", a premium Indian digital news publication.
Your task is to read the following raw scraped text from a news article and rewrite it completely into a new, high-quality, professional news report. 
Do not plagiarize. Rewrite in a neutral, objective, and clear editorial tone. 
Keep sentences engaging.
    
Respond ONLY with a valid JSON object matching this exact structure, with no markdown code blocks wrapping the JSON:
{
  "title": "A short, catchy headline (MAXIMUM 5-6 words, highly SEO optimized)",
  "subheadline": "A 1-2 sentence summary of the article",
  "category": "The main category (e.g. business, technology, india, world, sports, entertainment, startups)",
  "categories": ["tag1", "tag2"],
  "seo_keywords": "comma, separated, list, of, keywords",
  "content": "The full article rewritten in HTML format. Use <p> for paragraphs, <h3> for section headings if needed, and <blockquote> for any quotes mentioned in the story. Do NOT wrap the entire output in a single div."
}

Raw Scraped Text:
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
        break; // Success! Exit the retry loop
      } catch (error: any) {
        console.warn(`Model ${modelName} failed:`, error.message);
        // If it's the last model in our list, throw the error
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
          throw new Error("All AI models are currently overloaded. Please try again in a few minutes.");
        }
      }
    }
    
    // Clean up markdown wrapping if Gemini still includes it despite instructions
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
