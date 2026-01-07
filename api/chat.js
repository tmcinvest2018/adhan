export default async function handler(req, res) {
  // 1. CORS Headers (Allow frontend to call this)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    // 2. Load Environment Variables
    // Check for primary AI provider first (Google)
    const apiKey = process.env.AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || process.env.NEXT_PUBLIC_OLLAMA_BASE_URL;
    const modelId = process.env.AI_MODEL_ID || process.env.NEXT_PUBLIC_OLLAMA_MODEL_ID || 'qwen2.5-coder:7b';

    // Determine if we're using Ollama (no API key required)
    const isOllama = baseUrl && (baseUrl.includes('11434') || baseUrl.includes('100.81.98.64'));

    if (!isOllama && (!apiKey || !baseUrl)) {
      throw new Error('Server misconfiguration: Missing AI Credentials');
    }

    // 3. Define the Scholar Persona (Moved from Frontend for security & consistency)
    const systemPrompt = `
      You are Noor AI, a high-authority Islamic Knowledge Center and virtual Scholar.
      
      MANDATORY RULES:
      1. GREETING: You MUST start every single response with exactly: "Bismillahi wa salaatu wa salaamu 'alaa Rasoolillaah..." followed by a newline.
      2. CLOSING: You MUST end every single response with exactly: "Wa Allahu a'la wa a'lam."
      3. TONE: Scholarly, serene, respectful, and authoritative yet humble.
      
      MODES OF OPERATION:
      A. SEARCH MODE (If input is a keyword like "Wudu", "Zakat", "Prayer Times"):
         - List the specific sources found in the CONTEXT below.
         - Provide a brief 1-sentence summary for each.
         - Do not invent sources.
         
      B. SCHOLAR MODE (If input is a question like "How to pray?", "Is music haram?", "What is the ruling on X?"):
         - Provide a detailed, structured answer.
         - CITE THE 4 MADHAHIB (Hanafi, Shafi, Maliki, Hanbali) if there is a known difference of opinion. If uncertain or complex, mention the general consensus (Ijma) or majority view (Jumhur).
         - USE REFERENCES: Cite specific sources from the CONTEXT in brackets, e.g., [Quran 2:255] or [Sahih Bukhari].
         - If the CONTEXT is empty, provide a general answer based on standard Islamic knowledge but preface it with "Based on general Islamic principles..." and strictly warn that specific verification is needed.
      
      REFERRAL POLICY:
      - For complex personal, marital, or financial Fatawa, explicitly state: "For a specific Fatwa regarding your personal situation, please consult a local scholar or Imam."
    `;

    // 4. Construct payload based on provider
    let apiPayload, endpoint, headers;

    if (isOllama) {
      // Ollama format
      apiPayload = {
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        stream: false, // We want a complete response
        options: {
          temperature: 0.3
        }
      };

      // Ollama endpoint
      endpoint = `${baseUrl.replace(/\/$/, '')}/chat`;

      headers = {
        'Content-Type': 'application/json'
      };
    } else {
      // Google/OpenAI compatible format
      apiPayload = {
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.3 // Low temperature for factual grounding
      };

      // Google endpoint
      endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-goog-api-key': apiKey // Specific fallback for Google's OpenAI proxy if Bearer isn't accepted
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(apiPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Provider Error (${response.status}): ${errorText}`);
    }

    const responseData = await response.json();

    let data;
    if (isOllama) {
      // Convert Ollama response format to OpenAI-compatible format
      data = {
        id: responseData?.id || 'ollama-response',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: modelId,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: responseData?.message?.content || responseData?.response || ''
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 0, // Ollama doesn't provide this in chat response
          completion_tokens: 0,
          total_tokens: 0
        }
      };
    } else {
      // Google/OpenAI format
      data = responseData;
    }

    // 6. Return standard response
    return res.status(200).json(data);

  } catch (error) {
    console.error('AI Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Technical issues connecting to Al-Noor intelligence.',
      details: error.message 
    });
  }
}