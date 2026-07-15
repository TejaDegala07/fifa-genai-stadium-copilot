"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
exports.authRoutes = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'stadiumiq-hackathon-super-secret-key-2026';
const LoginSchema = zod_1.z.object({
    role: zod_1.z.enum(['fan', 'volunteer', 'security', 'medical', 'operations', 'transport']),
    section: zod_1.z.string().optional(),
});
exports.authRoutes.post('/login', async (req, res) => {
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '12h' });
        logger_1.logger.info(`User ${user.name} (${user.role}) logged in successfully.`);
        res.json({ token, user });
    }
    catch (err) {
        if (err.name === 'ZodError') {
            res.status(400).json({ error: 'Invalid login data', details: err.message });
        }
        else {
            logger_1.logger.error('Login error', { error: err });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
//# sourceMappingURL=auth.js.map