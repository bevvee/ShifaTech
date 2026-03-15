import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
// import { ToastService } from '../services/toast.service';
import { ToastService } from '../../shared/services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.clear();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        router.navigate(['/unauthorized']);
      } else {
        // Show error toast for other errors
        const errBody = error.error;
        const message = errBody?.message || error.message || 'Une erreur inattendue est survenue';

        // Si c'est une erreur de validation avec des détails par champ
        if (errBody?.data && typeof errBody.data === 'object' && !Array.isArray(errBody.data)) {
          Object.values(errBody.data).forEach((errMsg: any) => {
            toastService.error('Erreur Validation', String(errMsg));
          });
        } else {
          toastService.error('Erreur API', message);
        }
      }

      console.error('API Error:', error);
      return throwError(() => error);
    })
  );
};
