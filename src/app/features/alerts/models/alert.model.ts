/** Alert type returned by GET /api/v1/alerts. */
export type AlertType = 'NearExpiry' | 'LowStock';

/** Severity computed by the backend from days-until-expiry or qty/reorderLevel ratio. */
export type AlertSeverity = 'High' | 'Medium' | 'Low';

/**
 * Maps to the backend AlertDto.
 * Near-expiry severity bands: ≤30 days → High, 31–60 → Medium, 61–90 → Low.
 * Low-stock severity bands: qty/reorderLevel ≤0.25 → High, ≤0.50 → Medium, ≤1.00 → Low.
 */
export interface Alert {
  type: AlertType;
  severity: AlertSeverity;
  stockBatchId: string;
  branchId: string;
  branchName: string;
  drugId: string;
  drugTradeNameEn: string;
  drugTradeNameAr: string;
  batchNumber: string;
  /** ISO date string (yyyy-MM-dd). */
  expiryDate: string;
  /** Non-null for NearExpiry alerts; null for LowStock alerts. */
  daysUntilExpiry: number | null;
  quantityOnHand: number;
  reorderLevel: number;
}

/** Query params for GET /api/v1/alerts. All fields optional. */
export interface AlertSearchParams {
  branchId?: string;
  type?: AlertType;
}
