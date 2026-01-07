import { TemplateRef } from '@angular/core';

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    template?: TemplateRef<any>; // Para renderizado personalizado (Badges, Acciones)
    sortable?: boolean;
    class?: string; // Clases CSS adicionales para la columna

    // Control de visibilidad responsive
    /** Ocultar esta columna en móvil (< 768px) */
    hideOnMobile?: boolean;
    /** Ocultar esta columna en tablet y móvil (< 1024px) */
    hideOnTablet?: boolean;
    /** Mostrar solo en desktop (>= 1024px) */
    showOnlyOnDesktop?: boolean;
}

export interface SortEvent {
    column: string;
    direction: 'asc' | 'desc' | '';
}
