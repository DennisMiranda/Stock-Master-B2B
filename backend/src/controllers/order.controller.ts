import { Request, Response } from "express";
import { orderSchema } from "../models/order.model";
import { OrderService } from "../services/order/order.service";
import { NewPdfService } from "../services/PDF/newPDF.service";
import { CustomResponse } from "../utils/custom-response";

export class OrderController {
  constructor(
    private orderService: OrderService = new OrderService(),
    private pdfService: NewPdfService = new NewPdfService()
  ) {}

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

      try {
        if (createOrderResponse.success) {
          const respuestaid = createOrderResponse.data?.id;
          await this.pdfService.emitFactura(respuestaid!);
        }
      } catch (error) {
        console.error("Error generating PDF invoice", error);
      }

      // luego de crear la orden, almacenamos el id en res.locals para usarlo en el siguiente controller
      return res.status(201).json(createOrderResponse);
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
      const order = await this.orderService.getOrdersPaginated({
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
      const order = await this.orderService.getOrderById(id);

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

      const result = await this.orderService.getOrdersByUserId(userId, {
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
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await this.orderService.updateStatus(id!, status);
      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  async getPendingForDelivery(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await this.orderService.getOrdersPendingForDelivery({
        page,
        limit,
      });

      res
        .status(200)
        .json(
          CustomResponse.success(
            result,
            "Pedidos pendientes obtenidos exitosamente"
          )
        );
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json(
          CustomResponse.error(
            "ORDER_ERROR",
            "Error al obtener pedidos pendientes"
          )
        );
    }
  }
  async getReadyOrders(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await this.orderService.getOrdersPendingForDelivery({
        page,
        limit,
      });

      res
        .status(200)
        .json(
          CustomResponse.success(
            result,
            "Pedidos listos obtenidos exitosamente"
          )
        );
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json(
          CustomResponse.error("ORDER_ERROR", "Error al obtener pedidos listos")
        );
    }
  }
}
