import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Loader2, Eye, EyeOff } from 'lucide-angular';
import { Modal } from '../../../../../shared/ui/modal/modal';

@Component({
    selector: 'app-user-create-modal',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        LucideAngularModule,
        Modal
    ],
    template: `
    <app-modal (close)="close.emit()">
        <div class="p-6">
            <h2 class="text-xl font-bold mb-4">Nuevo Usuario</h2>
            <p class="text-sm text-gray-500 mb-6">Registra un nuevo empleado o administrador.</p>
            
            <form [formGroup]="createForm" (ngSubmit)="onSubmit()" class="space-y-4">
                
                <!-- Nombre -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input type="text" formControlName="displayName" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Ej: Juan Pérez">
                </div>

                <!-- Email -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input type="email" formControlName="email" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="nombre@empresa.com">
                </div>

                <!-- Password -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña Temporal</label>
                    <div class="relative">
                        <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10">
                        <button type="button" (click)="togglePassword()" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                            <lucide-icon [img]="showPassword() ? EyeOffIcon : EyeIcon" class="w-5 h-5"></lucide-icon>
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Mínimo 6 caracteres.</p>
                </div>
                
                <!-- Role -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Rol Asignado</label>
                    <select formControlName="role" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="admin">Administrador</option>
                        <option value="warehouse">Almacenero</option>
                        <option value="driver">Conductor</option>
                        <option value="client">Cliente</option>
                    </select>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" (click)="close.emit()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" [disabled]="createForm.invalid || isSaving()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        @if (isSaving()) {
                            <lucide-icon [img]="LoaderIcon" class="w-4 h-4 animate-spin"></lucide-icon>
                            Creando...
                        } @else {
                            Crear Usuario
                        }
                    </button>
                </div>
            </form>
        </div>
    </app-modal>
    `
})
export class UserCreateModal {
    @Input() isSaving = signal(false);
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<any>();

    fb = inject(FormBuilder);
    showPassword = signal(false);

    // Icons
    readonly LoaderIcon = Loader2;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;

    createForm = this.fb.group({
        displayName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        role: ['warehouse', Validators.required]
    });

    togglePassword() {
        this.showPassword.update(v => !v);
    }

    onSubmit() {
        if (this.createForm.valid) {
            this.save.emit(this.createForm.value);
        }
    }
}
