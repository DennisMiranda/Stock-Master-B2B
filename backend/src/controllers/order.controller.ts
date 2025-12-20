import { Request, Response } from "express";
import { orderSchema } from "../models/order.model";
import { OrderService } from "../services/order/order.service";
import { ProductService } from "../services/product.service";
import { CustomResponse } from "../utils/custom-response";

class OrderController {
  private orderService: OrderService;
  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  async createOrder(req: Request, res: Response) {
    try {
      // Validate body request to match Order schema
      const result = orderSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json(
            CustomResponse.error(
              "BAD_REQUEST",
              "Invalid request body",
              JSON.parse(result.error.message)
            )
          );
      }

      const createOrderResponse = await this.orderService.createOrder(req.body);
      const status = createOrderResponse.success ? 201 : 400;
      res.status(status).json(createOrderResponse);
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json(CustomResponse.error("ORDER_ERROR", "", JSON.stringify(error)));
    }
  }
}

const productService = new ProductService();
const orderService = new OrderService(productService);
const orderController = new OrderController(orderService);
export default orderController;
