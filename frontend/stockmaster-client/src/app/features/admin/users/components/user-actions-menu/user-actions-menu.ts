import { Component, EventEmitter, Output, signal } from '@angular/core';
import { LucideAngularModule, MoreHorizontal, Pencil, Key, Trash } from 'lucide-angular';

@Component({
    selector: 'app-user-actions-menu',
    standalone: true,
    imports: [LucideAngularModule],
    template: `
        <div class="relative">
            <button 
                (click)="toggleMenu($event)"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                [class.text-blue-600]="isOpen()"
                [class.bg-blue-50]="isOpen()">
                <lucide-icon [img]="MoreIcon" class="w-5 h-5"></lucide-icon>
            </button>

            <!-- Dropdown Menu -->
            @if (isOpen()) {
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <button (click)="onAction('edit')" class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <lucide-icon [img]="EditIcon" class="w-4 h-4 text-gray-400"></lucide-icon>
                        Editar Usuario
                    </button>
                    <button (click)="onAction('reset')" class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <lucide-icon [img]="KeyIcon" class="w-4 h-4 text-gray-400"></lucide-icon>
                        Restablecer Clave
                    </button>
                </div>
                
                <!-- Backdrop to close -->
                <div class="fixed inset-0 z-40" (click)="closeMenu()"></div>
            }
        </div>
    `
})
export class UserActionsMenu {
    @Output() edit = new EventEmitter<void>();
    @Output() resetPassword = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();

    isOpen = signal(false);

    // Icons
    readonly MoreIcon = MoreHorizontal;
    readonly EditIcon = Pencil;
    readonly KeyIcon = Key;
    readonly TrashIcon = Trash;

    toggleMenu(event: Event) {
        event.stopPropagation();
        this.isOpen.update(v => !v);
    }

    closeMenu() {
        this.isOpen.set(false);
    }

    onAction(action: 'edit' | 'reset' | 'delete') {
        this.closeMenu();
        if (action === 'edit') this.edit.emit();
        if (action === 'reset') this.resetPassword.emit();
        if (action === 'delete') this.delete.emit();
    }
}
