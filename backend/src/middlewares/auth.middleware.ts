import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase.js';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        console.warn('[AuthMiddleware] No token provided');
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    const token = header.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token as string);
        req.user = decodedToken;

        // Extracción de rol desde Custom Claims
        // @ts-ignore - claims is generic object
        if (decodedToken.role) {
            req.role = decodedToken.role;
        }

        next();
    } catch (error) {
        console.error('[AuthMiddleware] Invalid token:', error);
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
        return;
    }
};
