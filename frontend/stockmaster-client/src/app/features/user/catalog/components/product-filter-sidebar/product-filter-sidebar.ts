import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Trash2 } from 'lucide-angular';
import { FilterOptions, CategoryOption } from '../../../../../core/models/catalog-filter.model';
import { CatalogFilterService } from '../../services/catalog-filter.service';
import { getCategoryName } from '../../constants/category-mapping';

@Component({
  selector: 'app-product-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './product-filter-sidebar.html',
  styleUrl: './product-filter-sidebar.css',
})
export class ProductFilterSidebar implements OnInit {
  private filterService = inject(CatalogFilterService);
  readonly TrashIcon = Trash2;

  // Opciones disponibles de filtros (se actualizan dinámicamente desde el servicio)
  filterOptions = signal<FilterOptions>({ categories: [], brands: [] });

  // Estado local de selecciones (sincronizado con el servicio)
  selectedCategories = signal<Set<string>>(new Set());
  selectedSubcategories = signal<Set<string>>(new Set());
  selectedBrands = signal<Set<string>>(new Set());
  inStockOnly = signal<boolean>(false);

  // Computed: verifica si hay filtros activos
  hasActiveFilters = computed(() => {
    return (
      this.selectedCategories().size > 0 || this.selectedBrands().size > 0 || this.inStockOnly()
    );
  });

  ngOnInit(): void {
    // Suscribirse a cambios en las opciones de filtros (dinámicas)
    this.filterService.filterOptions$.subscribe((options) => {
      this.filterOptions.set(options);
    });

    // Suscribirse a cambios en los filtros del servicio para mantener sincronización
    this.filterService.filters$.subscribe((filters) => {
      this.selectedCategories.set(new Set(filters.categories));
      this.selectedSubcategories.set(new Set(filters.subcategories));
      this.selectedBrands.set(new Set(filters.brands));
      this.inStockOnly.set(filters.inStockOnly);
    });
  }

  /**
   * Maneja el cambio en el checkbox de categoría
   */
  onCategoryChange(categoryId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedCategories();
    const updated = new Set(current);

    if (checked) {
      updated.add(categoryId);
    } else {
      updated.delete(categoryId);
    }

    this.selectedCategories.set(updated);
    this.filterService.setCategories(Array.from(updated));

    // Al cambiar categoría, si se deselecciona, limpiar subcategorías relacionadas
    if (!checked) {
      const currentSubs = this.selectedSubcategories();
      const subsToKeep = new Set(
        Array.from(currentSubs).filter((subId) => !this.belongsToCategory(subId, categoryId))
      );
      this.selectedSubcategories.set(subsToKeep);
      this.filterService.setSubcategories(Array.from(subsToKeep));
    }
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
  isCategorySelected(categoryId: string): boolean {
    return this.selectedCategories().has(categoryId);
  }

  /**
   * Obtiene el nombre legible de una categoría
   */
  getCategoryDisplayName(categoryId: string): string {
    const cat = this.filterOptions().categories.find((c) => c.id === categoryId);
    return cat?.name || categoryId;
  }

  /**
   * Subcategorías
   */
  onSubcategoryChange(subId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedSubcategories();
    const updated = new Set(current);
    if (checked) {
      updated.add(subId);
    } else {
      updated.delete(subId);
    }
    this.selectedSubcategories.set(updated);
    this.filterService.setSubcategories(Array.from(updated));
  }

  isSubcategorySelected(subId: string): boolean {
    return this.selectedSubcategories().has(subId);
  }

  subcategoriesForSelectedCategory(): { id: string; name: string }[] {
    const selectedFirst = Array.from(this.selectedCategories())[0];
    if (!selectedFirst) return [];
    const cat = this.filterOptions().categories.find((c) => c.id === selectedFirst);
    return cat?.subcategories || [];
  }

  private belongsToCategory(subId: string, categoryId: string): boolean {
    const cat = this.filterOptions().categories.find((c) => c.id === categoryId);
    return (cat?.subcategories || []).some((s) => s.id === subId);
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
    this.selectedSubcategories.set(new Set());
    this.selectedBrands.set(new Set());
    this.inStockOnly.set(false);
    this.filterService.clearFilters();
  }
}
