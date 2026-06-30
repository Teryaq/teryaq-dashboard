import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { CreateSaleDto, SaleDto, TodaySaleSummaryDto } from '../models/sale.model';

@Injectable({ providedIn: 'root' })
export class PosApiService {
  private readonly api = inject(ApiService);

  /** POST /api/v1/pos/sales — confirms the cart as a sale; server does FEFO batch allocation. */
  createSale(dto: CreateSaleDto): Observable<SaleDto> {
    return this.api.post<SaleDto>('pos/sales', dto);
  }

  /** GET /api/v1/pos/sales/{id} — retrieves a sale with all resolved line items. */
  getSaleById(id: string): Observable<SaleDto> {
    return this.api.get<SaleDto>(`pos/sales/${id}`);
  }

  /** GET /api/v1/pos/sales/today — today's completed sales for the tenant. */
  getTodaysSales(branchId?: string): Observable<TodaySaleSummaryDto[]> {
    const params = branchId ? { branchId } : undefined;
    return this.api.get<TodaySaleSummaryDto[]>('pos/sales/today', { params });
  }
}
