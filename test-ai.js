import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAIConnection() {
  console.log('Testing AI Connection...\n');

  // Load API credentials
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
  const modelId = process.env.NEXT_PUBLIC_OPENROUTER_MODEL_ID || process.env.OPENROUTER_MODEL_ID || 'gemini-2.5-flash';

  console.log('Environment variables check:');
  console.log('- API Key present:', !!apiKey);
  console.log('- Model ID:', modelId);
  console.log('');

  if (!apiKey) {
    console.error('ERROR: No API key found!');
    return;
  }

  // Prepare the test request similar to what the frontend sends
  const testMessages = [
    {
      role: 'user',
      content: 'Assalamu Alaikum! Test message for Noor AI.'
    }
  ];

  // Construct Google Gemini API Payload
  const systemPrompt = `
    You are Noor AI, a high-authority Islamic Knowledge Center and virtual Scholar.

    MANDATORY RULES:
    1. GREETING: You MUST start every single response with exactly: "Bismillahi wa salaatu wa salaamu 'alaa Rasoolillaah..." followed by a newline.
    2. CLOSING: You MUST end every single response with exactly: "Wa Allahu a'la wa a'lam."
    3. TONE: Scholarly, serene, respectful, and authoritative yet humble.
  `;

  const contents = [];

  // Add system prompt as a user message (Gemini doesn't have system role)
  contents.push({
    role: "user",
    parts: [{ text: systemPrompt }]
  });

  // Add the actual messages
  for (const message of testMessages) {
    contents.push({
      role: message.role === 'assistant' ? 'model' : message.role,
      parts: [{ text: message.content }]
    });
  }

  const apiPayload = {
    contents: contents,
    generationConfig: {
      temperature: 0.3
    }
  };

  console.log('Sending request to Google API...');
  console.log('Endpoint:', `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=[HIDDEN]`);
  console.log('Payload:', JSON.stringify(apiPayload, null, 2));
  console.log('');

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiPayload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    console.log('');

    const data = await response.text(); // Use text() first to see raw response
    console.log('Raw response:', data);
    console.log('');

    if (response.ok) {
      try {
        const jsonData = JSON.parse(data);
        console.log('Parsed response:');
        console.log(JSON.stringify(jsonData, null, 2));
        
        if (jsonData.candidates && jsonData.candidates.length > 0) {
          const text = jsonData.candidates[0].content.parts[0].text;
          console.log('\nSUCCESS! Received response from AI:');
          console.log(text);
        } else {
          console.log('\nWARNING: Response has no candidates');
        }
      } catch (parseError) {
        console.error('ERROR parsing JSON response:', parseError.message);
      }
    } else {
      console.error('ERROR: API request failed');
    }
  } catch (error) {
    console.error('ERROR making API request:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testAIConnection();