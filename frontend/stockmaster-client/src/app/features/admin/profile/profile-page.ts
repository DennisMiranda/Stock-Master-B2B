import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule, User, Mail, Shield } from 'lucide-angular';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="bg-blue-600 p-2 rounded-lg">
          <lucide-icon [img]="UserIcon" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p class="text-gray-500">Información de tu cuenta personal</p>
        </div>
      </div>

      <!-- Profile Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        <!-- Cover / Banner Placeholder -->
        <div class="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <div class="px-6 pb-6">
          <!-- Avatar -->
          <div class="relative -mt-12 mb-6 flex justify-between items-end">
            <div class="w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div class="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-3xl font-bold text-gray-400 uppercase">
                {{ userInitials() }}
              </div>
            </div>
            
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Cuenta Activa
            </span>
          </div>

          <!-- User Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Basic Info -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Información Básica</h3>
              
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</label>
                <div class="mt-1 flex items-center gap-2 text-gray-900">
                  <lucide-icon [img]="UserIcon" class="w-4 h-4 text-gray-400" />
                  <span class="font-medium">{{ displayName() }}</span>
                </div>
              </div>

              <div>
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Electrónico</label>
                <div class="mt-1 flex items-center gap-2 text-gray-900">
                  <lucide-icon [img]="MailIcon" class="w-4 h-4 text-gray-400" />
                  <span>{{ email() }}</span>
                </div>
              </div>
            </div>

            <!-- Security & Role -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Seguridad y Acceso</h3>
              
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Rol Asignado</label>
                <div class="mt-1 flex items-center gap-2">
                  <lucide-icon [img]="ShieldIcon" class="w-4 h-4 text-gray-400" />
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 capitalize">
                    {{ displayRole() }}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  `
})
export class ProfilePage {
  private authService = inject(AuthService);

  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly ShieldIcon = Shield;

  currentUser = this.authService.currentUser;
  userRole = this.authService.userRole;

  displayName = computed(() => this.currentUser()?.displayName || 'Sin Nombre');
  email = computed(() => this.currentUser()?.email || 'No disponible');

  displayRole = computed(() => {
    const role = this.userRole();
    const roles: Record<string, string> = {
      'admin': 'Administrador',
      'warehouse': 'Almacenero',
      'driver': 'Conductor',
      'client': 'Cliente'
    };
    return roles[role || ''] || role || 'Usuario';
  });

  userInitials = computed(() => {
    const name = this.displayName();
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });
}
