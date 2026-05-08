// IMPORTANT: Add this to your providers array:
// import { provideGridster } from 'angular-gridster2';
// ...
// providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideGridster()]
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
