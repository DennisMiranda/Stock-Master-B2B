import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ApiService } from '../http/api.service';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CategoryService,
        {
          provide: ApiService,
          useValue: {
            get: () =>
              of({
                data: {
                  categories: [
                    {
                      id: 'cat-1',
                      name: 'Accessories',
                      subcategories: [
                        { id: 'sub-1', name: 'Image & Video' },
                        { id: 'sub-2', name: 'Audio' },
                      ],
                    },
                    { id: 'cat-2', name: 'Computers', subcategories: [] },
                  ],
                },
              }),
          },
        },
      ],
    });
    service = TestBed.inject(CategoryService);
  });

  it('debería traducir nombres de categorías y subcategorías al español', async () => {
    const cats = await firstValueFrom(service.getCategoriesWithSubcategories());
    expect(cats.length).toBe(2);
    const accessories = cats[0];
    expect(accessories.name).toBe('Accesorios');
    expect(accessories.subcategories?.[0].name).toBe('Imagen & Video');
    expect(accessories.subcategories?.[1].name).toBe('Audio');
    const computers = cats[1];
    expect(computers.name).toBe('Computadoras');
  });
});