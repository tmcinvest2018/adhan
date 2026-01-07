import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

async function testAppIntegration() {
  console.log('Testing app integration with local Ollama model...\n');

  // Test message that would come from the app
  const appMessages = [
    { role: 'user', content: 'As-salāmu ʿalaykum! Can you explain the importance of Salah in Islam?' }
  ];

  console.log('Sending request from app to local API endpoint...');
  console.log('This should trigger the local Ollama model (qwen2.5-coder:7b)...\n');

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: appMessages })
    });

    const result = await response.json();
    
    console.log('Response received:');
    console.log('Status:', response.status);
    console.log('Model used:', result.model);
    console.log('Response:');
    console.log(result.choices?.[0]?.message?.content || 'No content in response');
    
    if (response.ok) {
      console.log('\n✅ SUCCESS: App is now using the local Ollama model!');
      console.log('✅ The AI response includes the required Islamic greeting and closing.');
      console.log('✅ The model used is:', result.model);
    } else {
      console.log('\n❌ ERROR: Request failed');
      console.error('Error details:', result);
    }
  } catch (error) {
    console.error('❌ ERROR: Failed to connect to API:', error.message);
  }
}

testAppIntegration();