import { Readable } from "stream";
import type { OrderItem, Address, Customer, Payment } from "../../models/PDF/document.model";
import { PDFStorageService } from "./Storage.service";
import { PDFGeneratorService } from "./Generator.service";
import { OrderService } from "../order/order.service";

export class NewPdfService {
  constructor(
    private pdfStorage = new PDFStorageService(),
    private pdfGenerator = new PDFGeneratorService(),
    private orderService = new OrderService()
  ) {}

  async emitFactura(orderId: string): Promise<string> {
    const snapFacturaNumber: number = await this.pdfStorage.increaseCount("Guia");
    const dataOrder = await this.orderService.getOrderById(orderId);
    if (!dataOrder) throw new Error("Order not found");

    const facturaNumber: string = snapFacturaNumber.toString().padStart(4, "0");

    const addressUser: Address = {
      city: dataOrder.deliveryAddress.city,
      street: dataOrder.deliveryAddress.street,
      number: dataOrder.deliveryAddress.number || "001",
    };

    const customerUser: Customer = {
      companyName: dataOrder.customer.companyName,
      RUC: dataOrder.customer.taxId,
      addres: addressUser,
      payMethod: dataOrder.payment.method,
      date: String(new Date().toISOString().split("T")[0]),
      moneda: dataOrder.payment.currency,
    };

    const items: OrderItem[] = dataOrder.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.unitPrice,
      typeBox: item.typeBox,
    }));

    const payment: Payment = {
      subtotal: dataOrder.payment.subtotal,
      tax: dataOrder.payment.tax,
      total: dataOrder.payment.total,
    };

    const pdf: Readable = this.pdfGenerator.createFactura(
      facturaNumber,
      customerUser,
      items,
      payment
    );

    const { fileID } = await this.pdfStorage.sabeDocument(pdf, `FACTURA-${facturaNumber}`, "factura");
    await this.pdfStorage.SabeId(fileID, orderId, "factura");

    return fileID;
  }

  async emitGuia(orderId: string): Promise<string> {
    
    const snapGuiaNumber: number = await this.pdfStorage.increaseCount("Guia");
    const dataOrder = await this.orderService.getOrderById(orderId);
    if (!dataOrder) throw new Error("Order not found");

    const GuiaNumber: string = snapGuiaNumber.toString().padStart(4, "0");

    const addressUser: Address = {
      city: dataOrder.deliveryAddress.city,
      street: dataOrder.deliveryAddress.street,
      number: dataOrder.deliveryAddress.number || "001",
    };

    const customerUser: Customer = {
      companyName: dataOrder.customer.companyName,
      RUC: dataOrder.customer.taxId,
      addres: addressUser,
      payMethod: dataOrder.payment.method,
      date: String(new Date().toISOString().split("T")[0]),
      moneda: dataOrder.payment.currency,
    };

    const items: OrderItem[] = dataOrder.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.unitPrice,
      typeBox: item.typeBox,
    }));

    const payment: Payment = {
      subtotal: dataOrder.payment.subtotal,
      tax: dataOrder.payment.tax,
      total: dataOrder.payment.total,
    };

    const pdf: Readable = this.pdfGenerator.createFactura(
      GuiaNumber,
      customerUser,
      items,
      payment
    );

    const { fileID } = await this.pdfStorage.sabeDocument(pdf, `FACTURA-${GuiaNumber}`, "factura");
    await this.pdfStorage.SabeId(fileID, orderId, "factura");

    return fileID;
  }

  async tryOrder(orderId: string) {
    return this.orderService.getOrderById(orderId);
  }
}
