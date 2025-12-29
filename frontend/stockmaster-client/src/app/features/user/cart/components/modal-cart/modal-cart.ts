import { Component, input, output, signal, computed, inject, HostListener, ElementRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  LucideAngularModule,
  X,
  ShoppingCart,
  Package,
} from 'lucide-angular';
import type { Product, Variant, Price } from '../../../../../core/models/product.model';
import type { CartItem } from '../../../../../core/models/cart.model';
import { CardPriceVariant } from '../../../../../shared/ui/cards/card-price-variant/card-price-variant';

@Component({
  selector: 'app-modal-cart',
  standalone: true,
  imports: [CurrencyPipe, LucideAngularModule, CardPriceVariant],
  templateUrl: './modal-cart.html',
  styleUrl: './modal-cart.css',
})
export class ModalCart {
  readonly XIcon = X;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly PackageIcon = Package;

  private host = inject(ElementRef<HTMLElement>);
  product = input.required<Product>();
  closeModal = output<void>();
  addProducts = output<CartItem[]>();

  // Map to track quantities: Variant -> Quantity
  variantQuantities = signal<Map<Variant, number>>(new Map());

  grandTotal = computed(() => {
    let total = 0;
    this.product().prices.forEach((price) => {
      const qty = this.variantQuantities().get(price.label) || 0;
      if (qty > 0) {
        const effectivePrice = this.calculateEffectivePrice(price, qty);
        total += effectivePrice * qty;
      }
    });
    return total;
  });

  totalItems = computed(() => {
    let count = 0;
    this.variantQuantities().forEach((qty) => (count += qty));
    return count;
  });

  totalSavings = computed(() => {
    let savings = 0;
    this.product().prices.forEach((price) => {
      const qty = this.variantQuantities().get(price.label) || 0;
      if (qty > 0) {
        const effectivePrice = this.calculateEffectivePrice(price, qty);
        const originalPrice = price.price;
        savings += (originalPrice - effectivePrice) * qty;
      }
    });
    return savings;
  });

  getStock(variant: Variant): number {
    return variant === 'unit'
      ? (this.product().stockUnits || 0)
      : (this.product().stockBoxes || 0);
  }

  getQuantity(variant: Variant): number {
    return this.variantQuantities().get(variant) || 0;
  }

  // Handle quantity update from child component
  onQuantityChange(variant: Variant, newQty: number) {
    this.variantQuantities.update((map) => {
      const newMap = new Map(map);
      if (newQty <= 0) {
        newMap.delete(variant);
      } else {
        newMap.set(variant, newQty);
      }
      return newMap;
    });
  }

  // Duplicated generic logic for total calculation (keep here for ModalCart's footer state)
  private calculateEffectivePrice(price: Price, quantity: number): number {
    if (!price.discounts || price.discounts.length === 0) {
      return price.price;
    }
    const sortedDiscounts = [...price.discounts].sort((a, b) => b.minQuantity - a.minQuantity);
    const discount = sortedDiscounts.find((d) => quantity >= d.minQuantity);
    return discount ? discount.price : price.price;
  }

  addToCart(): void {
    const product = this.product();
    const items: CartItem[] = [];

    this.variantQuantities().forEach((qty, variant) => {
      if (qty > 0) {
        const variantPrice = product.prices.find((p) => p.label === variant);
        if (!variantPrice) return;

        const price = this.calculateEffectivePrice(variantPrice, qty);

        const maxQuantity = variant === 'unit'
          ? product.stockUnits ?? 0
          : product.stockBoxes ?? 0;

        const cartItem: CartItem = {
          productId: product.id,
          variant,
          quantity: qty,
          maxQuantity,
          product: {
            id: product.id,
            sku: product.sku,
            name: product.name,
            brand: product.brand,
            price,
            images: product.images,
          },
        };

        items.push(cartItem);
      }
    });

    if (items.length > 0) {
      this.addProducts.emit(items);
      this.closeModal.emit();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;
    if (!this.host.nativeElement.contains(target)) {
      this.closeModal.emit();
    }
  }
}
