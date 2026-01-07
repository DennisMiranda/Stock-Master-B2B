import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { VariantPipe } from '../../../../../shared/pipes/variant.pipe';
import { CardProduct } from '../../../../../shared/ui/cards/card-product/card-product';
import { ItemWithError } from '../../services/checkout.service';

@Component({
  selector: 'app-checkout-error-page',
  imports: [CardProduct, VariantPipe],
  templateUrl: './checkout-error-page.html',
  styleUrl: './checkout-error-page.css',
})
export class CheckoutErrorPage {
  router = inject(Router);

  itemsWithError = signal<ItemWithError[]>([]);

  constructor() {
    const navigation = this.router.currentNavigation();
    if (navigation?.extras.state && navigation.extras.state['itemsWithError']) {
      this.itemsWithError.set(navigation.extras.state['itemsWithError']);
    }
  }
}
