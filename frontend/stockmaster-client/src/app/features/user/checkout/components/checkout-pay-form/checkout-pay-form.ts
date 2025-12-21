import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OrderPaymentInfo } from '../../../../../core/models/order.model';
import { PaymentMethod } from '../../../../../core/models/payment.model';

interface CheckoutPayFormValues {
  paymentMethod: string;
  cardHolder: string;
  cardNumber: string;
  cardExpiration: string;
  cardCvv: string;
}

@Component({
  selector: 'app-checkout-pay-form',
  imports: [ReactiveFormsModule],
  templateUrl: './checkout-pay-form.html',
  styleUrl: './checkout-pay-form.css',
})
export class CheckoutPayForm {
  valueChanges = output<OrderPaymentInfo>();
  isValidChange = output<boolean>();

  private fb = inject(FormBuilder);
  private subscriptions = new Subscription();

  form = this.fb.nonNullable.group({
    paymentMethod: ['', [Validators.required]],

    cardNumber: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(\d{4}\s){3}\d{4}$/), // 1234 5678 9012 3456
      ],
    ],

    cardExpiration: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/), // MM/YY
      ],
    ],

    cardCvv: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{3,4}$/), // 3 o 4 dígitos
      ],
    ],
  });

  get f() {
    return this.form.controls;
  }

  constructor() {
    this.form.valueChanges.subscribe((value) => {
      this.valueChanges.emit(this.mapFormValues(value as CheckoutPayFormValues));
      console.log('PAY FORM VALUES:', value, this.form.valid);
      this.isValidChange.emit(this.form.valid);
    });
  }

  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 16);

    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    this.form.patchValue({ cardNumber: formatted }, { emitEvent: false });
  }

  formatExpiry(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 4);

    if (value.length >= 3) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }

    this.form.patchValue({ cardExpiration: value }, { emitEvent: false });
  }

  formatCVV(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 4);
    this.form.patchValue({ cardCvv: value }, { emitEvent: false });
  }

  mapFormValues(values: CheckoutPayFormValues): OrderPaymentInfo {
    // Remove spaces from card number
    const cardNumber = values.cardNumber.replace(/\s/g, '');
    // Format: MM/YY to YYYY-MM-DD (using current century)
    const [month, year] = values.cardExpiration.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month), 0); // Last day of the month

    return {
      method: values.paymentMethod as PaymentMethod,
      currency: 'PEN', // Assuming Peruvian Soles as default
      subtotal: 0, // These values should come from the cart/order service
      total: 0, // These values should come from the cart/order service
      paymentReference: `CARD-${cardNumber.slice(-4)}-${Date.now()}`,
    };
  }
}
