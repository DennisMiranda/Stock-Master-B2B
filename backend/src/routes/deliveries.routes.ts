import { Router } from 'express';
import { deliveriesController } from '../controllers/deliveries.controller';

const router = Router();

router.get('/', deliveriesController.getAll.bind(deliveriesController));
router.get('/:id', deliveriesController.getById.bind(deliveriesController));
router.get('/route/:routeId', deliveriesController.getByRoute.bind(deliveriesController));
router.get('/driver/:driverId', deliveriesController.getByDriver.bind(deliveriesController));
router.post('/', deliveriesController.create.bind(deliveriesController));
router.patch('/:id/status', deliveriesController.updateStatus.bind(deliveriesController));
router.patch('/:id/complete', deliveriesController.complete.bind(deliveriesController));
router.patch('/:id/fail', deliveriesController.fail.bind(deliveriesController));
router.patch('/:id/cancel', deliveriesController.cancel.bind(deliveriesController));
router.delete('/:id', deliveriesController.delete.bind(deliveriesController));

export default router;

