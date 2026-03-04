import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes          from './features/auth/auth.routes';
import classifyRoutes      from './features/classify/classify.routes';
import notificationsRoutes from './features/notifications/notifications.routes';
import supportRoutes       from './features/support/support.routes';
import userRoutes          from './features/user/user.routes';
import { errorHandler }    from './middleware/errorHandler';

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
// CORS configuration - allow multiple origins
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) ?? ['http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));

// ─── Root Route ───────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    service: 'EcoSync AI Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      classify: 'POST /api/classify',
      auth: '/api/auth/*',
      support: '/api/support/*',
    }
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    message: 'EcoSync AI Backend is running',
    mongodb: states[mongoose.connection.readyState] ?? 'unknown',
  });
});

// ─── Feature Routes ───────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api',         classifyRoutes);       // POST /api/classify
app.use('/api/user',    notificationsRoutes);  // GET|PUT /api/user/:id/notifications
app.use('/api/user',    userRoutes);           // PUT /api/user/:id/password, DELETE /api/user/:id/account
app.use('/api/support', supportRoutes);        // GET /api/support/faqs, POST /api/support/contact

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

export default app;
