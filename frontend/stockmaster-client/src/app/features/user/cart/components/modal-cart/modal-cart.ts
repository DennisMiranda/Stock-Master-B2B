import { Component, input, output, signal, computed,inject,HostListener,ElementRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  LucideAngularModule,
  X,
  Plus,
  Minus,
  ShoppingCart,
  Package,
  Tag,
  AlertCircle,
  Trash2,
} from 'lucide-angular';
import type { Product, Variant, Discount, Price } from '../../../../../core/models/product.model';
import type { CartItem } from '../../../../../core/models/cart.model';

@Component({
  selector: 'app-modal-cart',
  imports: [CurrencyPipe, LucideAngularModule],
  templateUrl: './modal-cart.html',
  styleUrl: './modal-cart.css',
})
export class ModalCart {
  readonly XIcon = X;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly PackageIcon = Package;
  readonly TagIcon = Tag;
  readonly AlertCircleIcon = AlertCircle;
  readonly Trash2Icon = Trash2;
  private host = inject(ElementRef<HTMLElement>);
  product = input.required<Product>();
  closeModal = output<void>();
  addProducts = output<CartItem[]>();
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

  getQuantity(variant: Variant): number {
    return this.variantQuantities().get(variant) || 0;
  }

  getMaxQuantity(variant: Variant): number {
    if (variant === 'unit') {
      return this.product().stockUnits || 0;
    } else {
      return this.product().stockBoxes || 0;
    }
  }

  getEffectivePrice(variant: Variant): number {
    const price = this.product().prices.find((p) => p.label === variant);
    if (!price) return 0;

    const qty = this.getQuantity(variant);
    return this.calculateEffectivePrice(price, qty);
  }

  getAppliedDiscount(variant: Variant): Discount | null {
    const price = this.product().prices.find((p) => p.label === variant);
    if (!price?.discounts || price.discounts.length === 0) return null;

    const qty = this.getQuantity(variant);
    const sortedDiscounts = [...price.discounts].sort((a, b) => b.minQuantity - a.minQuantity);
    return sortedDiscounts.find((d) => qty >= d.minQuantity) || null;
  }

  getVariantTotal(variant: Variant): number {
    const qty = this.getQuantity(variant);
    const price = this.getEffectivePrice(variant);
    return qty * price;
  }

  private calculateEffectivePrice(price: Price, quantity: number): number {
    if (!price.discounts || price.discounts.length === 0) {
      return price.price;
    }

    const sortedDiscounts = [...price.discounts].sort((a, b) => b.minQuantity - a.minQuantity);
    const discount = sortedDiscounts.find((d) => quantity >= d.minQuantity);
    return discount ? discount.price : price.price;
  }

  increaseQuantity(variant: Variant): void {
    const current = this.getQuantity(variant);
    const max = this.getMaxQuantity(variant);

    if (current < max) {
      this.variantQuantities.update((map) => {
        const newMap = new Map(map);
        newMap.set(variant, current + 1);
        return newMap;
      });
    }
  }

  decreaseQuantity(variant: Variant): void {
    const current = this.getQuantity(variant);

    if (current > 0) {
      this.variantQuantities.update((map) => {
        const newMap = new Map(map);
        if (current === 1) {
          newMap.delete(variant);
        } else {
          newMap.set(variant, current - 1);
        }
        return newMap;
      });
    }
  }

  onQuantityInput(event: Event, variant: Variant): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);

    if (isNaN(value) || value < 0) {
      this.variantQuantities.update((map) => {
        const newMap = new Map(map);
        newMap.delete(variant);
        return newMap;
      });
      input.value = '0';
      return;
    }

    const max = this.getMaxQuantity(variant);
    const clamped = Math.min(value, max);

    this.variantQuantities.update((map) => {
      const newMap = new Map(map);
      if (clamped === 0) {
        newMap.delete(variant);
      } else {
        newMap.set(variant, clamped);
      }
      return newMap;
    });

    input.value = clamped.toString();
  }

addToCart(): void {
  const product = this.product();
  const items: CartItem[] = [];

  this.variantQuantities().forEach((qty, variant) => {
    if (qty > 0) {
      // Buscar precio base según variante
      const variantPrice = product.prices.find((p) => p.label === variant);
      if (!variantPrice) return;

      let price = variantPrice.price;

      // Aplicar descuento si corresponde
      if (variantPrice.discounts) {
        const discount = variantPrice.discounts.find((d) => qty >= d.minQuantity);
        if (discount) {
          price = discount.price;
        }
      }

      const maxQuantity =
        variant === 'unit'
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
    // Si el click fue fuera del modal, cerrar
    if (!this.host.nativeElement.contains(target)) {
      this.closeModal.emit();
    }
  }

}
