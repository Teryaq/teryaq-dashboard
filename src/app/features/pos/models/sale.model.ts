/** Payment method — only Cash is supported in MVP. */
export type PaymentMethod = 'Cash';

/** Status of a completed sale. */
export type SaleStatus = 'Completed' | 'Voided';

/** A single line item in the create-sale request body. */
export interface SaleLineRequest {
  drugId: string;
  quantity: number;
}

/** Request body for POST /api/v1/pos/sales. */
export interface CreateSaleDto {
  branchId: string;
  items: SaleLineRequest[];
  /** Flat cash discount in EGP. Use 0 for no discount. */
  discount: number;
  paymentMethod: PaymentMethod;
  /** Pass null when no customer is associated. */
  customerId: string | null;
}

/** A single resolved line in a SaleDto (populated by the server after FEFO batch allocation). */
export interface SaleLineDto {
  id: string;
  drugId: string;
  drugTradeNameEn: string;
  drugTradeNameAr: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/** Full sale response returned by POST /pos/sales and GET /pos/sales/{id}. */
export interface SaleDto {
  id: string;
  branchId: string;
  branchName: string;
  /** Human-readable sale reference, e.g. "TRQ-20260701-A1B2C3D4". */
  saleNumber: string;
  cashierUserId: string;
  total: number;
  discount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  /** UTC ISO 8601 datetime. */
  completedAt: string;
  customerId: string | null;
  customerName: string | null;
  lines: SaleLineDto[];
  /** UTC ISO 8601 datetime. */
  createdAt: string;
}

/** Summary row returned by GET /api/v1/pos/sales/today. */
export interface TodaySaleSummaryDto {
  id: string;
  saleNumber: string;
  grandTotal: number;
  itemCount: number;
  /** UTC ISO 8601 datetime. */
  completedAt: string;
  customerName: string | null;
}
