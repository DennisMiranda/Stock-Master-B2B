import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.role;

        if (!userRole) {
            res.status(403).json({ message: 'Forbidden: No role assigned' });
            return;
        }

        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            console.warn(`[RoleMiddleware] Access denied for role: ${userRole}. Required: ${allowedRoles.join(', ')}`);
            res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            return;
        }
    };
};
