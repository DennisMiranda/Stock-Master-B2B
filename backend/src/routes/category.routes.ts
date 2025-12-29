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
// Obtener subcategorías de una categoría específica
router.get(
  "/:categoryId/subcategories",
  (req, res) => categoryController.getSubcategoriesByCategory(req, res)
);

// --- CRUD Routes ---

// Crear categoría
router.post("/", (req, res) => categoryController.createCategory(req, res));

// Actualizar categoría
router.put("/:id", (req, res) => categoryController.updateCategory(req, res));

// Eliminar categoría
router.delete("/:id", (req, res) => categoryController.deleteCategory(req, res));

// Agregar subcategoría
router.post("/:id/subcategories", (req, res) => categoryController.addSubcategory(req, res));

// Eliminar subcategoría
router.delete("/:id/subcategories/:subId", (req, res) => categoryController.deleteSubcategory(req, res));

export default router;
