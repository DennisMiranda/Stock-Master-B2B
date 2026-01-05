import { Component, inject, signal, OnInit } from '@angular/core';
import { DashboardService } from './services/dashboard.service';
import {
  LucideAngularModule,
  Package,
  Box,
  AlertTriangle
} from 'lucide-angular';
import { StockBadgeComponent } from '../../../shared/ui/badges/stock-badge/stock-badge.component';

import { ToastService } from '../../../core/services/toast.service';
import { DashboardStats } from './services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [LucideAngularModule, StockBadgeComponent],
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
