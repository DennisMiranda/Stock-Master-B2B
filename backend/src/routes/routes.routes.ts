import { Router } from 'express';
import { routesController } from '../controllers/routes.controller';

const router = Router();

router.get('/', routesController.getAll.bind(routesController));
router.get('/:id', routesController.getById.bind(routesController));

router.get('/driver/:driverId', routesController.getByDriver.bind(routesController));
router.post('/optimize', routesController.createOptimized.bind(routesController));
router.patch('/:id/status', routesController.updateStatus.bind(routesController));
router.delete('/:id', routesController.delete.bind(routesController));
router.post('/:id/orders', routesController.addOrder.bind(routesController)); 
router.delete('/:id/orders/:orderId', routesController.removeOrder.bind(routesController)); 
router.patch('/:id/orders/:orderId/deliver', routesController.markOrderAsDelivered.bind(routesController)); 

export default router;