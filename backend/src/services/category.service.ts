import { db } from "../config/firebase";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export class CategoryService {
  constructor() {}

  /**
   * Obtiene todas las categorías con sus subcategorías
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const categoriesSnapshot = await db.collection("categories").get();
      
      const categories: Category[] = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];

      return categories;
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  }

  /**
   * Obtiene una categoría específica por ID
   */
  async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      const categoryDoc = await db.collection("categories").doc(categoryId).get();
      
      if (!categoryDoc.exists) {
        return null;
      }

      return {
        id: categoryDoc.id,
        ...categoryDoc.data(),
      } as Category;
    } catch (error) {
      console.error("Error getting category by ID:", error);
      return null;
    }
  }

  /**
   * Obtiene todas las subcategorías de una categoría específica
   */
  async getSubcategoriesByCategoryId(
    categoryId: string
  ): Promise<Subcategory[]> {
    try {
      const subcategoriesSnapshot = await db
        .collection("categories")
        .doc(categoryId)
        .collection("subcategories")
        .get();

      const subcategories: Subcategory[] = subcategoriesSnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          categoryId,
          ...doc.data(),
        })
      ) as Subcategory[];

      return subcategories;
    } catch (error) {
      console.error("Error getting subcategories:", error);
      return [];
    }
  }

  /**
   * Obtiene todas las categorías con sus subcategorías anidadas
   */
  async getCategoriesWithSubcategories(): Promise<
    (Category & { subcategories: Subcategory[] })[]
  > {
    try {
      const categories = await this.getAllCategories();

      const categoriesWithSubcategories = await Promise.all(
        categories.map(async (category) => {
          const subcategories = await this.getSubcategoriesByCategoryId(
            category.id
          );
          return {
            ...category,
            subcategories,
          };
        })
      );

      return categoriesWithSubcategories;
    } catch (error) {
      console.error("Error getting categories with subcategories:", error);
      return [];
    }
  }
}
