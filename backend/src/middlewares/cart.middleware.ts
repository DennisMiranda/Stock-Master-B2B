// auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'UNAUTHORIZED' });
  const token = auth.substring(7);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).userId = decoded.uid;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'INVALID_TOKEN' });
  }
}
