import { z } from "zod";

export const ROUTE_STATUS = {
  planned: "PLANNED",
  inProgress: "IN_PROGRESS",
  completed: "COMPLETED",
  cancelled : 'CANCELLED'
} as const;

export type RouteStatus = (typeof ROUTE_STATUS)[keyof typeof ROUTE_STATUS];

// Schema para validación en el backend
export const routeSchema = z.object({
  id: z.string().optional(),
  driverId: z.string(),
  orders: z.array(z.string()),
  geometry: z.string(), 
  status: z.nativeEnum(ROUTE_STATUS),
  createdAt: z.number().optional(),
});
export interface Route extends z.infer<typeof routeSchema> {
  deliveredOrders?: string[]; 
}

export interface RouteParsed extends Omit<Route, 'geometry'> {
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  deliveredOrders?: string[]; 
}