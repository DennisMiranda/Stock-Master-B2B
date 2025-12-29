import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MapRouter } from '../../components/map-router/map-router';
import { 
  LucideAngularModule, 
  Users, 
  Package, 
  Truck, 
  MapPin, 
  Eye, 
  UserPlus,
  ChevronRight,
  ShoppingBag
} from 'lucide-angular';
import type {
  Driver,
  Order,
  Route,
  Delivery,
  OrderStatus,
} from '../../../../../core/models/route.model';

type TabKey = 'drivers' | 'orders' | 'routes';

interface Tab {
  key: TabKey;
  label: string;
  icon: any;
}

interface MapFilter {
  type: 'all' | 'driver' | 'order' | 'route';
  id?: string;
}
@Component({
  selector: 'app-router-page',
  imports: [LucideAngularModule, MapRouter],
  templateUrl: './router-page.html',
  styleUrl: './router-page.css',
})
export class RouterPage {
   UsersIcon = Users;
  PackageIcon = Package;
  TruckIcon = Truck;
  MapPinIcon = MapPin;
  EyeIcon = Eye;
  UserPlusIcon = UserPlus;
  ChevronRightIcon = ChevronRight;
  ShoppingBagIcon = ShoppingBag;

  // State
  activeTab = signal<TabKey>('drivers');
  mapFilter = signal<MapFilter>({ type: 'all' });
  selectedDriverId = signal<string | null>(null);
  selectedOrderId = signal<string | null>(null);
  selectedRouteId = signal<string | null>(null);

  tabs: Tab[] = [
    { key: 'drivers', label: 'Conductores', icon: Users },
    { key: 'orders', label: 'Pedidos', icon: Package },
    { key: 'routes', label: 'Rutas', icon: Truck },
  ];
  constructor(private router: Router) {}
  drivers = signal<Driver[]>([
    {
      companyName: 'Agua Pura SAC',
      contactName: 'Luis Fernández',
      displayName: 'Luis Fernández',
      email: 'luis.fernandez@aguapura.com',
      role: 'driver',
      isActive: true,
      ruc: '20123456789',
      uid: 'UID-DRIVER-001',
      orders: ['ORD-001', 'ORD-002'],
      assignedRoute: 'R-001',
      status: 'ON_ROUTE'
    },
    {
      companyName: 'Distribuciones Lima',
      contactName: 'María Torres',
      displayName: 'María Torres',
      email: 'maria.torres@distribuciones.com',
      role: 'driver',
      isActive: true,
      ruc: '20987654321',
      uid: 'UID-DRIVER-002',
      orders: [],
      assignedRoute: null,
      status: 'AVAILABLE'
    },
    {
      companyName: 'Logística Express',
      contactName: 'Jorge Ramírez',
      displayName: 'Jorge Ramírez',
      email: 'jorge.ramirez@logexpress.com',
      role: 'driver',
      isActive: true,
      ruc: '20876543210',
      uid: 'UID-DRIVER-003',
      orders: ['ORD-003'],
      assignedRoute: 'R-003',
      status: 'ON_ROUTE'
    },
  ]);

  routes = signal<Route[]>([
    {
      id: 'R-001',
      name: 'Ruta Lince Norte',
      driverId: 'DRV-001',
      orders: [
        {
          id: 'ORD-001',
          deliveryId: 'DEL-001',
          createdAt: Date.now(),
          delivered: false,
          customer: {
            companyName: 'REAL SERVICE',
            contactName: 'Especialistas en bidón de agua mineral',
            phone: '444444444',
            email: 'cliente1@empresa.com',
          },
          items: [
            {
              brand: 'BoomSound',
              id: '94VO79h8vkTCIq2ktx3P',
              imageUrl:
                'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
              name: 'Altavoz Bluetooth Portátil',
              quantity: 3,
              sku: 'SPK-BT-2024-012',
              subTotal: 209.97,
              unitPerBox: 12,
              unitPrice: 69.99,
              variant: 'unit',
            },
          ],
          deliveryAddress: {
            street: 'Av. Francisco Lazo 2352',
            district: 'Lince',
            city: 'Lima',
            postalCode: '15046',
            location: { lat: -12.082228, lng: -77.03599 },
          },
          status: 'CREATED',
        },
      ],
      districts: ['Lince'],
      status: 'PLANNED',
      createdAt: Date.now(),
    }
  ]);

