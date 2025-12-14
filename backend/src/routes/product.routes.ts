import { Router } from "express";
import productController from "../controllers/product.controller";

const router = Router();

router.get("/", (req, res) => productController.getProducts(req, res));

export default router;
