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
        this.products.set(data.products || []);
        this.metadata.set(data.metadata);
        this.loading.set(false);
        
        // Actualizar opciones de filtros dinámicamente basado en los productos actuales
        this.filterService.updateFilterOptions(data.products || []);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
