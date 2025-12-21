export const PAYMENT_METHOD = {
  transfer: 'TRANSFER',
  card: 'CARD',
  credit: 'CREDIT',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
