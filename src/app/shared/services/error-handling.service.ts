import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ErrorResponse } from '../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  constructor(
    private translate: TranslateService,
    private toastr: ToastrService,
  ) {}

  handleError(error: HttpErrorResponse): Observable<never> {
    // 401 and 403 are generally handled by authInterceptor.
    // Login 401 is intentionally propagated so we can show invalid credentials.
    const isLoginUnauthorized =
      error.status === 401 && (error.url?.includes('/login') ?? false);

    const errorCode = this.extractErrorCode(error);
    const i18nKey = isLoginUnauthorized
      ? 'LOGIN.ERRORS.INVALID_CREDENTIALS'
      : errorCode
        ? `ERROR.CODES.${errorCode}`
        : this.getStatusKey(error.status);

    this.translate.get(i18nKey).subscribe((translated: string) => {
      // If the translation key is missing, ngx-translate returns the key itself.
      // Fall back to the status-level message in that case.
      const message =
        translated !== i18nKey
          ? translated
          : this.getStatusFallback(error.status);

      this.toastr.error(message, '', {
        positionClass: 'toast-top-center',
      });
    });

    const errorResponse: ErrorResponse = {
      error: error.error,
      message: errorCode || i18nKey,
      statusCode: error.status,
      timestamp: new Date().toISOString(),
      path: error.url || '',
    };

    return throwError(() => errorResponse);
  }

  private extractErrorCode(error: HttpErrorResponse): string | null {
    const body = error.error;
    if (!body) return null;

    // Single error code
    const code = body.errorCode || body.ErrorCode || body.code || body.Code;
    if (typeof code === 'string' && code.trim()) return code;

    // Array of error codes - take the first one
    const errors = body.errors || body.Errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0];
      const firstCode =
        typeof first === 'string'
          ? first
          : first?.code ||
            first?.Code ||
            first?.errorCode ||
            first?.ErrorCode;
      if (typeof firstCode === 'string' && firstCode.trim()) return firstCode;
    }

    return null;
  }

  private getStatusKey(status: number): string {
    switch (status) {
      case 0:
        return 'ERROR.CONNECTION';
      case 400:
        return 'ERROR.BAD_REQUEST';
      case 401:
        return 'ERROR.UNAUTHORIZED';
      case 404:
        return 'ERROR.NOT_FOUND';
      case 500:
        return 'ERROR.SERVER_ERROR';
      default:
        return 'ERROR.GENERIC';
    }
  }

  private getStatusFallback(status: number): string {
    const key = this.getStatusKey(status);
    let fallback = '';
    this.translate.get(key).subscribe((t: string) => {
      fallback = t;
    });
    return fallback || key;
  }
}
