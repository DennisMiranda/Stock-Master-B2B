import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, ShoppingCart, Users, Package, LogOut, Settings, FileText, Truck, Tags } from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-gray-200">
        <a routerLink="/admin" class="flex items-center gap-2">
          <div class="bg-blue-600 p-1.5 rounded-lg">
            <span class="text-white font-bold text-lg">SM</span>
          </div>
          <div>
            <h1 class="font-bold text-gray-900 leading-none">StockMaster</h1>
            <span class="text-xs text-gray-500 font-medium">B2B Sistema</span>
          </div>
        </a>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        
        <!-- Section: Principal -->
        <div class="space-y-1">
          <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Principal</p>
          
          @if (isAdmin()) {
            <a routerLink="/admin/dashboard" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <lucide-icon [img]="LayoutDashboardIcon" class="w-5 h-5" />
              Dashboard
            </a>

            <a routerLink="/admin/products" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <lucide-icon [img]="PackageIcon" class="w-5 h-5" />
              Productos
            </a>

            <a routerLink="/admin/categories" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <lucide-icon [img]="TagsIcon" class="w-5 h-5" />
              Categorías
            </a>
          }

          @if (isAdmin() || isWarehouse()) {
            <a routerLink="/admin/orders" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <lucide-icon [img]="ShoppingCartIcon" class="w-5 h-5" />
              Pedidos
            </a>
          }
          
          @if (isAdmin() || isDriver()) {
             <a routerLink="/admin/routes" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <lucide-icon [img]="TruckIcon" class="w-5 h-5" />
              Rutas y Despacho
            </a>
          }
        </div>

        <!-- Section: Administración -->
        @if (isAdmin()) {
          <div class="space-y-1">
            <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Administración</p>
  
             <a routerLink="/admin/reports" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <lucide-icon [img]="FileTextIcon" class="w-5 h-5" />
              Reportes
            </a>
            
            <a routerLink="/admin/users" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <lucide-icon [img]="UsersIcon" class="w-5 h-5" />
              Usuarios
            </a>
  
            <a routerLink="/admin/settings" routerLinkActive="bg-blue-50 text-blue-600" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <lucide-icon [img]="SettingsIcon" class="w-5 h-5" />
              Configuración
            </a>
          </div>
        }

      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-200">
        <button (click)="logout()" class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
          <lucide-icon [img]="LogOutIcon" class="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  `
})
export class AdminSidebar {
  private authService = inject(AuthService);
  userRole = this.authService.userRole;

  // Strict View Logic
  isAdmin = computed(() => this.userRole() === 'admin');
  isWarehouse = computed(() => this.userRole() === 'warehouse');
  isDriver = computed(() => this.userRole() === 'driver');

  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly UsersIcon = Users;
  readonly PackageIcon = Package;
  readonly LogOutIcon = LogOut;
  readonly SettingsIcon = Settings;
  readonly FileTextIcon = FileText;
  readonly TruckIcon = Truck;
  readonly TagsIcon = Tags;

  logout() {
    this.authService.logout().subscribe();
  }
}
