import { BasicPagination } from '../../../../../shared/ui/pagination/basic-pagination/basic-pagination';
import { Component, inject, signal, ViewChild, TemplateRef, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../../../core/services/category.service';
import { DataTableComponent } from '../../../../../shared/ui/data-table/data-table.component';
import { PrimaryButton } from '../../../../../shared/ui/buttons/primary-button/primary-button';
import { CategoryModal } from '../../components/category-modal/category-modal';
import { ToastService } from '../../../../../core/services/toast.service';
import { LucideAngularModule, Plus, Edit, Trash2 } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { TableColumn } from '../../../../../shared/ui/data-table/models/table.model';
import { ConfirmationModalComponent } from '../../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import { SearchInput } from '../../../../../shared/ui/inputs/search-input/search-input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-categories-list-page',
  standalone: true,
  imports: [CommonModule, DataTableComponent, PrimaryButton, CategoryModal, ConfirmationModalComponent, LucideAngularModule, SearchInput, ReactiveFormsModule, BasicPagination],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Categorías</h1>
          <p class="text-gray-500 mt-1">Gestiona las categorías y subcategorías.</p>
        </div>
        <app-primary-button (onClick)="openCreate()">
          <lucide-icon [img]="PlusIcon" class="w-5 h-5 mr-2"/>
          Nueva Categoría
        </app-primary-button>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1 sm:max-w-md">
            <app-search-input [control]="searchControl" placeholder="Buscar categorías o subcategorías..."/>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div class="flex-1">
            <app-data-table
                [data]="paginatedData()"
                [columns]="columns"
            ></app-data-table>
        </div>
        
        <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <app-basic-pagination 
                [page]="currentPage()" 
                [totalPages]="totalPages()" 
                (pageChange)="currentPage.set($event)"
            />
        </div>

        <!-- Template for Subcategories Chips -->
        <ng-template #subcategoriesTpl let-item>
            <div class="flex flex-wrap gap-2">
                @for (sub of $any(item).subcategories | slice:0:3; track $any(sub).id) {
                    <span class="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200">
                        {{ $any(sub).name }}
                    </span>
                }
                @if (($any(item).subcategories?.length || 0) > 3) {
                    <span class="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-xs font-semibold text-blue-600 border border-blue-100">
                        +{{ ($any(item).subcategories?.length || 0) - 3 }} más
                    </span>
                }
                @if (!$any(item).subcategories?.length) {
                    <span class="text-xs text-gray-400 italic">--</span>
                }
            </div>
        </ng-template>

        <!-- Template for Actions -->
        <ng-template #actionsTpl let-item>
            <div class="flex items-center gap-2" (click)="$event.stopPropagation()">
                <button (click)="editCategory($any(item))" class="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" aria-label="Editar">
                    <lucide-icon [img]="EditIcon" class="w-4 h-4"/>
                </button>
                <button (click)="confirmDeleteCategory($any(item))" class="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" aria-label="Eliminar">
                    <lucide-icon [img]="TrashIcon" class="w-4 h-4"/>
                </button>
            </div>
        </ng-template>
      </div>

      <app-category-modal #modal />
      
      <app-confirmation-modal 
        #deleteModal
        title="Eliminar Categoría"
        message="¿Estás seguro de eliminar esta categoría y todo su contenido? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
        (confirm)="onDeleteConfirmed()"
      />
    </div>
  `
})
export class CategoriesListPage implements OnInit {
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);

  @ViewChild('modal') modal!: CategoryModal;
  @ViewChild('deleteModal') deleteModal!: ConfirmationModalComponent;
  @ViewChild('subcategoriesTpl', { static: true }) subcategoriesTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;

  // Search Logic
  searchControl = new FormControl('');
  searchQuery = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  rawData = toSignal(this.categoryService.getCategoriesWithSubcategories(), { initialValue: [] });

  filteredData = computed(() => {
    const query = this.searchQuery()?.toLowerCase().trim() || '';
    const items = this.rawData();

    if (!query) return items;

    return items.filter((cat: any) => {
      const matchName = cat.name.toLowerCase().includes(query);
      // Also search in subcategories
      const matchSub = cat.subcategories?.some((sub: any) => sub.name.toLowerCase().includes(query));
      return matchName || matchSub;
    });
  });

  // Client-Side Pagination Logic
  currentPage = signal(1);
  itemsPerPage = signal(10);

  paginatedData = computed(() => {
    const data = this.filteredData();
    const page = this.currentPage();
    const limit = this.itemsPerPage();
    const startIndex = (page - 1) * limit;
    return data.slice(startIndex, startIndex + limit);
  });

  totalPages = computed(() => Math.ceil(this.filteredData().length / this.itemsPerPage()));

  columns: TableColumn<any>[] = [];

  constructor() {
    // Reset page to 1 when search query changes
    effect(() => {
      this.searchQuery();
      this.currentPage.set(1);
    }, { allowSignalWrites: true });
  }

  // Temp state for deletion
  private categoryToDeleteId: string | null = null;

  ngOnInit() {
    this.columns = [
      { key: 'name', label: 'Nombre', sortable: true },
      { key: 'subcategories', label: 'Subcategorías', template: this.subcategoriesTpl, sortable: false },
      { key: 'actions', label: 'Acciones', template: this.actionsTpl, sortable: false }
    ];
  }

  openCreate() {
    this.modal.open();
  }

  editCategory(category: any) {
    this.modal.open(category);
  }

  confirmDeleteCategory(category: any) {
    this.categoryToDeleteId = category.id;
    this.deleteModal.open();
  }

  onDeleteConfirmed() {
    if (!this.categoryToDeleteId) return;

    this.categoryService.deleteCategory(this.categoryToDeleteId).subscribe({
      next: () => {
        this.toast.success('Categoría eliminada correctamente.');
        this.categoryService.notifyDataChanged();
        this.categoryToDeleteId = null;
      },
      error: (err) => {
        console.error('Error eliminando categoría', err);
        if (err.message === 'CATEGORY_HAS_PRODUCTS') {
          this.toast.error('No se puede eliminar: Esta categoría tiene productos asociados.');
        } else {
          this.toast.error('Error inesperado al eliminar la categoría.');
        }
        this.categoryToDeleteId = null;
      }
    });
  }
}