  orders = signal<Order[]>([
    {
      id: 'ORD-001',
      deliveryId: 'DEL-001',
      createdAt: Date.now(),
      delivered: false,
      customer: {
        companyName: 'REAL SERVICE',
        contactName: 'Especialistas en bidón de agua mineral',
        phone: '444444444',
        email: 'cliente1@empresa.com',
      },
      items: [
        {
          brand: 'BoomSound',
          id: '94VO79h8vkTCIq2ktx3P',
          imageUrl:
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
          name: 'Altavoz Bluetooth Portátil',
          quantity: 3,
          sku: 'SPK-BT-2024-012',
          subTotal: 209.96999999999997,
          unitPerBox: 12,
          unitPrice: 69.99,
          variant: 'unit',
        },
        {
          brand: 'BoomSound',
          id: '94VO79h8vkTCIq2ktx3P',
          imageUrl:
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
          name: 'Altavoz Bluetooth Portátil',
          quantity: 1,
          sku: 'SPK-BT-2024-012',
          subTotal: 630,
          unitPerBox: 12,
          unitPrice: 630,
          variant: 'box',
        },
      ],
      deliveryAddress: {
        street: 'Av. Francisco Lazo 2352',
        district: 'Lince',
        city: 'Lima',
        postalCode: '15046',
        location: {
          lat: -12.082228,
          lng: -77.03599,
        },
      },
      status: 'CREATED',
    },
    {
      id: 'ORD-002',
      deliveryId: 'DEL-002',
      createdAt: Date.now(),
      delivered: false,
      customer: {
        companyName: 'Cliente Arenales',
        contactName: 'Sucursal Norte',
        phone: '555555555',
        email: 'cliente2@empresa.com',
      },
      items: [
        {
          brand: 'BoomSound',
          id: '94VO79h8vkTCIq2ktx3P',
          imageUrl:
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
          name: 'Altavoz Bluetooth Portátil',
          quantity: 3,
          sku: 'SPK-BT-2024-012',
          subTotal: 209.96999999999997,
          unitPerBox: 12,
          unitPrice: 69.99,
          variant: 'unit',
        },
        {
          brand: 'BoomSound',
          id: '94VO79h8vkTCIq2ktx3P',
          imageUrl:
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
          name: 'Altavoz Bluetooth Portátil',
          quantity: 1,
          sku: 'SPK-BT-2024-012',
          subTotal: 630,
          unitPerBox: 12,
          unitPrice: 630,
          variant: 'box',
        },
      ],
      deliveryAddress: {
        street: 'Av. Gral. Juan Antonio Álvarez de Arenales 2418',
        district: 'Lince',
        city: 'Lima',
        postalCode: '15073',
        location: {
          lat: -12.086964,
          lng: -77.030005,
        },
      },
      status: 'CREATED',
    },
    {
      id: 'ORD-003',
      deliveryId: 'DEL-003',
      createdAt: Date.now(),
      delivered: false,
      customer: {
        companyName: 'Cliente Arenales Sur',
        contactName: 'Sucursal Sur',
        phone: '666666666',
        email: 'cliente3@empresa.com',
      },
      items: [
        {
          brand: 'BoomSound',
          id: '94VO79h8vkTCIq2ktx3P',
          imageUrl:
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
          name: 'Altavoz Bluetooth Portátil',
          quantity: 3,
          sku: 'SPK-BT-2024-012',
          subTotal: 209.96999999999997,
          unitPerBox: 12,
          unitPrice: 69.99,
          variant: 'unit',
        },
      ],
      deliveryAddress: {
        street: 'Av. Arenales',
        district: 'Lince',
        city: 'Lima',
        postalCode: '15073',
        location: {
          lat: -12.088397,
          lng: -77.035225,
        },
      },
      status: 'CREATED',
    },
  ]);
  entregas = signal<Delivery[]>([
    {
      id: 'DEL-001',
      orderId: 'ORD-001',
      driverId: 'driver_001',
      driverName: 'Carlos Vega',
      routeId: 'R-001',
      startedAt: 1766438201425,
      currentLocation: {
        lat: -12.082228,
        lng: -77.03599,
      },
      status: 'DELIVERED',
      deliveredAt: null,
    },
    {
      id: 'DEL-002',
      orderId: 'ORD-002',
      driverId: 'driver_002',
      driverName: 'Ana Torres',
      routeId: 'R-002',
      startedAt: 1766438201425,
      currentLocation: {
        lat: -12.086964,
        lng: -77.030005,
      },

      status: 'ON_ROUTE',
      deliveredAt: null,
    },
    {
      id: 'DEL-003',
      orderId: 'ORD-003',
      driverId: 'driver_003',
      driverName: 'Jorge Ramírez',
      routeId: 'R-003',
      startedAt: 1766438201425,
      currentLocation: {
        lat: -12.088397,
        lng: -77.035225,
      },

      status: 'ON_ROUTE',
      deliveredAt: null,
    },
  ]);

