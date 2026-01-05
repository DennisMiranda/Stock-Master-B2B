import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  Truck, 
  UserPlus, 
  MoreVertical,
  UserMinus,
  RefreshCw,
  BarChart3
} from 'lucide-angular';
import { Driver, DriverStatus } from '../../../../../core/models/driver.model';

@Component({
  selector: 'app-driver-card',
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './driver-card.component.html',
})
export class DriverCardComponent {
  driver = input.required<Driver>();
  isSelected = input<boolean>(false);
readonly DriverStatus = DriverStatus;
  cardClick = output<string>();
  assignRoute = output<string>();
  changeStatus = output<{ driverId: string; status: DriverStatus }>();

  showMenu = signal(false);

  readonly TruckIcon = Truck;
  readonly UserPlusIcon = UserPlus;
  readonly MoreVerticalIcon = MoreVertical;
  readonly UserMinusIcon = UserMinus;
  readonly RefreshCwIcon = RefreshCw;
  readonly BarChart3Icon = BarChart3;

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  }

  getStatusClass(status: DriverStatus): string {
    const classes: Record<DriverStatus, string> = {
      [DriverStatus.AVAILABLE]: 'bg-green-100 text-green-800',
      [DriverStatus.ASSIGNED]: 'bg-blue-100 text-blue-800',
      [DriverStatus.ON_ROUTE]: 'bg-purple-100 text-purple-800',
      [DriverStatus.OFFLINE]: 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: DriverStatus): string {
    const labels: Record<DriverStatus, string> = {
      [DriverStatus.AVAILABLE]: 'Disponible',
      [DriverStatus.ASSIGNED]: 'Asignado',
      [DriverStatus.ON_ROUTE]: 'En Ruta',
      [DriverStatus.OFFLINE]: 'Offline'
    };
    return labels[status] || status;
  }

  getAvatarClass(status: DriverStatus): string {
    const classes: Record<DriverStatus, string> = {
      [DriverStatus.AVAILABLE]: 'bg-green-500',
      [DriverStatus.ASSIGNED]: 'bg-blue-500',
      [DriverStatus.ON_ROUTE]: 'bg-purple-500',
      [DriverStatus.OFFLINE]: 'bg-gray-400'
    };
    return classes[status] || 'bg-gray-400';
  }

  onCardClick(): void {
    this.cardClick.emit(this.driver().id);
  }

  onChangeStatus(event: Event, status: DriverStatus): void {
    event.stopPropagation();
    this.changeStatus.emit({ driverId: this.driver().id, status });
    this.showMenu.set(false);
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu.update(v => !v);
  }
}
