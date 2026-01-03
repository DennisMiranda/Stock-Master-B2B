import { Request, Response } from 'express';
import { deliveriesService } from '../services/deliveries.service';

export class DeliveriesController {
  async getAll(req: Request, res: Response) {
    try {
      const deliveries = await deliveriesService.getAll();
      res.json({ success: true, data: deliveries });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const delivery = await deliveriesService.getById(id!);
      
      if (!delivery) {
        return res.status(404).json({ success: false, error: 'Entrega no encontrada' });
      }

      res.json({ success: true, data: delivery });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getByRoute(req: Request, res: Response) {
    try {
      const { routeId } = req.params;
      const deliveries = await deliveriesService.getByRoute(routeId!);
      res.json({ success: true, data: deliveries });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getByDriver(req: Request, res: Response) {
    try {
      const { driverId } = req.params;
      const deliveries = await deliveriesService.getByDriver(driverId!);
      res.json({ success: true, data: deliveries });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const delivery = await deliveriesService.create(req.body);
      res.status(201).json({ success: true, data: delivery });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const delivery = await deliveriesService.updateStatus(id!, status);
      res.json({ success: true, data: delivery });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async complete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const delivery = await deliveriesService.complete(id!);
      res.json({ success: true, data: delivery });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async fail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const delivery = await deliveriesService.fail(id!, reason);
      res.json({ success: true, data: delivery });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const delivery = await deliveriesService.cancel(id!);
      res.json({ success: true, data: delivery });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await deliveriesService.delete(id!);
      res.json({ success: true, message: 'Entrega eliminada' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const deliveriesController = new DeliveriesController();

