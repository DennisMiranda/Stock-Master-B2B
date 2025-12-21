import {
  Component,
  inject,
  OnInit,
  input,
  output,
  computed,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CartService } from '../../services/cart.service';
import type { CartItem } from '../../../../../core/models/cart.model';
import { LucideAngularModule, ShoppingCart, X, ArrowRight } from 'lucide-angular';
import { CurrencyPipe, JsonPipe, NgClass, Location } from '@angular/common';
import { CardItemCart } from '../../components/card-item-cart/card-item-cart';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-cart-page',
  imports: [LucideAngularModule, CurrencyPipe, JsonPipe, NgClass, CardItemCart, RouterLink],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage implements OnInit {
  readonly ShoppingCartIcon = ShoppingCart;
  readonly XIcon = X;
  readonly ArrowRightIcon = ArrowRight;
  private cartService = inject(CartService);
  private host = inject(ElementRef<HTMLElement>);
  private location = inject(Location);
  total = computed(() =>
    this.cartItems().reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0)
  );
  isModal = input<boolean>(false);
  closeModalEvent = output<void>();
  isLoading = false;
  isOpen = input<boolean>(true);

  cartItems = this.cartService.cartItems;

  ngOnInit(): void {
    this.cartService.setAuthState(false);
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el carrito:', error);
        this.isLoading = false;
      },
    });
  }

  increaseQuantity(item: CartItem): void {
    const updatedItem = { ...item, quantity: item.quantity + 1 };
    this.updateItem(updatedItem);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      const updatedItem = { ...item, quantity: item.quantity - 1 };
      this.updateItem(updatedItem);
    }
  }

  updateItem(item: CartItem): void {
    this.cartService.updateItem(item).subscribe({
      error: (error) => console.error('Error al actualizar el item:', error),
    });
  }

  removeItem(productId: string, variant: string): void {
    this.cartService.removeItem(productId, variant).subscribe({
      error: (error) => console.error('Error al eliminar el item:', error),
    });
  }

  checkout(): void {
    console.log('Procesando compra...', this.cartItems());
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.isModal() && event.target === event.currentTarget) {
      this.closeModalEvent.emit();
    }
  }
  goBack(): void {
    this.location.back();
  }
  closeModal(): void {
    this.closeModalEvent.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;
    if (this.isModal() && this.isOpen() && !this.host.nativeElement.contains(target)) {
      this.closeModalEvent.emit();
    }
  }
}
