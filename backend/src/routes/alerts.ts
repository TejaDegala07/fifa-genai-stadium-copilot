import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, requireAuth, requireRole } from '../middleware/auth';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
export const alertRoutes = Router();

// Get all alerts for the user's role
alertRoutes.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const alerts = await prisma.alert.findMany({
      where: {
        OR: [
          { targetAudience: role },
          { targetAudience: 'all' },
          { targetAudience: null }
        ]
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(alerts);
  } catch (error) {
    logger.error('Failed to fetch alerts', { error });
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Acknowledge an alert
alertRoutes.post('/:id/acknowledge', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const alert = await prisma.alert.update({
      where: { id },
      data: { acknowledged: true, acknowledgedBy: req.user?.id }
    });
    res.json(alert);
  } catch (error) {
    logger.error('Failed to acknowledge alert', { error, id: req.params.id });
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Clear an alert (Ops only)
alertRoutes.delete('/:id', requireAuth, requireRole(['operations']), async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.alert.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to clear alert', { error, id: req.params.id });
    res.status(500).json({ error: 'Failed to clear alert' });
  }
});
