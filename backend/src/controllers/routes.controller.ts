import { Request, Response } from "express";
import { RoutesService } from "../services/routes.service";

export class RoutesController {

  constructor(private routesService = new RoutesService()) {
   
  }

  async getAll(req: Request, res: Response) {
    try {
      const routes = await this.routesService.getAll();
      res.json({ success: true, data: routes });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const route = await this.routesService.getById(id!);

      if (!route) {
        return res
          .status(404)
          .json({ success: false, error: "Ruta no encontrada" });
      }

      res.json({ success: true, data: route });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getByDriver(req: Request, res: Response) {
    try {
      const { driverId } = req.params;
      const routes = await this.routesService.getByDriver(driverId!);
      res.json({ success: true, data: routes });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createOptimized(req: Request, res: Response) {
    try {
      const result = await this.routesService.createOptimized(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const route = await this.routesService.updateStatus(id!, status);
      res.json({ success: true, data: route });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }



  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.routesService.delete(id!);
      res.json({ success: true, message: "Ruta eliminada" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  async addOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { orderId, startLocation } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: "orderId es requerido",
        });
      }

      if (!startLocation || !startLocation.lat || !startLocation.lng) {
        return res.status(400).json({
          success: false,
          error: "startLocation con lat y lng es requerido",
        });
      }

      const route = await this.routesService.addOrder(id!, orderId, startLocation);

      res.json({
        success: true,
        data: route,
        message: "Pedido agregado y ruta re-optimizada exitosamente",
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * ✅ Remover pedido de ruta
   * DELETE /api/routes/:id/orders/:orderId
   */
  async removeOrder(req: Request, res: Response) {
    try {
      const { id, orderId } = req.params;
      const { startLocation } = req.body;

      if (!startLocation || !startLocation.lat || !startLocation.lng) {
        return res.status(400).json({
          success: false,
          error: "startLocation con lat y lng es requerido",
        });
      }

      const route = await this.routesService.removeOrder(
        id!,
        orderId!,
        startLocation
      );

      res.json({
        success: true,
        data: route,
        message: "Pedido removido y ruta re-optimizada exitosamente",
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  async markOrderAsDelivered(req: Request, res: Response) {
    try {
      const { id, orderId } = req.params;

      const route = await this.routesService.markOrderAsDelivered(id!, orderId!);

      res.json({
        success: true,
        data: route,
        message: "Pedido marcado como entregado exitosamente",
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const routesController = new RoutesController();
