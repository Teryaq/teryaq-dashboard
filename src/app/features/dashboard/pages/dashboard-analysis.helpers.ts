import { DailySales, TopDrug } from '../models/dashboard.model';

export interface WeeklySalesAnalysis {
  totalSales: number;
  totalOrders: number;
  averageSales: number;
  peakDayLabel: string;
  peakSalesTotal: number;
  chartSummary: string;
}

export interface WeeklySalesChartPoint {
  date: string;
  label: string;
  salesTotal: number;
  salesCount: number;
}

export interface TopDrugRankingPoint {
  drugId: string;
  label: string;
  quantitySold: number;
  revenue: number;
  sharePercent: number;
}

export function buildWeeklySalesAnalysis(
  days: DailySales[],
  formatDay: (date: string) => string,
): WeeklySalesAnalysis {
  if (days.length === 0) {
    return {
      totalSales: 0,
      totalOrders: 0,
      averageSales: 0,
      peakDayLabel: '',
      peakSalesTotal: 0,
      chartSummary: 'No weekly sales data available.',
    };
  }

  const totalSales = days.reduce((sum, day) => sum + day.salesTotal, 0);
  const totalOrders = days.reduce((sum, day) => sum + day.salesCount, 0);
  const averageSales = totalSales / days.length;
  const peakDay = days.reduce((peak, day) =>
    day.salesTotal > peak.salesTotal ? day : peak,
  );
  const peakDayLabel = formatDay(peakDay.date);

  return {
    totalSales,
    totalOrders,
    averageSales,
    peakDayLabel,
    peakSalesTotal: peakDay.salesTotal,
    chartSummary: `${days.length} days, ${totalOrders} sales, ${totalSales} total revenue. Peak day ${peakDayLabel} with ${peakDay.salesTotal} revenue.`,
  };
}

export function buildWeeklySalesChartPoints(
  days: DailySales[],
  formatDay: (date: string) => string,
): WeeklySalesChartPoint[] {
  return days.map(day => ({
    date: day.date,
    label: formatDay(day.date),
    salesTotal: day.salesTotal,
    salesCount: day.salesCount,
  }));
}

export function buildTopDrugsSummary(
  drugs: TopDrug[],
  labelForDrug: (drug: TopDrug) => string,
): string {
  if (drugs.length === 0) {
    return 'No top drugs data available.';
  }

  const leader = drugs.reduce((top, drug) =>
    drug.sharePercent > top.sharePercent ? drug : top,
  );
  return `${drugs.length} top drugs. Leading drug ${labelForDrug(leader)} with ${leader.sharePercent}% share.`;
}

export function buildTopDrugsRankingPoints(
  drugs: TopDrug[],
  labelForDrug: (drug: TopDrug) => string,
): TopDrugRankingPoint[] {
  return [...drugs]
    .sort((a, b) => b.sharePercent - a.sharePercent)
    .map(drug => ({
      drugId: drug.drugId,
      label: labelForDrug(drug),
      quantitySold: drug.quantitySold,
      revenue: drug.revenue,
      sharePercent: drug.sharePercent,
    }));
}
