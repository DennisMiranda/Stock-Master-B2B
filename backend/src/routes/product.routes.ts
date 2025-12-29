import { Router } from "express";
import productController from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Public Routes (Catalog)
router.get("/", (req, res) => productController.getProducts(req, res));
router.get("/:id", (req, res) => productController.getProductById(req, res));

// Admin Routes (Protected)
router.post("/", authMiddleware, requireRole(['admin']), (req, res) => productController.createProduct(req, res));
router.put("/:id", authMiddleware, requireRole(['admin']), (req, res) => productController.updateProduct(req, res));
router.delete("/:id", authMiddleware, requireRole(['admin']), (req, res) => productController.deleteProduct(req, res));

export default router;
