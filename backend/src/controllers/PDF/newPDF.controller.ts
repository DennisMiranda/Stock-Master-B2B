import type { Request, Response } from "express";
import { Readable } from "stream";
import type { OrderItem, Address, Customer, Payment } from "../../models/PDF/document.model";
import { NewPdfService } from "../../services/PDF/newPDF.service";

export class PDFController {
  constructor(private pdfService = new NewPdfService()) {}

  emitFactura = async (req: Request, res: Response) => {
    const orderId: string = res.locals.orderId as string;
    if (!orderId) {
      return res.status(400).json({ message: "Order ID not found in request context" });
    }

    try {
      const fileID = await this.pdfService.emitFactura(orderId);
      res.status(200).json({ fileID });
    } catch (error) {
      console.error("Error al emitir la factura:", (error as Error).message);
      res.status(500).json({ message: "Error al emitir la factura" });
    }
  };

  emitGuia = async (req: Request, res: Response) => {
    const orderId = req.query.orderId as string;
    if (!orderId) {
      return res.status(400).json({ message: "Order ID not found in request context" });
    }

    try {
      const fileID = await this.pdfService.emitGuia(orderId);
      res.status(200).json({ fileID });
    } catch (error) {
      console.error("Error al emitir la guia:", (error as Error).message);
      res.status(500).json({ message: "Error al emitir la guia" });
    }
  };

  tryorder = async (req: Request, res: Response) => {
    const orderData = await this.pdfService.tryOrder("a08YEG3CIDAOZHvPW7St");
    console.log(orderData);

    if (!orderData) {
      res.status(401).json({ message: "Order ID not found" });
    }
  };
}

const pdfController = new PDFController();
export default pdfController;
