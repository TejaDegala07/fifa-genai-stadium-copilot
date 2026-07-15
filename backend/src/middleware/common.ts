// =============================================================================
// COMMON MIDDLEWARE
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';
import { logger } from '../utils/logger';

// ---- Request logger --------------------------------------------------------

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
}

// ---- Error handler ---------------------------------------------------------

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(err.message, { stack: err.stack });

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

export function sanitizeInput(input: string): string {
  if (!input) return '';
  // Use DOMPurify to clean HTML tags and script injections
  let clean = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  // Fallback for edge cases like zero-width characters and null bytes
  clean = clean.replace(/[\u200B-\u200D\uFEFF\0]/g, '').trim();
  return clean.slice(0, 2000); // Max length limit
}

export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}
