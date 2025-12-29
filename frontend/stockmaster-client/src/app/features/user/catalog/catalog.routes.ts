import { Routes } from '@angular/router';
import { CatalogPage } from './pages/catalog-page/catalog-page';

export const catalogRoutes: Routes = [
  {
    path: '',
    component: CatalogPage,
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-detail-page/product-detail-page').then(m => m.ProductDetailPage)
  }
];
