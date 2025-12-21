import { Injectable, inject } from '@angular/core';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import type { CartItem } from '../../../../core/models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class LocalCartService {
  private readonly CART_KEY = 'cart';
  private storage = inject(LocalStorageService);

  getCart(): CartItem[] {
    return this.storage.getItem<CartItem[]>(this.CART_KEY) || [];
  }

  saveCart(cart: CartItem[]): void {
    this.storage.setItem(this.CART_KEY, cart);
  }

  clearCart(): void {
    this.storage.removeItem(this.CART_KEY);
  }

  addItem(item: CartItem): void {
    const cart = this.getCart();
    const index = cart.findIndex(
      (p) => p.productId === item.productId && p.variant === item.variant
    );

    if (index !== -1) {
      cart[index].quantity += item.quantity;
    } else {
      cart.push(item);
    }

    this.saveCart(cart);
  }

  updateItem(item: CartItem): void {
    const cart = this.getCart();
    const index = cart.findIndex(
      (p) => p.productId === item.productId && p.variant === item.variant
    );

    if (index !== -1) {
      cart[index] = item;
      this.saveCart(cart);
    }
  }

  removeItem(productId: string, variant: string): void {
    const cart = this.getCart().filter(
      (p) => !(p.productId === productId && p.variant === variant)
    );
    this.saveCart(cart);
  }
}
