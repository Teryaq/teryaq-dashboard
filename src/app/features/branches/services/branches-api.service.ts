import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { Branch, CreateBranchDto, UpdateBranchDto } from '../models/branches.model';

@Injectable({ providedIn: 'root' })
export class BranchesApiService {
  private readonly api = inject(ApiService);

  getAll(): Observable<Branch[]> {
    return this.api.get<Branch[]>('branches');
  }

  getById(id: string): Observable<Branch> {
    return this.api.get<Branch>(`branches/${id}`);
  }

  create(dto: CreateBranchDto): Observable<Branch> {
    return this.api.post<Branch>('branches', dto);
  }

  update(id: string, dto: UpdateBranchDto): Observable<Branch> {
    return this.api.put<Branch>(`branches/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`branches/${id}`);
  }

  /** Sets isActive=false. Cannot deactivate the main branch. */
  deactivate(id: string): Observable<Branch> {
    return this.api.put<Branch>(`branches/${id}/deactivate`, {});
  }
}
