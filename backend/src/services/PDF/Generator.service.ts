import PDFDocument from "pdfkit";
import "pdfkit-table";

export class PDFGeneratorService {

  createFacturaPDF(datos: { name: string }) {
    const { name } = datos;

    // 1. Crea el documento
    const doc = new PDFDocument({
      size: "A4",
      margin: 50
    });

    // 2. Escribir el contenido
    doc.fontSize(20).text(`Factura de ${name}`, {
      align: "center"
    });

    doc.moveDown();
    doc.fontSize(12).text("Gracias por su compra.");

    // 3. Cerrar documento
    doc.end();

    // 4. Devolver el PDF como flujo
    return doc;
  }
}
