import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  Pipe,
  PipeTransform,
  inject,
  computed,
  signal,
  effect,
  ChangeDetectionStrategy
} from '@angular/core';
import { SortableHeaderDirective, SortEvent } from '../../directives/sortable.directive';
import { TableColumn } from './models/table.model';
import { BreakpointService } from '../../utils/breakpoint.service';

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
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class DataTableComponent<T> {
  private breakpointService = inject(BreakpointService);

  @Input() data: T[] = [];
  @Input() columns: TableColumn<T>[] = [];
  @Output() sort = new EventEmitter<SortEvent>();
  @Output() rowClick = new EventEmitter<T>();
  @Input() isLoading: boolean = false;

  // Internal signal to trigger reactivity when columns change
  private columnsSignal = signal<TableColumn<T>[]>([]);

  // Update signal when columns input changes
  ngOnChanges() {
    this.columnsSignal.set(this.columns);
  }

  /** Computed: Columnas visibles según viewport actual */
  visibleColumns = computed(() => {
    const cols = this.columnsSignal();
    const isMobile = this.breakpointService.isMobile();
    const isTablet = this.breakpointService.isTablet();
    const isDesktop = this.breakpointService.isDesktop();

    return cols.filter(col => {
      // hideOnMobile: Ocultar en móvil solo
      if (isMobile && col.hideOnMobile) return false;
      // hideOnTablet: Ocultar en móvil Y tablet
      if ((isMobile || isTablet) && col.hideOnTablet) return false;
      // showOnlyOnDesktop: Solo mostrar en desktop
      if (col.showOnlyOnDesktop && !isDesktop) return false;
      return true;
    });
  });

  onSort({ column, direction }: SortEvent) {
    this.sort.emit({ column, direction });
  }
}
