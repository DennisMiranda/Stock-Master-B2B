import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  UserPlus, 
  ChevronRight, 
  MapPin,
  MoreVertical,
  Play,
  CheckCircle2,
  XCircle,
  Package
} from 'lucide-angular';
import { Route, RouteStatus } from '../../../../../core/models/route.model';

@Component({
  selector: 'app-route-card',
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './route-card.component.html',
})
export class RouteCardComponent {
  route = input.required<Route>();
  isSelected = input<boolean>(false);
  deliveredOrders = input<Set<string>>(new Set()); // IDs de pedidos entregados
readonly RouteStatus = RouteStatus;
  // Outputs
  cardClick = output<string>();
  assignDriver = output<string>();
  viewDetails = output<string>();
  startRoute = output<string>();
  completeRoute = output<string>();
  cancelRoute = output<string>();

   // Nuevos outputs
  markOrderDelivered = output<{ routeId: string; orderId: string }>();
  removeOrder = output<{ routeId: string; orderId: string }>();

  // State
  showMenu = signal(false);
  showOrders = signal(false);

  // Icons
  readonly UserPlusIcon = UserPlus;
  readonly ChevronRightIcon = ChevronRight;
  readonly MapPinIcon = MapPin;
  readonly MoreVerticalIcon = MoreVertical;
  readonly PlayIcon = Play;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly XCircleIcon = XCircle;
  readonly PackageIcon = Package;

  completedOrdersCount = computed(() => {
    return this.route().orders.filter(orderId => 
      this.deliveredOrders().has(orderId)
    ).length;
  });

  progressPercentage = computed(() => {
    const total = this.route().orders.length;
    if (total === 0) return 0;
    return Math.round((this.completedOrdersCount() / total) * 100);
  });

  getStatusClass(status: RouteStatus): string {
    const classes: Record<RouteStatus, string> = {
      [RouteStatus.PLANNED]: 'bg-yellow-100 text-yellow-800',
      [RouteStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [RouteStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [RouteStatus.CANCELLED]: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: RouteStatus): string {
    const labels: Record<RouteStatus, string> = {
      [RouteStatus.PLANNED]: 'Planificada',
      [RouteStatus.IN_PROGRESS]: 'En Progreso',
      [RouteStatus.COMPLETED]: 'Completada',
      [RouteStatus.CANCELLED]: 'Cancelada'
    };
    return labels[status] || status;
  }

  isOrderDelivered(orderId: string): boolean {
    return this.deliveredOrders().has(orderId);
  }

  onCardClick(): void {
    this.cardClick.emit(this.route().id);
  }

  onAssignDriver(event: Event): void {
    event.stopPropagation();
    this.assignDriver.emit(this.route().id);
  }

  onViewDetails(event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit(this.route().id);
  }

  onStartRoute(event: Event): void {
    event.stopPropagation();
    this.startRoute.emit(this.route().id);
    this.showMenu.set(false);
  }

  onCompleteRoute(event: Event): void {
    event.stopPropagation();
    if (confirm('¿Confirmar que la ruta está completada?')) {
      this.completeRoute.emit(this.route().id);
    }
    this.showMenu.set(false);
  }

  onCancelRoute(event: Event): void {
    event.stopPropagation();
    if (confirm('¿Estás seguro de cancelar esta ruta?')) {
      this.cancelRoute.emit(this.route().id);
    }
    this.showMenu.set(false);
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu.update(v => !v);
  }

  toggleOrders(event: Event): void {
    event.stopPropagation();
    this.showOrders.update(v => !v);
  }

  // Reemplazar toggleOrderDelivered por estos dos métodos
  onMarkAsDelivered(event: Event, orderId: string): void {
    event.stopPropagation();
    this.markOrderDelivered.emit({ routeId: this.route().id, orderId });
  }

  onRemoveOrder(event: Event, orderId: string): void {
    event.stopPropagation();
    if (confirm('¿Eliminar este pedido de la ruta?')) {
      this.removeOrder.emit({ routeId: this.route().id, orderId });
    }
  }
  
}