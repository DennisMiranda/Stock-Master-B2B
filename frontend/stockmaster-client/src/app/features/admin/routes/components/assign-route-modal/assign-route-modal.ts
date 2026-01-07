import { Component, input, output, EventEmitter, OnInit } from '@angular/core';
import type { Route } from '../../../../../core/models/route.model';
import { NgClass } from '@angular/common';
import { LucideAngularModule, Users, Package, Plus, Route as RouteIcon, X, AlertTriangle, Info, ChevronRight } from 'lucide-angular';
@Component({
  selector: 'app-assign-route-modal',
  imports: [NgClass, LucideAngularModule],
  templateUrl: './assign-route-modal.html',
  styleUrl: './assign-route-modal.css',
})
export class AssignRouteModal implements OnInit{
  routes = input<Route[]>([]);
  routeSelected = output<string>();
  close = output<void>();
  readonly PlusIcon = Plus;
readonly RouteIcon = RouteIcon;
readonly PackageIcon = Package;
readonly UsersIcon = Users;
readonly CloseIcon = X;
readonly AlertIcon = AlertTriangle;
readonly InfoIcon = Info;
readonly ChevronRightIcon = ChevronRight;
ngOnInit(): void {
  
}

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PLANNED: 'Planificada',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return labels[status] || status;
  }
  get filteredRoutes(): Route[] {
  return this.routes().filter(
    r => r.status === 'PLANNED' || r.status === 'IN_PROGRESS'
  );
}

  selectRoute(routeId: string) {
    this.routeSelected.emit(routeId);
  }
  onClose() {
    this.close.emit();
  }
}
