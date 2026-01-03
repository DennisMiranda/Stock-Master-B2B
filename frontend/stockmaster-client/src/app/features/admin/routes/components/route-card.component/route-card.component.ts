
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, UserPlus, ChevronRight, MapPin } from 'lucide-angular';
import { Route, RouteStatus } from '../../../../../core/models/route.model';

@Component({
  selector: 'app-route-card',
  imports: [LucideAngularModule,CommonModule ],
  templateUrl: './route-card.component.html',
  styleUrl: './route-card.component.css',
})
export class RouteCardComponent {
  // Inputs
  route = input.required<Route>();
  isSelected = input<boolean>(false);

  // Outputs
  cardClick = output<string>();
  assignDriver = output<string>();
  viewDetails = output<string>();

  // Icons
  readonly UserPlusIcon = UserPlus;
  readonly ChevronRightIcon = ChevronRight;
  readonly MapPinIcon = MapPin;

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
}