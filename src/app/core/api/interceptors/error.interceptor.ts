import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { SKIP_ERROR_TOAST } from '../api.service';
import { shouldShowErrorToast } from '../utils/api-error.mapper';
import { NotificationService } from '../../notifications/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!req.context.get(SKIP_ERROR_TOAST) && shouldShowErrorToast(error)) {
        notificationService.showHttpError(error);
      }

      return throwError(() => error);
    }),
  );
};
