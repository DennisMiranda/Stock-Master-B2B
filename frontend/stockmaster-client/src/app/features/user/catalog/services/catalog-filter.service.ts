import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CatalogFilters, FilterOptions } from '../../../../core/models/catalog-filter.model';
import { Product } from '../../../../core/models/product.model';

/**
 * Servicio reactivo para manejar el estado de los filtros del catálogo.
 * Extrae opciones de filtros dinámicamente de los productos actuales de la búsqueda.
 */
@Injectable({
  providedIn: 'root',
})
export class CatalogFilterService {
  // Estado inicial: sin filtros aplicados
  private filtersSubject = new BehaviorSubject<CatalogFilters>({
    categories: [],
    brands: [],
    inStockOnly: false,
  });

  // Opciones de filtros dinámicas basadas en los productos actuales
  private filterOptionsSubject = new BehaviorSubject<FilterOptions>({
    categories: [],
    brands: [],
  });

  // Observable público para suscribirse a cambios en los filtros
  public readonly filters$: Observable<CatalogFilters> = this.filtersSubject.asObservable();

  // Observable público para las opciones disponibles de filtros (dinámicas)
  public readonly filterOptions$: Observable<FilterOptions> = this.filterOptionsSubject.asObservable();

  /**
   * Obtiene el estado actual de los filtros (valor sincrónico)
   */
  getCurrentFilters(): CatalogFilters {
    return this.filtersSubject.value;
  }

  /**
   * Establece las categorías seleccionadas
   */
  setCategories(categories: string[]): void {
    const current = this.filtersSubject.value;
    this.filtersSubject.next({
      ...current,
      categories: [...categories],
    });
  }

  /**
   * Establece las marcas seleccionadas
   */
  setBrands(brands: string[]): void {
    const current = this.filtersSubject.value;
    this.filtersSubject.next({
      ...current,
      brands: [...brands],
    });
  }

  /**
   * Establece el filtro de disponibilidad
   */
  setInStockOnly(inStockOnly: boolean): void {
    const current = this.filtersSubject.value;
    this.filtersSubject.next({
      ...current,
      inStockOnly,
    });
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filtersSubject.next({
      categories: [],
      brands: [],
      inStockOnly: false,
    });
  }

  /**
   * Actualiza las opciones de filtros dinámicamente basado en los productos actuales
   * Extrae categorías únicas y marcas de los productos de búsqueda
   */
  updateFilterOptions(products: Product[]): void {
    const categories = this.extractUniqueCategoriesFromProducts(products);
    const brands = this.extractUniqueBrandsFromProducts(products);

    this.filterOptionsSubject.next({
      categories,
      brands,
    });
  }

  /**
   * Obtiene las opciones actuales de filtros de forma síncrona
   */
  getFilterOptions(): FilterOptions {
    return this.filterOptionsSubject.value;
  }

  /**
   * Extrae categorías únicas de los productos
   */
  private extractUniqueCategoriesFromProducts(
    products: Product[]
  ): { id: string; name: string }[] {
    const categoriesMap = new Map<string, string>();

    products.forEach((product) => {
      if (product.categoryId && product.categoryId !== '') {
        // Usar categoryId como id, y el mismo para el nombre
        // El backend debería proporcionar el nombre en futuro
        if (!categoriesMap.has(product.categoryId)) {
          categoriesMap.set(product.categoryId, product.categoryId);
        }
      }
    });

    return Array.from(categoriesMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }

  /**
   * Extrae marcas únicas de los productos
   */
  private extractUniqueBrandsFromProducts(products: Product[]): string[] {
    const brandsSet = new Set<string>();

    products.forEach((product) => {
      if (product.brand) {
        brandsSet.add(product.brand);
      }
    });

    return Array.from(brandsSet).sort();
  }
}
