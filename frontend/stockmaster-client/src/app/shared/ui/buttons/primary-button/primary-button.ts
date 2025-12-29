import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
    selector: 'app-primary-button',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <button 
      [type]="type"
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)"
      [class]="'flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] ' + 
               (fullWidth ? 'w-full ' : '') + 
               customClass + ' ' +
               (disabled || loading 
                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                 : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30')"
      class="px-6 py-3.5">
      
      @if (loading) {
        <lucide-icon [img]="LoaderIcon" class="w-5 h-5 animate-spin"></lucide-icon>
      }
      
      <ng-content></ng-content>
    </button>
  `
})
export class PrimaryButton {
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() disabled = false;
    @Input() loading = false;
    @Input() fullWidth = false;
    @Input() customClass = '';
    @Output() onClick = new EventEmitter<Event>();

    readonly LoaderIcon = Loader2;
}
