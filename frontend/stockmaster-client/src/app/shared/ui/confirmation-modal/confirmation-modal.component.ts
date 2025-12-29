import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Modal } from '../modal/modal';
import { LucideAngularModule, AlertTriangle, CheckCircle } from 'lucide-angular';

export type ConfirmationType = 'danger' | 'primary' | 'warning';

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    imports: [CommonModule, Modal, LucideAngularModule],
    template: `
    @if (isOpen()) {
        <app-modal (close)="onCancel()" [maxWidthClass]="'sm:max-w-sm'">
            <div class="flex flex-col items-center text-center p-2">
                <!-- Icon -->
                <div class="mb-4 p-3 rounded-full" 
                    [ngClass]="{
                        'bg-red-50 text-red-600': type === 'danger',
                        'bg-blue-50 text-blue-600': type === 'primary',
                        'bg-yellow-50 text-yellow-600': type === 'warning'
                    }">
                    @if (type === 'danger' || type === 'warning') {
                        <lucide-icon [img]="AlertTriangle" class="w-8 h-8" />
                    } @else {
                        <lucide-icon [img]="CheckCircle" class="w-8 h-8" />
                    }
                </div>

                <!-- Content -->
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ title }}</h3>
                <p class="text-gray-500 mb-6 text-sm leading-relaxed">
                    {{ message }}
                </p>

                <!-- Actions -->
                <div class="flex gap-3 w-full">
                    <button 
                        (click)="onCancel()"
                        class="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors">
                        {{ cancelText }}
                    </button>
                    
                    <button
                        (click)="onConfirm()"
                        class="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                        [ngClass]="{
                            'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-600/20': type === 'danger',
                            'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-600/20': type === 'primary',
                            'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 shadow-yellow-600/20': type === 'warning'
                        }">
                        {{ confirmText }}
                    </button>
                </div>
            </div>
        </app-modal>
    }
  `
})
export class ConfirmationModalComponent {
    // State
    isOpen = signal(false);

    // Config Inputs
    @Input() title = 'Confirmar acción';
    @Input() message = '¿Estás seguro de realizar esta acción?';
    @Input() confirmText = 'Confirmar';
    @Input() cancelText = 'Cancelar';
    @Input() type: ConfirmationType = 'primary';

    // Events
    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>(); // Just notifies cancel check

    readonly AlertTriangle = AlertTriangle;
    readonly CheckCircle = CheckCircle;

    open() {
        this.isOpen.set(true);
    }

    close() {
        this.isOpen.set(false);
    }

    onConfirm() {
        this.confirm.emit();
        this.close();
    }

    onCancel() {
        this.cancel.emit();
        this.close();
    }
}
