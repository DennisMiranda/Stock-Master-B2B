/**
 * Modelo para el estado de los filtros del catálogo
 */
export interface CatalogFilters {
  categories: string[];
  brands: string[];
  inStockOnly: boolean;
}

/**
 * Opciones disponibles para los filtros (categorías y marcas)
 */
export interface FilterOptions {
  categories: string[];
  brands: string[];
}

