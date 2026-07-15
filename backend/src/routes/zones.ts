import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, requireAuth, requireRole } from '../middleware/auth';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
export const zoneRoutes = Router();

// Get all crowd zones
zoneRoutes.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const zones = await prisma.crowdZone.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(zones);
  } catch (error) {
    logger.error('Failed to fetch crowd zones', { error });
    res.status(500).json({ error: 'Failed to fetch crowd zones' });
  }
});
