import { Component, input, output } from '@angular/core';
import { LucideAngularModule, Package, Trash2, Plus, Minus } from 'lucide-angular';
import type { CartItem } from '../../../../../core/models/cart.model';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-card-item-cart',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CurrencyPipe],
  templateUrl: './card-item-cart.html',
  styleUrl: './card-item-cart.css',
})
export class CardItemCart {
  readonly Trash2Icon = Trash2;
  readonly PackageIcon = Package;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  item = input<CartItem>();
  increase = output<CartItem>();
  decrease = output<CartItem>();
  update = output<CartItem>(); // nuevo output para cambios directos
  remove = output<{ productId: string; variant: string }>();
  decreaseQuantity() {
    if (this.item()!.quantity > 1) {
      this.decrease.emit(this.item()!);
    }
  }

  increaseQuantity() {

    if (this.item()!.quantity < this.item()!.maxQuantity) {

    }
    this.increase.emit(this.item()!);
  }

  onQuantityInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);

    if (isNaN(value) || value < 1) {
      value = 1;
    }
    if (value > this.item()!.maxQuantity) {
      value = this.item()!.maxQuantity;
    }

    input.value = value.toString();

    const updatedItem: CartItem = {
      ...this.item()!,
      quantity: value,
    };
    this.update.emit(updatedItem);
  }

  onRemoveClick() {
    this.remove.emit({
      productId: this.item()!.productId,
      variant: this.item()!.variant,
    });
  }
}
