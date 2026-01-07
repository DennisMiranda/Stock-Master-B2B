import { Component, output, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class CreateRouteModal {
  private driversService = inject(DriversService);
   private orderService = inject(OrderService);
  
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalPages = signal(1);
  totalOrders = signal(0);
  ordersPerPage = 10;

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

   loadOrders(page: number = 1) {
    this.loading.set(true);
    this.error.set(null);
    
    this.orderService.getReadyOrders(page, this.ordersPerPage)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.availableOrders.set(response.data.orders);
            this.totalPages.set(response.data.metadata.pages);
            this.totalOrders.set(response.data.metadata.count);
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Error al cargar pedidos listos');
          this.loading.set(false);
        }
      });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.loadOrders(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.loadOrders(this.currentPage() - 1);
    }
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
