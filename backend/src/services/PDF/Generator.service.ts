import type { Customer, OrderItem, Payment } from "../../models/PDF/document.model";
import PDFDocument from "pdfkit";
import "pdfkit-table";
import { Readable } from "stream";

export class PDFGeneratorService {

  createFactura(
    facturaNumber: string,
    customerUser: Customer,
    items: OrderItem[],
    payment: Payment
  ): Readable {
        // Tamaño del documento A4: 595 * 841
        // Mantenemos el margen 10 como pediste
        const doc = new PDFDocument({ size: 'A4', margin: 10 });

        // --- HEADER ---
        // Elegimos Helvetica-Bold para el título principal para dar autoridad
        doc.fillColor('#1B4D3E').font('Helvetica-Bold').fontSize(14)
        .text(`STOCKMASTER B2B DISTRIBUTOR`, 0, 30, { width: 595, align: 'center' });

        doc.fillColor('#333333').font('Helvetica').fontSize(10)
        .text('123 Calle Principal, Lima, Perú', { width: 595, align: 'center' });

        doc.moveDown(0.5);
        doc.fillColor('#666666').fontSize(9)
        .text('telefono: +51 924932128  |  E-mail: legal@stockmaster.com \nSucursal: Principal', 
        { width: 595, align: 'center', lineGap: 10 });

        // Zona de cuadro para logo - Color gris suave para no distraer
        doc.rect(20, 10, 100, 100)
        .lineWidth(0.5)
        .strokeColor('#CCCCCC')
        .stroke();

        // Zona de cuadro para texto de factura - Verde institucional
        doc.rect(440, 10, 150, 100)
        .lineWidth(1.5)
        .strokeColor('#1B4D3E')
        .stroke();

        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(13)
        .text('RUC: 20458556253', 440, 30, { width: 150, align: 'center' });
                
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#1B4D3E')
        .text('FACTURA ELECTRÓNICA', 440, 50, { width: 150, align: 'center' });
                
        doc.font('Helvetica').fontSize(14).fillColor('#333333')
        .text(`FFA9-${facturaNumber}`, 440, 86, { width: 150, align: 'center' });

        // Separador - Azul acero sutil
        doc.moveTo(20, 120).lineTo(575, 120)
        .lineWidth(1)
        .strokeColor('#2E5A88')
        .stroke();

        // --- DESCRIPCION DE USUARIO ---
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(10)
        .text('Señores: \nDireccion: \nRuc: \nMedio de Pago:', 20, 130, { width: 595, lineGap: 5 });
        
        const addresCompleto = `${customerUser.addres.number} ${customerUser.addres.street} ${customerUser.addres.city}`

        doc.font('Helvetica')
        .text(`${customerUser.companyName} \n${addresCompleto} \n${customerUser.RUC} \n${customerUser.payMethod}`, 130, 130, { width: 595, lineGap: 5 });

        doc.fontSize(10).font('Helvetica-Bold').text('Fecha Emisión: ', 350, 187);
        doc.font('Helvetica').text(`${customerUser.date}`, 430, 187);
        doc.font('Helvetica-Bold').text('Moneda: ', 495, 187);
        doc.font('Helvetica').text('PEN', 545, 187);
                
        doc.moveTo(20, 205).lineTo(575, 205)
        .lineWidth(1).strokeColor('#2E5A88').stroke();
                
        // --- CABECERA DE TABLA ---
        // Rellenamos con el verde oscuro para que resalte
        doc.rect(10, 210, 575, 20)
        .lineWidth(1)
        .fillColor('#1B4D3E')
        .fillAndStroke();
                
        // Texto de cabecera en blanco para contraste
        doc.fillColor('white').font('Helvetica-Bold').fontSize(9);
        const tableY = 216;
        doc.text('#', 10, tableY, { width: 30, align: 'center' })
        .text('Cant.', 40, tableY, { width: 40, align: 'center' })
        .text('Codigo', 80, tableY, { width: 70, align: 'center' })
        .text('Und', 150, tableY, { width: 50, align: 'center' })
        .text('Descripción', 200, tableY, { width: 210, align: 'center' })
        .text('Precio', 410, tableY, { width: 60, align: 'center' })
        .text('Dscto', 470, tableY, { width: 50, align: 'center' })
        .text('Valor Venta', 520, tableY, { width: 65, align: 'center' });

        // Iteramos en cada liena para mostrar todos los items
        let currentY = 230; 
        const rowHeight = 20; // La altura que definiste en doc.rect

        // 2. Iniciamos el bucle sobre tu array de productos
        items.forEach((item, index) => {
        // Usamos currentY para que cada cuadro baje 20 puntos respecto al anterior
        doc.rect(10, currentY, 575, rowHeight)
            .lineWidth(1) // Reducimos un poco el grosor para las filas internas
            .strokeColor('#1B4D3E')
            .stroke();

        // ACCIÓN: Insertamos los datos dinámicos
        // Sumamos 5 a currentY para centrar verticalmente el texto (fuente 10 en fila 20)
        const textY = currentY + 5;

        doc.fillColor('black').font('Helvetica').fontSize(9);
        doc.text((index + 1).toString(), 10, textY, { width: 30, align: 'center' });
        doc.text(item.quantity.toString(), 40, textY, { width: 40, align: 'center' });
        doc.text('-', 80, textY, { width: 70, align: 'center' });
        doc.text('UND', 150, textY, { width: 50, align: 'center' });
        doc.text(item.name, 200, textY, { width: 210, align: 'left' });
        doc.text(item.price.toFixed(2), 410, textY, { width: 60, align: 'center' });
        // Columna Dscto: Estático (0.00) sin valor
        doc.text('0.00', 470, textY, { width: 50, align: 'center' });
        const valorVenta = item.price * item.quantity;
        doc.text(valorVenta.toFixed(2), 520, textY, { width: 65, align: 'center' });
        currentY += rowHeight;
        });

        // --- SECCIÓN DE TOTALES ---
        doc.moveTo(340, 720).lineTo(575, 720).lineWidth(1.5).strokeColor('#1B4D3E').stroke();

        doc.fillColor('#333333').font('Helvetica').fontSize(10)
        .text('Total Venta Exonerada \nTotal IGV (18%) \nImporte Total de la Venta', 340, 730, { width: 595, lineGap: 5 });

        doc.font('Helvetica-Bold').text('S/. \nS/. \nS/.', 480, 730, { width: 595, lineGap: 5 });

        // Alineación derecha con peso bold en el total
        doc.font('Helvetica-Bold').text(`${payment.subtotal} \n${payment.tax} \n${payment.total}`, 0, 730, { width: 575, align: 'right', lineGap: 5 });
                
        // --- FOOTER ---
        doc.rect(10, 810, 300, 22)
        .fillColor('#1B4D3E')
        .fillAndStroke();

        doc.fillColor('#666666').font('Helvetica').fontSize(9)
        .text('SON: MONTO INGRESADO EN TEXTO', 20, 795, { width: 300 });
                
        doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
        .text(`Detalle de Forma de Pago: ${customerUser.payMethod}`, 10, 816, { width: 300, align: 'center' });

        doc.end();
    return doc as unknown as Readable;
  }
 // Generador de GUIA de Remicion
    createGuia(
        facturaNumber: string,
        customerUser: Customer,
        items: OrderItem[],
    ): Readable {
        const doc = new PDFDocument({
            size: "A4",
            margin: 50,
        });

        // --- HEADER ---
        doc.fillColor('#1B4D3E').font('Helvetica-Bold').fontSize(14)
            .text(`STOCKMASTER B2B DISTRIBUTOR`, 0, 30, { width: 595, align: 'center' });

        // Cuadro de Título de Guía
        doc.rect(440, 10, 150, 100).lineWidth(1.5).strokeColor('#1B4D3E').stroke();
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(13)
            .text(`RUC: ${customerUser.RUC}`, 440, 30, { width: 150, align: 'center' });
        doc.fillColor('#1B4D3E').fontSize(11)
            .text('GUÍA DE REMISIÓN REMITENTE', 440, 50, { width: 150, align: 'center' });
        doc.fillColor('#333333').fontSize(14)
            .text(`T001-${facturaNumber}`, 440, 86, { width: 150, align: 'center' });

        // --- BLOQUE 1: DATOS DEL TRASLADO ---
        doc.rect(10, 120, 575, 45).lineWidth(0.5).strokeColor('#CCCCCC').stroke();
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(8)
            .text('FECHA EMISIÓN:', 20, 125)
            .text('FECHA INICIO TRASLADO:', 150, 125)
            .text('MOTIVO DEL TRASLADO:', 320, 125);

        doc.font('Helvetica').fontSize(8)
            .text(`${customerUser.date}`, 20, 135)
            .text(`${customerUser.date}`, 150, 135) // ** Podrías agregar una fecha específica de salida
            .text('VENTA DE MERCADERÍA', 320, 135);

        // --- BLOQUE 2: PUNTOS DE PARTIDA Y LLEGADA ---
        doc.rect(10, 170, 575, 45).stroke();
        doc.font('Helvetica-Bold')
            .text('DIRECCIÓN PUNTO DE PARTIDA:', 20, 175)
            .text('DIRECCIÓN PUNTO DE LLEGADA (DESTINO):', 300, 175);

        doc.font('Helvetica')
            .text('** ALMACÉN CENTRAL STOCKMASTER **', 20, 185, { width: 270 })
            .text(`${customerUser.addres.street} ${customerUser.addres.number}, ${customerUser.addres.city}`, 300, 185, { width: 270 });

        // --- BLOQUE 3: DATOS DEL CONDUCTOR Y VEHÍCULO ---
        doc.rect(10, 220, 575, 45).stroke();
        doc.font('Helvetica-Bold')
            .text('DATOS DEL CONDUCTOR:', 20, 225)
            .text('UNIDAD DE TRANSPORTE (VEHÍCULO):', 300, 225);

        doc.font('Helvetica')
            .text('** NOMBRE CONDUCTOR **', 20, 235)
            .text('** DNI / LICENCIA **', 20, 245)
            .text('** MARCA / PLACA **', 300, 235)
            .text('** CERTIFICADO DE INSCRIPCIÓN **', 300, 245);

        // --- CABECERA DE TABLA ---
        doc.rect(10, 275, 575, 20).fillColor('#1B4D3E').fillAndStroke();
        doc.fillColor('white').font('Helvetica-Bold').fontSize(9);
        const tableY = 281;
        doc.text('#', 10, tableY, { width: 30, align: 'center' })
            .text('CANTIDAD', 40, tableY, { width: 60, align: 'center' })
            .text('UNIDAD', 110, tableY, { width: 50, align: 'center' })
            .text('DESCRIPCIÓN DE BIENES', 170, tableY, { width: 330, align: 'center' })
            .text('PESO (KG)', 510, tableY, { width: 75, align: 'center' });

        // --- BUCLE DINÁMICO DE ITEMS ---
        let currentY = 295;
        const rowHeight = 20;

        items.forEach((item, index) => {
            // Dibujamos el recuadro de la fila
            doc.rect(10, currentY, 575, rowHeight).lineWidth(0.5).strokeColor('#1B4D3E').stroke();

            const textY = currentY + 5;
            doc.fillColor('black').font('Helvetica').fontSize(9);

            doc.text((index + 1).toString(), 10, textY, { width: 30, align: 'center' })
            .text(item.quantity.toString(), 40, textY, { width: 60, align: 'center' })
            .text('UND', 110, textY, { width: 50, align: 'center' })
            .text(item.name, 175, textY, { width: 320, align: 'left' })
            .text('** 0.00 **', 510, textY, { width: 75, align: 'center' });

            currentY += rowHeight;
        });

        // --- PIE DE PÁGINA Y FIRMAS ---
        const footerY = 750;
        doc.moveTo(40, footerY).lineTo(200, footerY).lineWidth(1).strokeColor('#333333').stroke();
        doc.moveTo(395, footerY).lineTo(555, footerY).stroke();
        doc.fontSize(8).fillColor('#666666')
            .text('FIRMA DEL REMITENTE', 40, footerY + 5, { width: 160, align: 'center' })
            .text('RECIBIDO (NOMBRE, DNI, FIRMA)', 395, footerY + 5, { width: 160, align: 'center' });

        doc.rect(10, 810, 575, 22).fillColor('#1B4D3E').fillAndStroke();
        doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
            .text(`FORMA DE PAGO: ${customerUser.payMethod}`, 10, 816, { width: 575, align: 'center' });

        doc.end();

        return doc as unknown as Readable;
    }
}