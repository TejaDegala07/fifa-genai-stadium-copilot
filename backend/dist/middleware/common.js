"use strict";
// =============================================================================
// COMMON MIDDLEWARE
// =============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
exports.errorHandler = errorHandler;
exports.sanitizeInput = sanitizeInput;
exports.sanitizeObject = sanitizeObject;
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
const logger_1 = require("../utils/logger");
// ---- Request logger --------------------------------------------------------
function requestLogger(req, _res, next) {
    logger_1.logger.info(`${req.method} ${req.path}`, { ip: req.ip });
    next();
}
// ---- Error handler ---------------------------------------------------------
function errorHandler(err, _req, res, _next) {
    logger_1.logger.error(err.message, { stack: err.stack });
    if (err.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid request data', details: err.message });
        return;
    }
    // Never expose internal errors in production
    res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
    });
}
// ---- Input sanitization ---------------------------------------------------
function sanitizeInput(input) {
    if (!input)
        return '';
    // Use DOMPurify to clean HTML tags and script injections
    let clean = isomorphic_dompurify_1.default.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    // Fallback for edge cases like zero-width characters and null bytes
    clean = clean.replace(/[\u200B-\u200D\uFEFF\0]/g, '').trim();
    return clean.slice(0, 2000); // Max length limit
}
function sanitizeObject(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result[key] = sanitizeInput(value);
        }
        else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            result[key] = sanitizeObject(value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
//# sourceMappingURL=common.js.map