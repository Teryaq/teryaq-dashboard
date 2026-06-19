import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isAuthRequest = AUTH_PATHS.some((path) => req.url.includes(path));

  let authedReq = req;
  if (!isAuthRequest) {
    const token = authService.getAccessToken();
    if (token) {
      authedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
  }

  return next(authedReq).pipe(
    catchError((error) => {
      if (error.status !== 401 || isAuthRequest) {
        return throwError(() => error);
      }

      return authService.refresh().pipe(
        switchMap((session) => {
          if (!session) {
            return throwError(() => error);
          }

          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${session.accessToken}` },
          });
          return next(retryReq);
        }),
      );
    }),
  );
};
