import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-angular';

@Component({
    selector: 'app-stock-badge',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stock-badge.component.html',
})
export class StockBadgeComponent {
    value = input.required<number>();
    type = input<'unit' | 'box'>('unit');

    status = computed(() => {
        const val = this.value();
        if (val === 0) return 'out';
        if (val <= 5) return 'low';
        return 'good';
    });

    classes = computed(() => {
        switch (this.status()) {
            case 'out':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'low':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'good':
                return 'bg-green-100 text-green-800 border-green-200';
        }
    });

    label = computed(() => {
        const unitLabel = this.type() === 'box' ? 'Cajas' : 'Unds';
        if (this.status() === 'out') return `Agotado`;
        return `${this.value()} ${unitLabel}`;
    });
}
