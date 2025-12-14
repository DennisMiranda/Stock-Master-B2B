import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ProductRepository } from './core/domain/repositories/product.repository';
import { PRODUCT_USE_CASE_PROVIDERS } from './core/infrastructure/providers/product-usecases.provider';
import { ProductHttpRepository } from './core/infrastructure/repositories/product-http.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: ProductRepository, useClass: ProductHttpRepository },
    ...PRODUCT_USE_CASE_PROVIDERS,
  ],
};
