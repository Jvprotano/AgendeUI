import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { LocalStorageUtils } from './utils/localstorage';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorInterceptor } from './services/error.handle.service';
import { FakeBackendInterceptor } from './services/fake-backend.interceptor';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Observable } from 'rxjs';

/**
 * Custom Translate Loader for loading i18n files
 */
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) { }

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`);
  }
}

/**
 * HTTP Interceptor Providers
 */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: FakeBackendInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
];

/**
 * Application Configuration for Standalone Components
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Router configuration
    provideRouter(routes),

    // Platform providers
    provideClientHydration(),
    provideAnimations(),

    // Third-party providers
    provideToastr(),

    // Application services
    LocalStorageUtils,

    // HTTP interceptors
    httpInterceptorProviders,

    // Material providers
    MatDatepickerModule,
    MatNativeDateModule,

    // HTTP and Translation modules
    importProvidersFrom(
      HttpClientModule,
      TranslateModule.forRoot({
        defaultLanguage: 'pt',
        loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader,
          deps: [HttpClient]
        }
      })
    )
  ]
};
