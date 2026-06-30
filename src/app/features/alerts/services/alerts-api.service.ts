import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { Alert, AlertSearchParams } from '../models/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertsApiService {
  private readonly api = inject(ApiService);

  /** GET /api/v1/alerts — returns all active near-expiry and low-stock alerts for the tenant. */
  getAll(params?: AlertSearchParams): Observable<Alert[]> {
    return this.api.get<Alert[]>('alerts', { params: this.toParams(params) });
  }

  private toParams(
    params?: AlertSearchParams,
  ): Record<string, string | number | boolean> | undefined {
    if (!params) return undefined;
    const record: Record<string, string | number | boolean> = {};
    if (params.branchId !== undefined) record['branchId'] = params.branchId;
    if (params.type !== undefined) record['type'] = params.type;
    return Object.keys(record).length ? record : undefined;
  }
}
