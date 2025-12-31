import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/http/api.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import type { CartItem } from '../../../../core/models/cart.model';
import type { ApiResponse } from '../../../../core/models/api-response.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RemoteCartService {
  private api = inject(ApiService);
  apiURL = environment.apiURL;
  private readonly BASE_PATH = '/cart';

  getCart(userId: string): Observable<CartItem[]> {
    return this.api
      .get<CartItem[]>(`${this.BASE_PATH}?userId=${userId}`)
      .pipe(map((res: ApiResponse<CartItem[]>) => res.data ?? []));
  }

  addItem(userId: string, item: CartItem): Observable<CartItem[]> {
    return this.api
      .post<CartItem[]>(`${this.BASE_PATH}?userId=${userId}`, { ...item })
      .pipe(map((res: ApiResponse<CartItem[]>) => res.data ?? []));
  }

  updateItem(userId: string, item: CartItem): Observable<CartItem[]> {
    return this.api
      .put<CartItem[]>(`${this.BASE_PATH}/quantity?userId=${userId}`, { ...item })
      .pipe(map((res: ApiResponse<CartItem[]>) => res.data ?? []));
  }

  removeItem(userId: string, productId: string, variant: string): Observable<CartItem[]> {
    return this.api
      .delete<CartItem[]>(`${this.BASE_PATH}/${productId}?variant=${variant}&userId=${userId}`)
      .pipe(map((res: ApiResponse<CartItem[]>) => res.data ?? []));
  }

  mergeCart(userId: string, localItems: CartItem[]): Observable<CartItem[]> {
    return this.api
      .post<CartItem[]>(`${this.BASE_PATH}/merge?userId=${userId}`, { items: localItems })
      .pipe(map((res: ApiResponse<CartItem[]>) => res.data ?? []));
  }

 clearCart(userId: string): Observable<ApiResponse<void>> {
  console.log('limpiando carrito remoto:', userId, `${this.BASE_PATH}/clear/${userId}`);
  return this.api.delete<void>(`${this.BASE_PATH}/clear/${userId}`).pipe(
    tap((res) => {
      if (res.success) {
        console.log('Carrito eliminado correctamente');
      } else {
        console.warn('No se pudo eliminar el carrito:', res.message);
      }
    })
  );
}

}
