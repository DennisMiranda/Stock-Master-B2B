import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import {
  OrderCustomerInfo,
  OrderDeliveryAddress,
  OrderPaymentInfo,
} from '../../../../../core/models/order.model';
import { ToastService } from '../../../../../core/services/toast.service';
import { CartService } from '../../../cart/services/cart.service';
import { CheckoutCustomerForm } from '../../components/checkout-customer-form/checkout-customer-form';
import { CheckoutPayForm } from '../../components/checkout-pay-form/checkout-pay-form';
import { CheckoutTotal } from '../../components/checkout-total/checkout-total';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-checkout',
  imports: [CheckoutCustomerForm, CheckoutPayForm, CheckoutTotal],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private checkoutService = inject(CheckoutService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  customerForm = signal<{
    customer: OrderCustomerInfo;
    deliveryAddress: OrderDeliveryAddress;
  } | null>(null);

  payForm = signal<OrderPaymentInfo | null>(null);

  isCustomerFormValid = signal(false);
  isPayFormValid = signal(false);
  cartItems = this.cartService.cartItems;

  ngOnInit(): void {
    this.cartService.getCart().subscribe();
  }

  submit() {
    if (!this.isCustomerFormValid() || !this.isPayFormValid()) return;
    if (!this.customerForm() || !this.payForm()) return;
    if (!this.authService.currentUser()) return;
    const { customer, deliveryAddress } = this.customerForm()!;
    const payment = this.payForm()!;

    this.checkoutService
      .createOrder({
        uid: this.authService.currentUser()?.uid!,
        items: this.cartService.cartItems().map((item) => ({
          ...item,
          id: item.productId,
        })),
        payment,
        customer,
        deliveryAddress,
      })
      .subscribe({
        next: (response) => {
          this.toastService.success('Orden creada exitosamente');
          this.cartService.clearCart().subscribe({
            next: () => console.log('Carrito vaciado en frontend'),
            error: (err) => console.error('Error:', err),
          });

          this.router.navigate(['/']);
        },
        error: (error) => {
          this.toastService.error('Error al crear la orden');
        },
      });
  }
}
