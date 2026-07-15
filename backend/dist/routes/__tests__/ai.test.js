"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const ai_1 = require("../ai");
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
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/ai', ai_1.aiRoutes);
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
            const res = await (0, supertest_1.default)(app)
                .post('/api/ai/crowd')
                .send(payload);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('situation', 'Test situation');
            expect(res.body).toHaveProperty('recommendation', 'Test recommendation');
        });
        it('returns 400 when context is missing', async () => {
            const res = await (0, supertest_1.default)(app)
                .post('/api/ai/crowd')
                .send({ zoneId: 'z1' }); // missing context
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });
});
//# sourceMappingURL=ai.test.js.map