// =============================================================================
// AUTH MIDDLEWARE
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'stadiumiq-hackathon-super-secret-key-2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    name: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn(`Failed auth attempt from ${req.ip}`, { error: err });
    res.status(403).json({ error: 'Forbidden', message: 'Token expired or invalid' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`User ${req.user.id} (${req.user.role}) attempted unauthorized access to ${req.originalUrl}`);
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient role permissions' });
      return;
    }
    next();
  };
}
