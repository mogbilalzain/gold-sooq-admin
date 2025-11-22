import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenStorageService } from '../services/auth/token-storage.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - clear token and redirect to login
        tokenStorage.clear();
        router.navigate(['/signin']);
      } else if (error.status === 403) {
        // Forbidden - Admin access required
        console.error('Access denied: Admin privileges required');
      }

      // Re-throw the error for component-level handling
      return throwError(() => error);
    })
  );
};

