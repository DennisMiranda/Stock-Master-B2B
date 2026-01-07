import type { Customer, OrderItem, Payment } from "../../models/PDF/document.model";
import PDFDocument from "pdfkit";
import "pdfkit-table";
import { Readable } from "stream";

export class PDFGeneratorService {

  createFactura(
    facturaNumber: string,
    dataUser: Customer,
    dataOrder: OrderItem[],
    payment: Payment
  ): Readable {
    const doc = new PDFDocument({ size: 'A4', margin: 10 });

    // --- HEADER ---
    // Aplicamos el verde oscuro institucional directamente
    doc.fillColor('#1B4D3E').font('Helvetica-Bold').fontSize(14)
    .text('NOMBRE COMPLETO DE LA EMPRESA', 0, 30, { width: 595, align: 'center' });

    doc.fillColor('#333333').font('Helvetica').fontSize(10)
    .text('DIRECCIÓN COMPLETA DE LA EMPRESA', { width: 595, align: 'center' });

    doc.moveDown(0.5);
    doc.fillColor('#666666').fontSize(9)
    .text('Teléfono: 987 987 987 | E-mail: test@ejemplo.com | Sucursal: Principal', 
    { width: 595, align: 'center', lineGap: 5 });

    // Cuadro de Factura - Color institucional
    doc.rect(440, 10, 150, 100).lineWidth(1.5).strokeColor('#1B4D3E').stroke();
    doc.fillColor('#333333').font('Helvetica-Bold').fontSize(13)
    .text(`RUC: ${dataUser.RUC}`, 440, 30, { width: 150, align: 'center' });
    doc.fillColor('#1B4D3E').text('FACTURA ELECTRÓNICA', 440, 50, { width: 150, align: 'center' });
    doc.fillColor('#333333').font('Helvetica').text(facturaNumber, 440, 86, { width: 150, align: 'center' });

    // Separador sutil
    doc.moveTo(20, 120).lineTo(575, 120).lineWidth(1).strokeColor('#2E5A88').stroke();

    // --- DESCRIPCIÓN DE USUARIO ---
    doc.fillColor('#333333').font('Helvetica-Bold').fontSize(10)
    .text('Señores: \nDirección: \nRUC: \nMedio de Pago:', 20, 135, { lineGap: 5 });

    const fullAddress = `${dataUser.addres.street} ${dataUser.addres.number}, ${dataUser.addres.city}`;
    doc.font('Helvetica')
    .text(`${dataUser.companyName} \n${fullAddress} \n${dataUser.RUC} \n${dataUser.payMethod}`, 130, 135, { lineGap: 5 });

    doc.font('Helvetica-Bold').text(`Fecha Emisión: `, 360, 187);
    doc.font('Helvetica').text(dataUser.date, 445, 187);
    doc.font('Helvetica-Bold').text(`Moneda: `, 500, 187);
    doc.font('Helvetica').text(dataUser.moneda, 550, 187);

    doc.moveTo(20, 205).lineTo(575, 205).lineWidth(1).strokeColor('#2E5A88').stroke();

    // --- CABECERA DE TABLA ---
    doc.rect(10, 210, 575, 20).fillColor('#1B4D3E').fillAndStroke();
    doc.fillColor('white').font('Helvetica-Bold').fontSize(9);
    const headerY = 216;
    doc.text('#', 10, headerY, { width: 30, align: 'center' })
    .text('Cant.', 40, headerY, { width: 40, align: 'center' })
    .text('Und', 150, headerY, { width: 50, align: 'center' })
    .text('Descripción', 200, headerY, { width: 210, align: 'center' })
    .text('Precio', 410, headerY, { width: 60, align: 'center' })
    .text('Valor Venta', 520, headerY, { width: 65, align: 'center' });

    // --- BUCLE DE ITEMS ---
    // Iniciamos la posición Y debajo de la cabecera
    let currentY = 235; 
    const itemHeight = 18; // Reducimos levemente para ganar espacio

    dataOrder.forEach((item, index) => {
    doc.fillColor('#333333').font('Helvetica').fontSize(9)
        .text((index + 1).toString(), 10, currentY, { width: 30, align: 'center' })
        .text(item.quantity.toString(), 40, currentY, { width: 40, align: 'center' })
        .text('UND', 150, currentY, { width: 50, align: 'center' })
        .text(item.name, 200, currentY, { width: 210 })
        .text(item.price.toFixed(2), 410, currentY, { width: 60, align: 'center' })
        .text((item.price * item.quantity).toFixed(2), 520, currentY, { width: 65, align: 'center' });

    currentY += itemHeight;

    // Línea divisoria muy suave entre filas para mejorar legibilidad
    doc.moveTo(10, currentY - 2).lineTo(585, currentY - 2).lineWidth(0.5).strokeColor('#F0F0F0').stroke();
    });

    // --- SECCIÓN DE TOTALES ---
    const totalYStart = 730;
    doc.moveTo(340, 720).lineTo(575, 720).lineWidth(1.5).strokeColor('#1B4D3E').stroke();

    doc.fillColor('#333333').font('Helvetica').fontSize(10)
    .text(`Total Venta Exonerada \nTotal IGV \nImporte Total de la Venta`, 340, totalYStart, { lineGap: 5 });

    doc.font('Helvetica-Bold').text(`${dataUser.moneda} \n${dataUser.moneda} \n${dataUser.moneda}`, 470, totalYStart, { lineGap: 5 });

    doc.font('Helvetica-Bold')
    .text(`${payment.subtotal.toFixed(2)} \n${payment.tax.toFixed(2)} \n${payment.total.toFixed(2)}`, 
            0, totalYStart, { width: 575, align: 'right', lineGap: 5 });

    // --- FOOTER ---
    doc.rect(10, 810, 300, 22).fillColor('#1B4D3E').fillAndStroke();
    doc.fillColor('#666666').font('Helvetica').fontSize(9)
    .text('SON: MONTO INGRESADO EN TEXTO', 20, 795, { width: 300 });

    doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
    .text('Detalle de Forma de Pago: Contado', 10, 816, { width: 300, align: 'center' });

    doc.end();
    return doc as unknown as Readable;
  }

