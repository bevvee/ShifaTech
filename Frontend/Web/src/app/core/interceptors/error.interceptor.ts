import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    return next.handle(req).pipe(

      catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {

          localStorage.removeItem('token');
          window.location.href = '/login';

        }

        if (error.status === 403) {

          console.error('Access denied');

        }

        return throwError(() => error);

      })

    );

  }
}