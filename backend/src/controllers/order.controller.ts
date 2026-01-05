import { Request, Response } from "express";
import { orderSchema } from "../models/order.model";
import { OrderService } from "../services/order/order.service";
import { ProductService } from "../services/product.service";
import { CustomResponse } from "../utils/custom-response";
import { StatisticService } from "../services/statistic.service";

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
      res.status(201).json(createOrderResponse);
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json(CustomResponse.error("ORDER_ERROR", "Error creating order"));
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const order = await orderService.getOrdersPaginated({
        page,
        limit,
      });
      res
        .status(200)
        .json(CustomResponse.success(order, "Orders fetched successfully"));
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json(CustomResponse.error("ORDER_ERROR", "Error getting orders"));
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Order id is required" });
      }
      const order = await orderService.getOrderById(id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.json(
        CustomResponse.success(order, "Order detail fetched successfully")
      );
    } catch (error) {
      console.error("Error getting order by id", error);
      return res
        .status(500)
        .json(CustomResponse.error("ORDER_ERROR", "Error getting order by id"));
    }
  }

  async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      if (!userId) {
        return res.status(400).json({ message: "User id is required" });
      }

      const result = await orderService.getOrdersByUserId(userId, {
        page,
        limit,
      });

      return res.json(
        CustomResponse.success(result, "Orders fetched successfully")
      );
    } catch (error) {
      console.error("Error getting orders by user", error);
      return res
        .status(500)
        .json(
          CustomResponse.error("ORDER_ERROR", "Error getting orders by user")
        );
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json(CustomResponse.error("ORDER_ERROR", "Order id is required"));
      }

      const order = await this.orderService.updateOrder(id, req.body);
      return res.json(
        CustomResponse.success(order, "Order updated successfully")
      );
    } catch (error) {
      console.error("Error updating order", error);
      return res
        .status(500)
        .json(
          CustomResponse.error("ORDER_ERROR", "Error updating order by id")
        );
    }
  }
}

const productService = new ProductService();
const statisticService = new StatisticService();
const orderService = new OrderService(productService, statisticService);
const orderController = new OrderController(orderService);
export default orderController;
