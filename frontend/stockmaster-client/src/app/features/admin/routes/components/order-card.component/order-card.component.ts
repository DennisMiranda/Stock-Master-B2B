
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MapPin, ShoppingBag, Eye } from 'lucide-angular';
import { Order, ORDER_STATUS ,OrderStatus } from '../../../../../core/models/order.model';

@Component({
  selector: 'app-order-card',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.css',
})

export class OrderCardComponent {
  // Inputs
  order = input.required<Order>();
  isSelected = input<boolean>(false);

  // Outputs
  cardClick = output<string>();
  assignToRoute = output<string>();
  viewDetails = output<string>();

  // Icons
  readonly MapPinIcon = MapPin;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly EyeIcon = Eye;

  // Computed
  totalItems = computed(() => {
    return this.order().items.reduce((sum, item) => sum + item.quantity, 0);
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
    [ORDER_STATUS.assigned]: 'Conductor asignado',
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

  onViewDetails(event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit(this.order().id!);
  }
}