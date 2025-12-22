import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { CartItem } from '../../../../../core/models/cart.model';

@Component({
  selector: 'app-checkout-total',
  imports: [CurrencyPipe],
  templateUrl: './checkout-total.html',
  styleUrl: './checkout-total.css',
})
export class CheckoutTotal {
  items = input<CartItem[]>([]);
  total = computed<number>(() =>
    this.items().reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0)
  );
}
