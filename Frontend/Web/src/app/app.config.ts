import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import localeFr from '@angular/common/locales/fr';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

import { authReducer } from './core/store/auth/auth.reducer';
import { AuthService } from './core/services/auth.service';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [

    { provide: LOCALE_ID, useValue: 'fr' },

    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(routes),

    provideHttpClient(withInterceptorsFromDi()),

    provideStore({ auth: authReducer }),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },

    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.init(),
      deps: [AuthService],
      multi: true
    }

  ]
};