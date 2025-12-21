import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, syncSchema } from "../utils/validators";

export class AuthController {
    // [POST] /v1/api/auth/register
    static async register(req: Request, res: Response): Promise<void> {
        // 1. Validar Body con Zod
        const validatedData = registerSchema.parse(req.body);

        // 2. Llamar al Servicio
        const user = await AuthService.registerB2B(validatedData);

        res.status(201).json({
            success: true,
            message: "Usuario registrado correctamente",
            uid: user.uid,
        });
    }

    // [POST] /v1/api/auth/sync
    static async sync(req: Request, res: Response): Promise<void> {
        // 1. Validar payload
        const validatedData = syncSchema.parse(req.body);

        // 2. Sincronizar
        await AuthService.syncGoogleUser(validatedData);

        res.status(200).json({ success: true, message: "Usuario sincronizado" });
    }

    // [POST] /v1/api/auth/claim-admin
    static async claimAdmin(req: Request, res: Response): Promise<void> {
        const { secret } = req.body;
        const authHeader = req.headers.authorization;

        if (!secret || secret !== process.env.ADMIN_SECRET) {
            res.status(403).json({ success: false, message: "Invalid Admin Secret" });
            return;
        }

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: "No token provided" });
            return;
        }

        const token = authHeader.split(' ')[1];

        try {
            await AuthService.grantAdminRole(token as string);
            res.status(200).json({ success: true, message: "Admin role granted successfully" });
        } catch (error) {
            console.error("Error granting admin role:", error);
            res.status(500).json({ success: false, message: "Failed to grant role" });
        }
    }
}
