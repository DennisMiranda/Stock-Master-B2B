import { Router } from 'express';
import { register, sync } from '../controllers/auth.controller';

const router = Router();

// Ruta POST /api/auth/register
router.post('/register', register);

// Ruta POST /api/auth/sync (Para Google Login)
router.post('/sync', sync);

export default router;
