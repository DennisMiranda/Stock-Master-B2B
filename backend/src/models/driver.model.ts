import { z } from "zod";

export const DRIVER_STATUS = {
  available: "AVAILABLE",
  assigned: "ASSIGNED",
  onRoute: "ON_ROUTE",  
  offline: "OFFLINE",
} as const;
export type DriverStatus = (typeof DRIVER_STATUS)[keyof typeof DRIVER_STATUS];

export const driverSchema = z.object({
  id: z.string(),
  userId: z.string(), 
  vehicle: z.string(),
  status: z.enum(Object.values(DRIVER_STATUS) as [DriverStatus]),
  currentRouteId: z.string().nullable().optional(),
});
export interface Driver extends z.infer<typeof driverSchema> {}
export interface DriverWithUserInfo extends Driver {
  displayName?: string;
  email?: string;
  photoURL?: string;
  isActive?: boolean;
}