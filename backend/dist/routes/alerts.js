"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
exports.alertRoutes = (0, express_1.Router)();
// Get all alerts for the user's role
exports.alertRoutes.get('/', auth_1.requireAuth, async (req, res) => {
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
    }
    catch (error) {
        logger_1.logger.error('Failed to fetch alerts', { error });
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});
// Acknowledge an alert
exports.alertRoutes.post('/:id/acknowledge', auth_1.requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const alert = await prisma.alert.update({
            where: { id },
            data: { acknowledged: true, acknowledgedBy: req.user?.id }
        });
        res.json(alert);
    }
    catch (error) {
        logger_1.logger.error('Failed to acknowledge alert', { error, id: req.params.id });
        res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
});
// Clear an alert (Ops only)
exports.alertRoutes.delete('/:id', auth_1.requireAuth, (0, auth_1.requireRole)(['operations']), async (req, res) => {
    try {
        const id = req.params.id;
        await prisma.alert.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        logger_1.logger.error('Failed to clear alert', { error, id: req.params.id });
        res.status(500).json({ error: 'Failed to clear alert' });
    }
});
//# sourceMappingURL=alerts.js.map