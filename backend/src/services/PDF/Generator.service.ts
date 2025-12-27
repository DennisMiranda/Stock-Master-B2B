import PDFDocument from "pdfkit";
import "pdfkit-table";


export const generatePDF = async (): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    // Crear documento PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    // usamos buffers para almacenar los datos del PDF en memoria antes de enviarlo a drive
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Título
    doc.fontSize(20).text(`Factura`, { align: "center" });
    doc.end();
  });
};
