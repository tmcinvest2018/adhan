import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testOllamaConnection() {
  console.log('Testing Ollama AI Connection via API endpoint...\n');

  // Check if we're configured to use Ollama
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || process.env.NEXT_PUBLIC_OLLAMA_BASE_URL;
  const ollamaModelId = process.env.OLLAMA_MODEL_ID || process.env.NEXT_PUBLIC_OLLAMA_MODEL_ID;
  
  console.log('Environment variables check:');
  console.log('- Ollama Base URL:', ollamaBaseUrl);
  console.log('- Ollama Model ID:', ollamaModelId);
  console.log('');

  if (!ollamaBaseUrl || !ollamaModelId) {
    console.error('ERROR: Ollama configuration not found!');
    return;
  }

  // Test the API endpoint
  const testMessages = [
    {
      role: 'user',
      content: 'Assalamu Alaikum! Test message for Noor AI using Ollama.'
    }
  ];

  console.log('Sending request to local API endpoint...');
  console.log('This should use Ollama with model:', ollamaModelId);
  console.log('');

  try {
    // Call the local API endpoint
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages: testMessages })
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

        if (jsonData.choices && jsonData.choices.length > 0) {
          const text = jsonData.choices[0].message.content;
          console.log('\nSUCCESS! Received response from Ollama via API:');
          console.log(text);
        } else {
          console.log('\nWARNING: Response has no choices');
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
testOllamaConnection();