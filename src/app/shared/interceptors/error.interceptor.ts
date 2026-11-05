import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenStorageService } from '../services/auth/token-storage.service';

const PUBLIC_AUTH_ROUTES = ['/signin', '/forgot-password', '/reset-password'];

/** 403 messages the backend auth middleware sends when the session is unusable. */
const AUTH_REJECTION_MESSAGES = ['No token provided', 'Require Admin Role'];

function isAuthRejection(error: HttpErrorResponse): boolean {
  const message = typeof error.error?.message === 'string' ? error.error.message : '';
  return AUTH_REJECTION_MESSAGES.some((m) => message.includes(m));
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - clear token, then redirect to login unless we are
        // already on a public auth route (prevents infinite redirect loops).
        tokenStorage.clear();
        const currentUrl = router.url.split('?')[0];
        const onPublicAuthRoute = PUBLIC_AUTH_ROUTES.some(
          route => currentUrl === route || currentUrl.startsWith(route + '/')
        );
        if (!onPublicAuthRoute) {
          router.navigate(['/signin']);
        }
      } else if (error.status === 403 && isAuthRejection(error)) {
        // The backend uses 403 (not 401) for a missing token ("No token
        // provided!") and for a demoted/suspended admin ("Require Admin
        // Role!"). Treat both like 401: drop the session and re-login.
        tokenStorage.clear();
        const currentUrl = router.url.split('?')[0];
        const onPublicAuthRoute = PUBLIC_AUTH_ROUTES.some(
          route => currentUrl === route || currentUrl.startsWith(route + '/')
        );
        if (!onPublicAuthRoute) {
          router.navigate(['/signin']);
        }
      }

      // Re-throw the error for component-level handling
      return throwError(() => error);
    })
  );
};

