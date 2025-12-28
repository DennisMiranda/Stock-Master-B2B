import { drive } from "../../config/driveClient";
import {Readable} from "stream";
import { db } from "../../config/firebase";

export class PDFStorageService {

    constructor () {}

    // función para subir el PDF a Google Drive mediande un stream
    async pdfSabeDrive(pdfStream: Readable, filename: string): Promise<{fileID: string}> {
        const response = await drive.files.create({
            requestBody: {
                name: filename,
                mimeType: "application/pdf",
            },
            media: {
                mimeType: "application/pdf",
                body: pdfStream,
            },
        });

        if ( !response.data.id ) {
            throw new Error("Error al subir el PDF a Google Drive");
        }

        return { fileID: response.data.id! };
    };

    // función para guardar el ID del archivo en Firestore
    async pdfSabeId (fileID: string, userId: string): Promise<string> {

        // Guardar en Firestore en la colección "orders"
        await db.collection("orders").doc(userId).set({
            fileID,
        });
        return "ID guardado correctamente";
    };

    //funcion para extraer pdfID de Firestore y armar la url para enviarla al cliente por stream
    async getUrl (userId: string): Promise<string> {
        const doc = await db.collection("orders").doc(userId).get();
        if( !doc) {
            throw new Error("Documento no encontrado");
        }
        const data = doc.data();
        if( !data ) {
            throw new Error("Datos no encontrados");
        }
        return `https://drive.google.com/uc?export=download&id=${data.fileID}`;
    }

    //funcion conectar por stram el pdf de drive al cliente
    async steamToClient (url: string): Promise<Readable> {
        const response = await drive.files.get({
            fileId: url,
            alt: "media",
        }, { responseType: "stream" });

        return response.data as Readable;
    }
}