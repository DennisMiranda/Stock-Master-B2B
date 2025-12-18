import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/shop/home',
    pathMatch: 'full',
  },
  {

    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/user/profile/profile').then(m => m.Profile)
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./layouts/user-layout/user-layout').then(c => c.UserLayout),
    children: [{
      path: 'home',
      loadComponent: () => import('./features/user/home/pages/home/home').then(c => c.Home)
    },
    {
      path: 'catalog',
      loadComponent: () => import('./features/user/catalog/pages/catalog-page/catalog-page').then(c => c.CatalogPage)
    },
      /* {
        path:'cart',
        loadComponent: () => import('./features/user/home/p').then(c => c.Home)
      },
      
  */
                     {
        path: 'checkout',
        loadComponent: () =>
          import('./features/user/checkout/pages/checkout-page/checkout').then((c) => c.Checkout),
      }
    ]
  },
];
