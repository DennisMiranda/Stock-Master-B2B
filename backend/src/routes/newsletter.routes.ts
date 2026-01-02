import express from "express";
import { addSubscriber } from "../controllers/newsletter.controller";

const router = express.Router();

/**
 * @route POST /v1/api/newsletter
 * @desc Registrar un nuevo suscriptor al newsletter
 * @access Público
 */
router.post("/", addSubscriber);

export default router;
