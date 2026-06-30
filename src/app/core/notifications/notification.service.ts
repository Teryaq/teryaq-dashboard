import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

import { mapApiError } from '../api/utils/api-error.mapper';
import { I18nService } from '../i18n/i18n.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messageService = inject(MessageService);
  private readonly i18n = inject(I18nService);

  showHttpError(error: HttpErrorResponse): void {
    const { key, params } = mapApiError(error);
    this.showError(key, params);
  }

  showError(key: string, params?: Record<string, string>): void {
    this.messageService.add({
      severity: 'error',
      summary: this.i18n.translate('errors.title'),
      detail: this.i18n.translate(key, params),
      life: 5000,
    });
  }

  showSuccess(key: string, params?: Record<string, string>): void {
    this.messageService.add({
      severity: 'success',
      summary: this.i18n.translate('common.success'),
      detail: this.i18n.translate(key, params),
      life: 4000,
    });
  }
}
