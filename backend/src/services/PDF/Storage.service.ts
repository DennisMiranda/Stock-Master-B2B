import { drive } from "../../config/driveClient";

export class PDFStorageService {

    PDF: any;

    constructor (PDF: any) {
        this.PDF = PDF;
    }

    async uploadPDF(buffer: Buffer, filename: string): Promise<any> {
        const response = await drive.files.create({
            requestBody: {
                name: filename,
                mimeType: "application/pdf",
            },
            media: {
                mimeType: "application/pdf",
                body: buffer,
            },
        });
        return response.data.id;
    }       
}