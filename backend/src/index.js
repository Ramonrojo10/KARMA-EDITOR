/**
 * KARMA OPS EDITOR - Backend Server
 * Express API for video editing automation
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import videoRoutes from './routes/videos.js';
import statsRoutes from './routes/stats.js';
import youtubeRoutes from './routes/youtube.js';
import settingsRoutes from './routes/settings.js';
import { authenticateToken } from './middleware/auth.js';
import { testConnection } from './config/database.js';

// Load environment variables
dotenv.config({ path: '../.env' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);

// Public download endpoint for n8n (no authentication)
app.use('/api/download', (await import('./routes/download.js')).default);

app.use('/api/videos', authenticateToken, videoRoutes);
app.use('/api/stats', authenticateToken, statsRoutes);
app.use('/api/youtube', authenticateToken, youtubeRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 500MB.' });
    }
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const startServer = async () => {
  // Test database connection before starting
  console.log('\n🔌 Testing database connection...');
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('⚠️  Warning: Database connection failed. Server will start but auth may not work.');
  }

  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎬 KARMA OPS EDITOR - Backend Server               ║
║                                                       ║
║   Server running on port ${PORT}                        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                       ║
║   Database: ${dbConnected ? '✅ Connected' : '❌ Not connected'}                          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
};

startServer().catch(console.error);

export default app;
