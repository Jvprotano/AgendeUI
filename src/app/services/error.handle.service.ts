import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';
import { LocalStorageUtils } from '../utils/localstorage';
import { AccountService } from '../account/services/account.service';
import { isTokenExpired } from '../utils/token.utils';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const localStorageUtils = inject(LocalStorageUtils);
  const router = inject(Router);
  const accountService = inject(AccountService);
  const toastr = inject(ToastrService);
  const translate = inject(TranslateService);

  // Attach Bearer token if present and valid
  const token = localStorageUtils.getUserToken();
  let authReq = req;

  if (token && !isTokenExpired(token)) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  } else if (token && isTokenExpired(token)) {
    // Token exists but is expired — trigger session expired flow
    accountService.handleSessionExpired();
    translate.get('AUTH.SESSION_EXPIRED').subscribe((msg) => {
      toastr.warning(msg, '', { positionClass: 'toast-top-center' });
    });
    router.navigate(['/account/login']);
    return EMPTY;
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Exclusive 401 handling — do NOT re-throw
          accountService.handleSessionExpired();
          translate.get('AUTH.SESSION_EXPIRED').subscribe((msg) => {
            toastr.warning(msg, '', { positionClass: 'toast-top-center' });
          });
          router.navigate(['/account/login']);
          return EMPTY;

        case 403:
          router.navigate(['/access-denied']);
          return EMPTY;

        default:
          // Let other errors propagate to service-level handlers
          return throwError(() => error);
      }
    }),
  );
};
