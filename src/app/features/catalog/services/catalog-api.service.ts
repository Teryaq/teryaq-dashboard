import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { PaginatedList } from '../../../shared/models/paginated-list.model';
import { CreateDrugDto, Drug, DrugSearchParams, UpdateDrugDto } from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly api = inject(ApiService);

  getAll(params?: DrugSearchParams): Observable<PaginatedList<Drug>> {
    return this.api.get<PaginatedList<Drug>>('drugs', { params: this.toParams(params) });
  }

  getById(id: string): Observable<Drug> {
    return this.api.get<Drug>(`drugs/${id}`);
  }

  create(dto: CreateDrugDto): Observable<Drug> {
    return this.api.post<Drug>('drugs', dto);
  }

  update(id: string, dto: UpdateDrugDto): Observable<Drug> {
    return this.api.put<Drug>(`drugs/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`drugs/${id}`);
  }

  private toParams(
    params?: DrugSearchParams,
  ): Record<string, string | number | boolean> | undefined {
    if (!params) return undefined;
    const record: Record<string, string | number | boolean> = {};
    if (params.search !== undefined) record['search'] = params.search;
    if (params.source !== undefined) record['source'] = params.source;
    if (params.isActive !== undefined) record['isActive'] = params.isActive;
    if (params.pageNumber !== undefined) record['pageNumber'] = params.pageNumber;
    if (params.pageSize !== undefined) record['pageSize'] = params.pageSize;
    return Object.keys(record).length ? record : undefined;
  }
}
