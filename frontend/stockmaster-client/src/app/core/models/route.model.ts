import { Order } from './order.model';
import { Driver} from './driver.model';
export enum RouteStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface Route {
  id: string;
  name?: string;
  orders: string[];
  geometry: RouteGeometry;
  status: RouteStatus;
  createdAt?: number;
  deliveredOrders?: string[];
  driver?: {
    id: string;
    name: string;
  };
}

export interface RouteStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalDistance: number;
  estimatedDuration: number;
}

export interface CreateOptimizedRouteDto {
  driverId: string;
  orderIds: string[];
  startLocation: {
    lat: number;
    lng: number;
  };
}

export interface OptimizedRouteResult {
  route: Route;
  distance: number;
  duration: number;
  optimizedOrderIds: string[];
}

export interface RouteEnriched extends Omit<Route, 'orders' | 'driver'> {
  orders: Order[];
  driver: Driver;
}


// ✅ Tipo enriquecido que recibes del backend GET /routes/:id
export interface RouteEnriched {
  id: string;
  status: RouteStatus;
  createdAt?: number;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  deliveredOrders?: string[];
  
  // 🎯 Datos enriquecidos del backend
  orders: Order[];                    // Array completo de órdenes
  driver: Driver;         // Información completa del conductor
  
  // 📋 IDs originales
  orderIds: string[];
  driverId: string;
}