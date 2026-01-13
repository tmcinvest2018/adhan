import https from 'https';
import { Buffer } from 'buffer';

// Test the Hugging Face API call directly
const postData = JSON.stringify({
  model: 'meta-llama/Llama-3.1-8B-Instruct',
  messages: [
    { role: 'user', content: 'Hello' }
  ],
  max_tokens: 100,
  temperature: 0.7
});

const options = {
  hostname: 'router.huggingface.co',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer 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',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Making request to Hugging Face API...');

const hfReq = https.request(options, (hfRes) => {
  let data = '';

  hfRes.on('data', (chunk) => {
    data += chunk;
  });

  hfRes.on('end', () => {
    console.log('Status Code:', hfRes.statusCode);
    console.log('Headers:', JSON.stringify(hfRes.headers, null, 2));
    console.log('Response Data:', data);
    
    try {
      const response = JSON.parse(data);
      console.log('Parsed Response:', JSON.stringify(response, null, 2));
    } catch (parseError) {
      console.error('Parse Error:', parseError.message);
    }
  });
});

hfReq.on('error', (error) => {
  console.error('Request Error:', error);
});

hfReq.write(postData);
hfReq.end();