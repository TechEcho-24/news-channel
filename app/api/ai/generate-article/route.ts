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

    // 3. Editorial Generation Prompt
    const systemInstruction = `You are a professional news editor for Bharat News Bulletin (BNB).

SOURCE FIDELITY IS THE HIGHEST PRIORITY.
Use ONLY information explicitly present in the supplied source text.
Never add unsupported facts, names, numbers, dates, quotes, statistics, background information, assumptions, explanations, or speculation.
Do not use general model knowledge to fill gaps or expand the story.

DO NOT OVER-SUMMARIZE.
Your task is to REWRITE the source into a professional BNB article, not summarize it.
Preserve all materially important information from the source.

SOURCE DETAIL DETERMINES OUTPUT DETAIL.
If the source is detailed, produce a detailed article.
If the source is short, produce a concise article.
There is NO fixed word count target. Do not add filler to short sources. Do not compress detailed sources.

PRESERVE IMPORTANT DETAILS.
Unless clearly irrelevant or duplicated, retain from the source:
- Exact figures, percentages, monetary values (e.g. 513,847 accounts, not "over 500,000")
- Dates and timeframes
- Company names, person names, countries, locations
- Official statements and attributed quotes
- Analyst comments
- Investigation or regulatory findings
- Causes, consequences, market reactions
- Policy/regulatory details
- Company responses
The article body should preserve precise figures. Headlines may round for readability.

ATTRIBUTION.
Do not strengthen allegations. Preserve source attribution:
- "police said", "according to investigators", "the company said", "an analyst said"
If the source says "Police plan to question Google", do not write "Google security failures" unless the source itself establishes that conclusion.

REMOVE ONLY NOISE.
Remove: advertisements, "Scroll to continue", "opens new tab", newsletter promotions, video-player messages, navigation text, publisher UI.
Do NOT remove legitimate article paragraphs or source-supported details.

CONSOLIDATE REPETITION.
If the source repeats the same fact, consolidate it once. But do not remove a paragraph that adds meaningful context to an earlier fact.`;

    const promptPass1 = `${systemInstruction}

Your task: rewrite the source news text below into a new, ready-to-publish Bharat News Bulletin news report.

FORMATTING RULES for the "content" field:
1. Write in smooth HTML paragraphs (<p>). No <h2> or <h3> unless essential.
2. Start with a strong lead paragraph.
3. Follow with detailed narrative body paragraphs preserving all important source details.
4. Include EXACTLY ONE blockquote for the most important quote or takeaway: <blockquote class="border-l-4 border-blue-600 pl-4 py-2 my-4 italic text-gray-800 font-medium bg-gray-50 rounded-r">...</blockquote>
5. Bold 2-4 key SEO phrases with <strong> tags (never markdown **).
6. End with <p><strong>Important notes:</strong></p> followed by <ul><li> bullet points for any critical caveats.

HEADLINE: Clear and newsworthy, based strictly on the source.
SUB-HEADLINE: Adds useful context, does not repeat the headline.

CATEGORIES — use ONLY from this list:
[India, Business, Economy, Markets, Banking & Finance, Companies, Startups, Technology, Automobile, Energy, Agriculture, Real Estate, Trade & Exports, Policy & Regulations, Employment, Infrastructure, Healthcare & Pharma, Consumer & Retail, International Business, MSME]
Select 2-4 most relevant. Do not add categories just because a keyword appears.

SEO GENERATION RULES:
Before generating SEO, internally identify: Primary Entity, Primary Event, Primary Search Intent, Important Secondary Entities, Most Important Source Fact. Use these to generate SEO. Do not expose this analysis.

seoTitle:
- ~50-60 characters (quality target, not hard limit)
- Primary entity/topic appears early
- Communicates the main development clearly
- Includes company/person when relevant
- Natural language, no keyword stuffing, no unsupported facts
- Does NOT need to match the editorial headline exactly

seoDescription:
- ~140-160 characters (quality target, not hard limit)
- Explains the central development
- Contains the main entity/topic naturally
- Includes an important figure or consequence where useful
- No clickbait. No generic openers: "Read the latest...", "Know more...", "Latest news...", "Breaking..."
- Does not simply repeat the title

seoKeywords:
- Generate 6-8 high-quality, story-specific search phrases
- Prioritize: primary query, main company/person, main event, sector/topic, secondary entities, location, story-specific phrase
- GOOD: "Google fake Gmail accounts", "Gujarat Police Google investigation", "India cybercrime 2024"
- BAD: "news", "latest", "breaking news", "update", "today"
- No duplicates or near-duplicates
- No unrelated trending keywords
- No unsupported entities
- Return as a comma-separated STRING (not an array)

IMAGE PROMPTS:
coverImagePrompt: Photorealistic editorial photography specifically representing the central event/company/sector described. 16:9, no watermark, no text overlay. Do not default to generic traders/screens/phones/offices unless genuinely fitting.
socialMediaImagePrompt: Story-specific professional Instagram/Facebook news graphic. Include only 2-3 strongest verified source facts. Never invent numbers. No "Read Full Story". No website URL. Leave space for CTA.

Respond ONLY with this exact JSON structure. No markdown fences. No extra text before or after:
{
  "title": "Editorial headline based strictly on the source",
  "subheadline": "1-2 sentence summary adding context",
  "category": "Single primary category from allowed list",
  "categories": ["Category 1", "Category 2"],
  "authorName": "Anuj Sachan",
  "content": "Full article in HTML format",
  "seoTitle": "~50-60 char search-optimized title",
  "seoKeywords": "keyword phrase one, keyword phrase two, keyword phrase three, keyword phrase four, keyword phrase five, keyword phrase six",
  "seoDescription": "~140-160 char meta description",
  "coverImagePrompt": "Specific editorial photo prompt",
  "socialMediaImagePrompt": "Story-specific social graphic prompt"
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
            generationConfig: { 
              responseMimeType: "application/json",
              maxOutputTokens: 8192
            }
          });
          const result = await model.generateContent(promptPass1);
          pass1Response = result.response.text();
          pass1Success = true;
          console.log(`[AI SUCCESS] Pass 1 Gemini model ${modelName} succeeded. Length: ${pass1Response.length}`);
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
              max_tokens: 8000,
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
              ],
              max_tokens: 5000
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
            generationConfig: { 
              responseMimeType: "application/json",
              maxOutputTokens: 8192
            }
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
            max_tokens: 8000,
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
            ],
            max_tokens: 5000
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

    // Robust JSON Extraction & Parsing
    const extractJson = (text: string) => {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON object found in response");
      return JSON.parse(match[0]);
    };

    let parsedData;
    let usedPass = 2;
    
    try {
      console.log(`[AI RESPONSE] Pass 2 length: ${finalAiResponse.length} chars`);
      parsedData = extractJson(finalAiResponse);
    } catch (parseError: any) {
      console.error(`[AI ERROR] Pass 2 JSON parsing failed: ${parseError.message}`);
      console.error(`[AI ERROR] Pass 2 Raw Response snippet: ${finalAiResponse.substring(0, 500)}`);
      
      // Fallback to Pass 1
      try {
        usedPass = 1;
        console.log(`[AI RESPONSE] Pass 1 length: ${pass1Response.length} chars`);
        parsedData = extractJson(pass1Response);
      } catch (e: any) {
        console.error(`[AI ERROR] Pass 1 JSON parsing failed: ${e.message}`);
        console.error(`[AI ERROR] Pass 1 Raw Response snippet: ${pass1Response.substring(0, 500)}`);
        return NextResponse.json({ error: 'AI generated invalid data format in both passes.' }, { status: 500 });
      }
    }

    console.log(`[AI SUCCESS] Successfully extracted JSON from Pass ${usedPass}`);

    // Normalize seoKeywords: ensure comma-separated string regardless of AI output type
    if (parsedData) {
      // seoKeywords: array → string
      const kw = parsedData.seoKeywords ?? parsedData.seo_keywords;
      if (Array.isArray(kw)) {
        parsedData.seoKeywords = kw.join(', ');
      } else if (typeof kw === 'string') {
        parsedData.seoKeywords = kw.trim();
      } else {
        parsedData.seoKeywords = '';
      }
      // Always delete legacy snake_case key to avoid ambiguity on frontend
      delete parsedData.seo_keywords;

      // seoTitle/seoDescription fallbacks
      if (!parsedData.seoTitle) parsedData.seoTitle = parsedData.title || '';
      if (!parsedData.seoDescription) parsedData.seoDescription = parsedData.subheadline || '';
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
