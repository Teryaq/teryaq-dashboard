import {

  ApplicationConfig,

  inject,

  provideAppInitializer,

  provideBrowserGlobalErrorListeners,

} from '@angular/core';

import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideRouter } from '@angular/router';

import { MessageService } from 'primeng/api';

import { providePrimeNG } from 'primeng/config';



import { routes } from './app.routes';

import { errorInterceptor } from './core/api/interceptors/error.interceptor';

import { authInterceptor } from './core/auth/interceptors/auth.interceptor';

import { AuthService } from './core/auth/services/auth.service';

import { I18nService } from './core/i18n/i18n.service';

import { TeryaqPreset } from './core/theme/teryaq.preset';

import { ThemeService } from './core/theme/theme.service';



export const appConfig: ApplicationConfig = {

  providers: [

    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),

    provideAnimationsAsync(),

    MessageService,

    providePrimeNG({

      theme: {

        preset: TeryaqPreset,

        options: {

          darkModeSelector: '.dark',

          cssLayer: {

            name: 'primeng',

            order: 'theme, base, primeng',

          },

        },

      },

      ripple: true,

    }),

    provideAppInitializer(() => {
      inject(AuthService).initializeFromStorage();
      inject(ThemeService);
      return inject(I18nService).initialize();
    }),

  ],

};


