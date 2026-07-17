import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export async function handleVerify(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  // Parse body
  let body = '';
  req.on('data', chunk => { body += chunk; });
  await new Promise(resolve => req.on('end', resolve));
  
  let parsedBody;
  try {
    parsedBody = JSON.parse(body);
  } catch (e) {
    res.statusCode = 400;
    res.end('Bad Request');
    return;
  }

  const { draft, sources } = parsedBody;

  if (process.env.APP_MODE === 'MOCK' || !process.env.APP_MODE) {
    // Return mock results after 2s delay
    setTimeout(async () => {
      try {
        const mockDataPath = path.resolve('./src/data/mockResults.json');
        const data = await fs.readFile(mockDataPath, 'utf8');
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Error reading mock data' }));
      }
    }, 2000);
    return;
  }

  // LIVE Mode using Gemini
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
You are an expert litigation-consulting analyst. Verify the factual claims in the following draft section against the provided source documents.

Draft Section:
${JSON.stringify(draft)}

Source Documents:
${JSON.stringify(sources)}

Return strict JSON only matching this schema:
{
  "meta_analysis": {
    "overall_risk_score": "low | medium | high",
    "summary": "2-3 sentences evaluating the factual grounding of the draft",
    "key_issues": ["list of strings", "highlighting major factual deviations"]
  },
  "claims": [
    {
      "id": "c1",
      "claim_text": "exact sentence or clause from the draft",
      "claim_type": "factual | numeric | citation",
      "cited_source": "source id the draft cites, or null",
      "best_source": "source id that best supports the claim, or null",
      "status": "supported | misgrounded | unsupported | numeric_mismatch",
      "evidence_quote": "verbatim quote from the source that supports or contradicts, or null",
      "explanation": "one sentence: why this status",
      "confidence": "high | medium | low"
    }
  ]
}

Definitions:
- supported = cited source contains evidence for the claim
- misgrounded = the cited source is real but does not support the claim (even if another source does — report it in best_source)
- unsupported = no bundled source supports it
- numeric_mismatch = a number in the draft conflicts with the number in the source.

CRITICAL INSTRUCTIONS FOR JSON OUTPUT:
1. You MUST properly escape any double quotes inside your string values (e.g. \\").
2. DO NOT wrap the output in markdown blocks (\`\`\`json). Return the raw JSON string directly.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    res.setHeader('Content-Type', 'application/json');
    res.end(response.text);

  } catch (err) {
    console.error('LLM Error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
}
