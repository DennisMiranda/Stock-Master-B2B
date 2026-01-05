import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, Package, Plus, Route as RouteIcon } from 'lucide-angular';
import { DriversService } from '../../services/drivers.service';
import { RoutesService } from '../../services/routes.service';
import { Driver, DriverStatus } from '../../../../../core/models/driver.model';
import { Route, RouteStatus } from '../../../../../core/models/route.model';
import { Order, OrderStatus, ORDER_STATUS } from '../../../../../core/models/order.model';
import { Delivery } from '../../../../../core/models/delivery.model';
import { DriverCardComponent } from '../../components/driver-card.component/driver-card.component';
import { OrderCardComponent } from '../../components/order-card.component/order-card.component';
import { RouteCardComponent } from '../../components/route-card.component/route-card.component';
import { MapRouterComponent } from '../../components/map-router.component/map-router.component';
import { OrderService } from '../../../../../core/services/order/order';
import { AssignRouteModal } from '../../components/assign-route-modal/assign-route-modal';
import { WAREHOUSE_LOCATION } from '../../config/location';
import { ToastService } from '../../../../../core/services/toast.service';
import { CreateRouteModal } from '../../components/create-route-modal/create-route-modal';

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
    MapRouterComponent,
    AssignRouteModal,
    CreateRouteModal,
  ],
  templateUrl: './router-page.html',
  styleUrl: './router-page.css',
})
export class RouterPage implements OnInit {
  private driversService = inject(DriversService);
  private routesService = inject(RoutesService);
  private ordersService = inject(OrderService);
  private toastService = inject(ToastService);

