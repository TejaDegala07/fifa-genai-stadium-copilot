import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, requireAuth, requireRole } from '../middleware/auth';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
export const incidentRoutes = Router();

// Get all active incidents (Operations, Security, Medical)
incidentRoutes.get('/', requireAuth, requireRole(['operations', 'security', 'medical']), async (req: AuthRequest, res: Response) => {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { reportedAt: 'desc' }
    });
    res.json(incidents);
  } catch (error) {
    logger.error('Failed to fetch incidents', { error });
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Resolve an incident (Operations, Security, Medical)
incidentRoutes.post('/:id/resolve', requireAuth, requireRole(['operations', 'security', 'medical']), async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const incident = await prisma.incident.update({
      where: { id },
      data: { status: 'resolved', resolvedAt: new Date() }
    });
    res.json(incident);
  } catch (error) {
    logger.error('Failed to resolve incident', { error, id: req.params.id });
    res.status(500).json({ error: 'Failed to resolve incident' });
  }
});
