import { Router } from "express";
import { OrderController  } from "../controllers/order.controller";
import pdfController  from "../controllers/PDF/PDF.controller";

const orderController = new OrderController();
const router = Router();

router.post("/", (req, res, next) => orderController.createOrder(req, res, next), (req, res) => pdfController.emitFactura(req, res));
router.get("/", (req, res) => orderController.getOrders(req, res));
router.get("/ready", (req, res) => orderController.getReadyOrders(req, res));
router.get('/pending/delivery', orderController.getPendingForDelivery.bind(orderController));
router.get("/:id", (req, res) => orderController.getOrderById(req, res));
router.get("/user/:userId", (req, res) => orderController.getByUserId(req, res));
router.put("/:id", (req, res) => orderController.updateOrder(req, res));
router.patch("/:id/status", orderController.updateStatus.bind(orderController));


export default router;
