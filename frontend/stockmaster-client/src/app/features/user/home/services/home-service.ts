import { inject, Injectable,signal } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { ApiService } from '../../../../core/http/api.service';
import { Product } from '../../../../core/models/product.model';
interface ProductsResponse {
  products: Product[];
  metadata: { count: number; pages: number };
}
const defaultResponse: ProductsResponse = {
  products: [],
  metadata: { count: 0, pages: 0 },
};

@Injectable({
  providedIn: 'root',
})
export class HomeService {
private api = inject(ApiService);

  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  getProducts(page: number = 1, limit: number = 12, search: string = '') {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .get<ProductsResponse>('/products', {
        params: { search, page, limit },
      })
      .pipe(
        map((response) => response.data || defaultResponse),
        catchError((err) => {
          console.error(err);
          this.error.set('Error al cargar productos');
          return of(defaultResponse);
        })
      )
      .subscribe((data) => {
        this.products.set(data.products);
        this.loading.set(false);
      });
  }
}
