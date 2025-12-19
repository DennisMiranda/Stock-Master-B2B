import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[ErrorMiddleware] ${err.message}`, err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Firebase Auth Custom Errors mapping
    if (err.code === "auth/email-already-exists") {
        res.status(400).json({ success: false, error: "El email ya está en uso" });
        return;
    }

    if (err.errors) {
        // Zod Errors
        res.status(400).json({ success: false, error: err.errors });
        return;
    }

    res.status(statusCode).json({
        success: false,
        error: message,
    });
};
