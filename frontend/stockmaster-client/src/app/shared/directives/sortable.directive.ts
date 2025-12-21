import { Directive, Input, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';

export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = { 'asc': 'desc', 'desc': '', '': 'asc' };

export interface SortEvent {
    column: string;
    direction: SortDirection;
}

@Directive({
    selector: 'th[sortable]',
    standalone: true
})
export class SortableHeaderDirective {
    @Input() sortable: string = '';
    @Input() direction: SortDirection = '';
    @Output() sort = new EventEmitter<SortEvent>();

    @HostBinding('class.asc') get isAsc() { return this.direction === 'asc'; }
    @HostBinding('class.desc') get isDesc() { return this.direction === 'desc'; }

    @HostListener('click') rotate() {
        this.direction = rotate[this.direction];
        this.sort.emit({ column: this.sortable, direction: this.direction });
    }
}
