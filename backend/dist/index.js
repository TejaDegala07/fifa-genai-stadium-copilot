"use strict";
// =============================================================================
// BACKEND — AI Gateway Server
// =============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const ai_1 = require("./routes/ai");
const auth_1 = require("./routes/auth");
const incidents_1 = require("./routes/incidents");
const alerts_1 = require("./routes/alerts");
const zones_1 = require("./routes/zones");
const common_1 = require("./middleware/common");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// ---- Security middleware ---------------------------------------------------
app.use((0, helmet_1.default)({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", '*.googleapis.com'],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'X-Client'],
    maxAge: 86400,
}));
// ---- Rate limiting ---------------------------------------------------------
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: { error: 'Too many requests. Please wait a moment.' },
    standardHeaders: true,
    legacyHeaders: false,
});
// ---- Body parsing ----------------------------------------------------------
app.use(express_1.default.json({ limit: '16kb' }));
app.use(express_1.default.urlencoded({ extended: false, limit: '16kb' }));
// ---- Request logging -------------------------------------------------------
app.use(common_1.requestLogger);
// ---- Routes ----------------------------------------------------------------
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'StadiumIQ AI Gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/ai', apiLimiter, ai_1.aiRoutes);
app.use('/api/incidents', incidents_1.incidentRoutes);
app.use('/api/alerts', alerts_1.alertRoutes);
app.use('/api/zones', zones_1.zoneRoutes);
// ---- Error handling --------------------------------------------------------
app.use(common_1.errorHandler);
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
exports.default = app;
//# sourceMappingURL=index.js.map