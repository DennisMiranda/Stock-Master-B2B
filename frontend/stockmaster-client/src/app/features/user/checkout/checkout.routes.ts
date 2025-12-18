import { Routes } from '@angular/router';
import { CheckoutCustomerForm } from './components/checkout-customer-form/checkout-customer-form';

export const checkoutRoutes: Routes = [
  {
    path: '',
    component: CheckoutCustomerForm,
  },
];
