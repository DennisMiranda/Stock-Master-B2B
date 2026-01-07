import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { DashboardService, DashboardStats, StatisticItem, LowStockItem } from './services/dashboard.service';
import {
  LucideAngularModule,
  Package,
  Box,
  AlertTriangle
} from 'lucide-angular';
import { StatCardComponent, StatCardItem } from '../../../shared/ui/cards/stat-card/stat-card.component';
import { LowStockCardComponent } from '../../../shared/ui/cards/low-stock-card/low-stock-card.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [LucideAngularModule, StatCardComponent, LowStockCardComponent],
  templateUrl: './dashboard.html'
})
export class DashboardPage implements OnInit {
  private dashboardService = inject(DashboardService);
  private toastService = inject(ToastService);

  // Icons
  readonly PackageIcon = Package;
  readonly BoxIcon = Box;
  readonly AlertIcon = AlertTriangle;

  // Data State
  stats = signal<DashboardStats | null>(null);
  isLoading = signal(true);

  // Computed: Mapear StatisticItem a StatCardItem para unidades
  topUnitsItems = computed<StatCardItem[]>(() => {
    const data = this.stats();
    if (!data) return [];
    return data.topSelling.byUnit.map((item: StatisticItem) => ({
      id: item.id,
      name: item.name,
      value: item.unitSold,
      images: item.images,
      subtitle: 'Unidad Individual'
    }));
  });

  // Computed: Mapear StatisticItem a StatCardItem para cajas
  topBoxesItems = computed<StatCardItem[]>(() => {
    const data = this.stats();
    if (!data) return [];
    return data.topSelling.byBox.map((item: StatisticItem) => ({
      id: item.id,
      name: item.name,
      value: item.boxSold,
      images: item.images,
      subtitle: 'Caja Master'
    }));
  });

  // Computed: Low stock items (ya tienen el formato correcto)
  lowStockUnits = computed<LowStockItem[]>(() => {
    const data = this.stats();
    return data?.lowStock.byUnit ?? [];
  });

  lowStockBoxes = computed<LowStockItem[]>(() => {
    const data = this.stats();
    return data?.lowStock.byBox ?? [];
  });

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading stats', err);
        this.isLoading.set(false);
        this.toastService.error('Error cargando estadísticas');
      }
    });
  }
}
