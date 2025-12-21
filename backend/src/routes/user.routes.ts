import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Rutas protegidas (Solo Admin)
router.get('/', authMiddleware, requireRole(['admin']), userController.getAllUsers);
router.post('/', authMiddleware, requireRole(['admin']), userController.createUser);
router.put('/:uid', authMiddleware, requireRole(['admin']), userController.updateUser);

export const userRoutes = router;
