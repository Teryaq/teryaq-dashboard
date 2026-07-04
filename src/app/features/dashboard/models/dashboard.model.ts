/** Response from GET /api/v1/dashboard/summary */
export interface DashboardSummary {
  todaySalesCount: number;
  todaySalesTotal: number;
  todayItemsSold: number;
  openAlertsCount: number;
  lowStockCount: number;
  nearExpiryCount: number;
}

/** Daily sales point from GET /api/v1/dashboard/weekly-sales */
export interface DailySales {
  date: string;
  salesCount: number;
  salesTotal: number;
}

/** Top drug from GET /api/v1/dashboard/top-drugs */
export interface TopDrug {
  drugId: string;
  tradeNameEn: string;
  tradeNameAr: string;
  quantitySold: number;
  revenue: number;
  sharePercent: number;
}

/** Recent sale from GET /api/v1/dashboard/recent-sales */
export interface RecentSale {
  id: string;
  saleNumber: string;
  cashierName: string;
  itemCount: number;
  grandTotal: number;
  completedAt: string;
}

/** Donut segment derived from TopDrug for chart rendering. */
export interface DonutSegment {
  drugId: string;
  label: string;
  sharePercent: number;
  color: string;
  startPercent: number;
  endPercent: number;
}
