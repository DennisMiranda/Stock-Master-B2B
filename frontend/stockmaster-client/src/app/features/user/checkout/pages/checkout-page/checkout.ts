import { Component } from '@angular/core';
import { CheckoutCustomerForm } from '../../components/checkout-customer-form/checkout-customer-form';

@Component({
  selector: 'app-checkout',
  imports: [CheckoutCustomerForm],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {}
