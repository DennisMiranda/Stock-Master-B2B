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
      const category = await this.categoryService.getCategoryById(id as string);

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
        await this.categoryService.getSubcategoriesByCategoryId(categoryId as string);

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

  // --- CRUD Endpoints ---

  async createCategory(req: Request, res: Response) {
    try {
      const { name, slug, subcategories } = req.body;
      const newCategory = await this.categoryService.createCategory({ name, slug, subcategories });
      res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Error creating category' } });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.categoryService.updateCategory(id as string, req.body);
      res.status(200).json({ success: true, message: 'Updated' });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: 'Error updating category' } });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.categoryService.deleteCategory(id as string);
      res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: 'Error deleting category' } });
    }
  }

  async addSubcategory(req: Request, res: Response) {
    try {
      const { id } = req.params; // categoryId
      const { name, slug } = req.body;
      const newSub = await this.categoryService.addSubcategory(id as string, { name, slug });
      res.status(201).json({ success: true, data: newSub });
    } catch (error) {
      console.error("Error adding subcategory:", error);
      res.status(500).json({ success: false, error: { code: 'CREATE_SUB_ERROR', message: 'Error adding subcategory' } });
    }
  }

  async deleteSubcategory(req: Request, res: Response) {
    try {
      const { id, subId } = req.params;
      await this.categoryService.removeSubcategory(id as string, subId as string);
      res.status(200).json({ success: true, message: 'Subcategory deleted' });
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      res.status(500).json({ success: false, error: { code: 'DELETE_SUB_ERROR', message: 'Error deleting subcategory' } });
    }
  }
}

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService);

export default categoryController;
