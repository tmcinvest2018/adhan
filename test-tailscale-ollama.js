import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testTailscaleConnection() {
  console.log('Testing connection to Ollama via Tailscale IP...\n');

  // Load API credentials
  const baseUrl = process.env.AI_BASE_URL;
  const modelId = process.env.AI_MODEL_ID;

  console.log('Environment variables check:');
  console.log('- Base URL:', baseUrl);
  console.log('- Model ID:', modelId);
  console.log('');

  if (!baseUrl || !modelId) {
    console.error('ERROR: Missing AI configuration!');
    return;
  }

  // Test the API endpoint that uses the configuration
  const testMessages = [
    {
      role: 'user',
      content: 'Assalamu Alaikum! This is a test from the deployed app using Tailscale Ollama.'
    }
  ];

  console.log('Sending request to local API endpoint...');
  console.log('This should connect to Ollama via Tailscale IP:', baseUrl);
  console.log('');

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages: testMessages })
    });

    console.log('Response status:', response.status);
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
          console.log('\nSUCCESS! Received response from Tailscale Ollama:');
          console.log(text);
          console.log('\n✅ Your deployed app will be able to connect to your local Ollama via Tailscale!');
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
testTailscaleConnection();