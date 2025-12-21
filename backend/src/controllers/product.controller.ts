import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  async getProducts(req: Request, res: Response) {
    try {
      const {
        search,
        limit,
        page,
        categoryId,
        subcategoryId,
        brand,
        inStockOnly,
      } = req.query;

      const params = {
        search: search as string,
        limit: Number(limit) || undefined,
        page: Number(page) || undefined,
        categoryId: categoryId as string,
        subcategoryId: subcategoryId as string,
        brand: brand as string,
        inStockOnly: inStockOnly === "true" || inStockOnly === true,
      };

      const { products, metadata } = await this.productService.searchProducts(
        params
      );

      res.status(200).json({ success: true, data: { products, metadata } });
    } catch (error) {
      console.error("Error in getProducts:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "PRODUCT_ERROR",
          message: "Error al obtener los productos",
        },
      });
    }
  }
}

const productService = new ProductService();
const productController = new ProductController(productService);

export default productController;
