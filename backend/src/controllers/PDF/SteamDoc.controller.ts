import type { Request, Response } from "express";
import { PDFStorageService } from "../../services/PDF/Storage.service";
import {pipeline} from "stream/promises"
import { Readable } from "stream";
export class StreamDocController {
    
    constructor (
        private pdf = new PDFStorageService()
    ){}

    streamPdf = async (req: Request, res: Response, type: string) => {
        try {
            // obtenemos el uid del usuario autenticado
            const orderId:string = req.user?.uid || " ";
            // obtenemos la url del pdf desde firestore
            const url:string = await this.pdf.getUrl(orderId , type);
            // configuramos los headers para enviar el pdf
            res.setHeader("content-type", "application/pdf");
            res.setHeader("content-Disposition", "inline; filename=document.pdf");
            // conectamos el stream de drive al cliente
            const pdfStream: Readable = await this.pdf.steamToClient(url);

            // enviamos el stream al cliente
            await pipeline(
                pdfStream,
                res as any
            );
        } catch (error) {
            if(!res.headersSent) {
                console.error("Error getUrl");
                res.status(500).json({ message: (error as Error).message });
            } else {
                console.error("Error en stream", (error as Error));
                res.end();
            }                
        }
    };

    testOrders = async (req: Request, res: Response) => {

    }

}

const streamDocController = new StreamDocController();
export default streamDocController;