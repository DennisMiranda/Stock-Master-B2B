import { Provider } from '@angular/core';
import { SearchProductsUseCase } from '../../application/use-cases/product/search-product.usecase';
import { ProductRepository } from '../../domain/repositories/product.repository';

export const PRODUCT_USE_CASE_PROVIDERS: Provider[] = [
  {
    provide: SearchProductsUseCase, // The token that will be used for injection
    useFactory: (repo: ProductRepository) => new SearchProductsUseCase(repo), // Factory function to create the instance
    deps: [ProductRepository], // Dependencies needed by the factory function
  },
];
