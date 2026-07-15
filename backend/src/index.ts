// =============================================================================
// BACKEND — AI Gateway Server
// =============================================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { aiRoutes } from './routes/ai';
import { authRoutes } from './routes/auth';
import { incidentRoutes } from './routes/incidents';
import { alertRoutes } from './routes/alerts';
import { zoneRoutes } from './routes/zones';
import { requestLogger, errorHandler } from './middleware/common';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ---- Security middleware ---------------------------------------------------

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", '*.googleapis.com'],
    },
  },
}));

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Client'],
  maxAge: 86400,
}));

// ---- Rate limiting ---------------------------------------------------------

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many requests. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---- Body parsing ----------------------------------------------------------

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));

// ---- Request logging -------------------------------------------------------

app.use(requestLogger);

// ---- Routes ----------------------------------------------------------------

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'StadiumIQ AI Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', apiLimiter, aiRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/zones', zoneRoutes);

// ---- Error handling --------------------------------------------------------

app.use(errorHandler);

// ---- 404 -------------------------------------------------------------------

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ---- Start -----------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   StadiumIQ AI Gateway — FIFA WC 2026       ║
  ║   Listening on port ${PORT}                     ║
  ║   Gemini: ${process.env.GEMINI_API_KEY ? '✓ Connected' : '✗ No API key (mock mode)'}         ║
  ╚══════════════════════════════════════════════╝
  `);
});

export default app;
