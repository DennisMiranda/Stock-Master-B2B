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
    @Output() close = new EventEmitter<void>();
    readonly XIcon = X;
}
