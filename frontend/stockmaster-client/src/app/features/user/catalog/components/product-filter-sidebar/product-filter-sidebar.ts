import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterOptions } from '../../../../../core/models/catalog-filter.model';
import { CatalogFilterService } from '../../services/catalog-filter.service';

@Component({
  selector: 'app-product-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-filter-sidebar.html',
  styleUrl: './product-filter-sidebar.css',
})
export class ProductFilterSidebar implements OnInit {
  private filterService = inject(CatalogFilterService);

  // Opciones disponibles de filtros (cargadas desde el servicio)
  filterOptions = signal<FilterOptions>({ categories: [], brands: [] });

  // Estado local de selecciones (sincronizado con el servicio)
  selectedCategories = signal<Set<string>>(new Set());
  selectedBrands = signal<Set<string>>(new Set());
  inStockOnly = signal<boolean>(false);

  // Computed: verifica si hay filtros activos
  hasActiveFilters = computed(() => {
    return (
      this.selectedCategories().size > 0 || this.selectedBrands().size > 0 || this.inStockOnly()
    );
  });

  ngOnInit(): void {
    // Cargar opciones disponibles desde el servicio (mock)
    const options = this.filterService.getFilterOptions();
    this.filterOptions.set(options);

    // Suscribirse a cambios en los filtros del servicio para mantener sincronización
    this.filterService.filters$.subscribe((filters) => {
      this.selectedCategories.set(new Set(filters.categories));
      this.selectedBrands.set(new Set(filters.brands));
      this.inStockOnly.set(filters.inStockOnly);
    });
  }

  /**
   * Maneja el cambio en el checkbox de categoría
   */
  onCategoryChange(category: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedCategories();
    const updated = new Set(current);

    if (checked) {
      updated.add(category);
    } else {
      updated.delete(category);
    }

    this.selectedCategories.set(updated);
    this.filterService.setCategories(Array.from(updated));
  }

  /**
   * Maneja el cambio en el checkbox de marca
   */
  onBrandChange(brand: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedBrands();
    const updated = new Set(current);

    if (checked) {
      updated.add(brand);
    } else {
      updated.delete(brand);
    }

    this.selectedBrands.set(updated);
    this.filterService.setBrands(Array.from(updated));
  }

  /**
   * Maneja el cambio en el checkbox de disponibilidad
   */
  onInStockChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.inStockOnly.set(checked);
    this.filterService.setInStockOnly(checked);
  }

  /**
   * Verifica si una categoría está seleccionada
   */
  isCategorySelected(category: string): boolean {
    return this.selectedCategories().has(category);
  }

  /**
   * Verifica si una marca está seleccionada
   */
  isBrandSelected(brand: string): boolean {
    return this.selectedBrands().has(brand);
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.selectedCategories.set(new Set());
    this.selectedBrands.set(new Set());
    this.inStockOnly.set(false);
    this.filterService.clearFilters();
  }
}
