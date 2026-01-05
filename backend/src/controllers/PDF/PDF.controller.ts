import  type { Request, Response } from "express";
import type { DataUser } from "../../models/PDF/document.model";
import { PDFStorageService } from "../../services/PDF/Storage.service";
import { PDFGeneratorService } from "../../services/PDF/Generator.service";
import {Readable} from "stream";
import { StatisticService } from "../../services/statistic.service";
import { OrderService } from "../../services/order/order.service";
import { ProductService } from "../../services/product.service";
import { db } from "../../config/firebase";
export class PDFController {
    
    constructor (
        private pdfStorage = new PDFStorageService(),
        private pdfGenerator = new PDFGeneratorService(),
        private productService = new ProductService(),
        private statisticService = new StatisticService(),
        private orderService = new OrderService(productService, statisticService)
    ){} 

    emitFactura = async (req: Request, res: Response) => {
        
        //extraemos id de order generada en el controller anterior
        const orderId = res.locals.orderId;
        if (!orderId) {
            return  res.status(400).json({ message: "Order ID not found in request context" });
        }
        console.log("Order ID:", orderId);
        // aumentar el contador de guias y obtener el nuevo valor
        const facturaNumber :number = await this.pdfStorage.increaseCount("Factura");
        console.log("valo actual es :", facturaNumber);
        // obtenemos datos de order y usuario
        const dataOrder = await this.orderService.getOrderById(orderId);
        if (!dataOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        // generar el PDF de la factura
        const userSnap  = await (await db.collection("usuarios").doc(dataOrder?.userId).get())
        if(!userSnap .exists){
            return res.status(404).json({message: "User not fount"})
        }
        
        const dataUser  = userSnap.data() as DataUser
         const pdf: Readable = this.pdfGenerator.createFactura(
            "20123456789",           // RUC empresa
            facturaNumber,
            dataOrder,
            dataUser
            );

        try {
            // subir el PDF a Google Drive
            const { fileID } = await this.pdfStorage.sabeDocument(
                pdf,
                `FACTURA-${facturaNumber}`,
                "factura"
            );
            console.log("File ID de la factura subida:", fileID);
            // guadar el ID del archivo en Firestore
            await this.pdfStorage.SabeId(fileID, orderId, "factura");
            // responder al cliente con el ID del archivo
            console.log(`id de achivo subido es ${fileID}`);
            
            res.status(200).json({ fileID });
        } catch (error) {
            console.error("Error al emitir la factura:", (error as Error).message);
            res.status(500).json({ message: "Error al emitir la factura" });
        }   
    };

    emitGuia = async (req: Request, res: Response) => {
        
        //extraemos id de order generada en el controller anterior
        const orderId = req.query.orderId as string;
        if (!orderId) {
            return  res.status(400).json({ message: "Order ID not found in request context" });
        }

        console.log("Order ID:", orderId);
        // aumentar el contador de guias y obtener el nuevo valor
        const newValue :number = await this.pdfStorage.increaseCount("Guia");
        console.log("valo actual es :", newValue);
        // generar el PDF de la guia
        const pdf : Readable = this.pdfGenerator.createGuia(
            "Cliente",
        );

        try {
            // subir el PDF a Google Drive
            const { fileID } = await this.pdfStorage.sabeDocument(
                pdf,
                `FACTURA-${newValue}`,
                "guia"
            );
            console.log("File ID de la factura subida:", fileID);
            // guadar el ID del archivo en Firestore
            await this.pdfStorage.SabeId(fileID, orderId, "guia");
            // responder al cliente con el ID del archivo
            console.log(`id de achivo subido es ${fileID}`);
            
            res.status(200).json({ fileID });
        } catch (error) {
            console.error("Error al emitir la factura:", (error as Error).message);
            res.status(500).json({ message: "Error al emitir la factura" });
        }   
    };
    
    tryorder = async (req: Request, res: Response) => { 
        const orderData = await this.orderService.getOrderById('a08YEG3CIDAOZHvPW7St')
        console.log(orderData);
        
        if(!orderData){
            res.status(401).json({message: "Order ID not found"})
        }
        
    }
}

const pdfController = new PDFController();
export default pdfController;