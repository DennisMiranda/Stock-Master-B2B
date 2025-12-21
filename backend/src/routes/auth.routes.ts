import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

// /v1/api/auth/register
router.post("/register", AuthController.register);

// /v1/api/auth/sync
router.post("/sync", AuthController.sync);

// /v1/api/auth/claim-admin (PROTECTED BY SECRET)
router.post("/claim-admin", AuthController.claimAdmin);

export default router;
