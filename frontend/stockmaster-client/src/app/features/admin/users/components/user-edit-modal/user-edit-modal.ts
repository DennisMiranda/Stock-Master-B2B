import { Component, EventEmitter, Input, Output, inject, effect, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Loader2 } from 'lucide-angular';
import { User } from '../../../../../core/models/auth.model'; // Verify path
import { Modal } from '../../../../../shared/ui/modal/modal';

@Component({
    selector: 'app-user-edit-modal',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        LucideAngularModule,
        Modal
    ],
    template: `
    <app-modal [fullscreenBelow]="'lg'" (close)="close.emit()">
        <div class="p-6">
            <h2 class="text-xl font-bold mb-4">Editar Usuario</h2>
            
            <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="space-y-4">
                
                <!-- Role Field -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <select formControlName="role" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="admin">Administrador</option>
                        <option value="warehouse">Almacenero</option>
                        <option value="driver">Conductor</option>
                        <option value="client">Cliente</option>
                    </select>
                </div>

                <!-- Active Toggle -->
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <span class="font-medium text-gray-900">Estado de Cuenta</span>
                        <p class="text-xs text-gray-500">Desactiva para bloquear acceso</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" formControlName="isActive" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" (click)="close.emit()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" [disabled]="editForm.invalid || isSaving()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        @if (isSaving()) {
                            <lucide-icon [img]="LoaderIcon" class="w-4 h-4 animate-spin"></lucide-icon>
                            Guardando...
                        } @else {
                            Guardar Cambios
                        }
                    </button>
                </div>
            </form>
        </div>
    </app-modal>
    `
})
export class UserEditModal {
    @Input() set user(value: User | null) {
        if (value) {
            this.editForm.patchValue({
                role: value.role,
                isActive: value.isActive
            });
            this._user = value;
        }
    }

    @Input() isSaving = signal(false);
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<{ uid: string, role: User['role'], isActive: boolean }>();

    private _user: User | null = null;
    fb = inject(FormBuilder);
    readonly LoaderIcon = Loader2;

    editForm = this.fb.group({
        role: ['', Validators.required],
        isActive: [true, Validators.required]
    });

    onSubmit() {
        if (this.editForm.valid && this._user) {
            const { role, isActive } = this.editForm.value;
            this.save.emit({
                uid: this._user.uid,
                role: role as User['role'],
                isActive: isActive!
            });
        }
    }
}