  activeTab = signal<TabKey>('drivers');
  selectedDriverId = signal<string | null>(null);
  selectedOrderId = signal<string | null>(null);
  selectedRouteId = signal<string | null>(null);
  deliveredOrdersMap = signal<Map<string, Set<string>>>(new Map());
  showCreateRouteModal = signal(false);
  readonly PlusIcon = Plus;
  drivers = signal<Driver[]>([]);
  orders = signal<Order[]>([]);
  routes = signal<Route[]>([]);
  deliveries = signal<Delivery[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showAssignModal = signal(false);
  readonly WAREHOUSE_LOCATION = WAREHOUSE_LOCATION;

  // Tabs
  tabs: Tab[] = [
    { key: 'drivers', label: 'Conductores', icon: Users },
    { key: 'orders', label: 'Pedidos', icon: Package },
    { key: 'routes', label: 'Rutas', icon: RouteIcon },
  ];

  // Computed - Filtered data for map
  filteredDrivers = computed(() => {
    const selectedId = this.selectedDriverId();
    return selectedId ? this.drivers().filter((d) => d.id === selectedId) : this.drivers();
  });

  filteredOrders = computed(() => {
    const selectedId = this.selectedOrderId();
    return selectedId ? this.orders().filter((o) => o.id === selectedId) : this.orders();
  });

  filteredRoutes = computed(() => {
    const selectedId = this.selectedRouteId();
    return selectedId ? this.routes().filter((r) => r.id === selectedId) : this.routes();
  });

  filteredEntregas = computed(() => {
    const selectedRouteId = this.selectedRouteId();
    return selectedRouteId
      ? this.deliveries().filter((d) => d.routeId === selectedRouteId)
      : this.deliveries();
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  /**
   * ✅ Cargar todos los datos con manejo de errores mejorado
   */
  private loadAllData(): void {
    this.loading.set(true);
    this.error.set(null);

    Promise.all([this.loadDrivers(), this.loadRoutes(), this.loadOrders()])
      .catch((error) => {
        console.error('Error loading data:', error);
        this.error.set('Error al cargar los datos. Por favor, intenta de nuevo.');
      })
      .finally(() => {
        this.loading.set(false);
      });
  }

  private async loadOrders(): Promise<void> {
    try {
      const response = await this.ordersService.getOrders().toPromise();
      if (response?.data?.orders) {
        this.orders.set(response.data.orders);
        console.log('✅ Orders loaded:', response.data.orders.length);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      throw error;
    }
  }

  private async loadDrivers(): Promise<void> {
    try {
      const response = await this.driversService.getAll().toPromise();
      if (response?.data) {
        this.drivers.set(response.data);
        console.log('✅ Drivers loaded:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Error loading drivers:', error);
      throw error;
    }
  }
  private async loadRoutes(): Promise<void> {
    try {
      const response = await this.routesService.getAll().toPromise();
      if (response?.data) {
        this.routes.set(response.data);
        console.log('✅ Routes loaded:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Error loading routes:', error);
      throw error;
    }
  }

  onDriverClick(driverId: string): void {
    this.selectedDriverId.set(this.selectedDriverId() === driverId ? null : driverId);
  }

  onOrderClick(orderId: string): void {
    this.selectedOrderId.set(this.selectedOrderId() === orderId ? null : orderId);
  }

  onRouteClick(routeId: string): void {
    this.selectedRouteId.set(this.selectedRouteId() === routeId ? null : routeId);
  }

  //asignacion de ruta
  async assignOrderToRoute(orderId: string): Promise<void> {
    this.selectedOrderId.set(orderId);
    this.showAssignModal.set(true);
  }

  onRouteSelected(routeId: string) {
    const orderId = this.selectedOrderId();
    if (!orderId) return;
    this.routesService.addOrderToRoute(routeId, orderId, this.WAREHOUSE_LOCATION).subscribe({
      next: (res) => {
        console.log('✅ Orden asignada', res.data);
        this.showAssignModal.set(false);
        this.onOrderChangeStatus({ orderId: orderId, status: ORDER_STATUS.assigned });
      },
      error: (err) => console.error('❌ Error', err),
    });
  }

  onRemoveOrderFromRoute(routeId: string, orderId: string) {
    this.routesService.removeOrderFromRoute(routeId, orderId, this.WAREHOUSE_LOCATION).subscribe({
      next: (res) => console.log('🗑️ Orden removida', res.data),
      error: (err) => console.error('❌ Error al remover', err),
    });
  }

  closeAssignModal() {
    this.showAssignModal.set(false);
  }

  async assignDriverToRoute(routeId: string): Promise<void> {
    console.log('Assign driver to route:', routeId);
    // TODO: Implementar lógica
  }

  viewRouteDetails(routeId: string): void {
    console.log('View route details:', routeId);
    // TODO: Implementar navegación o modal
  }

  resetMapFilter(): void {
    this.selectedDriverId.set(null);
    this.selectedOrderId.set(null);
    this.selectedRouteId.set(null);
  }

  hasActiveFilter(): boolean {
    return !!(this.selectedDriverId() || this.selectedOrderId() || this.selectedRouteId());
  }

  refreshData(): void {
    this.loadAllData();
  }
  getInitials(name: string): string {
    return (
      name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '??'
    );
  }

  getTotalItemsCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getDeliveredOrders(routeId: string): Set<string> {
    const route = this.routes().find((r) => r.id === routeId);
    return new Set(route?.deliveredOrders || []);
  }

  async onDriverChangeStatus(data: { driverId: string; status: DriverStatus }): Promise<void> {
    try {
      this.loading.set(true);
      const response = await this.driversService
        .update(data.driverId, {
          status: data.status,
        })
        .toPromise();

      if (response?.success) {
        console.log('✅ Driver status updated');
        await this.loadDrivers();
      }
    } catch (error) {
      console.error('❌ Error updating driver status:', error);
      this.toastService.error('Error al cambiar el estado del pedido');
      this.error.set('Error al cambiar el estado del conductor');
    } finally {
      this.loading.set(false);
    }
  }
  async onOrderChangeStatus(data: { orderId: string; status: OrderStatus }): Promise<void> {
    try {
      this.loading.set(true);

      const response = await this.ordersService
        .updateOrderStatus(data.orderId, data.status)
        .toPromise();
      this.toastService.success('Estado del pedido cambiado correctamente');
      await this.loadOrders();
    } catch (error) {
      this.toastService.error('Error al cambiar el estado del pedido');
      this.error.set('Error al cambiar el estado del pedido');
    } finally {
      this.loading.set(false);
    }
  }

  async onOrderCancel(data: { orderId: string; status: OrderStatus }): Promise<void> {
    try {
      this.loading.set(true);
      const response = await this.ordersService
        .updateOrderStatus(data.orderId, data.status)
        .toPromise();
      await this.loadOrders();
      this.toastService.success('Orden cancelada correctamente');
    } catch (error) {
      this.toastService.error('Error al cancelar la orden');
      this.error.set('Error al cancelar el pedido');
    } finally {
      this.loading.set(false);
    }
  }

  async onRouteStart(routeId: string): Promise<void> {
    try {
      this.loading.set(true);
      const response = await this.routesService
        .updateStatus(routeId, RouteStatus.IN_PROGRESS)
        .toPromise();

      if (response?.success) {
        this.toastService.success('Ruta iniciada correctamente');
        await this.loadRoutes();
      }
    } catch (error) {
      this.toastService.error('Error al comenzar la ruta');
      this.error.set('Error al iniciar la ruta');
    } finally {
      this.loading.set(false);
    }
  }

  async onRouteComplete(routeId: string): Promise<void> {
    try {
      this.loading.set(true);
      const response = await this.routesService
        .updateStatus(routeId, RouteStatus.COMPLETED)
        .toPromise();

      if (response?.success) {
        this.toastService.success('Ruta completa correctamente');
        await this.loadRoutes();
      }
    } catch (error) {
      this.toastService.error('Error al marcar como completado');
      this.error.set('Error al completar la ruta');
    } finally {
      this.loading.set(false);
    }
  }

  async onRouteCancel(routeId: string): Promise<void> {
    try {
      this.loading.set(true);
      const response = await this.routesService
        .updateStatus(routeId, RouteStatus.CANCELLED)
        .toPromise();

      if (response?.success) {
        this.toastService.success('Ruta cancelada correctamente');
        await this.loadRoutes();
      }
    } catch (error) {
      this.toastService.error('Error a cancelar la ruta');
      this.error.set('Error al cancelar la ruta');
    } finally {
      this.loading.set(false);
    }
  }

  async onRouteToggleOrderDelivered(data: { routeId: string; orderId: string }): Promise<void> {
    const currentMap = new Map(this.deliveredOrdersMap());
    const routeOrders = currentMap.get(data.routeId) || new Set();

    if (routeOrders.has(data.orderId)) {
      routeOrders.delete(data.orderId);
    } else {
      routeOrders.add(data.orderId);
    }

    currentMap.set(data.routeId, routeOrders);
    this.deliveredOrdersMap.set(currentMap);
  }

  onMarkOrderDelivered(event: { routeId: string; orderId: string }): void {
    this.routesService.markOrderAsDelivered(event.routeId, event.orderId).subscribe({
      next: (response) => {
        if (response.success) {
          this.routes.update((routes) =>
            routes.map((route) => {
              if (route.id === event.routeId) {
                const deliveredOrders = [...(route.deliveredOrders || []), event.orderId];
                return { ...route, deliveredOrders };
              }
              return route;
            })
          );
          this.toastService.success('Orden marcada como entregada correctamente');
        }
      },
      error: (error) => {
        this.toastService.error('Ocurrió un error al marcar pedido como entregado');
      },
    });
  }

  onRemoveOrder(event: { routeId: string; orderId: string }): void {
    this.routesService.removeOrder(event.routeId, event.orderId, WAREHOUSE_LOCATION).subscribe({
      next: (response) => {
        if (response.success) {
          this.routes.update((routes) =>
            routes.map((route) => {
              if (route.id === event.routeId) {
                return {
                  ...route,
                  orders: route.orders.filter((id) => id !== event.orderId),
                  deliveredOrders: route.deliveredOrders?.filter((id) => id !== event.orderId),
                };
              }
              return route;
            })
          );
          this.toastService.success('Orden removida correctamente');
        }
      },
      error: (error) => {
        this.toastService.error('Ocurrió un error al remover la orden');
      },
    });
  }
  onCreateRoute(data: { driverId: string; orderIds: string[] }): void {
    this.loading.set(true);

    this.routesService
      .createOptimized({
        driverId: data.driverId,
        orderIds: data.orderIds,
        startLocation: this.WAREHOUSE_LOCATION,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success('Ruta creada exitosamente');
            this.showCreateRouteModal.set(false);
            this.loadRoutes();
            this.loadOrders();
          }
        },
        error: (err) => {
          this.toastService.error('Error al crear la ruta');
          console.error('Error:', err);
        },
        complete: () => this.loading.set(false),
      });
  }
}
