import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { DashboardSummary } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly api = inject(ApiService);

  getSummary(branchId?: string): Observable<DashboardSummary> {
    const params = branchId ? { branchId } : undefined;
    return this.api.get<DashboardSummary>('dashboard/summary', { params });
  }
}
