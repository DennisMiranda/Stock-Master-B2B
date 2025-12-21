import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../../../../core/http/api.service';
import { CategoryService } from '../../../../core/services/category.service';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        CatalogService,
        {
          provide: ApiService,
          useValue: {
            get: () => of({ data: { products: [], metadata: { count: 0, pages: 0 } } }),
          },
        },
        {
          provide: CategoryService,
          useValue: {
            getCategoriesWithSubcategories: () => of([]),
          },
        },
      ],
    });
    service = TestBed.inject(CatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debería actualizar la página y mantener el límite por defecto', () => {
    expect(service.page()).toBe(1);
    expect(service.limit()).toBe(12);
    service.setPage(3);
    expect(service.page()).toBe(3);
  });
});
