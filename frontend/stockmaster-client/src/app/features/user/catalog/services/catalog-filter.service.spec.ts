import { TestBed } from '@angular/core/testing';
import { CatalogFilterService } from './catalog-filter.service';

describe('CatalogFilterService', () => {
  let service: CatalogFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogFilterService);
  });

  it('debería actualizar subcategorías y limpiar filtros', () => {
    // set subcategories
    service.setSubcategories(['sub-1']);
    let current = service.getCurrentFilters();
    expect(current.subcategories).toEqual(['sub-1']);

    // clear filters
    service.clearFilters();
    current = service.getCurrentFilters();
    expect(current.categories).toEqual([]);
    expect(current.subcategories).toEqual([]);
    expect(current.brands).toEqual([]);
    expect(current.inStockOnly).toBe(false);
  });
});
