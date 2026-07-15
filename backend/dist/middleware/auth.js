"use strict";
// =============================================================================
// AUTH MIDDLEWARE
// =============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || 'stadiumiq-hackathon-super-secret-key-2026';
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid token' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        logger_1.logger.warn(`Failed auth attempt from ${req.ip}`, { error: err });
        res.status(403).json({ error: 'Forbidden', message: 'Token expired or invalid' });
    }
}
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            logger_1.logger.warn(`User ${req.user.id} (${req.user.role}) attempted unauthorized access to ${req.originalUrl}`);
            res.status(403).json({ error: 'Forbidden', message: 'Insufficient role permissions' });
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map