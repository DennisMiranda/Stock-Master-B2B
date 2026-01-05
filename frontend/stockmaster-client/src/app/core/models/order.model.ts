import { z } from 'zod';
//Usar las variantes de producto para servicios
export const ORDER_VARIANT = {
  unit: 'unit',
  box: 'box',
} as const;

export const ORDER_VARIANT_LABELS = {
  [ORDER_VARIANT.unit]: 'unidad',
  [ORDER_VARIANT.box]: 'caja',
};

//usar type para definir la interfaz
export type OrderVariant = (typeof ORDER_VARIANT)[keyof typeof ORDER_VARIANT];

export const orderDetailItemSchema = z.object({
  id: z.string(),
  sku: z.string().optional(),
  name: z.string().optional(),
  brand: z.string().optional(),
  quantity: z.number(),
  variant: z.enum(ORDER_VARIANT),
  unitPrice: z.number().optional(),
  subTotal: z.number().optional(),
  unitPerBox: z.number().optional(),
  imageUrl: z.string().optional(),
  stockUnits: z.number().optional(),
  stockBoxes: z.number().optional(),
});

export interface OrderDetailItem extends z.infer<typeof orderDetailItemSchema> {}

export const ORDER_STATUS = {
  created: 'CREATED', // Orden creada (checkout exitoso)
  inPacking: 'IN_PACKING', // En preparación
  ready: 'READY', // Listo para despacho
  assigned: 'ASSIGNED', // Asignado a conductor
  inTransit: 'IN_TRANSIT', // En ruta
  delivered: 'DELIVERED', // Entregado
  cancelled: 'CANCELLED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.created]: 'Creado',
  [ORDER_STATUS.inPacking]: 'En preparación',
  [ORDER_STATUS.ready]: 'Listo para despacho',
  [ORDER_STATUS.assigned]: 'Conductor asignado',
  [ORDER_STATUS.inTransit]: 'En ruta',
  [ORDER_STATUS.delivered]: 'Entregado',
  [ORDER_STATUS.cancelled]: 'Cancelado',
};

export const orderCustomerInfoSchema = z.object({
  companyName: z.string(), // Razón social
  taxId: z.string(), // DNI o RUC
  contactName: z.string(), // Persona que recibe
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
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});
export interface OrderDeliveryAddress extends z.infer<typeof orderDeliveryAddressSchema> {}

export const PAYMENT_METHOD = {
  transfer: 'TRANSFER',
  card: 'CARD',
  credit: 'CREDIT',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const orderPaymentInfoSchema = z.object({
  method: z.enum(PAYMENT_METHOD),
  currency: z.string(),
  subtotal: z.number(),
  tax: z.number().optional(),
  total: z.number(),
  paymentReference: z.string(), // nro operación, voucher, etc
});
export interface OrderPaymentInfo extends z.infer<typeof orderPaymentInfoSchema> {}

export const orderSchema = z.object({
  id: z.string().optional(),
  uid: z.string(), // Firebase Auth UID del cliente

  status: z.enum(ORDER_STATUS).optional(), // CREATED al inicio

  // --- Cliente (para guía / factura)
  customer: orderCustomerInfoSchema,

  // --- Dirección de entrega
  deliveryAddress: orderDeliveryAddressSchema,

  // --- Detalle inmutable
  items: z.array(orderDetailItemSchema),

  // --- Pago
  payment: orderPaymentInfoSchema,
  // --- Metadata
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

export interface Order extends z.infer<typeof orderSchema> {}
