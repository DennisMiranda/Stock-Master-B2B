import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { clientGuard } from './core/guards/client.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/ui/startup/startup.component').then((m) => m.StartupComponent),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'user',
    canActivate: [clientGuard],
    loadComponent: () => import('./layouts/user-layout/user-layout').then((m) => m.UserLayout),
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./features/admin/profile/profile-page').then((m) => m.ProfilePage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/settings-page').then((m) => m.SettingsPage),
      }
    ]
  },
  {
    path: 'shop',
    loadComponent: () => import('./layouts/shop-layout/shop-layout').then((c) => c.ShopLayout),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./features/user/home/pages/home/home').then((c) => c.Home),
      },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./features/user/catalog/pages/catalog-page/catalog-page').then(
            (c) => c.CatalogPage
          ),
      },
      {
        path: 'catalog/product/:id',
        loadComponent: () =>
          import('./features/user/catalog/pages/product-detail-page/product-detail-page').then(
            (c) => c.ProductDetailPage
          ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/user/cart/pages/cart-page/cart-page').then((c) => c.CartPage),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/user/checkout/pages/checkout-page/checkout').then((c) => c.Checkout),
      },
      // 404
      {
        path: '**',
        redirectTo: ''
      }
    ],
  },
  {
    path: 'admin',
    canActivate: [roleGuard(['admin', 'warehouse', 'driver'])],
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
];
