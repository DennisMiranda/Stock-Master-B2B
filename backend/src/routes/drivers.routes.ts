import { Router } from 'express';
import { driversController } from '../controllers/drivers.controller';

const router = Router();

router.get('/', driversController.getAll.bind(driversController));
router.get('/available', driversController.getAvailable.bind(driversController));
router.get('/:id', driversController.getById.bind(driversController));
router.get('/:id/stats', driversController.getStats.bind(driversController));
router.post('/', driversController.create.bind(driversController));
router.put('/:id', driversController.update.bind(driversController));
router.patch('/:id/assign', driversController.assignRoute.bind(driversController));
router.patch('/:id/unassign', driversController.unassignRoute.bind(driversController));
router.delete('/:id', driversController.delete.bind(driversController));

export default router;