import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { PaginatedList } from '../../../shared/models/paginated-list.model';
import {
  CreateSupplierRequest,
  Supplier,
  SupplierSearchParams,
  UpdateSupplierRequest,
} from '../models/purchasing.model';

@Injectable({ providedIn: 'root' })
export class SuppliersApiService {
  private readonly api = inject(ApiService);

  getSuppliers(
    search?: string,
    isActive?: boolean,
    pageNumber = 1,
    pageSize = 20,
  ): Observable<PaginatedList<Supplier>> {
    return this.api.get<PaginatedList<Supplier>>('suppliers', {
      params: this.toParams({ search, isActive, pageNumber, pageSize }),
    });
  }

  getSupplier(id: string): Observable<Supplier> {
    return this.api.get<Supplier>(`suppliers/${id}`);
  }

  createSupplier(req: CreateSupplierRequest): Observable<Supplier> {
    return this.api.post<Supplier>('suppliers', req);
  }

  updateSupplier(id: string, req: UpdateSupplierRequest): Observable<Supplier> {
    return this.api.put<Supplier>(`suppliers/${id}`, req);
  }

  deleteSupplier(id: string): Observable<void> {
    return this.api.delete<void>(`suppliers/${id}`);
  }

  private toParams(params: SupplierSearchParams): Record<string, string | number | boolean> {
    const record: Record<string, string | number | boolean> = {};
    if (params.search !== undefined) record['search'] = params.search;
    if (params.isActive !== undefined) record['isActive'] = params.isActive;
    if (params.pageNumber !== undefined) record['pageNumber'] = params.pageNumber;
    if (params.pageSize !== undefined) record['pageSize'] = params.pageSize;
    return record;
  }
}
