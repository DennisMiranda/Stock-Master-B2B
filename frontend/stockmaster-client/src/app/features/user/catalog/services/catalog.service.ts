import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import {
  catchError,
  debounceTime,
  filter,
  map,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ApiService } from '../../../../core/http/api.service';
import { Product } from '../../../../core/models/product.model';
import { CatalogFilterService } from './catalog-filter.service';
import { CatalogFilters } from '../../../../core/models/catalog-filter.model';

interface SearchProductsResponse {
  products: Product[];
  metadata: { count: number; pages: number };
}

const defaultResponse: SearchProductsResponse = {
  products: [],
  metadata: { count: 0, pages: 0 },
};

@Injectable({
  providedIn: 'root',
})
export class CatalogService implements OnDestroy {
  private api = inject(ApiService);
  private filterService = inject(CatalogFilterService);

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Guarda todos los productos sin filtrar (para aplicar filtros cliente-side)
  private allProducts: Product[] = [];
  
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  term = signal<string>('');
  page = signal<number>(1);
  metadata = signal<SearchProductsResponse['metadata']>({
    count: 0,
    pages: 0,
  });

  constructor() {
    this.initSearchFlow();
    this.initFilterFlow();
  }

  searchProducts(term: string) {
    this.page.set(1);
    this.search$.next(term);
  }

  updateSearch({ search, page }: { search: string; page: number }) {
    this.term.set(search);
    this.page.set(page);
    this.search$.next(search);
  }

  /**
   * Inicializa el flujo de escucha de filtros
   * Cuando cambian los filtros, vuelve a aplicarlos a los productos actuales
   */
  private initFilterFlow() {
    this.filterService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Cuando cambian los filtros, re-aplicarlos a los productos actuales
        this.applyFilters();
      });
  }

  /**
   * Aplica los filtros actuales a los productos
   */
  private applyFilters(): void {
    const currentFilters = this.filterService.getCurrentFilters();
    const filtered = this.filterProductsByFilters(this.allProducts, currentFilters);
    this.products.set(filtered);
  }

  /**
   * Filtra un array de productos basado en los filtros seleccionados
   */
  private filterProductsByFilters(productsToFilter: Product[], filters: CatalogFilters): Product[] {
    return productsToFilter.filter((product) => {
      // Filtro de categorías
      if (filters.categories.length > 0) {
        if (!product.categoryId || !filters.categories.includes(product.categoryId)) {
          return false;
        }
      }

      // Filtro de marcas
      if (filters.brands.length > 0) {
        if (!product.brand || !filters.brands.includes(product.brand)) {
          return false;
        }
      }

      // Filtro de disponibilidad
      if (filters.inStockOnly) {
        if (!product.stockUnits || product.stockUnits <= 0) {
          return false;
        }
      }

      return true;
    });
  }

  private initSearchFlow() {
    this.search$
      .pipe(
        debounceTime(300),
        map((term) => term.trim()),
        filter((term) => term.length >= 2 || term.length === 0),
        tap((term) => {
          if (term !== this.term()) {
            this.page.set(1);
          }
          this.term.set(term);
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap((term) =>
          this.api
            .get<SearchProductsResponse>('/products', {
              params: {
                search: term,
                page: this.page(),
                limit: 4,
              },
            })
            .pipe(
              map((response) => {
                return response.data || defaultResponse;
              }),
              catchError((err) => {
                console.error(err);
                this.error.set('Error al buscar productos');
                return of(defaultResponse);
              })
            )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        // Guardar todos los productos sin filtrar
        this.allProducts = data.products || [];
        this.metadata.set(data.metadata);
        this.loading.set(false);
        
        // Actualizar opciones de filtros dinámicamente basado en los productos actuales
        this.filterService.updateFilterOptions(this.allProducts);
        
        // Aplicar filtros a los productos obtenidos
        this.applyFilters();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
