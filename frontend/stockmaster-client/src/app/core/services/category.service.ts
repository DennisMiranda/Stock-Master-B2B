import { Injectable, inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';
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
  getCategoriesWithSubcategories() {
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
}