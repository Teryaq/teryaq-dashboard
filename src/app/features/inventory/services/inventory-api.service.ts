import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { PaginatedList } from '../../../shared/models/paginated-list.model';
import {
  AdjustStockDto,
  InventorySearchParams,
  ReceiveStockDto,
  StockBatch,
} from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private readonly api = inject(ApiService);

  getAll(params?: InventorySearchParams): Observable<PaginatedList<StockBatch>> {
    return this.api.get<PaginatedList<StockBatch>>('inventory', {
      params: this.toParams(params),
    });
  }

  getById(id: string): Observable<StockBatch> {
    return this.api.get<StockBatch>(`inventory/${id}`);
  }

  create(dto: ReceiveStockDto): Observable<StockBatch> {
    return this.api.post<StockBatch>('inventory', dto);
  }

  update(id: string, dto: AdjustStockDto): Observable<StockBatch> {
    return this.api.put<StockBatch>(`inventory/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`inventory/${id}`);
  }

  private toParams(
    params?: InventorySearchParams,
  ): Record<string, string | number | boolean> | undefined {
    if (!params) return undefined;
    const record: Record<string, string | number | boolean> = {};
    if (params.branchId !== undefined) record['branchId'] = params.branchId;
    if (params.drugId !== undefined) record['drugId'] = params.drugId;
    if (params.expiringBefore !== undefined) record['expiringBefore'] = params.expiringBefore;
    if (params.search !== undefined) record['search'] = params.search;
    if (params.pageNumber !== undefined) record['pageNumber'] = params.pageNumber;
    if (params.pageSize !== undefined) record['pageSize'] = params.pageSize;
    return Object.keys(record).length ? record : undefined;
  }
}
