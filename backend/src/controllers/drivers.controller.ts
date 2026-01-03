import { Request, Response } from 'express';
import { driversService } from '../services/driver.service';

export class DriversController {
  async getAll(req: Request, res: Response) {
    try {
      const drivers = await driversService.getAll();
      res.json({ success: true, data: drivers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const driver = await driversService.getById(id!);
      
      if (!driver) {
        return res.status(404).json({ success: false, error: 'Conductor no encontrado' });
      }

      res.json({ success: true, data: driver });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAvailable(req: Request, res: Response) {
    try {
      const drivers = await driversService.getByStatus('AVAILABLE');
      res.json({ success: true, data: drivers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const driver = await driversService.create(req.body);
      res.status(201).json({ success: true, data: driver });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const driver = await driversService.update(id!, req.body);
      res.json({ success: true, data: driver });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async assignRoute(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { routeId } = req.body;
      
      const driver = await driversService.assignRoute(id!, routeId);
      res.json({ success: true, data: driver });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async unassignRoute(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const driver = await driversService.unassignRoute(id!);
      res.json({ success: true, data: driver });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await driversService.getDriverStats(id!);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await driversService.delete(id!);
      res.json({ success: true, message: 'Conductor eliminado' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const driversController = new DriversController();

