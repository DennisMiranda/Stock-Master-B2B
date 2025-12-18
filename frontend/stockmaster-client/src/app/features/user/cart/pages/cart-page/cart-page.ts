import { Component,inject } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-page',
  imports: [],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {
  private cartService = inject(CartService);

  addToCart(product: any) {
    this.cartService.addItem(product);
  }

  removeFromCart(id: string) {
    this.cartService.removeItem(id);
  }
}
