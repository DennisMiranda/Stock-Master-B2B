import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

// Middleware que intercepta el Bearer Token
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        // Verificar el token con Firebase Admin
        const decodedToken = await auth.verifyIdToken(token);

        // Inyectar usuario en la request (se puede extender Request interface si se usa TypeScript estricto)
        (req as any).user = decodedToken;

        next();
    } catch (error) {
        console.error('Error verificando token:', error);
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
};