   filteredDrivers = computed(() => {
    const filter = this.mapFilter();
    if (filter.type === 'all') return this.drivers();
    if (filter.type === 'driver' && filter.id) {
      return this.drivers().filter(d => d.uid === filter.id);
    }
    if (filter.type === 'route' && filter.id) {
      const route = this.routes().find(r => r.id === filter.id);
      if (route) {
        return this.drivers().filter(d => d.uid === route.driverId);
      }
    }
    return [];
  });

  filteredOrders = computed(() => {
    const filter = this.mapFilter();
    if (filter.type === 'all') return this.orders();
    if (filter.type === 'order' && filter.id) {
      return this.orders().filter(o => o.id === filter.id);
    }
    if (filter.type === 'route' && filter.id) {
      const route = this.routes().find(r => r.id === filter.id);
      return route?.orders || [];
    }
    if (filter.type === 'driver' && filter.id) {
      const driver = this.drivers().find(d => d.uid === filter.id);
      return this.orders().filter(o => driver?.orders.includes(o.id));
    }
    return [];
  });

  filteredEntregas = computed(() => {
    const filter = this.mapFilter();
    if (filter.type === 'all') return this.entregas();
    if (filter.type === 'route' && filter.id) {
      return this.entregas().filter(e => e.routeId === filter.id);
    }
    if (filter.type === 'driver' && filter.id) {
      return this.entregas().filter(e => e.driverId === filter.id);
    }
    return [];
  });

  // Methods
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getTotalItemsCount(order: Order): number {
    return order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  getDriverStatusClass(status: Driver['status']): string {
    const classes = {
      'AVAILABLE': 'bg-green-100 text-green-700',
      'ON_ROUTE': 'bg-blue-100 text-blue-700',
      'INACTIVE': 'bg-gray-100 text-gray-500'
    };
    return classes[status || 'AVAILABLE'];
  }

  getDriverStatusLabel(status: Driver['status']): string {
    const labels = {
      'AVAILABLE': 'Disponible',
      'ON_ROUTE': 'En ruta',
      'INACTIVE': 'Inactivo'
    };
    return labels[status || 'AVAILABLE'];
  }

  getOrderStatusClass(status: OrderStatus): string {
    const classes: Record<OrderStatus, string> = {
      CREATED: 'bg-gray-100 text-gray-700',
      ASSIGNED: 'bg-blue-100 text-blue-700',
      ON_ROUTE: 'bg-green-100 text-green-700',
      DELIVERED: 'bg-green-200 text-green-800',
      FAILED: 'bg-red-100 text-red-700',
    };
    return classes[status];
  }

  getOrderStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      CREATED: 'Creado',
      ASSIGNED: 'Asignado',
      ON_ROUTE: 'En ruta',
      DELIVERED: 'Entregado',
      FAILED: 'Fallido',
    };
    return labels[status];
  }

  getRouteStatusClass(status: Route['status']): string {
    const classes = {
      'PLANNED': 'bg-yellow-100 text-yellow-700',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'COMPLETED': 'bg-green-100 text-green-700'
    };
    return classes[status];
  }

  getRouteStatusLabel(status: Route['status']): string {
    const labels = {
      'PLANNED': 'Planificada',
      'IN_PROGRESS': 'En progreso',
      'COMPLETED': 'Completada'
    };
    return labels[status];
  }

  // Actions - Drivers
  onDriverClick(driverId: string): void {
    this.selectedDriverId.set(driverId);
    this.mapFilter.set({ type: 'driver', id: driverId });
  }

  assignRouteToDriver(driverId: string): void {
    console.log('Asignar ruta al conductor:', driverId);
    // Aquí implementarías la lógica para asignar ruta
    // Podrías abrir un modal o navegar a otra página
  }

  // Actions - Orders
  onOrderClick(orderId: string): void {
    this.selectedOrderId.set(orderId);
    this.mapFilter.set({ type: 'order', id: orderId });
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  assignOrderToRoute(orderId: string): void {
    console.log('Asignar pedido a ruta:', orderId);
    // Implementar lógica de asignación
  }

  // Actions - Routes
  onRouteClick(routeId: string): void {
    this.selectedRouteId.set(routeId);
    this.mapFilter.set({ type: 'route', id: routeId });
  }

  viewRouteDetails(routeId: string): void {
    this.router.navigate(['/routes', routeId]);
  }

  assignDriverToRoute(routeId: string): void {
    console.log('Asignar conductor a ruta:', routeId);
    // Implementar lógica de asignación
  }

  // Reset filter
  resetMapFilter(): void {
    this.mapFilter.set({ type: 'all' });
    this.selectedDriverId.set(null);
    this.selectedOrderId.set(null);
    this.selectedRouteId.set(null);
  }

  // Helper para saber si hay filtro activo
  hasActiveFilter(): boolean {
    return this.mapFilter().type !== 'all';
  }
}
