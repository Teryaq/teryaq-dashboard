import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';

@Injectable({ providedIn: 'root' })
export class I18nApiService {
  private readonly api = inject(ApiService);

  load(locale: string): Observable<Record<string, unknown>> {
    return this.api.getAsset<Record<string, unknown>>(`/assets/i18n/${locale}.json`, {
      context: this.api.skipErrorToastContext(),
    });
  }
}
