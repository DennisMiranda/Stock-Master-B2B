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
import { CommonModule, CurrencyPipe, JsonPipe, NgClass, Location } from '@angular/common';
import { CardItemCart } from '../../components/card-item-cart/card-item-cart';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { onAuthStateChanged } from 'firebase/auth';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CurrencyPipe, NgClass, CardItemCart, RouterLink],
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
  private authService = inject(AuthService);
  total = computed(() =>
    this.cartItems().reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0)
  );
  isModal = input<boolean>(false);
  closeModalEvent = output<void>();
  isLoading = false;
  isOpen = input<boolean>(true);

  cartItems = this.cartService.cartItems;

  ngOnInit(): void {
    onAuthStateChanged(this.authService['auth'], (user) => {
      // Aquí no usamos isLoading, solo si hay usuario
      this.cartService.setAuthState(!!user, user?.uid);
      console.log('Auth state:', !!user, user?.uid);
      this.loadCart();
    });
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
    event.stopPropagation();
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
