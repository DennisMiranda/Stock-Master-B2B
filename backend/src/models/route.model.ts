import { z } from "zod";
import { Order } from "./order.model";
import { DriverWithUserInfo } from "./driver.model";

export const ROUTE_STATUS = {
  planned: "PLANNED",
  inProgress: "IN_PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
} as const;

export type RouteStatus = (typeof ROUTE_STATUS)[keyof typeof ROUTE_STATUS];

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

export interface RouteParsed extends Omit<Route, "geometry"> {
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  deliveredOrders?: string[];
}

export interface RouteEnriched extends Omit<Route, "orders" | "driverId" | "geometry"> {
  orders: Order[];
  driver: DriverWithUserInfo;
  orderIds: string[];
  driverId: string;
}
