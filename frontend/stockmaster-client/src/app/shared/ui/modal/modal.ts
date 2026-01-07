import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [LucideAngularModule],
    templateUrl: './modal.html'
})
export class Modal {
    @Input() maxWidthClass = 'sm:max-w-md';
    @Input() title = '';

    /** 
     * Hace el modal fullscreen debajo del breakpoint especificado.
     * - 'lg' = Fullscreen en < 1024px (mobile + tablet)
     * - 'md' = Fullscreen en < 768px (solo mobile)
     * - 'none' = Nunca fullscreen (default)
     */
    @Input() fullscreenBelow: 'sm' | 'md' | 'lg' | 'none' = 'none';

    @Output() close = new EventEmitter<void>();
    readonly XIcon = X;

    /** Computed classes for modal panel based on fullscreen mode */
    get panelClasses(): string {
        const base = 'relative transform overflow-hidden bg-white text-left shadow-xl transition-all';

        if (this.fullscreenBelow === 'lg') {
            // Fullscreen on mobile/tablet (< 1024px), centered modal on laptop/desktop
            return `${base} lg:rounded-lg lg:my-8 lg:w-full ${this.maxWidthClass} max-lg:fixed max-lg:inset-0 max-lg:w-full max-lg:h-full max-lg:rounded-none max-lg:overflow-y-auto`;
        }

        if (this.fullscreenBelow === 'md') {
            // Fullscreen on mobile (< 768px), centered modal on tablet+
            return `${base} md:rounded-lg md:my-8 md:w-full ${this.maxWidthClass} max-md:fixed max-md:inset-0 max-md:w-full max-md:h-full max-md:rounded-none max-md:overflow-y-auto`;
        }

        // Default: rounded on all sizes
        return `${base} rounded-lg sm:my-8 sm:w-full ${this.maxWidthClass}`;
    }

    /** Classes for modal container based on fullscreen mode */
    get containerClasses(): string {
        if (this.fullscreenBelow === 'lg') {
            return 'flex min-h-full items-center justify-center p-0 lg:p-4 text-center';
        }
        if (this.fullscreenBelow === 'md') {
            return 'flex min-h-full items-center justify-center p-0 md:p-4 text-center';
        }
        return 'flex min-h-full items-center justify-center p-4 text-center sm:p-0';
    }

    /** Classes for modal content area based on fullscreen mode */
    get contentClasses(): string {
        if (this.fullscreenBelow === 'lg') {
            return 'bg-white max-lg:min-h-screen max-lg:flex max-lg:flex-col max-lg:p-4 max-lg:pt-10 lg:px-4 lg:pb-4 lg:pt-5 lg:p-6';
        }
        if (this.fullscreenBelow === 'md') {
            return 'bg-white max-md:min-h-screen max-md:flex max-md:flex-col max-md:p-4 max-md:pt-10 md:px-4 md:pb-4 md:pt-5 md:p-6';
        }
        return 'bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4';
    }
}
