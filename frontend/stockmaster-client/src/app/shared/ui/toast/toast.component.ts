import { Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType, Toast } from '../../../core/services/toast.service';
import { LucideAngularModule, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      @for (toast of toasts(); track toast.id) {
        <div 
          class="pointer-events-auto min-w-[300px] max-w-md p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 animate-slide-in flex items-start gap-3 bg-white"
          [ngClass]="getToastClasses(toast.type)"
        >
            <!-- Icon -->
            <div class="shrink-0 mt-0.5">
                @switch (toast.type) {
                    @case ('success') { <lucide-icon [img]="CheckCircle" class="w-5 h-5 text-green-500" /> }
                    @case ('error') { <lucide-icon [img]="AlertCircle" class="w-5 h-5 text-red-500" /> }
                    @case ('warning') { <lucide-icon [img]="AlertTriangle" class="w-5 h-5 text-amber-500" /> }
                    @case ('info') { <lucide-icon [img]="Info" class="w-5 h-5 text-blue-500" /> }
                }
            </div>

            <!-- Content -->
            <div class="flex-1 text-sm font-medium text-gray-800 break-words">
                {{ toast.message }}
            </div>

            <!-- Close Button -->
            <button (click)="toastService.remove(toast.id)" class="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                <lucide-icon [img]="X" class="w-4 h-4" />
            </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out forwards;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  readonly X = X;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly Info = Info;

  readonly toasts: Signal<Toast[]> = this.toastService.toasts;

  getToastClasses(type: ToastType): string {
    switch (type) {
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      case 'warning': return 'border-amber-500';
      case 'info': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  }
}
