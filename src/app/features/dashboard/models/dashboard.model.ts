/** Response from GET /api/v1/dashboard/summary */
export interface DashboardSummary {
  todaySalesCount: number;
  todaySalesTotal: number;
  openAlertsCount: number;
  lowStockCount: number;
  nearExpiryCount: number;
}
