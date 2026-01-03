// router-page.ts - ACTUALIZADO
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, Package, Route as RouteIcon } from 'lucide-angular';
import { DriversService } from '../../services/drivers.service';
import { RoutesService } from '../../services/routes.service';
import { DeliveriesService } from '../../services/deliveries.service';
import { Driver } from '../../../../../core/models/driver.model';
import { Route } from '../../../../../core/models/route.model';
import { Order } from '../../../../../core/models/order.model';
import { Delivery } from '../../../../../core/models/delivery.model';
import { DriverCardComponent } from '../../components/driver-card.component/driver-card.component';
import { OrderCardComponent } from '../../components/order-card.component/order-card.component';
import { RouteCardComponent } from '../../components/route-card.component/route-card.component';
import { MapRouterComponent } from '../../components/map-router.component/map-router.component';
import { OrderService } from '../../../../../core/services/order/order';

type TabKey = 'drivers' | 'orders' | 'routes';

interface Tab {
  key: TabKey;
  label: string;
  icon: any;
}

@Component({
  selector: 'app-router-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    DriverCardComponent,
    OrderCardComponent,
    RouteCardComponent,
    MapRouterComponent
  ],
  templateUrl: './router-page.html',
  styleUrl: './router-page.css',
})
export class RouterPage implements OnInit {
  private driversService = inject(DriversService);
  private routesService = inject(RoutesService);
  private deliveriesService = inject(DeliveriesService);
  private ordersService = inject(OrderService);

  // State
  activeTab = signal<TabKey>('drivers');
  selectedDriverId = signal<string | null>(null);
  selectedOrderId = signal<string | null>(null);
  selectedRouteId = signal<string | null>(null);

  drivers = signal<Driver[]>([]);
  orders = signal<Order[]>([]);
  routes = signal<Route[]>([]);
  deliveries = signal<Delivery[]>([]);

  loading = signal(false);

  // Tabs
  tabs: Tab[] = [
    { key: 'drivers', label: 'Conductores', icon: Users },
    { key: 'orders', label: 'Pedidos', icon: Package },
    { key: 'routes', label: 'Rutas', icon: RouteIcon }
  ];

  // Computed - Filtered data for map
  filteredDrivers = computed(() => {
    const selectedId = this.selectedDriverId();
    return selectedId 
      ? this.drivers().filter(d => d.id === selectedId)
      : this.drivers();
  });

  filteredOrders = computed(() => {
    const selectedId = this.selectedOrderId();
    return selectedId 
      ? this.orders().filter(o => o.id === selectedId)
      : this.orders();
  });

  filteredRoutes = computed(() => {
    const selectedId = this.selectedRouteId();
    return selectedId 
      ? this.routes().filter(r => r.id === selectedId)
      : this.routes();
  });

  filteredEntregas = computed(() => {
    const selectedRouteId = this.selectedRouteId();
    return selectedRouteId 
      ? this.deliveries().filter(d => d.routeId === selectedRouteId)
      : this.deliveries();
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  private loadAllData(): void {
    this.loading.set(true);
    
    Promise.all([
      this.loadDrivers(),
      this.loadRoutes(),
      this.loadDeliveries(),
      this.loadOrders()
    ]).finally(() => {
      this.loading.set(false);
    });
  }

  private async loadOrders(): Promise<void> {
    try {
      const response = await this.ordersService.getOrders().toPromise();
      if (response?.data) {
        this.orders.set(response.data.orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  private async loadDrivers(): Promise<void> {
    try {
      const response = await this.driversService.getAll().toPromise();
      if (response?.data) {
        this.drivers.set(response.data);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  }

  private async loadRoutes(): Promise<void> {
    try {
      const response = await this.routesService.getAll().toPromise();
      console.log('📍 Routes loaded:', response?.data); // ✅ Debug
      if (response?.data) {
        this.routes.set(response.data);
      }
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  }

  private async loadDeliveries(): Promise<void> {
    try {
      const response = await this.deliveriesService.getAll().toPromise();
      if (response?.data) {
        this.deliveries.set(response.data);
      }
    } catch (error) {
      console.error('Error loading deliveries:', error);
    }
  }

  onDriverClick(driverId: string): void {
    this.selectedDriverId.set(
      this.selectedDriverId() === driverId ? null : driverId
    );
  }

  onOrderClick(orderId: string): void {
    this.selectedOrderId.set(
      this.selectedOrderId() === orderId ? null : orderId
    );
  }

  onRouteClick(routeId: string): void {
    this.selectedRouteId.set(
      this.selectedRouteId() === routeId ? null : routeId
    );
  }

  async assignRouteToDriver(driverId: string): Promise<void> {
    console.log('Assign route to driver:', driverId);
  }

  async assignOrderToRoute(orderId: string): Promise<void> {
    console.log('Assign order to route:', orderId);
  }

  viewOrderDetails(orderId: string): void {
    console.log('View order details:', orderId);
  }

  async assignDriverToRoute(routeId: string): Promise<void> {
    console.log('Assign driver to route:', routeId);
  }

  viewRouteDetails(routeId: string): void {
    console.log('View route details:', routeId);
  }

  resetMapFilter(): void {
    this.selectedDriverId.set(null);
    this.selectedOrderId.set(null);
    this.selectedRouteId.set(null);
  }

  hasActiveFilter(): boolean {
    return !!(
      this.selectedDriverId() || 
      this.selectedOrderId() || 
      this.selectedRouteId()
    );
  }

  getInitials(name: string): string {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  }

  getTotalItemsCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}