import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.post('/api/hf-inference', (req, res) => {
  console.log('Received request:', req.body);
  // Just return a mock response for now to test if the route works
  res.json({ response: 'Mock response for: ' + req.body.message });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});