import { Request, Response } from "express";
import { saveSubscriber } from "../services/newsletter.service";

/**
 * Controlador: suscripción al newsletter.
 * Ruta: POST /v1/api/newsletter
 */
export const addSubscriber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      console.warn("⚠️ [Newsletter] Solicitud sin correo electrónico");
      res.status(400).json({
        success: false,
        message: "El campo 'email' es obligatorio.",
      });
      return;
    }

    const result = await saveSubscriber(email);

    if (result.duplicate) {
      res.status(200).json({
        success: true,
        duplicate: true,
        message: result.message,
      });
    } else {
      res.status(201).json({
        success: true,
        duplicate: false,
        message: result.message,
      });
    }
  } catch (error: any) {
    console.error("❌ [Newsletter] Error en la suscripción:", error.message);

    if (error.message.includes("Formato de correo inválido")) {
      res.status(400).json({
        success: false,
        message: "El formato del correo no es válido.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
    });
  }
};
