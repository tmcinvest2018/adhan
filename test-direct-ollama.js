import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDirectOllamaConnection() {
  console.log('Testing direct connection to Ollama via Tailscale IP...\n');

  const baseUrl = 'http://100.81.98.64:11434/api';
  const modelId = 'qwen2.5-coder:7b';

  console.log('Connecting to Ollama at:', baseUrl);
  console.log('Using model:', modelId);
  console.log('');

  // Prepare the payload for Ollama's chat endpoint
  const payload = {
    model: modelId,
    messages: [
      {
        role: "system",
        content: `You are Noor AI, a high-authority Islamic Knowledge Center and virtual Scholar.

MANDATORY RULES:
1. GREETING: You MUST start every single response with exactly: "Bismillahi wa salaatu wa salaamu 'alaa Rasoolillaah..." followed by a newline.
2. CLOSING: You MUST end every single response with exactly: "Wa Allahu a'la wa a'lam."
3. TONE: Scholarly, serene, respectful, and authoritative yet humble.`
      },
      {
        role: "user",
        content: "Assalamu Alaikum! This is a test from the deployed app using Tailscale Ollama."
      }
    ],
    stream: false,
    options: {
      temperature: 0.3
    }
  };

  try {
    console.log('Sending request to Ollama...');
    const response = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    console.log('');

    if (response.ok) {
      const data = await response.json();
      console.log('Response from Ollama:');
      console.log(data.message.content);
      
      console.log('\n✅ SUCCESS: Direct connection to Tailscale Ollama works!');
      console.log('✅ Your deployed app on Vercel will be able to connect to your local Ollama.');
    } else {
      const errorText = await response.text();
      console.error('❌ Error response from Ollama:', errorText);
    }
  } catch (error) {
    console.error('❌ Error connecting to Ollama:', error.message);
  }
}

testDirectOllamaConnection();