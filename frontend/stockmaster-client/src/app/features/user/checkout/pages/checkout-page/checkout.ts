import { Component, inject, signal } from '@angular/core';
import {
  OrderCustomerInfo,
  OrderDeliveryAddress,
  OrderPaymentInfo,
} from '../../../../../core/models/order.model';
import { CheckoutCustomerForm } from '../../components/checkout-customer-form/checkout-customer-form';
import { CheckoutPayForm } from '../../components/checkout-pay-form/checkout-pay-form';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-checkout',
  imports: [CheckoutCustomerForm, CheckoutPayForm],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private checkoutService = inject(CheckoutService);

  customerForm = signal<{
    customer: OrderCustomerInfo;
    deliveryAddress: OrderDeliveryAddress;
  } | null>(null);

  payForm = signal<OrderPaymentInfo | null>(null);

  isCustomerFormValid = signal(false);
  isPayFormValid = signal(false);

  submit() {
    console.log('submit', this.customerForm(), this.payForm());
    if (!this.isCustomerFormValid() || !this.isPayFormValid()) return;
    if (!this.customerForm() || !this.payForm()) return;
    const { customer, deliveryAddress } = this.customerForm()!;
    const payment = this.payForm()!;

    this.checkoutService
      .createOrder({
        uid: '',
        items: [],
        payment,
        customer,
        deliveryAddress,
      })
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
}
