import { OrderDetailItem } from "./order.model";
import { User } from './auth.model'; // tu modelo base

export type DriverStatus = 'AVAILABLE' | 'ON_ROUTE' | 'INACTIVE';

export interface Driver extends User {
  role: 'driver';              // restringimos el rol
  companyName: string;         // obligatorio para drivers
  contactName: string;         // obligatorio para drivers
  ruc: string;                 // obligatorio para drivers
  orders: string[];            // IDs de pedidos asignados
  assignedRoute?: string | null; // ruta actual asignada
  status?: DriverStatus;       // estado opcional del conductor
}



export type DeliveryStatus = 'PENDING' | 'ON_ROUTE' | 'DELIVERED' | 'FAILED';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Delivery {
  id: string;              // ID único de la entrega
  orderId: string;         // referencia al pedido
  driverId: string;
  driverName: string;
  routeId: string;
  startedAt: number;       // timestamp inicio entrega
  currentLocation: GeoLocation;
  estimatedArrival?: number;   // timestamp estimado de llegada
  status: DeliveryStatus;
  deliveredAt?: number | null; // timestamp de entrega real
}
export type OrderStatus = 'CREATED' | 'ASSIGNED' | 'ON_ROUTE' | 'DELIVERED' | 'FAILED';

export interface Customer {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  taxId?: string;          // opcional
}

export interface DeliveryAddress {
  street: string;
  number?: string;
  reference?: string;
  district: string;
  city: string;
  postalCode?: string;
  location: GeoLocation;
}

export interface Payment {
  currency: string;
  method: string;
  paymentReference?: string;
  subtotal: number;
  total: number;
}

export type ItemVariant = 'unit' | 'box';

export interface OrderItem {
  id: string;
  name: string;
  brand?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  variant?: ItemVariant;
  imageUrl?: string;
  createdAt: number;
}

export interface Order {
  id: string;              // ID único del pedido
  createdAt: number;       // timestamp de creación
  customer: Customer;
  deliveryAddress: DeliveryAddress;
  status: OrderStatus;
  deliveryId: string;      // referencia a la entrega
  delivered: boolean;      // estado simple de entrega
  payment?: Payment;
  items?: OrderDetailItem[];
}

export interface Route {
  id: string;
  name: string;
  driverId: string;       // referencia al conductor asignado
  orders: Order[];        // pedidos que forman parte de la ruta
  districts: string[];    // distritos que cubre la ruta
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: number;
}
