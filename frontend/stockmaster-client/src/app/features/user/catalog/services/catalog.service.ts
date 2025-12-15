import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ApiService } from '../../../../core/http/api.service';
import { Product } from '../../../../core/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CatalogService implements OnDestroy {
  private api = inject(ApiService);

  private search$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();

  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.initSearchFlow();
  }

  searchProducts(term: string) {
    this.search$.next(term);
  }

  private initSearchFlow() {
    this.search$
      .pipe(
        debounceTime(300),
        map((term) => term.trim()),
        distinctUntilChanged(),
        filter((term) => term.length >= 2 || term.length === 0),
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap((term) =>
          this.api
            .get<Product[]>('/products', {
              params: {
                search: term,
                page: 1,
                limit: 10,
              },
            })
            .pipe(
              map((response) => response.data || []),
              catchError((err) => {
                console.error(err);
                this.error.set('Error al buscar productos');
                return [[] as Product[]];
              })
            )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((products) => {
        this.products.set(products);
        this.loading.set(false);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
