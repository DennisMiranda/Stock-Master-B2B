import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/ui/startup/startup.component').then(m => m.StartupComponent)
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

  {
    path: 'admin',
    canActivate: [roleGuard(['admin', 'warehouse', 'driver'])],
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  }
];
