import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardPage),
    canActivate: [roleGuard(['admin', 'warehouse', 'driver'])],
  },
  {
    path: 'users',
    loadComponent: () => import('./users/pages/users-page/users-page').then((m) => m.UsersPage),
    canActivate: [roleGuard(['admin'])],
  },
        {
        path: 'products',
        loadComponent: () => import('./products/pages/products-list-page/products-list-page').then(m => m.ProductsListPage),
        canActivate: [roleGuard(['admin'])]
    },

    {
        path: 'routes',
        loadComponent: () => import('./routes/pages/router-page/router-page').then(m => m.RouterPage),
        canActivate: [roleGuard(['admin', 'driver'])]
    },

          {
        path: 'categories',
        loadComponent: () => import('./categories/pages/categories-list-page/categories-list-page').then(m => m.CategoriesListPage),
        canActivate: [roleGuard(['admin'])]

    },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile-page').then((m) => m.ProfilePage),
    canActivate: [roleGuard(['admin', 'warehouse', 'driver'])], // Acceso para todos los roles staff
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings-page').then((m) => m.SettingsPage),
    canActivate: [roleGuard(['admin', 'warehouse', 'driver'])], // Acceso para todos los roles staff
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./warehouse/orders/components/orders-table/orders-table').then((m) => m.OrdersTable),
    canActivate: [roleGuard(['admin', 'warehouse'])],
  },
  {
    path: 'orders/:id',
    loadComponent: () =>
      import('./warehouse/orders/components/order-detail/order-detail').then((m) => m.OrderDetail),
    canActivate: [roleGuard(['admin', 'warehouse'])],
  },
];