 // Generador de GUIA de Remicion
    createGuia(name: string): Readable {
        // Tamaño del documento A4: 595 * 841
        // Mantenemos el margen 10 como pediste
        const doc = new PDFDocument({ size: 'A4', margin: 10 });

        // --- HEADER ---
        doc.font('Helvetica-Bold').fontSize(13)
        .text('NOMBRE COMPLETO DE LA EMPRESA', 0, 30, { width: 595, align: 'center' });

        doc.font('Helvetica').fontSize(11)
        .text('DIRECCION COMPLETA DE LA EMPRESA', { width: 595, align: 'center' });

        doc.moveDown(0.5);
        doc.fontSize(10)
        .text('telefono: 987987987\nE-mail: test@ejemplo.com\nSucursal: Principal', 
        { width: 595, align: 'center', lineGap: 5 });

        // Zona de cuadro para logo
        doc.rect(20, 10, 100, 100)
        .lineWidth(1)
        .strokeColor('green')
        .stroke();

        // Zona de cuadro para texto de factura
        doc.rect(440, 10, 150, 100)
        .lineWidth(1)
        .strokeColor('green')
        .stroke();

        doc.fillColor('black').fontSize(14)
        .text('RUC: 3216549871', 440, 30, { width: 150, align: 'center' });
        
        doc.font('Helvetica-Bold').fontSize(14)
        .text('FACTURA ELECTRONICA', 440, 50, { width: 150, align: 'center' });
        
        doc.font('Helvetica').fontSize(14)
        .text('FFA9-6543', 440, 86, { width: 150, align: 'center' });

        // Separador azul
        doc.moveTo(0, 120).lineTo(595, 120)
        .lineWidth(1)
        .strokeColor('blue')
        .stroke();

        // --- DESCRIPCION DE USUARIO ---
        doc.fillColor('black').fontSize(12)
        .text('Señores: \nDireccion: \nRuc: \nMedio de Pago:', 20, 130, { width: 595, lineGap: 5 });

        doc.text('nombre de empresa \nDIREECCION DE EMPRESA COMPLETA UNIDA \n20654654525 \nContado', 130, 130, { width: 595, lineGap: 5 });

        doc.fontSize(12).text('Fecha Emision: ', 250, 187);
        doc.text('15/6465-452: ', 335, 187);
        doc.text('Moneda: ', 460, 187);
        doc.text('PEN', 510, 187);
        
        doc.moveTo(0, 205).lineTo(595, 205)
        .lineWidth(1).strokeColor('blue').stroke();
        
        // --- CABECERA DE TABLA ---
        // Corregido: Separamos fillColor de la acción de dibujar
        doc.rect(0, 210, 595, 20)
        .lineWidth(1)
        .fillColor('green')
        .fillAndStroke();
        
        // Resetear a negro para el texto de la tabla
        doc.fillColor('black').fontSize(11);
        const tableY = 215;
        doc.text('#', 0, tableY, { width: 30, align: 'center' })
        .text('Cant.', 30, tableY, { width: 40, align: 'center' })
        .text('Codigo', 70, tableY, { width: 70, align: 'center' })
        .text('Und', 140, tableY, { width: 50, align: 'center' })
        .text('Descripcion', 190, tableY, { width: 210, align: 'center' })
        .text('Precio', 400, tableY, { width: 60, align: 'center' })
        .text('Dscto', 460, tableY, { width: 50, align: 'center' })
        .text('Valor Venta', 510, tableY, { width: 80, align: 'center' });

        // --- SECCIÓN DE TOTALES ---
        doc.moveTo(0, 720).lineTo(595, 720).strokeColor('blue').stroke();
        doc.moveTo(300, 745).lineTo(595, 745).stroke();
        doc.moveTo(480, 762).lineTo(595, 762).stroke();
        doc.moveTo(480, 782).lineTo(595, 782).stroke();

        doc.fillColor('black').fontSize(11)
        .text('Total Venta Exonerada \nTotal IGV \nImporte Total de la Venta', 340, 730, { width: 595, lineGap: 5 });

        doc.text('S/. \nS/. \nS/.', 480, 730, { width: 595, lineGap: 5 });

        // Corregido: Alineación derecha usando un width seguro
        doc.text('123456.00 \n100.00 \n123456789', 0, 730, { width: 585, align: 'right', lineGap: 5 });
        
        // --- FOOTER ---
        doc.rect(0, 810, 300, 20)
        .fillColor('green')
        .fillAndStroke();

        doc.fillColor('black').fontSize(11)
        .text('SON: MONTO INGRESADO EN TEXTO', 10, 795, { width: 300 });
        
        doc.text('Detalle de Forma de Pago: Contado', 0, 815, { width: 300, align: 'center' });

        doc.end();
    return doc as unknown as Readable;
    }
}