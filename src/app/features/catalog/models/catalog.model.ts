import { PaginationParams } from '../../../shared/models/paginated-list.model';

/** String label returned by the API for the drug's source. */
export type DrugSource = 'EDA' | 'Import' | 'Manual';

/** Numeric enum value sent to the API when creating a drug. 0=EDA, 1=Import, 2=Manual. */
export type DrugSourceValue = 0 | 1 | 2;

/** Response shape for a single drug from the global shared catalog. */
export interface Drug {
  id: string;
  tradeNameAr: string;
  tradeNameEn: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  packSize: number;
  price: number;
  barcode?: string | null;
  manufacturerAr?: string | null;
  manufacturerEn?: string | null;
  source: DrugSource;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

/** Query params for GET /drugs. All fields are optional. */
export interface DrugSearchParams extends PaginationParams {
  search?: string;
  /** Filter by source: 0=EDA, 1=Import, 2=Manual */
  source?: DrugSourceValue;
  isActive?: boolean;
}

/** Request body for POST /drugs. `source` is required and immutable after creation. */
export interface CreateDrugDto {
  tradeNameAr: string;
  tradeNameEn: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  packSize: number;
  price: number;
  barcode?: string | null;
  manufacturerAr?: string | null;
  manufacturerEn?: string | null;
  /** 0=EDA, 1=Import, 2=Manual */
  source: DrugSourceValue;
}

/** Request body for PUT /drugs/{id}. `source` is excluded (immutable). */
export interface UpdateDrugDto {
  tradeNameAr: string;
  tradeNameEn: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  packSize: number;
  price: number;
  barcode?: string | null;
  manufacturerAr?: string | null;
  manufacturerEn?: string | null;
  isActive: boolean;
}
