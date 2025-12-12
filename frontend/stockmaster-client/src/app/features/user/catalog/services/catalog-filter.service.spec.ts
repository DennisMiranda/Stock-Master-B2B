import { CatalogFilterService } from './catalog-filter.service';

describe('CatalogFilterService', () => {
  let service: CatalogFilterService;

  beforeEach(() => {
    service = new CatalogFilterService();
  });

  it('should start with empty filters', () => {
    const current = service.getCurrentFilters();
    expect(current.categories).toEqual([]);
    expect(current.brands).toEqual([]);
    expect(current.inStockOnly).toBe(false);
  });

  it('should set categories and emit them', (done) => {
    const expected = ['Bebidas', 'Alimentos'];
    service.filters$.subscribe((f) => {
      // The subject emits initial value first; ignore until categories match
      if (f.categories.length === expected.length) {
        expect(f.categories).toEqual(expected);
        done();
      }
    });
    service.setCategories(expected);
  });

  it('should set brands and clear filters', (done) => {
    const brands = ['ZumoFresh'];
    service.setBrands(brands);
    const afterSet = service.getCurrentFilters();
    expect(afterSet.brands).toEqual(brands);

    service.clearFilters();
    const afterClear = service.getCurrentFilters();
    expect(afterClear.categories).toEqual([]);
    expect(afterClear.brands).toEqual([]);
    expect(afterClear.inStockOnly).toBe(false);
    done();
  });
});
