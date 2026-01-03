export enum DeliveryStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface Delivery {
  id: string;
  orderId: string;
  routeId: string;
  driverId: string;
  status: DeliveryStatus;
  timestamp: number;
  failureReason?: string;
  completedAt?: number;
  order?: {
    id: string;
    customer: string;
    address: string;
  };
}

export interface CreateDeliveryDto {
  orderId: string;
  routeId: string;
  driverId: string;
  status: DeliveryStatus;
}

export interface UpdateDeliveryStatusDto {
  status: DeliveryStatus;
}

export interface FailDeliveryDto {
  reason: string;
}