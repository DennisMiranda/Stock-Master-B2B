import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeft,
  MapPin,
  User,
  Truck,
  Package,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Building,
  Calendar,
  DollarSign,
  Navigation,
  AlertCircle,
} from 'lucide-angular';
import { RoutesService } from '../../services/routes.service';
import { Order } from '../../../../../core/models/order.model';
import { ToastService } from '../../../../../core/services/toast.service';
import { RouteEnriched } from '../../../../../core/models/route.model';

@Component({
  selector: 'app-router-details',
  imports: [LucideAngularModule, DatePipe, CurrencyPipe],
  templateUrl: './router-details.html',
  styleUrl: './router-details.css',
})
export class RouterDetails implements OnInit {
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private routesService = inject(RoutesService);
  private toastService = inject(ToastService);

  // Icons
  readonly ArrowLeftIcon = ArrowLeft;
  readonly MapPinIcon = MapPin;
  readonly UserIcon = User;
  readonly TruckIcon = Truck;
  readonly PackageIcon = Package;
  readonly CheckCircleIcon = CheckCircle;
  readonly ClockIcon = Clock;
  readonly PhoneIcon = Phone;
  readonly MailIcon = Mail;
  readonly BuildingIcon = Building;
  readonly CalendarIcon = Calendar;
  readonly DollarSignIcon = DollarSign;
  readonly NavigationIcon = Navigation;
  readonly AlertCircleIcon = AlertCircle;
  // State
  routeData = signal<RouteEnriched | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  routeId = signal<string | null>(null);

  // Computed
  totalOrders = computed(() => this.routeData()?.orders.length || 0);
  deliveredOrders = computed(() => this.routeData()?.deliveredOrders?.length || 0);
  pendingOrders = computed(() => this.totalOrders() - this.deliveredOrders());

  progressPercentage = computed(() => {
    const total = this.totalOrders();
    if (total === 0) return 0;
    return Math.round((this.deliveredOrders() / total) * 100);
  });

  statusClass = computed(() => {
    const status = this.routeData()?.status;
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  });

  statusText = computed(() => {
    const status = this.routeData()?.status;
    switch (status) {
      case 'PLANNED':
        return 'Planificada';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  });

  ngOnInit(): void {

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
            if (!id) {
        this.error.set('No se proporcionó un ID de ruta válido');
        this.toastService.error('ID de ruta no válido');
        this.loading.set(false);
        return;
      }
      this.routeId.set(id);
      this.loadRouteDetail(id);
    });
  }

  /**
   * ✅ Cargar detalles de la ruta
   */
  private loadRouteDetail(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.routesService.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.routeData.set(response.data);
          console.log('✅ Route detail loaded:', response.data);
        } else {
          this.error.set('No se pudo cargar la información de la ruta');
          this.toastService.error('Error al cargar la ruta');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading route detail:', err);
        this.error.set('Error al cargar los detalles de la ruta');
        this.toastService.error('Error al cargar la ruta');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
   this.location.back();
  }

  isOrderDelivered(orderId: string): boolean {
    return this.routeData()?.deliveredOrders?.includes(orderId) || false;
  }

  callCustomer(phone: string): void {
    window.location.href = `tel:${phone}`;
  }

  emailCustomer(email: string): void {
    window.location.href = `mailto:${email}`;
  }

  refresh(): void {
    const id = this.routeId();
    if (id) {
      this.loadRouteDetail(id);
    }
  }
}
