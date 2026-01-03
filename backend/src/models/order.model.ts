// order.model.ts
import { z } from "zod";

export const ORDER_VARIANT = {
  unit: "unit",
  box: "box",
} as const;
export type OrderVariant = (typeof ORDER_VARIANT)[keyof typeof ORDER_VARIANT];

export const orderDetailItemSchema = z.object({
  id: z.string(),
  sku: z.string().optional(),
  name: z.string().optional(),
  brand: z.string().optional(),
  quantity: z.number(),
  variant: z.enum(["unit","box"]),
  unitPrice: z.number().optional(),
  subTotal: z.number().optional(),
  unitPerBox: z.number().optional(),
  imageUrl: z.string().optional(),
  stockUnits: z.number().optional(),
  stockBoxes: z.number().optional(),
});
export interface OrderDetailItem extends z.infer<typeof orderDetailItemSchema> {}

export const orderCustomerInfoSchema = z.object({
  companyName: z.string(),
  taxId: z.string(),
  contactName: z.string(),
  email: z.string(),
  phone: z.string(),
});
export interface OrderCustomerInfo extends z.infer<typeof orderCustomerInfoSchema> {}

export const orderDeliveryAddressSchema = z.object({
  city: z.string(),
  district: z.string(),
  street: z.string(),
  number: z.string(),
  reference: z.string().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }),
});
export interface OrderDeliveryAddress extends z.infer<typeof orderDeliveryAddressSchema> {}

export const PAYMENT_METHOD = {
  transfer: "TRANSFER",
  card: "CARD",
  credit: "CREDIT",
} as const;
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const orderPaymentInfoSchema = z.object({
  method: z.enum(["TRANSFER","CARD","CREDIT"]),
  currency: z.string(),
  subtotal: z.number(),
  tax: z.number().optional(),
  total: z.number(),
  paymentReference: z.string(),
});
export interface OrderPaymentInfo extends z.infer<typeof orderPaymentInfoSchema> {}

export const ORDER_STATUS = {
  created: "CREATED",
  inPacking: "IN_PACKING",
  ready: "READY",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const orderSchema = z.object({
  id: z.string().optional(),
  uid: z.string(),
  status: z.enum(Object.values(ORDER_STATUS) as [OrderStatus]).default(ORDER_STATUS.created),
  customer: orderCustomerInfoSchema,
  deliveryAddress: orderDeliveryAddressSchema,
  items: z.array(orderDetailItemSchema),
  payment: orderPaymentInfoSchema,
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});
export interface Order extends z.infer<typeof orderSchema> {}
