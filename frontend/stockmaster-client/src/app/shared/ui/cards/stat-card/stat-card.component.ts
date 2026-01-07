import { Component, Input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

export interface StatCardItem {
    id: string;
    name: string;
    value: number;
    images: string[];
    subtitle?: string;
}

@Component({
    selector: 'app-stat-card',
    standalone: true,
    imports: [LucideAngularModule],
    templateUrl: './stat-card.component.html'
})
export class StatCardComponent {
    /** Título principal de la tarjeta */
    @Input({ required: true }) title!: string;

    /** Subtítulo descriptivo */
    @Input() subtitle: string = '';

    /** Icono de Lucide para el header */
    @Input({ required: true }) icon!: LucideIconData;

    /** Esquema de color: 'blue' | 'amber' | 'red' | 'green' */
    @Input() colorScheme: 'blue' | 'amber' | 'red' | 'green' = 'blue';

    /** Items a mostrar en la tabla */
    @Input() items: StatCardItem[] = [];

    /** Etiqueta para el valor (ej: "Unidades", "Cajas") */
    @Input() valueLabel: string = 'Cantidad';

    /** Etiqueta secundaria para cada item */
    @Input() itemSubtitle: string = 'Item';


    get iconBgClass(): string {
        // Uniforme: siempre azul para consistencia visual
        return 'bg-blue-100 text-blue-700';
    }

    get valueColorClass(): string {
        // Uniforme: siempre azul para consistencia visual
        return 'text-blue-700';
    }

    get labelColorClass(): string {
        // Uniforme: siempre azul para consistencia visual
        return 'text-blue-600/80';
    }
}
