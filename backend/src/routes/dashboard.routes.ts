import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// /v1/api/dashboard/stats
router.get(
    "/stats",
    authMiddleware,
    requireRole(['admin', 'superadmin']), // Asumiendo 'admin' es el rol
    DashboardController.getStats
);

export default router;
