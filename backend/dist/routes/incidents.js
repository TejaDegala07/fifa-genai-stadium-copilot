"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
exports.incidentRoutes = (0, express_1.Router)();
// Get all active incidents (Operations, Security, Medical)
exports.incidentRoutes.get('/', auth_1.requireAuth, (0, auth_1.requireRole)(['operations', 'security', 'medical']), async (req, res) => {
    try {
        const incidents = await prisma.incident.findMany({
            orderBy: { reportedAt: 'desc' }
        });
        res.json(incidents);
    }
    catch (error) {
        logger_1.logger.error('Failed to fetch incidents', { error });
        res.status(500).json({ error: 'Failed to fetch incidents' });
    }
});
// Resolve an incident (Operations, Security, Medical)
exports.incidentRoutes.post('/:id/resolve', auth_1.requireAuth, (0, auth_1.requireRole)(['operations', 'security', 'medical']), async (req, res) => {
    try {
        const id = req.params.id;
        const incident = await prisma.incident.update({
            where: { id },
            data: { status: 'resolved', resolvedAt: new Date() }
        });
        res.json(incident);
    }
    catch (error) {
        logger_1.logger.error('Failed to resolve incident', { error, id: req.params.id });
        res.status(500).json({ error: 'Failed to resolve incident' });
    }
});
//# sourceMappingURL=incidents.js.map