import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testComplexQuery() {
  console.log('Testing complex query with Ollama...\n');

  const testMessages = [
    {
      role: 'user',
      content: 'What are the rules for performing wudu (ablution) in Islam? Please explain the obligatory steps.'
    }
  ];

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages: testMessages })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const text = data.choices[0].message.content;
        console.log('Response for wudu query:');
        console.log(text);
      } else {
        console.log('No choices in response');
      }
    } else {
      console.error('API request failed with status:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error making request:', error.message);
  }
}

testComplexQuery();