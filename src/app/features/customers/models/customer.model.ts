import { PaginationParams } from '../../../shared/models/paginated-list.model';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface CustomerSearchParams extends PaginationParams {
  search?: string;
}

export interface CreateCustomerDto {
  name: string;
  phone?: string | null;
  email?: string | null;
}
