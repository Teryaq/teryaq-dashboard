import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { PaginatedList } from '../../../shared/models/paginated-list.model';
import {
  CreatePurchaseReturnRequest,
  PurchaseReturn,
  PurchaseReturnSearchParams,
} from '../models/purchasing.model';

@Injectable({ providedIn: 'root' })
export class PurchaseReturnsApiService {
  private readonly api = inject(ApiService);

  getPurchaseReturns(
    branchId?: string,
    supplierId?: string,
    pageNumber = 1,
    pageSize = 20,
  ): Observable<PaginatedList<PurchaseReturn>> {
    return this.api.get<PaginatedList<PurchaseReturn>>('purchase-returns', {
      params: this.toParams({ branchId, supplierId, pageNumber, pageSize }),
    });
  }

  getPurchaseReturn(id: string): Observable<PurchaseReturn> {
    return this.api.get<PurchaseReturn>(`purchase-returns/${id}`);
  }

  createPurchaseReturn(req: CreatePurchaseReturnRequest): Observable<PurchaseReturn> {
    return this.api.post<PurchaseReturn>('purchase-returns', req);
  }

  private toParams(
    params: PurchaseReturnSearchParams,
  ): Record<string, string | number | boolean> {
    const record: Record<string, string | number | boolean> = {};
    if (params.branchId !== undefined) record['branchId'] = params.branchId;
    if (params.supplierId !== undefined) record['supplierId'] = params.supplierId;
    if (params.pageNumber !== undefined) record['pageNumber'] = params.pageNumber;
    if (params.pageSize !== undefined) record['pageSize'] = params.pageSize;
    return record;
  }
}
