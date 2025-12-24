import { Router } from "express";
import orderController from "../controllers/order.controller";

const router = Router();

router.post("/", (req, res) => orderController.createOrder(req, res));
router.get("/", (req, res) => orderController.getOrders(req, res));
router.get("/:id", (req, res) => orderController.getOrderById(req, res));
router.get("/user/:userId", (req, res) =>
  orderController.getByUserId(req, res)
);

export default router;
