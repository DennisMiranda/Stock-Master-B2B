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
        inStockOnly: inStockOnly === "true",
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
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
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id as string);

      if (!product) {
        res.status(404).json({ success: false, error: { message: "Producto no encontrado" } });
        return;
      }

      res.status(200).json({ success: true, data: product });
    } catch (error) {
      console.error("Error getting product:", error);
      res.status(500).json({ success: false, error: { message: "Error interno del servidor" } });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      // Manejo de Imágenes: Si vienen en base64, las subimos a Cloudinary
      // 'images' debe ser array de strings (URL o Base64)
      let images = req.body.images || [];
      const processedImages: string[] = [];
      const { cloudinaryService } = await import("../services/cloudinary.service");

      for (const img of images) {
        if (img.startsWith("data:image")) {
          // Es base64, subir
          const result = await cloudinaryService.uploadImage(img, "products");
          processedImages.push(result.url);
        } else {
          // Ya es URL o texto, guardar tal cual
          processedImages.push(img);
        }
      }

      const productData = {
        ...req.body,
        images: processedImages
      };

      const productId = await this.productService.createProduct(productData);

      res.status(201).json({
        success: true,
        data: { id: productId, ...productData }
      });

    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({
        success: false,
        error: { message: "Error al crear producto" }
      });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Manejo de Imágenes similar a create
      let processedImages = req.body.images;
      if (processedImages && Array.isArray(processedImages)) {
        const { cloudinaryService } = await import("../services/cloudinary.service");
        const finalImages: string[] = [];
        for (const img of processedImages) {
          if (img.startsWith("data:image")) {
            const result = await cloudinaryService.uploadImage(img, "products");
            finalImages.push(result.url);
          } else {
            finalImages.push(img);
          }
        }
        req.body.images = finalImages;
      }

      await this.productService.updateProduct(id as string, req.body);

      res.status(200).json({ success: true, message: "Producto actualizado" });

    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ success: false, error: { message: "Error al actualizar producto" } });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.productService.deleteProduct(id as string);
      res.status(200).json({ success: true, message: "Producto eliminado" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ success: false, error: { message: "Error al eliminar producto" } });
    }
  }
}

const productService = new ProductService();
const productController = new ProductController(productService);

export default productController;