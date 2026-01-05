import { Router } from "express";
import { UserDocCheck } from "../../middlewares/PDF/documentCheck.middleware";
import streamDocController from "../../controllers/PDF/SteamDoc.controller";
import pdfController from "../../controllers/PDF/PDF.controller";
const router = Router();

// ruta para mostrar el pdf de factura
router.get("/factura/:orderDoc" , (req, res, next) => streamDocController.streamPdf(req, res, "factura"));
// ruta para mostrar guias
router.get("/guide/:orderDoc" , (req, res, next) => streamDocController.streamPdf(req, res, "guide"));
// ruta para emitir guia
router.post("/create/guide", pdfController.emitGuia);

//ruta para test de datos de order
router.get("/orderTest", pdfController.emitFactura) 

export default router;