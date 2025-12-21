// cart.controller.ts
import type { Request, Response } from "express";
import { CartService } from "../services/cart.service";
import type { CartItem, Variant } from "../models/cart.model";

export class CartController {
  private service = new CartService();

  getCart = async (req: Request, res: Response) => {
    try {
       const { userId } = req.query as { userId: string };
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID required" });
      }
      const items = await this.service.getCart(userId);
      res.json({ success: true, data: items });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: (error as Error).message });
    }
  };



  addItem = async (req: Request, res: Response) => {
    try {
      const { userId } = req.query as { userId: string };
      const {  productId, variant, quantity } = req.body as {
        productId: string;
        variant: string;
        quantity: number;
      };
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID required" });
      }

      const items = await this.service.addItem(userId, {
        productId,
        variant: variant as Variant,
        quantity,
      });
      res.json({ success: true, data: items });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: (error as Error).message });
    }
  };

  removeItem = async (req: Request, res: Response) => {
    try {
      const { userId } = req.query as { userId: string };
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID required" });
      }
      const { productId } = req.params;
      const { variant } = req.query as { variant: string };
      if (!productId || !variant) {
        return res.status(400).json({
          success: false,
          message: "Product ID and variant are required",
        });
      }
      const items = await this.service.removeItem(
        userId,
        productId,
        variant as Variant
      );
      res.json({ success: true, data: items });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: (error as Error).message });
    }
  };

  mergeCart = async (req: Request, res: Response) => {
    try {
      const { userId } = req.query as { userId: string };
      const { items: localItems } = req.body as {
        userId: string;
        items: Array<Pick<CartItem, "productId" | "variant" | "quantity">>;
      };
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID required" });
      }
      const items = await this.service.mergeCart(userId, localItems);
      res.json({ success: true, data: items });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: (error as Error).message });
    }
  };

  updateQuantity = async (req: Request, res: Response) => {
    try {
      const { userId } = req.query as { userId: string };
      const { productId, variant, quantity } = req.body as {
        productId: string;
        variant: string;
        quantity: number;
      };
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID required" });
      }
      const items = await this.service.addItem(userId, {
        productId,
        variant: variant as Variant,
        quantity,
      });
      res.json({ success: true, data: items });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: (error as Error).message });
    }
  };
}
