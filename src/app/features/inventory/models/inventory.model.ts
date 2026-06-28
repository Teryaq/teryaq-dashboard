import { PaginationParams } from '../../../shared/models/paginated-list.model';

/** Response shape for a single stock batch (maps to backend StockBatchDto). */
export interface StockBatch {
  id: string;
  branchId: string;
  branchName: string;
  drugId: string;
  drugTradeNameEn: string;
  drugTradeNameAr: string;
  batchNumber: string;
  /** ISO 8601 date string (yyyy-MM-dd). */
  expiryDate: string;
  quantityReceived: number;
  quantityOnHand: number;
  costPrice: number;
  sellingPrice: number;
  receivedAt: string;
  createdAt: string;
  updatedAt?: string | null;
}

/** Query params for GET /inventory. All fields are optional. */
export interface InventorySearchParams extends PaginationParams {
  branchId?: string;
  drugId?: string;
  /** ISO 8601 date string — return batches expiring before this date. */
  expiringBefore?: string;
  search?: string;
}

/** Request body for POST /inventory (receive a new stock batch). */
export interface ReceiveStockDto {
  branchId: string;
  drugId: string;
  batchNumber: string;
  /** ISO 8601 date string (yyyy-MM-dd). Must be a future date. */
  expiryDate: string;
  /** Must be at least 1. */
  quantity: number;
  /** Purchase cost per unit in Egyptian pounds (non-negative). */
  costPrice: number;
  /** Per-unit selling price; defaults to the drug's catalog price when null. */
  sellingPrice?: number | null;
}

/** Request body for PUT /inventory/{id} (adjust an existing batch). */
export interface AdjustStockDto {
  /** Corrected quantity on hand (non-negative). */
  quantityOnHand: number;
  /** Updated per-unit selling price (non-negative). */
  sellingPrice: number;
  /** Corrected expiry date as ISO 8601 date string (yyyy-MM-dd). */
  expiryDate: string;
}
