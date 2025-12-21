import { CurrencyPipe } from '@angular/common';
import { Component, input,signal,inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Box, LucideAngularModule, Package, ShoppingCart, Tag } from 'lucide-angular';
import type { Product } from '../../../../core/models/product.model';
import type { CartItem } from '../../../../core/models/cart.model';
import { CartService } from '../../../../features/user/cart/services/cart.service';
import { ModalCart } from '../../../../features/user/cart/components/modal-cart/modal-cart';
interface PriceTypeIcon {
  label: string;
  icon: string;
}
@Component({
  selector: 'app-card-product',
  imports: [RouterLink, LucideAngularModule, CurrencyPipe,ModalCart],
  templateUrl: './card-product.html',
  styleUrl: './card-product.css',
})
export class CardProduct {
    showModal = signal(false);
  cartService = inject(CartService);

  readonly ShoppingCart = ShoppingCart;
  readonly Tag = Tag;
  readonly Package = Package;
  product = input<Product>();
  icons = [Package, Tag, Box];

  priceTypes: PriceTypeIcon[] = [
    { label: 'unit', icon: 'package' },
    { label: 'wholesale', icon: 'tag' },
    { label: 'box', icon: 'hash' },
  ];

  getPriceLabel(label: string): string {
    const labels: { [key: string]: string } = {
      unit: 'Unitario',
      wholesale: 'Mayorista',
      box: 'Por Caja',
    };
    return labels[label.toLowerCase()] || label;
  }

  openModal(): void {
    this.showModal.set(true);
  }
  onAddProducts(items: CartItem[]): void {
    items.forEach(item => {
      this.cartService.addItem(item).subscribe();
    });
    console.log(`${items.length} variante(s) agregada(s) al carrito`);
  }
}
