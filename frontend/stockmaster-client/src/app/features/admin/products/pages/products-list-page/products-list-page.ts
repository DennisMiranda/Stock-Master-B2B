import { ConfirmationModalComponent } from '../../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { Component, computed, inject, OnInit, signal, ViewChild, TemplateRef, AfterViewInit, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-angular';
import { ProductService, ProductModel } from '../../../../../core/services/product.service';
import { SearchInput } from '../../../../../shared/ui/inputs/search-input/search-input';
import { BasicPagination } from '../../../../../shared/ui/pagination/basic-pagination/basic-pagination';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map, startWith, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { DataTableComponent } from '../../../../../shared/ui/data-table/data-table.component';
import { TableColumn } from '../../../../../shared/ui/data-table/models/table.model';
import { ProductModal } from '../../components/product-modal/product-modal';
import { PrimaryButton } from '../../../../../shared/ui/buttons/primary-button/primary-button';

@Component({
    selector: 'app-products-list-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        LucideAngularModule,
        SearchInput,
        DataTableComponent,
        ProductModal,
        BasicPagination,
        ConfirmationModalComponent,
        PrimaryButton
    ],
    templateUrl: './products-list-page.html',
    styleUrl: './products-list-page.css'
})
export class ProductsListPage implements OnInit, AfterViewInit {
    private productService = inject(ProductService);

    products = this.productService.products;
    isLoading = this.productService.isLoading;

    // Pagination Signals from Service
    totalPages = this.productService.totalPages;
    currentPage = this.productService.currentPage;
    totalProducts = this.productService.totalItems;

    searchControl = new FormControl('');

    constructor() {
        // Server-side Search Effect
        this.searchControl.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            map(term => term?.trim() || '')
        ).subscribe(term => {
            // Reset to page 1 when searching
            this.productService.loadProducts({ search: term, page: 1 });
        });
    }

    // No client-side filtering needed anymore
    // filteredProducts = computed removed in favor of direct products signal usage

    activeProductsCount = computed(() => this.products().filter((p: ProductModel) => p.isActive).length);

    // Icons
    readonly PlusIcon = Plus;
    readonly SearchIcon = Search;
    readonly EditIcon = Edit;
    readonly TrashIcon = Trash2;

    // Table Columns
    columns: TableColumn<ProductModel>[] = [];

    // Templates
    @ViewChild('imageTemplate') imageTemplate!: TemplateRef<any>;
    @ViewChild('priceTemplate') priceTemplate!: TemplateRef<any>;
    @ViewChild('stockTemplate') stockTemplate!: TemplateRef<any>;
    @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
    @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

    // Modal State
    @ViewChild('deleteModal') deleteModal!: ConfirmationModalComponent;
    isModalOpen = signal(false);
    selectedProduct = signal<ProductModel | null>(null);
    isSaving = signal(false);

    // Temp state for deletion
    private productToDeleteId: string | null = null;
    private toast = inject(ToastService);

    ngOnInit() {
        this.productService.loadProducts();
    }

    onPageChange(page: number) {
        // Keep current search term if any
        const currentSearch = this.searchControl.value;
        this.productService.loadProducts({
            page,
            search: currentSearch
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.columns = [
                { key: 'images', label: 'Imagen', template: this.imageTemplate },
                { key: 'name', label: 'Producto', sortable: true },
                { key: 'sku', label: 'SKU', sortable: true, hideOnMobile: true },
                { key: 'brand', label: 'Marca', sortable: true, hideOnMobile: true },
                { key: 'prices', label: 'Precio Base', template: this.priceTemplate, sortable: true, hideOnTablet: true },
                { key: 'stockUnits', label: 'Stock', template: this.stockTemplate, sortable: true, hideOnTablet: true },
                { key: 'isActive', label: 'Estado', template: this.statusTemplate, sortable: true, hideOnMobile: true },
                { key: 'id', label: 'Acciones', template: this.actionsTemplate }
            ];
        });
    }

    openCreateModal() {
        this.selectedProduct.set(null);
        this.isModalOpen.set(true);
    }

    openEditModal(product: ProductModel) {
        this.selectedProduct.set(product);
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
        this.selectedProduct.set(null);
    }

    onSave(data: any) {
        this.isSaving.set(true);
        if (this.selectedProduct()) {
            this.productService.updateProduct(this.selectedProduct()!.id, data).subscribe({
                next: () => {
                    this.isSaving.set(false);
                    this.closeModal();
                    this.toast.success('Producto actualizado correctamente');
                },
                error: (err: any) => {
                    this.isSaving.set(false);
                    this.toast.error('Error al actualizar el producto');
                }
            });
        } else {
            this.productService.createProduct(data).subscribe({
                next: () => {
                    this.isSaving.set(false);
                    this.closeModal();
                    this.productService.loadProducts();
                    this.toast.success('Producto creado correctamente');
                },
                error: (err: any) => {
                    this.isSaving.set(false);
                    this.toast.error('Error al crear el producto');
                }
            });
        }
    }

    onDelete(product: ProductModel) {
        this.productToDeleteId = product.id;
        this.deleteModal.open();
    }

    onDeleteConfirmed() {
        if (!this.productToDeleteId) return;

        this.productService.deleteProduct(this.productToDeleteId).subscribe({
            next: () => {
                this.toast.success('Producto eliminado correctamente');
                this.productToDeleteId = null;
            },
            error: () => {
                this.toast.error('Error al eliminar el producto');
                this.productToDeleteId = null;
            }
        });
    }
}
