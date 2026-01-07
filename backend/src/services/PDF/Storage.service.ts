import { drive } from "../../config/driveClient";
import {Readable} from "stream";
import { db } from "../../config/firebase";
import { env } from "../../config/env";
import { FieldValue } from "firebase-admin/firestore";
import { log } from "console";

export class PDFStorageService {

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

    //funcion para aumentar count de factura o guia en Firestore
    async increaseCount ( typePdf: "Factura" | "Guia" ): Promise<number> {

        const countField = "valor";
        // aumentamos el contador en Firestore
        await db.collection("counters").doc(`${typePdf}`).update({
            [countField]: FieldValue.increment(1)
        });
        // obtenemos el nuevo valor del contador
        const doc = await db.collection("counters").doc(`${typePdf}`).get();
        const data = doc.data();
        const newValue = data ? data[countField] : 0;

        return newValue;
    };

    // función para guardar el ID del archivo en Firestore
    async SabeId (fileID: string, userId: string, type: string): Promise<string> {

        // Guardar en Firestore en la colección "orders"
        await db.collection("orders").doc(userId).update({
            [type]: fileID,
        });
        return "ID guardado correctamente";
    };

    //funcion para extraer pdfID de Firestore y armar la url para enviarla al cliente por stream
    async getUrl (orderId: string, type: string): Promise<string> {
        const doc = await db.collection("orders").doc(orderId).get();
        if( !doc.exists) {
            throw new Error(`Documento ${orderId} no encontrado`);
        }
        
        const data = doc.data();
        if( !data ) {
            throw new Error("Datos no encontrados");
        }
        
        return data[type];
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