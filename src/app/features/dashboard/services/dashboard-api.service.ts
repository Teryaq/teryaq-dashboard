import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import {
  DailySales,
  DashboardSummary,
  RecentSale,
  TopDrug,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly api = inject(ApiService);

  getSummary(branchId?: string): Observable<DashboardSummary> {
    const params = branchId ? { branchId } : undefined;
    return this.api.get<DashboardSummary>('dashboard/summary', { params });
  }

  getWeeklySales(branchId?: string, days = 7): Observable<DailySales[]> {
    const params: Record<string, string | number> = { days };
    if (branchId) params['branchId'] = branchId;
    return this.api.get<DailySales[]>('dashboard/weekly-sales', { params });
  }

  getTopDrugs(branchId?: string, limit = 5, period = 'month'): Observable<TopDrug[]> {
    const params: Record<string, string | number> = { limit, period };
    if (branchId) params['branchId'] = branchId;
    return this.api.get<TopDrug[]>('dashboard/top-drugs', { params });
  }

  getRecentSales(branchId?: string, limit = 5): Observable<RecentSale[]> {
    const params: Record<string, string | number> = { limit };
    if (branchId) params['branchId'] = branchId;
    return this.api.get<RecentSale[]>('dashboard/recent-sales', { params });
  }
}
