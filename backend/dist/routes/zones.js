"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zoneRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
exports.zoneRoutes = (0, express_1.Router)();
// Get all crowd zones
exports.zoneRoutes.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const zones = await prisma.crowdZone.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(zones);
    }
    catch (error) {
        logger_1.logger.error('Failed to fetch crowd zones', { error });
        res.status(500).json({ error: 'Failed to fetch crowd zones' });
    }
});
//# sourceMappingURL=zones.js.map