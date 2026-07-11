import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { PaginatedList } from '../../../shared/models/paginated-list.model';
import { CreateCustomerDto, Customer, CustomerSearchParams } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomersApiService {
  private readonly api = inject(ApiService);

  getAll(params?: CustomerSearchParams): Observable<PaginatedList<Customer>> {
    const query: Record<string, string | number> = {};
    if (params?.search) query['search'] = params.search;
    if (params?.pageNumber) query['pageNumber'] = params.pageNumber;
    if (params?.pageSize) query['pageSize'] = params.pageSize;
    return this.api.get<PaginatedList<Customer>>('customers', {
      params: Object.keys(query).length ? query : undefined,
    });
  }

  getById(id: string): Observable<Customer> {
    return this.api.get<Customer>(`customers/${id}`);
  }

  create(dto: CreateCustomerDto): Observable<Customer> {
    return this.api.post<Customer>('customers', dto);
  }
}
