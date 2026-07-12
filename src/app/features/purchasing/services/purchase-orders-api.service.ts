import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { PaginatedList } from '../../../shared/models/paginated-list.model';
import {
  CreatePurchaseOrderRequest,
  PurchaseOrder,
  PurchaseOrderSearchParams,
  PurchaseOrderStatus,
  ReceivePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
} from '../models/purchasing.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersApiService {
  private readonly api = inject(ApiService);

  getPurchaseOrders(
    branchId?: string,
    supplierId?: string,
    status?: PurchaseOrderStatus,
    pageNumber = 1,
    pageSize = 20,
  ): Observable<PaginatedList<PurchaseOrder>> {
    return this.api.get<PaginatedList<PurchaseOrder>>('purchase-orders', {
      params: this.toParams({ branchId, supplierId, status, pageNumber, pageSize }),
    });
  }

  getPurchaseOrder(id: string): Observable<PurchaseOrder> {
    return this.api.get<PurchaseOrder>(`purchase-orders/${id}`);
  }

  createPurchaseOrder(req: CreatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>('purchase-orders', req);
  }

  updatePurchaseOrder(id: string, req: UpdatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.api.put<PurchaseOrder>(`purchase-orders/${id}`, req);
  }

  deletePurchaseOrder(id: string): Observable<void> {
    return this.api.delete<void>(`purchase-orders/${id}`);
  }

  sendPurchaseOrder(id: string): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>(`purchase-orders/${id}/send`, {});
  }

  receivePurchaseOrder(
    id: string,
    req: ReceivePurchaseOrderRequest,
  ): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>(`purchase-orders/${id}/receive`, req);
  }

  private toParams(
    params: PurchaseOrderSearchParams,
  ): Record<string, string | number | boolean> {
    const record: Record<string, string | number | boolean> = {};
    if (params.branchId !== undefined) record['branchId'] = params.branchId;
    if (params.supplierId !== undefined) record['supplierId'] = params.supplierId;
    if (params.status !== undefined) record['status'] = params.status;
    if (params.pageNumber !== undefined) record['pageNumber'] = params.pageNumber;
    if (params.pageSize !== undefined) record['pageSize'] = params.pageSize;
    return record;
  }
}
