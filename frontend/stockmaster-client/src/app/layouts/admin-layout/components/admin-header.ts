import { Component, signal, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, User, Settings, LogOut, ChevronDown } from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-admin-header',
  imports: [LucideAngularModule, RouterLink],
  template: `
    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 sticky top-0 z-20">
      
      <!-- User Profile Dropdown -->
      <div class="relative">
        <button 
          (click)="toggleMenu()"
          class="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors focus:outline-none"
        >
          <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold text-gray-900 leading-none">{{ displayName() }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ displayRole() }}</p>
          </div>
          
          <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <lucide-icon [img]="UserIcon" class="w-6 h-6" />
          </div>
          
          <lucide-icon [img]="ChevronDownIcon" class="w-4 h-4 text-gray-400" />
        </button>

        @if (isOpen()) {
          <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-fadeIn">
            <!-- Header items -->
             <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900">Mi Cuenta</p>
            </div>

            <a routerLink="/admin/profile" class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <lucide-icon [img]="UserIcon" class="w-4 h-4" />
              Perfil
            </a>
            
            <a routerLink="/admin/settings" class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <lucide-icon [img]="SettingsIcon" class="w-4 h-4" />
              Configuración
            </a>

            <div class="border-t border-gray-100 my-1"></div>

            <button (click)="logout()" class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
              <lucide-icon [img]="LogOutIcon" class="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        }
      </div>

    </header>
  `
})
export class AdminHeader {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  userRole = this.authService.userRole;

  displayName = computed(() => {
    const user = this.currentUser();
    return user?.displayName || user?.email || 'Usuario';
  });

  displayRole = computed(() => {
    const role = this.userRole();
    if (!role) return 'Usuario';
    const roles: Record<string, string> = {
      'admin': 'Administrador',
      'warehouse': 'Almacenero',
      'driver': 'Conductor',
      'client': 'Cliente'
    };
    return roles[role] || role;
  });

  isOpen = signal(false);

  readonly UserIcon = User;
  readonly SettingsIcon = Settings;
  readonly LogOutIcon = LogOut;
  readonly ChevronDownIcon = ChevronDown;

  toggleMenu() {
    this.isOpen.update(v => !v);
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
