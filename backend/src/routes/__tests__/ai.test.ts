import request from 'supertest';
import express from 'express';
import { aiRoutes } from '../ai';

// Mock the Gemini service so tests don't make real API calls
jest.mock('../../services/gemini', () => ({
  callGemini: jest.fn().mockResolvedValue({
    situation: "Test situation",
    reasoning: "Test reasoning",
    recommendation: "Test recommendation",
    priority: "Routine",
    estimatedImpact: "Test impact",
    confidence: 90,
    actions: []
  })
}));

const app = express();
app.use(express.json());
app.use('/api/ai', aiRoutes);

describe('AI Routes', () => {
  describe('POST /api/ai/crowd', () => {
    it('returns a structured JSON response from Gemini', async () => {
      const payload = {
        context: {
          role: 'operations',
          language: 'en',
          timestamp: new Date().toISOString()
        },
        zoneId: 'z1'
      };

      const res = await request(app)
        .post('/api/ai/crowd')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('situation', 'Test situation');
      expect(res.body).toHaveProperty('recommendation', 'Test recommendation');
    });

    it('returns 400 when context is missing', async () => {
      const res = await request(app)
        .post('/api/ai/crowd')
        .send({ zoneId: 'z1' }); // missing context

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
