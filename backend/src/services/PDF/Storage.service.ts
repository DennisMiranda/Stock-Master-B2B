import { drive } from "../../config/driveClient";
import {Readable} from "stream";
import { db } from "../../config/firebase";
import { env } from "../../config/env";

export class PDFStorageService {

    constructor () {}

    // función para subir el PDF a Google Drive mediande un stream => usando OAuth2
    async sabeDocument(pdfStream: Readable, docID: string, typePdf: string): Promise<{fileID: string}> {

        let uploadType;
        
        switch(typePdf) {
            case "factura": uploadType = [env.googleDrive.foldeFactura];
            break;
            case "guia": uploadType = [env.googleDrive.folderGuia];
            break;
            default: uploadType = [env.googleDrive.foldeFactura];
        };

        const response = await drive.files.create({
            requestBody: {
                name: docID,
                mimeType: "application/pdf",
                parents: uploadType,
            },
            media: {
                mimeType: "application/pdf",
                body: pdfStream,
            },
            supportsAllDrives: true
        });

        if ( !response.data.id ) {
            throw new Error("Error al subir el PDF a Google Drive");
        }

        return { fileID: response.data.id! };
    };

    // función para guardar el ID del archivo en Firestore
    async SabeId (fileID: string, userId: string): Promise<string> {

        // Guardar en Firestore en la colección "orders"
        await db.collection("orders").doc(userId).update({
            factura: fileID,
        });
        return "ID guardado correctamente";
    };

    //funcion para extraer pdfID de Firestore y armar la url para enviarla al cliente por stream
    async getUrl (orderId: string): Promise<string> {
        const doc = await db.collection("orders").doc(orderId).get();
        if( !doc.exists) {
            throw new Error(`Documento ${orderId} no encontrado`);
        }
        const data = doc.data();
        if( !data ) {
            throw new Error("Datos no encontrados");
        }
        
        return data.factura;
    }

    //funcion conectar por stram el pdf de drive al cliente
    async steamToClient (url: string ): Promise<Readable> {
        const response = await drive.files.get({
            fileId: url,
            alt: "media",
        }, { responseType: "stream" });

        return response.data as Readable;
    }
}