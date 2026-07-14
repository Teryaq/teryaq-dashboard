import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { PaginatedList } from '../../../shared/models/paginated-list.model';
import {
  CreateStockTransferRequest,
  StockTransfer,
  StockTransferSearchParams,
  StockTransferStatus,
} from '../models/stock-transfer.model';

@Injectable({ providedIn: 'root' })
export class StockTransfersApiService {
  private readonly api = inject(ApiService);

  getStockTransfers(
    branchId?: string,
    status?: StockTransferStatus,
    pageNumber = 1,
    pageSize = 20,
  ): Observable<PaginatedList<StockTransfer>> {
    return this.api.get<PaginatedList<StockTransfer>>('stock-transfers', {
      params: this.toParams({ branchId, status, pageNumber, pageSize }),
    });
  }

  getStockTransfer(id: string): Observable<StockTransfer> {
    return this.api.get<StockTransfer>(`stock-transfers/${id}`);
  }

  createStockTransfer(req: CreateStockTransferRequest): Observable<StockTransfer> {
    return this.api.post<StockTransfer>('stock-transfers', req);
  }

  dispatchStockTransfer(id: string): Observable<StockTransfer> {
    return this.api.post<StockTransfer>(`stock-transfers/${id}/dispatch`, {});
  }

  receiveStockTransfer(id: string): Observable<StockTransfer> {
    return this.api.post<StockTransfer>(`stock-transfers/${id}/receive`, {});
  }

  rejectStockTransfer(id: string, reason: string): Observable<StockTransfer> {
    return this.api.post<StockTransfer>(`stock-transfers/${id}/reject`, { reason });
  }

  private toParams(
    params: StockTransferSearchParams,
  ): Record<string, string | number | boolean> {
    const record: Record<string, string | number | boolean> = {};
    if (params.branchId !== undefined) record['branchId'] = params.branchId;
    if (params.status !== undefined) record['status'] = params.status;
    if (params.pageNumber !== undefined) record['pageNumber'] = params.pageNumber;
    if (params.pageSize !== undefined) record['pageSize'] = params.pageSize;
    return record;
  }
}
