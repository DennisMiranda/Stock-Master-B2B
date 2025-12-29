import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
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
import { CategoryService } from '../../../../core/services/category.service';

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
  private http = inject(HttpClient);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Eliminado: ya no se usa filtrado cliente-side

  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  term = signal<string>('');
  page = signal<number>(1);
  limit = signal<number>(4);
  metadata = signal<SearchProductsResponse['metadata']>({
    count: 0,
    pages: 0,
  });

  constructor() {
    // Cargar categorías desde backend y actualizar opciones de filtros
    this.categoryService
      .getCategoriesWithSubcategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories) => {
        this.filterService.setFilterOptionsCategories(categories);
      });

    // Leer query params iniciales y sincronizar filtros
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const search = (params['search'] as string) || '';
      const page = Number(params['page'] || 1);
      const limit = Number(params['limit'] || this.limit());
      const categoryId = (params['categoryId'] as string) || '';
      const subcategoryId = (params['subcategoryId'] as string) || '';
      const brand = (params['brand'] as string) || '';
      const inStockOnly = params['inStockOnly'] === 'true';

      this.term.set(search);
      this.page.set(page);
      this.limit.set(limit);
      this.filterService.setCategories(categoryId ? [categoryId] : []);
      this.filterService.setSubcategories(subcategoryId ? [subcategoryId] : []);
      this.filterService.setBrands(brand ? [brand] : []);
      this.filterService.setInStockOnly(inStockOnly);

      // Dispara búsqueda inicial con los parámetros actuales
      this.search$.next(search);
    });

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
   * Actualiza la página actual, sincroniza los query params y re-dispara la búsqueda
   */
  setPage(page: number) {
    this.page.set(page);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page,
        limit: this.limit(),
      },
      queryParamsHandling: 'merge',
    });
    // Mantener flujo consistente: el backend aplica paginación tras filtros
    this.search$.next(this.term());
  }

  /**
   * Inicializa el flujo de escucha de filtros
   * Cuando cambian los filtros, vuelve a aplicarlos a los productos actuales
   */
  private initFilterFlow() {
    this.filterService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters) => {
        // Actualizar la URL con los filtros actuales (usar primero de cada lista)
        const categoryId = filters.categories[0] || undefined;
        const subcategoryId = filters.subcategories[0] || undefined;
        const brand = filters.brands[0] || undefined;

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            search: this.term() || undefined,
            page: this.page() || 1,
            limit: this.limit() || 4,
            categoryId,
            subcategoryId,
            brand,
            inStockOnly: filters.inStockOnly || undefined,
          },
          queryParamsHandling: 'merge',
        });

        // Re-disparar búsqueda para que el backend aplique los filtros
        this.search$.next(this.term());
      });
  }

  /**
   * Aplica los filtros actuales a los productos
   */
  // Eliminado: filtrado cliente-side ahora lo hace el backend

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
        switchMap((term) => {
          const current = this.filterService.getCurrentFilters();
          const params: Record<string, string | number | boolean> = {
            search: term,
            page: this.page(),
            limit: this.limit(),
          };
          if (current.categories[0]) params['categoryId'] = current.categories[0];
          if (current.subcategories[0]) params['subcategoryId'] = current.subcategories[0];
          if (current.brands[0]) params['brand'] = current.brands[0];
          if (current.inStockOnly) params['inStockOnly'] = true;
          // Security: Client Catalog always requests active products
          params['isActive'] = true;

          return this.api.get<SearchProductsResponse>('/products', { params })
            .pipe(
              map((response) => {
                return response.data || defaultResponse;
              }),
              catchError((err) => {
                console.error('[CatalogService] API error, cargando respaldo local...', err);
                return this.loadFallbackProducts();
              })
            );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        this.products.set(data.products || []);
        this.metadata.set(data.metadata);
        this.loading.set(false);
        // Solo actualizamos marcas dinámicamente desde productos para sugerencias
        this.filterService.updateFilterOptionsFromProducts(data.products || []);
      });
  }

  /**
   * Carga productos de respaldo local desde assets cuando la API falla
   */
  private loadFallbackProducts() {
    const page = this.page();
    const limit = this.limit();
    return this.http.get<Product[]>(`/assets/mock/products.json`).pipe(
      map((products) => {
        const start = (page - 1) * limit;
        const paged = products.slice(start, start + limit);
        return {
          products: paged,
          metadata: {
            count: products.length,
            pages: Math.ceil(products.length / limit),
          },
        } as SearchProductsResponse;
      }),
      catchError(() => of(defaultResponse))
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
