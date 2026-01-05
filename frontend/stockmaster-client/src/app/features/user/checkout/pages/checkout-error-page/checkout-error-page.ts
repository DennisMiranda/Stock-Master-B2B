import { Component, inject, OnInit, signal } from '@angular/core';
import { CardProduct } from '../../../../../shared/ui/cards/card-product/card-product';
import { ItemWithError } from '../../services/checkout.service';
import { VariantPipe } from '../../../../../shared/pipes/variant.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-error-page',
  imports: [CardProduct, VariantPipe],
  templateUrl: './checkout-error-page.html',
  styleUrl: './checkout-error-page.css',
})
export class CheckoutErrorPage implements OnInit {
  router = inject(Router);

  itemsWithError = signal<ItemWithError[]>([]);

  ngOnInit(): void {
    const navigation = this.router.currentNavigation();
    if (navigation?.extras.state && navigation.extras.state['itemsWithError']) {
      this.itemsWithError.set(navigation.extras.state['itemsWithError']);
    }
  }
}
