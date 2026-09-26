import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Route bindings
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Direct Zip download endpoint for deploying elsewhere
app.get('/api/download-zip', (_req, res) => {
  const publicZip = path.resolve(process.cwd(), 'public', 'aurelle-luxury-store.zip');
  const rootZip = path.resolve(process.cwd(), 'aurelle-luxury-store.zip');

  const fileToSend = fs.existsSync(publicZip) ? publicZip : fs.existsSync(rootZip) ? rootZip : null;

  if (fileToSend) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="aurelle-luxury-store.zip"');
    return res.sendFile(fileToSend);
  }

  res.status(404).json({ error: 'Source archive not ready yet.' });
});

// Health / Status endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    brand: 'Aurelle',
    tagline: 'Curated for the art of living.',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default app;
