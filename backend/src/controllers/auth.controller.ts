import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema } from '../utils/validators';

const authService = new AuthService();

export const register = async (req: Request, res: Response): Promise<any> => {
    try {
        // 1. Validar input con Zod
        const validation = registerSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: 'Datos inválidos',
                errors: (validation.error as any).errors
            });
        }

        // 2. Llamar al servicio
        const newUser = await authService.registerUser(validation.data);

        // 3. Responder
        return res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: newUser
        });

    } catch (error: any) {
        console.error('Error en registro:', error);
        // Manejo básico de errores de Firebase
        if (error.code === 'auth/email-already-exists') {
            return res.status(409).json({ message: 'El email ya está registrado' });
        }
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const sync = async (req: Request, res: Response): Promise<any> => {
    try {
        const { uid, email, displayName } = req.body;

        if (!uid || !email) {
            return res.status(400).json({ message: 'UID y Email son requeridos' });
        }

        const user = await authService.syncUser(uid, email, displayName);

        return res.status(200).json({
            message: 'Usuario sincronizado',
            user
        });
    } catch (error) {
        console.error('Error en sync:', error);
        return res.status(500).json({ message: 'Error interno al sincronizar usuario' });
    }
};
