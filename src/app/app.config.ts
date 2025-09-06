import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import {
  provideRouter, 
  withComponentInputBinding, 
  withInMemoryScrolling 
} from '@angular/router';
import { 
  provideHttpClient, 
  withInterceptorsFromDi 
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';

// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

// perfect scrollbar
import { NgScrollbarModule } from 'ngx-scrollbar';

//Import all material modules
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ✅ Import CalendarModule & Adapter
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withComponentInputBinding()
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideClientHydration(),
    provideAnimationsAsync(),
    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule,
      MaterialModule,
      TablerIconsModule.pick(TablerIcons),
      NgScrollbarModule,
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: () => {
          const factory = adapterFactory as (config: { firstDayOfWeek: number }) => DateAdapter;
          return factory({
            firstDayOfWeek: 0,
          });
        },
      })
    ),
  ],
};
