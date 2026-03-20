import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ErrorResponse } from '../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  constructor(
    private translate: TranslateService,
    private toastr: ToastrService
  ) {}

  handleError(error: HttpErrorResponse): Observable<never> {
    // 401 and 403 are handled exclusively by the authInterceptor — they
    // return EMPTY and never reach service-level catchError.
    let errorMessage = 'ERROR.GENERIC';

    switch (error.status) {
      case 400:
        errorMessage = 'ERROR.BAD_REQUEST';
        break;
      case 404:
        errorMessage = 'ERROR.NOT_FOUND';
        break;
      case 500:
        errorMessage = 'ERROR.SERVER_ERROR';
        break;
    }

    this.translate.get(errorMessage).subscribe((translatedMessage: string) => {
      this.toastr.error(translatedMessage, 'Error', {
        positionClass: 'toast-top-center'
      });
    });

    const errorResponse: ErrorResponse = {
      error: error.error,
      message: errorMessage,
      statusCode: error.status,
      timestamp: new Date().toISOString(),
      path: error.url || ''
    };

    return throwError(() => errorResponse);
  }
}
