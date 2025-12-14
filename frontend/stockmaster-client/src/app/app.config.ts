import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // Habilitar Zoneless Change Detection (Estable)
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding() // Habilitar Input Binding del Router
    ),
    provideHttpClient(withFetch()) // Habilitar Cliente HTTP con Fetch API
  ]
};
