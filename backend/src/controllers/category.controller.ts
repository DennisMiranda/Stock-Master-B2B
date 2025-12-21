import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";

class CategoryController {
  private categoryService: CategoryService;

  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  /**
   * Obtiene todas las categorías
   */
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await this.categoryService.getAllCategories();

      res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      console.error("Error in getCategories:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "CATEGORY_ERROR",
          message: "Error al obtener las categorías",
        },
      });
    }
  }

  /**
   * Obtiene una categoría específica por ID
   */
  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: "CATEGORY_NOT_FOUND",
            message: "Categoría no encontrada",
          },
        });
      }

      res.status(200).json({
        success: true,
        data: { category },
      });
    } catch (error) {
      console.error("Error in getCategoryById:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "CATEGORY_ERROR",
          message: "Error al obtener la categoría",
        },
      });
    }
  }

  /**
   * Obtiene todas las subcategorías de una categoría
   */
  async getSubcategoriesByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const subcategories =
        await this.categoryService.getSubcategoriesByCategoryId(categoryId);

      res.status(200).json({
        success: true,
        data: { subcategories },
      });
    } catch (error) {
      console.error("Error in getSubcategoriesByCategory:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "SUBCATEGORY_ERROR",
          message: "Error al obtener las subcategorías",
        },
      });
    }
  }

  /**
   * Obtiene todas las categorías con sus subcategorías anidadas
   */
  async getCategoriesWithSubcategories(req: Request, res: Response) {
    try {
      const categoriesWithSubcategories =
        await this.categoryService.getCategoriesWithSubcategories();

      res.status(200).json({
        success: true,
        data: { categories: categoriesWithSubcategories },
      });
    } catch (error) {
      console.error("Error in getCategoriesWithSubcategories:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "CATEGORY_ERROR",
          message: "Error al obtener las categorías con subcategorías",
        },
      });
    }
  }
}

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService);

export default categoryController;
