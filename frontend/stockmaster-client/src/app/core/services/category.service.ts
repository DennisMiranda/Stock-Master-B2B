import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../http/api.service';
import type { FilterOptions, CategoryOption } from '../models/catalog-filter.model';

type CategoriesResponse = {
  categories: Array<{
    id: string;
    name: string;
    slug?: string;
    subcategories?: Array<{ id: string; name: string; slug?: string; categoryId: string }>
  }>;
};

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = inject(ApiService);

  /**
   * Obtiene categorías con subcategorías desde el backend
   */
  private refreshTrigger = signal(0);

  /**
   * Notifica que los datos han cambiado para recargar la lista
   */
  notifyDataChanged() {
    this.refreshTrigger.update(n => n + 1);
  }

  /**
   * Obtiene categorías con subcategorías desde el backend (Reactivo)
   */
  getCategoriesWithSubcategories() {
    return toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.getRawCategories())
    );
  }

  private getRawCategories() {
    return this.api
      .get<CategoriesResponse>('/categories/with-subcategories')
      .pipe(
        map((resp) => {
          const data = resp.data;
          const translate = (name?: string) => {
            switch (name) {
              case 'Image & Video':
                return 'Imagen & Video';
              case 'Accessories':
                return 'Accesorios';
              case 'Computers':
                return 'Computadoras';
              case 'Audio':
                return 'Audio';
              default:
                return name || '';
            }
          };

          const categories: CategoryOption[] = (data?.categories || []).map((c) => ({
            id: c.id,
            name: translate(c.name),
            subcategories: (c.subcategories || []).map((s) => ({ id: s.id, name: translate(s.name) })),
          }));
          return categories;
        }),
        catchError((err) => {
          console.error('[CategoryService] Error cargando categorías', err);
          return of([] as CategoryOption[]);
        })
      );
  }

  // --- CRUD Admin ---

  createCategory(data: { name: string; slug: string; subcategories?: { name: string; slug: string }[] }) {
    return this.api.post('/categories', data);
  }

  updateCategory(id: string, data: { name: string; slug: string }) {
    return this.api.put(`/categories/${id}`, data);
  }

  deleteCategory(id: string) {
    return this.api.delete(`/categories/${id}`);
  }



  addSubcategory(categoryId: string, data: { name: string; slug: string }) {
    return this.api.post(`/categories/${categoryId}/subcategories`, data);
  }

  deleteSubcategory(categoryId: string, subId: string) {
    return this.api.delete(`/categories/${categoryId}/subcategories/${subId}`);
  }
}