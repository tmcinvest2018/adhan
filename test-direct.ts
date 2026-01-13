import https from 'https';
import { Buffer } from 'buffer';

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

console.log('Making request with options:', JSON.stringify(options, null, 2));
console.log('Post data:', postData);

const req = https.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => {
    console.log('Received chunk:', chunk.toString());
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Complete response:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('Parsed response:', parsed);
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(postData);
req.end();