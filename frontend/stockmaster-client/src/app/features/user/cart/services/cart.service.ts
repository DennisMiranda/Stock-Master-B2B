import { Injectable, inject } from '@angular/core';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { ApiService } from '../../../../core/http/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
 private api = inject(ApiService);
  private storage = inject(LocalStorageService);
  private key = 'cart';

  // Local
  getLocalCart(): any[] {
    return this.storage.getItem<any[]>(this.key) || [];
  }
  saveLocalCart(cart: any[]): void {
    this.storage.setItem(this.key, cart);
  }
  clearLocalCart(): void {
    this.storage.removeItem(this.key);
  }

  // Remoto (usando ApiService en vez de HttpClient directo)
  getRemoteCart(): Observable<any[]> {
    return this.api.get<any[]>('/cart');
  }
  addRemoteItem(product: any): Observable<any> {
    return this.api.post<any>('/cart', product);
  }
  removeRemoteItem(productId: string): Observable<any> {
    return this.api.delete<any>(`/cart/${productId}`);
  }
  mergeCart(localItems: any[]): Observable<any> {
    return this.api.post<any>('/cart/merge', { items: localItems });
  }

  // Sincronización
  syncOnLogin(): void {
    const localItems = this.getLocalCart();
    if (localItems.length > 0) {
      this.mergeCart(localItems).subscribe(() => {
        this.clearLocalCart();
      });
    }
  }
}
