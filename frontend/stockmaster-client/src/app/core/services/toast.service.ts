import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private _toasts = signal<Toast[]>([]);

    // Expose readonly signal for consumption
    readonly toasts = computed(() => this._toasts());

    show(message: string, type: ToastType = 'info', duration: number = 3000) {
        const id = Date.now();
        const newToast: Toast = { id, message, type, duration };

        this._toasts.update(toasts => [...toasts, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }
    }

    success(message: string, duration: number = 3000) {
        this.show(message, 'success', duration);
    }

    error(message: string, duration: number = 4000) {
        this.show(message, 'error', duration);
    }

    info(message: string, duration: number = 3000) {
        this.show(message, 'info', duration);
    }

    warning(message: string, duration: number = 3500) {
        this.show(message, 'warning', duration);
    }

    remove(id: number) {
        this._toasts.update(toasts => toasts.filter(t => t.id !== id));
    }
}
