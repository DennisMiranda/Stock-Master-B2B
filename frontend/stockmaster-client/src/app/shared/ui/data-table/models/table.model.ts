import { TemplateRef } from '@angular/core';

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    template?: TemplateRef<any>; // Para renderizado personalizado (Badges, Acciones)
    sortable?: boolean;
    class?: string; // Clases CSS adicionales para la columna
}

export interface SortEvent {
    column: string;
    direction: 'asc' | 'desc' | '';
}
