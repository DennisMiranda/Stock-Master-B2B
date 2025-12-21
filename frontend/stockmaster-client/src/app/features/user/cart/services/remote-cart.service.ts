import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/http/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { CartItem } from '../../../../core/models/cart.model';
import type { ApiResponse } from '../../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class RemoteCartService {
  private api = inject(ApiService);
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

  clearCart(): Observable<void> {
    return this.api.delete<void>(this.BASE_PATH).pipe(map(() => void 0));
  }
}
