import express from 'express';
import cors from 'cors';
import https from 'https';
import { Buffer } from 'buffer';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;

// Ensure HF_TOKEN is set
if (!HF_TOKEN) {
  console.error('HF_TOKEN environment variable is not set. Please set it in your .env file.');
  process.exit(1);
}

app.post('/api/hf-inference', async (req, res) => {
  console.log('Received request:', req.body);
  const { message } = req.body;

  const postData = JSON.stringify({
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    messages: [
      { role: 'user', content: message }
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
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const hfReq = https.request(options, (hfRes) => {
    let data = '';
    hfRes.on('data', (chunk) => {
      data += chunk;
    });
    hfRes.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Full response from HF:', JSON.stringify(response));
        if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
          res.json({ response: response.choices[0].message.content });
        } else {
          console.log('Invalid response structure:', response);
          res.status(500).json({ error: 'Invalid response from AI', details: response });
        }
      } catch (e) {
        console.log('Error parsing response:', e, 'Data:', data);
        res.status(500).json({ error: 'Error parsing AI response', details: data });
      }
    });
  });

  hfReq.on('error', (error) => {
    console.log('Request error:', error);
    res.status(500).json({ error: error.message });
  });

  hfReq.write(postData);
  hfReq.end();
});

app.listen(PORT, () => {
  console.log(`Simple AI proxy server running on port ${PORT}`);
});