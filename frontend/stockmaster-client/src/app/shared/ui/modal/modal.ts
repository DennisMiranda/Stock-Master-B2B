import { Component, EventEmitter, Output } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [LucideAngularModule],
    templateUrl: './modal.html'
})
export class Modal {
    @Output() close = new EventEmitter<void>();
    readonly XIcon = X;
}
