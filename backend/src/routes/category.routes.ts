import { Router } from "express";
import categoryController from "../controllers/category.controller";

const router = Router();

// Obtener todas las categorías
router.get("/", (req, res) => categoryController.getCategories(req, res));

// Obtener todas las categorías con sus subcategorías
router.get(
  "/with-subcategories",
  (req, res) => categoryController.getCategoriesWithSubcategories(req, res)
);

// Obtener una categoría específica por ID
router.get("/:id", (req, res) => categoryController.getCategoryById(req, res));

// Obtener subcategorías de una categoría específica
router.get(
  "/:categoryId/subcategories",
  (req, res) => categoryController.getSubcategoriesByCategory(req, res)
);

export default router;
