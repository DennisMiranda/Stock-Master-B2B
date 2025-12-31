// cart.router.ts
import { Router } from "express";
import { CartController } from "../controllers/cart.controller";

export const cartRouter = Router();
const controller = new CartController();

cartRouter.get("/", controller.getCart);
cartRouter.post("/", controller.addItem);
cartRouter.delete("/:productId", controller.removeItem);
cartRouter.post("/merge", controller.mergeCart);
cartRouter.put("/quantity", controller.updateQuantity);
cartRouter.delete("/clear/:userId", controller.clearCart);

export default cartRouter;
