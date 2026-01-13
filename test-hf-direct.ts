import axios from 'axios';

const HF_TOKEN = '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';

async function testHFApi() {
  try {
    console.log('Making request to Hugging Face API...');
    
    const response = await axios.post(
      'https://router.huggingface.co/v1/chat/completions',
      {
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello, how are you?' }
        ],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Response received:', response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testHFApi();