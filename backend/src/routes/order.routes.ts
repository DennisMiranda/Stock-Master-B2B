import { Router } from "express";
import orderController from "../controllers/order.controller";

const router = Router();

router.post("/", (req, res) => orderController.createOrder(req, res));

export default router;
