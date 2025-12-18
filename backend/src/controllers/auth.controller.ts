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
}
