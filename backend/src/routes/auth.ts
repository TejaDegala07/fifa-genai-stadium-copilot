import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
export const authRoutes = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'stadiumiq-hackathon-super-secret-key-2026';

const LoginSchema = z.object({
  role: z.enum(['fan', 'volunteer', 'security', 'medical', 'operations', 'transport']),
  section: z.string().optional(),
});

authRoutes.post('/login', async (req: Request, res: Response) => {
  try {
    const { role, section } = LoginSchema.parse(req.body);

    // In a real app, this would verify a password/SSO token.
    // For this hackathon upgrade, we map the requested role to a seed user.
    let user = await prisma.user.findFirst({ where: { role } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `Demo ${role}`,
          role,
          section: section || 'General',
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    logger.info(`User ${user.name} (${user.role}) logged in successfully.`);
    
    res.json({ token, user });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid login data', details: err.message });
    } else {
      logger.error('Login error', { error: err });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
