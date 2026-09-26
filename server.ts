import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './server/app.js';
import connectDB from './server/config/db.js';
import 'dotenv/config';
import { initializeDatabase } from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }
await connectDB();
await initializeDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aurelle] Server listening gracefully on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Aurelle] Fatal error initializing server:', err);
  process.exit(1);
});

