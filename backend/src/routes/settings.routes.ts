import { Router } from "express";
import { settingsController } from "../controllers/settings.controller";

const router = Router();

router.get(
  "/districts",
  settingsController.getDistricts.bind(settingsController)
);

export default router;
