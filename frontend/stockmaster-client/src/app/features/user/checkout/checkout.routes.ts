import { Routes } from '@angular/router';
import { Checkout } from './pages/checkout-page/checkout';

export const checkoutRoutes: Routes = [
  {
    path: '',
    component: Checkout,
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./pages/checkout-error-page/checkout-error-page').then((m) => m.CheckoutErrorPage),
  },
];
