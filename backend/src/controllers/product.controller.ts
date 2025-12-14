import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  async getProducts(req: Request, res: Response) {
    try {
      const { search, limit, page } = req.query;
      const params = {
        search: search as string,
        limit: Number(limit),
        page: Number(page),
      };

      const products = await this.productService.searchProducts(params);
      console.log(products);

      res.status(200).json({ success: true, data: products });
    } catch (error) {
      console.log(error);
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
