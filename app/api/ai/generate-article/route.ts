import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic'; // Prevent Next.js from caching this route
export const revalidate = 0; // Disable revalidation caching

export async function POST(request: Request) {
  try {
    const { url, text, content } = await request.json();

    const apiKeys = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
    if (apiKeys.length === 0) {
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
      
      // A. SSRF Protection & URL Validation
      let targetUrl;
      try {
        targetUrl = new URL(url);
      } catch (e) {
        return NextResponse.json({ error: 'INVALID_URL: The provided URL is malformed.' }, { status: 400 });
      }

      if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
        return NextResponse.json({ error: 'URL_BLOCKED_FOR_SECURITY: Only HTTP/HTTPS URLs are allowed.' }, { status: 400 });
      }

      const hostname = targetUrl.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
      const isPrivateIP = /^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.|^169\.254\./.test(hostname);
      const isCloudMetadata = hostname === '169.254.169.254';

      if (isLocalhost || isPrivateIP || isCloudMetadata) {
        return NextResponse.json({ error: 'URL_BLOCKED_FOR_SECURITY: Access to internal/private networks is forbidden.' }, { status: 403 });
      }

      // B. Robust Fetching
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10s timeout

      try {
        console.log(`[URL FETCH] Requesting: ${url}`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          signal: abortController.signal,
          redirect: 'follow',
        });
        clearTimeout(timeoutId);

        console.log(`[URL FETCH] Status: ${response.status} for ${response.url}`);

        if (response.status === 401 || response.status === 403) {
          // Detect publisher bot protection
          return NextResponse.json({ 
            error: "We couldn't automatically extract this publisher's article (Publisher blocked automated access). Please paste the article text and I can process it." 
          }, { status: 403 });
        }

        if (!response.ok) {
           return NextResponse.json({ error: `HTTP_ERROR: Server responded with status ${response.status}.` }, { status: 400 });
        }

        const contentType = response.headers.get('content-type') || '';
        console.log(`[URL FETCH] Content-Type: ${contentType}`);
        if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml') && !contentType.includes('text/xml')) {
           return NextResponse.json({ error: 'UNSUPPORTED_CONTENT_TYPE: The URL does not point to an HTML webpage.' }, { status: 400 });
        }
        
        const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
        if (contentLength > 5 * 1024 * 1024) {
           return NextResponse.json({ error: 'URL_BLOCKED_FOR_SECURITY: Response size exceeds the 5MB limit.' }, { status: 400 });
        }

        html = await response.text();
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error(`[URL FETCH ERROR]`, error.message);
        if (error.name === 'AbortError') {
          return NextResponse.json({ error: 'FETCH_TIMEOUT: The server took too long to respond.' }, { status: 408 });
        }
        return NextResponse.json({ error: 'Could not fetch the provided URL due to a network error. Ensure it is valid.' }, { status: 400 });
      }

      // C. Smart Article Extraction
      const $ = cheerio.load(html);
      let extractedTitle = '';
      let extractedBody = '';
      let extractionMethod = 'none';

      // Remove unwanted elements early
      $('script, style, nav, header, footer, aside, .ad, .advertisement, [role="banner"], [role="navigation"], .related, .recommended, .trending, .comments, .sidebar, .tags, .newsletter, .share, .social, .outbrain, .taboola, iframe, noscript').remove();

      // Method 1: JSON-LD NewsArticle
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const jsonld = JSON.parse($(el).html() || '{}');
          const schemas = Array.isArray(jsonld) ? jsonld : [jsonld];
          
          for (const schema of schemas) {
             const graph = schema['@graph'] || [schema];
             for (const item of graph) {
                if (item['@type'] === 'NewsArticle' || item['@type'] === 'Article' || item['@type'] === 'BlogPosting') {
                   extractedTitle = item.headline || item.name || '';
                   extractedBody = item.articleBody || item.text || '';
                   extractionMethod = 'JSON-LD';
                   break;
                }
             }
             if (extractedBody) break;
          }
        } catch (e) {}
      });

      // Method 2: Semantic HTML Fallback
      if (!extractedBody || extractedBody.length < 100) {
         extractedTitle = extractedTitle || $('meta[property="og:title"]').attr('content') || $('title').text() || '';
         
         const articleEl = $('article');
         const mainEl = $('main');
         const contentEl = $('.article-content, .post-content, .entry-content, #main-content');
         
         if (articleEl.length > 0) {
            extractedBody = articleEl.text();
            extractionMethod = 'Semantic <article>';
         } else if (contentEl.length > 0) {
            extractedBody = contentEl.text();
            extractionMethod = 'CSS Class';
         } else if (mainEl.length > 0) {
            extractedBody = mainEl.text();
            extractionMethod = 'Semantic <main>';
         } else {
            extractedBody = $('body').text();
            extractionMethod = 'Generic <body>';
         }
      }

      extractedBody = extractedBody.replace(/\s+/g, ' ').trim();
      textToProcess = extractedTitle ? `${extractedTitle}\n\n${extractedBody}` : extractedBody;
      textToProcess = textToProcess.substring(0, 15000);

      console.log(`[EXTRACTION] Method: ${extractionMethod} | Title found: ${!!extractedTitle} | Body length: ${extractedBody.length}`);
      
      if (textToProcess.length < 50) {
         return NextResponse.json({ error: 'ARTICLE_EXTRACTION_FAILED: Could not find readable article text on this page.' }, { status: 422 });
      }
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
7. Naturally bold (wrap in <strong> tags) 2-4 important SEO keywords or key phrases within the paragraphs to improve search engine visibility. DO NOT use markdown asterisks (**) for bolding, use ONLY HTML <strong> tags.
8. After the article paragraphs, add a line starting with <p><strong>Important notes:</strong></p> followed by any additional bullet points or remarks (use HTML <ul> and <li>).

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

    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro"];
    let pass1Response = "";
    
    // Helper function for sleeping
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Pass 1: Initial Generation
    let pass1Success = false;
    let lastError: any = null;

    for (const apiKey of apiKeys) {
      if (pass1Success) break;
      const genAI = new GoogleGenerativeAI(apiKey);
      
      for (let i = 0; i < modelsToTry.length; i++) {
        const modelName = modelsToTry[i];
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
          });
          const result = await model.generateContent(promptPass1);
          pass1Response = result.response.text();
          pass1Success = true;
          break; 
        } catch (error: any) {
          console.warn(`Pass 1 Key ending in ${apiKey.slice(-4)} Model ${modelName} failed:`, error.message);
          lastError = error;
          // Delay only if we are going to try another model
          if (i < modelsToTry.length - 1) await delay(1500); 
        }
      }
    }

    if (!pass1Success) {
      if (process.env.GROQ_API_KEY) {
        console.log("Gemini failed, falling back to Groq API...");
        try {
          const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: promptPass1 }
              ],
              temperature: 0.1,
              response_format: { type: "json_object" }
            })
          });

          if (!groqResponse.ok) {
            const err = await groqResponse.text();
            throw new Error(`Groq Error: ${err}`);
          }
          
          const groqData = await groqResponse.json();
          pass1Response = groqData.choices[0].message.content;
          pass1Success = true;
        } catch (groqError: any) {
          console.warn(`Groq fallback failed: ${groqError.message}`);
        }
      }

      if (!pass1Success && process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN) {
        console.log("Falling back to Cloudflare AI...");
        try {
          const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-70b-instruct`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: promptPass1 }
              ]
            })
          });

          if (!cfResponse.ok) {
            const err = await cfResponse.text();
            throw new Error(`Cloudflare Error: ${err}`);
          }
          
          const cfData = await cfResponse.json();
          pass1Response = cfData.result.response;
          pass1Success = true;
        } catch (cfError: any) {
          throw new Error(`AI Generation Failed. All API fallbacks (Gemini, Groq, Cloudflare) exhausted. CF Error: ${cfError.message}`);
        }
      }
      
      if (!pass1Success) {
        throw new Error(`AI Model Error: All keys and models exhausted, and no fallback worked.`);
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
    let pass2Success = false;
    
    for (const apiKey of apiKeys) {
      if (pass2Success) break;
      const genAI = new GoogleGenerativeAI(apiKey);
      
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
          });
          const result = await model.generateContent(promptPass2);
          finalAiResponse = result.response.text();
          pass2Success = true;
          break; 
        } catch (error: any) {
          console.warn(`Pass 2 Key ending in ${apiKey.slice(-4)} Model ${modelName} failed:`, error.message);
        }
      }
    }
    
    // Groq Fallback for Pass 2
    if (!pass2Success && process.env.GROQ_API_KEY) {
      console.log("Gemini Pass 2 failed, falling back to Groq...");
      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "user", content: promptPass2 }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
          })
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          finalAiResponse = groqData.choices[0].message.content;
          pass2Success = true;
        }
      } catch (groqError: any) {
         console.warn(`Groq Pass 2 fallback failed:`, groqError.message);
      }
    }

    // Cloudflare Fallback for Pass 2
    if (!pass2Success && process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN) {
      console.log("Groq Pass 2 failed, falling back to Cloudflare...");
      try {
        const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-70b-instruct`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [
              { role: "user", content: promptPass2 }
            ]
          })
        });

        if (cfResponse.ok) {
          const cfData = await cfResponse.json();
          finalAiResponse = cfData.result.response;
          pass2Success = true;
        }
      } catch (cfError: any) {
         console.warn(`Cloudflare Pass 2 fallback failed:`, cfError.message);
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
