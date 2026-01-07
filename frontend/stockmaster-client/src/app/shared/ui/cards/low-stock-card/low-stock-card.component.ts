import { Component, Input } from '@angular/core';
import { LucideAngularModule, LucideIconData, AlertTriangle } from 'lucide-angular';
import { StockBadgeComponent } from '../../badges/stock-badge/stock-badge.component';

export interface LowStockItem {
    id: string;
    name: string;
    sku: string;
    stockUnits: number;
    stockBoxes: number;
    images: string[];
}

@Component({
    selector: 'app-low-stock-card',
    standalone: true,
    imports: [LucideAngularModule, StockBadgeComponent],
    templateUrl: './low-stock-card.component.html'
})
export class LowStockCardComponent {
    /** Título de la sección */
    @Input({ required: true }) title!: string;

    /** Tipo de stock a mostrar */
    @Input() stockType: 'unit' | 'box' = 'unit';

    /** Esquema de color */
    @Input() colorScheme: 'red' | 'orange' = 'red';

    /** Items de bajo stock */
    @Input() items: LowStockItem[] = [];

    /** Texto del badge de acción */
    @Input() actionLabel: string = 'Reponer';

    /** Icono placeholder para items sin imagen */
    @Input() placeholderIcon: LucideIconData = AlertTriangle;

    get borderColorClass(): string {
        return this.colorScheme === 'red' ? 'border-red-100 ring-red-50' : 'border-orange-100 ring-orange-50';
    }

    get headerBgClass(): string {
        return this.colorScheme === 'red' ? 'bg-red-50/30 border-red-100' : 'bg-orange-50/30 border-orange-100';
    }

    get iconColorClass(): string {
        // Uniforme: siempre rojo para urgencia
        return 'text-red-500';
    }

    get titleColorClass(): string {
        // Uniforme: título negro para consistencia
        return 'text-gray-900';
    }

    get badgeBgClass(): string {
        // Uniforme: siempre rojo para urgencia
        return 'bg-red-100 text-red-700';
    }

    get dividerColorClass(): string {
        return this.colorScheme === 'red' ? 'divide-red-50' : 'divide-orange-50';
    }

    getStockValue(item: LowStockItem): number {
        return this.stockType === 'unit' ? item.stockUnits : item.stockBoxes;
    }
}
