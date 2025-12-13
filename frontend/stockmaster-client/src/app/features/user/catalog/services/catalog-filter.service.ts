import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CatalogFilters, FilterOptions } from '../../../../core/models/catalog-filter.model';

/**
 * Servicio reactivo para manejar el estado de los filtros del catálogo.
 * Usa datos mock locales y emite cambios a través de observables.
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

  // Observable público para suscribirse a cambios en los filtros
  public readonly filters$: Observable<CatalogFilters> = this.filtersSubject.asObservable();

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
   * Obtiene las opciones disponibles de filtros (datos mock)
   * En el futuro, esto vendrá del backend
   */
  getFilterOptions(): FilterOptions {
    return {
      categories: ['Bebidas', 'Alimentos', 'Limpieza', 'Cuidado Personal'],
      brands: ['ZumoFresh', 'Snacko', 'CleanHome'],
    };
  }
}

