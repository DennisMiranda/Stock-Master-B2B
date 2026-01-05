import { Component, input, output, EventEmitter } from '@angular/core';
import type { Route } from '../../../../../core/models/route.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-assign-route-modal',
  imports: [NgClass],
  templateUrl: './assign-route-modal.html',
  styleUrl: './assign-route-modal.css',
})
export class AssignRouteModal {
  routes = input<Route[]>([]);
  routeSelected = output<string>();
  close = output<void>();
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PLANNED: 'Planificada',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return labels[status] || status;
  }
  selectRoute(routeId: string) {
    this.routeSelected.emit(routeId);
  }
  onClose() {
    this.close.emit();
  }
}
