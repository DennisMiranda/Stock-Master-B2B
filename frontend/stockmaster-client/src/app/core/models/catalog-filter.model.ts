/**
 * Modelo para el estado de los filtros del catálogo (Productos Electrónicos)
 */
export interface CatalogFilters {
  categories: string[];
  subcategories: string[];
  brands: string[];
  inStockOnly: boolean;
}

/**
 * Opciones disponibles para los filtros (categorías y marcas)
 * Se actualiza dinámicamente basado en los productos de la búsqueda actual
 */
export interface FilterOptions {
  categories: CategoryOption[];
  brands: string[];
}

export interface CategoryOption {
  id: string;
  name: string;
  subcategories?: { id: string; name: string }[];
}

