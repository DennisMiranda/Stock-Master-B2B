import { Router } from "express";
import { UserDocCheck } from "../../middlewares/PDF/UserDocCheck.middleware";

const router = Router();

// /v1/api/pdf/download/:pdfId  (ruta para mostrar o descargar un PDF desde su ID para usuarios autenticados)
router.get("/download/?:pdfId", UserDocCheck , )

export default router;