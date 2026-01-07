import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware to handle CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  next();
});

// Handle preflight requests for specific routes
app.options('/api/chat', (req, res) => {
  res.status(200).end();
});

app.options('/api/mawaqit-proxy', (req, res) => {
  res.status(200).end();
});

app.options('/api/youtube-feed', (req, res) => {
  res.status(200).end();
});

app.use(express.json());

// Import and use the API handlers
app.post('/api/chat', async (req, res) => {
  try {
    const handler = await import('./api/chat.js');
    await handler.default(req, res);
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/mawaqit-proxy', async (req, res) => {
  try {
    const handler = await import('./api/mawaqit-proxy.js');
    await handler.default(req, res);
  } catch (error) {
    console.error('Error in /api/mawaqit-proxy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/youtube-feed', async (req, res) => {
  try {
    const handler = await import('./api/youtube-feed.ts');
    await handler.default(req, res);
  } catch (error) {
    console.error('Error in /api/youtube-feed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'API server running', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at:`);
  console.log(`  - POST /api/chat`);
  console.log(`  - GET  /api/mawaqit-proxy`);
  console.log(`  - GET  /api/youtube-feed`);
});