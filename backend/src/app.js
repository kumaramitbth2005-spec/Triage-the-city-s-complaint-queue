const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const path = require('path');
const fs = require('fs');

const app = express();

// Trust proxy for Render / Cloud reverse proxies
app.set('trust proxy', 1);

// Security Middlewares & CORS
const configuredOrigins = [
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [])
].map(o => o.trim().replace(/\/$/, '')).filter(Boolean);

const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    const cleanOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes('*') || 
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.onrender.com') ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS'));
  },
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: (req) => req.path === '/api/health' || req.path === '/health'
});
app.use('/api', limiter);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Checks
app.get(['/health', '/api/health'], (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.json({
    status: 'ok',
    service: 'triage-backend',
    database: dbStatus,
    aiService: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/triage', require('./routes/triageRoutes'));
app.use('/api/clusters', require('./routes/clusterRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/user/profile', require('./routes/profileRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/import', require('./routes/importRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));

// Serve frontend build (dist) if present
const possibleDistPaths = [
  path.resolve(__dirname, '../../dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '../dist')
];
const distPath = possibleDistPaths.find(p => fs.existsSync(p));

if (distPath) {
  app.use(express.static(distPath));
}

// Root Backend Welcome & Info Route
app.get('/', (req, res) => {
  if (distPath) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Nexus AI Backend API</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 480px; width: 90%; text-align: center; border: 1px solid #e2e8f0; }
        .badge { display: inline-block; padding: 0.35rem 0.75rem; background: #ecfdf5; color: #059669; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; border: 1px solid #a7f3d0; }
        h1 { font-size: 1.5rem; margin: 0 0 0.5rem; color: #0f172a; }
        p { color: #64748b; font-size: 0.95rem; line-height: 1.5; margin: 0 0 1.5rem; }
        .btn { display: inline-block; background: #4f46e5; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: background 0.2s; }
        .btn:hover { background: #4338ca; }
        .meta { margin-top: 1.5rem; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid #f1f5f9; pt-3; padding-top: 1rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">● Backend Service Online</div>
        <h1>Nexus AI Backend API</h1>
        <p>This is the Render cloud API service for the City Complaint Triage platform. Database status is <strong>${dbStatus}</strong>.</p>
        <a href="https://triage-the-city-s-complaint-queue.vercel.app" class="btn">Open Vercel Frontend →</a>
        <div class="meta">Health Endpoint: <a href="/health" style="color:#6366f1;">/health</a> · API: <a href="/api/complaints" style="color:#6366f1;">/api/complaints</a></div>
      </div>
    </body>
    </html>
  `);
});

// 404 & SPA fallback handler (Express 5 compatible)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'API route not found' } });
  }
  if (distPath && req.method === 'GET') {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      details: err.details || []
    }
  });
});

module.exports = app;
