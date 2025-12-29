import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, Pipe, PipeTransform } from '@angular/core';
import { SortableHeaderDirective, SortEvent } from '../../directives/sortable.directive';
import { TableColumn } from './models/table.model';

// Helper Pipes (Inline for simplicity, or move to shared/pipes)
@Pipe({ name: 'keyToString', standalone: true })
export class KeyToStringPipe implements PipeTransform {
  transform(value: any): string {
    return String(value);
  }
}

@Pipe({ name: 'getProperty', standalone: true })
export class GetPropertyPipe implements PipeTransform {
  transform(item: any, key: any): any {
    return item?.[key] ?? '';
  }
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, SortableHeaderDirective, KeyToStringPipe, GetPropertyPipe],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent<T> {
    @Input() data: T[] = [];
    @Input() columns: TableColumn<T>[] = [];
    @Output() sort = new EventEmitter<SortEvent>();
    @Output() rowClick = new EventEmitter<T>();
  @Input() isLoading: boolean = false;



  onSort({ column, direction }: SortEvent) {
    // Reset other headers logic could be added here if we had access to ViewChildren
    this.sort.emit({ column, direction });
  }
}
