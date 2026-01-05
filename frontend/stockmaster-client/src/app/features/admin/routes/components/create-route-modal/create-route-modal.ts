import { Component, output, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X,MapPin, ShoppingBag, Eye, MoreVertical, Truck, CheckCircle2, XCircle, Package } from 'lucide-angular';
import { DriversService } from '../../services/drivers.service';
import { OrderService } from '../../../../../core/services/order/order';
import { Driver, DriverStatus } from '../../../../../core/models/driver.model';
import { Order, ORDER_STATUS } from '../../../../../core/models/order.model';

@Component({
  selector: 'app-create-route-modal',
  imports: [LucideAngularModule, CommonModule, FormsModule],
  templateUrl: './create-route-modal.html',
  styleUrl: './create-route-modal.css',
})
export class CreateRouteModal {
  private driversService = inject(DriversService);
  private ordersService = inject(OrderService);

  close = output<void>();
  create = output<{ driverId: string; orderIds: string[] }>();

  readonly XIcon = X;
  readonly TruckIcon = Truck;
  readonly PackageIcon = Package;
  readonly MapPinIcon = MapPin;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly EyeIcon = Eye;
  readonly MoreVerticalIcon = MoreVertical;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly XCircleIcon = XCircle;

  selectedDriverId: string | null = null;
  selectedOrderIds = signal<Set<string>>(new Set());
  availableDrivers = signal<Driver[]>([]);
  availableOrders = signal<Order[]>([]);

  ngOnInit(): void {
    this.loadDrivers();
    this.loadOrders();
  }

  private loadDrivers(): void {
    this.driversService.getAvailable().subscribe({
      next: (res) => {
        if (res.success) {
          this.availableDrivers.set(res.data!);
        }
      },
      error: (err) => console.error('Error loading drivers:', err),
    });
  }

  private loadOrders(): void {
    this.ordersService.getOrders().subscribe({
      next: (res) => {
        if (res.data?.orders) {
          // Filtrar solo pedidos READY
          const readyOrders = res.data.orders.filter(
            (o) => o.status === ORDER_STATUS.ready || o.status === ORDER_STATUS.inPacking
          );
          this.availableOrders.set(readyOrders);
        }
      },
      error: (err) => console.error('Error loading orders:', err),
    });
  }

  toggleOrder(orderId: string): void {
    this.selectedOrderIds.update((ids) => {
      const newSet = new Set(ids);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  canCreate(): boolean {
    return !!this.selectedDriverId && this.selectedOrderIds().size > 0;
  }

  onCreate(): void {
    if (!this.canCreate()) return;

    this.create.emit({
      driverId: this.selectedDriverId!,
      orderIds: Array.from(this.selectedOrderIds()),
    });
  }
}
