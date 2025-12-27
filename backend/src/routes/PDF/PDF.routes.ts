import { Router } from "express"

const router = Router();

// /v1/api/pdf/download/:pdfId  (ruta para mostrar o descargar un PDF desde su ID para usuarios autenticados)
router.get("/download/?:pdfId", (req, res) => {""})

export default router;