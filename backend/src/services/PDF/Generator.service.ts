import type { Customer, OrderItem, Payment } from "../../models/PDF/document.model";

import PDFDocument from "pdfkit";
import "pdfkit-table";
import { Readable } from "stream";
export class PDFGeneratorService {

  createFactura(
  facturaNumber:string,
  dataUser: Customer,
  dataOrder: OrderItem[],
  payment: Payment
): Readable {

  const doc = new PDFDocument({
    size: "A4",
    margin: 50
  });

  /* ─────────────────────────────
     HEADER – LOGO
  ───────────────────────────── */
  doc.rect(50, 40, 180, 50).stroke();
  doc.fontSize(19)
     .text("LOGO DE EMPRESA", 50, 55, {
       width: 180,
       align: "center"
     });

  const direccionCompleta = `Direccion`;

  doc.fontSize(10)
     .text(direccionCompleta, 50, 110)
     .text("contacto@miempresa.com", 50, 125);

  /* ─────────────────────────────
     CUADRO RUC / FACTURA
  ───────────────────────────── */
  const boxX = 350;
  const boxY = 50;
  const boxW = 200;

  doc.rect(boxX, boxY, boxW, 90).stroke();

  doc.fontSize(14).font("Helvetica-Bold")
     .text(`RUC: ${dataUser.RUC}`, boxX, boxY + 10, {
       align: "center",
       width: boxW
     });

  doc.fontSize(15).fillColor("red")
     .text("FACTURA ELECTRÓNICA", boxX, boxY + 35, {
       align: "center",
       width: boxW
     });

  doc.fillColor("black").fontSize(12)
     .text(`F001-${facturaNumber}`, boxX, boxY + 60, {
       align: "center",
       width: boxW
     });

  /* ─────────────────────────────
     LÍNEA DIVISORIA
  ───────────────────────────── */
  doc.moveTo(50, 160).lineTo(545, 160).stroke();

  /* ─────────────────────────────
     DATOS DEL CLIENTE
  ───────────────────────────── */
  doc.fontSize(11).font("Helvetica-Bold")
     .text("DATOS DEL CLIENTE", 50, 175);

  doc.fontSize(10).font("Helvetica")
     .text(`Nombre: ${dataUser.companyName}`, 50, 195)
     .text(`Dirección: ${direccionCompleta}`, 50, 210);

  /* ─────────────────────────────
     TABLA DE ITEMS
  ───────────────────────────── */
  const tableTop = 260;

  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Descripción", 50, tableTop);
  doc.text("Cant.", 300, tableTop);
  doc.text("P. Unit.", 360, tableTop);
  doc.text("Total", 450, tableTop);

  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

  doc.font("Helvetica").fontSize(10);

  let y = tableTop + 25;

     const items:OrderItem[] = dataOrder
    items.forEach(item => {
    const totalItem = item.price * item.quantity;

    doc.text(item.name, 50, y, { width: 230 });
    doc.text(item.quantity.toString(), 300, y);
    doc.text(`S/ ${item.price.toFixed(2)}`, 360, y);
    doc.text(`S/ ${totalItem.toFixed(2)}`, 450, y);

    y += 20;
  });

  /* ─────────────────────────────
     TOTAL
  ───────────────────────────── */
  doc.font("Helvetica-Bold");
  doc.text("TOTAL:", 360, y + 30);
  doc.text(`S/ ${payment.total.toFixed(2)}`, 450, y + 30);

  /* ─────────────────────────────
     FOOTER
  ───────────────────────────── */
  doc.fontSize(9).font("Helvetica")
     .text(
       "Gracias por su preferencia",
       50,
       760,
       { align: "center", width: 495 }
     );

  doc.end();

  return doc as unknown as Readable;
}

  createGuia(name: string): Readable {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  let y = 50;

  // ─────────────────────────────
  // HEADER
  // ─────────────────────────────

  // Logo (placeholder)
  doc.rect(50, y, 150, 50).stroke();
  doc.fontSize(10).text("LOGO", 50, y + 18, {
    width: 150,
    align: "center",
  });

  // Título
  doc.font("Helvetica-Bold").fontSize(16)
    .text("GUÍA DE REMISIÓN – REMITENTE", 0, y, {
      align: "center",
    });

  // Cuadro RUC / Serie
  doc.rect(350, y, 180, 70).stroke();
  doc.fontSize(10).text("RUC: 20123456789", 350, y + 10, {
    width: 180,
    align: "center",
  });
  doc.fontSize(12).text("T001-000001", 350, y + 30, {
    width: 180,
    align: "center",
  });

  y += 90;

  // ─────────────────────────────
  // DATOS DEL TRASLADO
  // ─────────────────────────────
  doc.font("Helvetica-Bold").fontSize(11)
    .text("DATOS DEL TRASLADO", 50, y);

  y += 15;

  doc.font("Helvetica").fontSize(10)
    .text("Punto de partida: Almacén Central", 50, y)
    .text("Punto de llegada: Cliente Final", 50, y + 15)
    .text("Motivo del traslado: Venta", 50, y + 30)
    .text("Fecha de traslado: 28/12/2025", 350, y);

  y += 55;
  doc.moveTo(50, y).lineTo(545, y).stroke();
  y += 15;

  // ─────────────────────────────
  // DATOS DEL DESTINATARIO
  // ─────────────────────────────
  doc.font("Helvetica-Bold").text("DATOS DEL DESTINATARIO", 50, y);
  y += 15;

  doc.font("Helvetica")
    .text(`Nombre: ${name}`, 50, y)
    .text("DNI / RUC: 74589632", 50, y + 15)
    .text("Dirección: Jr. Los Olivos 123", 50, y + 30);

  y += 55;
  doc.moveTo(50, y).lineTo(545, y).stroke();
  y += 15;

  // ─────────────────────────────
  // DATOS DEL TRANSPORTISTA
  // ─────────────────────────────
  doc.font("Helvetica-Bold").text("DATOS DEL TRANSPORTISTA", 50, y);
  y += 15;

  doc.font("Helvetica")
    .text("Empresa: Transportes Perú SAC", 50, y)
    .text("RUC: 20547896321", 50, y + 15)
    .text("Placa del vehículo: ABC-123", 350, y)
    .text("Conductor: Juan Torres", 350, y + 15);

  y += 50;
  doc.moveTo(50, y).lineTo(545, y).stroke();
  y += 15;

  // ─────────────────────────────
  // DETALLE DE BIENES
  // ─────────────────────────────
  doc.font("Helvetica-Bold").text("DETALLE DE BIENES", 50, y);
  y += 15;

  doc.fontSize(10).text("Descripción", 50, y);
  doc.text("Unidad", 300, y);
  doc.text("Cantidad", 400, y);

  y += 10;
  doc.moveTo(50, y).lineTo(545, y).stroke();
  y += 10;

  doc.font("Helvetica")
    .text("Producto de prueba", 50, y)
    .text("UND", 300, y)
    .text("5", 400, y);

  y += 40;

  // ─────────────────────────────
  // FOOTER
  // ─────────────────────────────
  doc.fontSize(9)
    .text(
      "Documento generado electrónicamente conforme a SUNAT",
      50,
      760,
      { width: 495, align: "center" }
    );

  // Cerrar
  doc.end();

  return doc as unknown as Readable;
}
}
