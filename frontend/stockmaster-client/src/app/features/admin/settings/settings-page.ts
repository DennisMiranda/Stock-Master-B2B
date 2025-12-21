import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule, Settings, Lock, Save, AlertTriangle, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="bg-gray-900 p-2 rounded-lg">
          <lucide-icon [img]="SettingsIcon" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Configuración</h1>
          <p class="text-gray-500">Gestiona la seguridad y preferencias de tu cuenta</p>
        </div>
      </div>

      <!-- Change Password Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
             <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <lucide-icon [img]="LockIcon" class="w-5 h-5 text-gray-500" />
              Cambiar Contraseña
            </h3>
            <p class="text-sm text-gray-500 mt-1">Por seguridad, necesitarás ingresar tu contraseña actual.</p>
          </div>
        </div>

        <div class="p-6">
          @if (isGoogleUser()) {
             <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <lucide-icon [img]="SettingsIcon" class="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h4 class="text-blue-900 font-medium text-lg">Cuenta de Google</h4>
                <p class="text-blue-700 mt-2">
                  Iniciaste sesión con Google. Para cambiar tu contraseña o gestionar tu seguridad, debes hacerlo directamente en tu 
                  <a href="https://myaccount.google.com/" target="_blank" class="underline font-semibold hover:text-blue-900">Cuenta de Google</a>.
                </p>
             </div>
          } @else {
          <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-6 max-w-lg">
            
            <!-- Alert Error -->
             @if (errorMessage()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 text-sm">
                <lucide-icon [img]="AlertTriangleIcon" class="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Success Message -->
             @if (successMessage()) {
              <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3 text-sm">
                <lucide-icon [img]="SaveIcon" class="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{{ successMessage() }}</span>
              </div>
            }

            <!-- Current Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
              <div class="relative">
                <input 
                  [type]="showCurrentPassword() ? 'text' : 'password'"
                  formControlName="currentPassword"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="********"
                >
                <button type="button" (click)="toggleCurrentPassword()" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  <lucide-icon [img]="showCurrentPassword() ? EyeIcon : EyeOffIcon" class="w-5 h-5" />
                </button>
              </div>
              @if (passwordForm.get('currentPassword')?.touched && passwordForm.get('currentPassword')?.invalid) {
                <p class="text-xs text-red-500 mt-1">Campo requerido</p>
              }
            </div>

            <!-- New Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <div class="relative">
                <input 
                  [type]="showNewPassword() ? 'text' : 'password'"
                  formControlName="newPassword"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                >
                <button type="button" (click)="toggleNewPassword()" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  <lucide-icon [img]="showNewPassword() ? EyeIcon : EyeOffIcon" class="w-5 h-5" />
                </button>
              </div>
              @if (passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.invalid) {
                <p class="text-xs text-red-500 mt-1">Mínimo 6 caracteres requeridos</p>
              }
            </div>

            <div class="pt-2">
              <button 
                type="submit" 
                [disabled]="passwordForm.invalid || isSaving()"
                class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
              >
                @if (isSaving()) {
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Guardando...
                } @else {
                  <lucide-icon [img]="SaveIcon" class="w-4 h-4" />
                  Actualizar Contraseña
                }
              </button>
            </div>

          </form>
          }
        </div>
      </div>
    </div>
  `
})
export class SettingsPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  readonly SettingsIcon = Settings;
  readonly LockIcon = Lock;
  readonly SaveIcon = Save;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);

  // Detect if user is Google User
  isGoogleUser = computed(() => {
    const user = this.authService.currentUser();
    return user?.providerData.some(p => p.providerId === 'google.com') ?? false;
  });

  toggleCurrentPassword() { this.showCurrentPassword.update(v => !v); }
  toggleNewPassword() { this.showNewPassword.update(v => !v); }

  onChangePassword() {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.updateUserPassword(currentPassword!, newPassword!)
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMessage.set('Contraseña actualizada correctamente.');
          this.passwordForm.reset();
        },
        error: (err: any) => {
          this.isSaving.set(false);
          console.error('Error changing password', err);

          // Mapeo básico de errores de Firebase
          if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            this.errorMessage.set('La contraseña actual es incorrecta.');
          } else if (err.code === 'auth/requires-recent-login') {
            this.errorMessage.set('Por seguridad, inicia sesión nuevamente antes de cambiar la clave.');
          } else {
            this.errorMessage.set('Error al actualizar: ' + err.message);
          }
        }
      });
  }
}
