export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  ON_ROUTE = 'ON_ROUTE',
  OFFLINE = 'OFFLINE'
}

export interface Driver {
  id: string;
  userId: string;
  vehicle: string;
  status: DriverStatus;
  currentRouteId: string | null;
  // ✅ Datos enriquecidos del usuario
  displayName?: string;
  email?: string;
  photoURL?: string;
  isActive?: boolean;
}

export interface DriverStats {
  totalDeliveries: number;
  completedDeliveries: number;
  currentRoute: string | null;
}

export interface CreateDriverDto {
  userId: string;
  vehicle: string;
  status: DriverStatus;
  currentRouteId?: string | null;
}