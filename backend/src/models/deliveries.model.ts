// delivery.model.ts
import { z } from "zod";

export const DELIVERY_STATUS = {
  pending: "PENDING",
  delivered: "DELIVERED",
  failed: "FAILED",
  cancelled: "CANCELLED",
} as const;
export type DeliveryStatus = (typeof DELIVERY_STATUS)[keyof typeof DELIVERY_STATUS];

export const deliverySchema = z.object({
  id: z.string(),
  orderId: z.string(),
  routeId: z.string(),
  driverId: z.string(),
  status: z.enum(Object.values(DELIVERY_STATUS) as [DeliveryStatus]),
  timestamp: z.number(),
});
export interface Delivery extends z.infer<typeof deliverySchema> {}
