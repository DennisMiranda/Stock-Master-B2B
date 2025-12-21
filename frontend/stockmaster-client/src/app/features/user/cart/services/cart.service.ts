import { Injectable, inject, signal } from '@angular/core';
import { LocalCartService } from './local-cart.service';
import { RemoteCartService } from './remote-cart.service';
import { Observable, of, switchMap, tap } from 'rxjs';
import type { CartItem } from '../../../../core/models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private local = inject(LocalCartService);
  private remote = inject(RemoteCartService);
  private isLoggedIn = signal(false);
  private userId = signal<string | null>(null);
  cartItems = signal<CartItem[]>([]);
  cartCount = signal(0);

  setAuthState(isAuthenticated: boolean, userId?: string): void {
    this.isLoggedIn.set(isAuthenticated);
    this.userId.set(isAuthenticated ? userId ?? null : null);

    if (isAuthenticated && this.userId()) {
      this.syncOnLogin();
    }
  }

  getCart(): Observable<CartItem[]> {
    if (this.isLoggedIn() && this.userId()) {
      return this.remote.getCart(this.userId()!).pipe(tap((items) => this.updateCart(items)));
    } else {
      const items = this.local.getCart();
      this.updateCart(items);
      return of(items);
    }
  }

  addItem(item: CartItem): Observable<CartItem[]> {
    if (this.isLoggedIn() && this.userId()) {
      return this.remote.addItem(this.userId()!, item).pipe(tap((items) => this.updateCart(items)));
    } else {
      this.local.addItem(item);
      const items = this.local.getCart();
      this.updateCart(items);
      return of(items);
    }
  }

  updateItem(item: CartItem): Observable<CartItem[]> {
    if (this.isLoggedIn() && this.userId()) {
      return this.remote
        .updateItem(this.userId()!, item)
        .pipe(tap((items) => this.updateCart(items)));
    } else {
      this.local.updateItem(item);
      const items = this.local.getCart();
      this.updateCart(items);
      return of(items);
    }
  }

  removeItem(productId: string, variant: string): Observable<CartItem[]> {
    if (this.isLoggedIn() && this.userId()) {
      return this.remote
        .removeItem(this.userId()!, productId, variant)
        .pipe(tap((items) => this.updateCart(items)));
    } else {
      this.local.removeItem(productId, variant);
      const items = this.local.getCart();
      this.updateCart(items);
      return of(items);
    }
  }

  clearCart(): Observable<void> {
    if (this.isLoggedIn() && this.userId()) {
      return this.remote.clearCart().pipe(tap(() => this.updateCart([])));
    } else {
      this.local.clearCart();
      this.updateCart([]);
      return of(void 0);
    }
  }

  private syncOnLogin(): void {
    const localItems = this.local.getCart();
    if (localItems.length > 0 && this.userId()) {
      this.remote.mergeCart(this.userId()!, localItems).subscribe({
        next: (items) => {
          this.local.clearCart();
          this.updateCart(items);
        },
        error: (err) => console.error('Error al sincronizar el carrito:', err),
      });
    }
  }

  private updateCart(items: CartItem[]): void {
    this.cartItems.set(items);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCount.set(count);
  }
}
