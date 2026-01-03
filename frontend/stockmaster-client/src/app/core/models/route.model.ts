export enum RouteStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface Route {
  id: string;
  name?: string;
  driverId: string;
  orders: string[];
  geometry: RouteGeometry; 
  status: RouteStatus;
  createdAt: number;
  districts?: string[];
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