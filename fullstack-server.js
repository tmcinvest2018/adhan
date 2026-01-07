import express from 'express';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  
  // Determine if we're in production or development
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // In production, serve the built files
    app.use(express.static(path.resolve(__dirname, 'dist')));
  } else {
    // In development, connect to Vite's development server
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }
  
  // API Routes - these need to be defined before the catch-all route
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
  
  // Serve the index.html file for all non-API routes (SPA fallback)
  app.get(/^(?!\/api\/).*$/, async (req, res) => {
    try {
      if (isProduction) {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      } else {
        // In development, use Vite's HTML transformation
        const indexPath = path.resolve(__dirname, 'index.html');
        const html = await new Promise((resolve, reject) => {
          import('fs').then(fsModule => {
            const htmlContent = fsModule.default.readFileSync(indexPath, 'utf-8');
            resolve(htmlContent);
          }).catch(reject);
        });
        const vite = await createServer({
          server: { middlewareMode: true },
          appType: 'spa',
        });
        const transformedHtml = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(transformedHtml);
      }
    } catch (error) {
      console.error('Error serving index.html:', error);
      res.status(500).send('Error loading application');
    }
  });
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Fullstack server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at:`);
    console.log(`  - POST /api/chat`);
    console.log(`  - GET  /api/mawaqit-proxy`);
    console.log(`  - GET  /api/youtube-feed`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});