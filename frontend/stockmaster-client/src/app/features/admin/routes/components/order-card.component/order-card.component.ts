import { Component, input, output, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  MapPin,
  ShoppingBag,
  Eye,
  MoreVertical,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
} from 'lucide-angular';
import { Order, ORDER_STATUS, OrderStatus } from '../../../../../core/models/order.model';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [LucideAngularModule, CommonModule, RouterLink],
  templateUrl: './order-card.component.html',
})
export class OrderCardComponent {
  order = input.required<Order>();
  isSelected = input<boolean>(false);
  readonly ORDER_STATUS = ORDER_STATUS;
  // Outputs
  cardClick = output<string>();
  assignToRoute = output<string>();
  changeStatus = output<{ orderId: string; status: OrderStatus }>();
  cancelOrder = output<{ orderId: string; status: OrderStatus }>();

  // State
  showMenu = signal(false);

  // Icons
  readonly MapPinIcon = MapPin;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly EyeIcon = Eye;
  readonly MoreVerticalIcon = MoreVertical;
  readonly TruckIcon = Truck;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly XCircleIcon = XCircle;
  readonly PackageIcon = Package;

  totalItems = computed(() => {
    return this.order().items.reduce((sum, item) => sum + item.quantity, 0);
  });

  canAssignToRoute = computed(() => {
    const status = this.order().status!;
    return status === ORDER_STATUS.ready || status === ORDER_STATUS.inPacking;
  });

  getStatusClass(status: OrderStatus): string {
    const classes: Record<OrderStatus, string> = {
      [ORDER_STATUS.created]: 'bg-yellow-100 text-yellow-800',
      [ORDER_STATUS.inPacking]: 'bg-blue-100 text-blue-800',
      [ORDER_STATUS.ready]: 'bg-green-100 text-green-800',
      [ORDER_STATUS.assigned]: 'bg-purple-100 text-purple-800',
      [ORDER_STATUS.inTransit]: 'bg-indigo-100 text-indigo-800',
      [ORDER_STATUS.delivered]: 'bg-gray-100 text-gray-800',
      [ORDER_STATUS.cancelled]: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [ORDER_STATUS.created]: 'Creado',
      [ORDER_STATUS.inPacking]: 'Empaquetando',
      [ORDER_STATUS.ready]: 'Listo',
      [ORDER_STATUS.assigned]: 'Asignado',
      [ORDER_STATUS.inTransit]: 'En ruta',
      [ORDER_STATUS.delivered]: 'Entregado',
      [ORDER_STATUS.cancelled]: 'Cancelado',
    };
    return labels[status] || status;
  }

  onCardClick(): void {
    this.cardClick.emit(this.order().id!);
  }

  onAssignToRoute(event: Event): void {
    event.stopPropagation();
    this.assignToRoute.emit(this.order().id!);
  }



  onChangeStatus(event: Event, status: OrderStatus): void {
    event.stopPropagation();
    this.changeStatus.emit({ orderId: this.order().id!, status });
    this.showMenu.set(false);
  }

  onCancelOrder(event: Event, status: OrderStatus): void {
    event.stopPropagation();
      this.cancelOrder.emit({ orderId: this.order().id!, status });
    this.showMenu.set(false);
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu.update((v) => !v);
  }
}
