import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { PaginatedList } from '../../../shared/models/paginated-list.model';
import {
  CreateSupplierInvoiceRequest,
  SupplierInvoice,
  SupplierInvoiceSearchParams,
  UpdateSupplierInvoiceRequest,
} from '../models/purchasing.model';

@Injectable({ providedIn: 'root' })
export class SupplierInvoicesApiService {
  private readonly api = inject(ApiService);

  getSupplierInvoices(
    supplierId?: string,
    hasOutstandingBalance?: boolean,
    pageNumber = 1,
    pageSize = 20,
  ): Observable<PaginatedList<SupplierInvoice>> {
    return this.api.get<PaginatedList<SupplierInvoice>>('supplier-invoices', {
      params: this.toParams({ supplierId, hasOutstandingBalance, pageNumber, pageSize }),
    });
  }

  getSupplierInvoice(id: string): Observable<SupplierInvoice> {
    return this.api.get<SupplierInvoice>(`supplier-invoices/${id}`);
  }

  createSupplierInvoice(req: CreateSupplierInvoiceRequest): Observable<SupplierInvoice> {
    return this.api.post<SupplierInvoice>('supplier-invoices', req);
  }

  updateSupplierInvoice(
    id: string,
    req: UpdateSupplierInvoiceRequest,
  ): Observable<SupplierInvoice> {
    return this.api.put<SupplierInvoice>(`supplier-invoices/${id}`, req);
  }

  deleteSupplierInvoice(id: string): Observable<void> {
    return this.api.delete<void>(`supplier-invoices/${id}`);
  }

  recordInvoicePayment(id: string, amount: number): Observable<SupplierInvoice> {
    return this.api.put<SupplierInvoice>(`supplier-invoices/${id}/payments`, { amount });
  }

  private toParams(
    params: SupplierInvoiceSearchParams,
  ): Record<string, string | number | boolean> {
    const record: Record<string, string | number | boolean> = {};
    if (params.supplierId !== undefined) record['supplierId'] = params.supplierId;
    if (params.hasOutstandingBalance !== undefined) {
      record['hasOutstandingBalance'] = params.hasOutstandingBalance;
    }
    if (params.pageNumber !== undefined) record['pageNumber'] = params.pageNumber;
    if (params.pageSize !== undefined) record['pageSize'] = params.pageSize;
    return record;
  }
}
