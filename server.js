import express from 'express';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic imports for API handlers
async function getApiHandlers() {
  const chatHandler = await import('./api/chat.js');
  const mawaqitProxyHandler = await import('./api/mawaqit-proxy.js');
  const youtubeFeedHandler = await import('./api/youtube-feed.ts');

  return {
    chatHandler: chatHandler.default,
    mawaqitProxyHandler: mawaqitProxyHandler.default,
    youtubeFeedHandler: youtubeFeedHandler.default
  };
}

async function startServer() {
  const app = express();

  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // API Routes
  app.use(express.json());

  // Get API handlers
  const { chatHandler, mawaqitProxyHandler, youtubeFeedHandler } = await getApiHandlers();

  app.post('/api/chat', async (req, res) => {
    try {
      await chatHandler(req, res);
    } catch (error) {
      console.error('Error in /api/chat:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/mawaqit-proxy', async (req, res) => {
    try {
      await mawaqitProxyHandler(req, res);
    } catch (error) {
      console.error('Error in /api/mawaqit-proxy:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/youtube-feed', async (req, res) => {
    try {
      await youtubeFeedHandler(req, res);
    } catch (error) {
      console.error('Error in /api/youtube-feed:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Serve index.html for all other routes (SPA fallback)
  app.get('*', async (req, res) => {
    const indexPath = path.resolve(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      const html = await vite.transformIndexHtml(req.originalUrl,
        fs.readFileSync(indexPath, 'utf-8')
      );
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } else {
      res.status(404).send('Index file not found');
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});