import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import { ChartModule } from 'primeng/chart';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { BranchesApiService } from '../../branches/services/branches-api.service';
import { Branch } from '../../branches/models/branches.model';
import { AlertsApiService } from '../../alerts/services/alerts-api.service';
import { Alert, AlertSeverity } from '../../alerts/models/alert.model';
import { DashboardApiService } from '../services/dashboard-api.service';
import {
  DailySales,
  DashboardSummary,
  RecentSale,
  TopDrug,
} from '../models/dashboard.model';
import {
  buildTopDrugsRankingPoints,
  buildTopDrugsSummary,
  buildWeeklySalesAnalysis,
  buildWeeklySalesChartPoints,
} from './dashboard-analysis.helpers';

interface DashboardChartTheme {
  primary: string;
  primarySoft: string;
  secondary: string;
  text: string;
  muted: string;
  border: string;
  grid: string;
  tooltipBackground: string;
  tooltipText: string;
  rankingColors: string[];
}

const FONT_FAMILY = 'Cairo, system-ui, -apple-system, sans-serif';

@Component({
  selector: 'app-dashboard-page',
  imports: [TranslatePipe, DecimalPipe, DatePipe, RouterLink, ChartModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly alertsApi = inject(AlertsApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly authService = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly themeService = inject(ThemeService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly summary = signal<DashboardSummary | null>(null);
  protected readonly weeklySales = signal<DailySales[]>([]);
  protected readonly topDrugs = signal<TopDrug[]>([]);
  protected readonly recentSales = signal<RecentSale[]>([]);
  protected readonly previewAlerts = signal<Alert[]>([]);
  protected readonly branches = signal<Branch[]>([]);
  protected readonly selectedBranchId = signal<string>('');
  protected readonly prefersReducedMotion = signal(false);

  protected readonly isOwner = this.authService.isOwner;
  protected readonly isArabic = computed(() => this.i18n.locale() === 'ar');

  protected readonly weeklySalesAnalysis = computed(() =>
    buildWeeklySalesAnalysis(this.weeklySales(), date => this.formatChartDay(date)),
  );

  protected readonly weeklySalesChartPoints = computed(() =>
    buildWeeklySalesChartPoints(this.weeklySales(), date => this.formatChartDay(date)),
  );

  protected readonly topDrugRankingPoints = computed(() =>
    buildTopDrugsRankingPoints(this.topDrugs(), drug => this.drugLabel(drug)),
  );

  protected readonly topDrugsSummary = computed(() =>
    buildTopDrugsSummary(this.topDrugs(), drug => this.drugLabel(drug)),
  );

  protected readonly chartTheme = computed(() => this.readChartTheme());

  protected readonly weeklySalesChartData = computed<ChartData<'bar' | 'line', number[], string>>(() => {
    const points = this.weeklySalesChartPoints();
    const theme = this.chartTheme();

    return {
      labels: points.map(point => point.label),
      datasets: [
        {
          type: 'bar',
          label: this.i18n.translate('dashboard.charts.revenue'),
          data: points.map(point => point.salesTotal),
          yAxisID: 'revenue',
          backgroundColor: theme.primarySoft,
          borderColor: theme.primary,
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 34,
        },
        {
          type: 'line',
          label: this.i18n.translate('dashboard.charts.orders'),
          data: points.map(point => point.salesCount),
          yAxisID: 'orders',
          borderColor: theme.secondary,
          backgroundColor: theme.secondary,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: theme.secondary,
          pointBorderColor: theme.tooltipText,
          tension: 0.35,
        },
      ],
    };
  });

  protected readonly weeklySalesChartOptions = computed<ChartOptions<'bar' | 'line'>>(() => {
    const theme = this.chartTheme();
    const isArabic = this.isArabic();

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: this.prefersReducedMotion()
        ? false
        : {
            duration: 650,
            easing: 'easeOutQuart',
          },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: isArabic ? 'end' : 'start',
          labels: {
            color: theme.muted,
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8,
            padding: 14,
            font: {
              family: FONT_FAMILY,
              size: 12,
              weight: 600,
            },
          },
        },
        tooltip: {
          rtl: isArabic,
          textDirection: isArabic ? 'rtl' : 'ltr',
          backgroundColor: theme.tooltipBackground,
          borderColor: theme.border,
          borderWidth: 1,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          displayColors: true,
          padding: 12,
          callbacks: {
            label: context => this.weeklyTooltipLabel(context),
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: theme.muted,
            font: {
              family: FONT_FAMILY,
              size: 11,
            },
          },
        },
        revenue: {
          beginAtZero: true,
          position: isArabic ? 'right' : 'left',
          grid: {
            color: theme.grid,
          },
          border: {
            display: false,
          },
          ticks: {
            color: theme.muted,
            callback: value => this.formatCompactNumber(Number(value)),
            font: {
              family: FONT_FAMILY,
              size: 11,
            },
          },
          title: {
            display: true,
            text: this.i18n.translate('dashboard.charts.revenue'),
            color: theme.muted,
            font: {
              family: FONT_FAMILY,
              size: 11,
              weight: 600,
            },
          },
        },
        orders: {
          beginAtZero: true,
          position: isArabic ? 'left' : 'right',
          grid: {
            drawOnChartArea: false,
          },
          border: {
            display: false,
          },
          ticks: {
            precision: 0,
            color: theme.muted,
            font: {
              family: FONT_FAMILY,
              size: 11,
            },
          },
          title: {
            display: true,
            text: this.i18n.translate('dashboard.charts.orders'),
            color: theme.muted,
            font: {
              family: FONT_FAMILY,
              size: 11,
              weight: 600,
            },
          },
        },
      },
    };
  });

  protected readonly topDrugsChartData = computed<ChartData<'bar', number[], string>>(() => {
    const points = this.topDrugRankingPoints();
    const theme = this.chartTheme();

    return {
      labels: points.map(point => point.label),
      datasets: [
        {
          label: this.i18n.translate('dashboard.charts.share'),
          data: points.map(point => point.sharePercent),
          backgroundColor: points.map((_, index) => theme.rankingColors[index % theme.rankingColors.length]),
          borderRadius: 7,
          borderSkipped: false,
          maxBarThickness: 24,
        },
      ],
    };
  });

  protected readonly topDrugsChartOptions = computed<ChartOptions<'bar'>>(() => {
    const theme = this.chartTheme();
    const isArabic = this.isArabic();

    return {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: this.prefersReducedMotion()
        ? false
        : {
            duration: 600,
            easing: 'easeOutQuart',
          },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          rtl: isArabic,
          textDirection: isArabic ? 'rtl' : 'ltr',
          backgroundColor: theme.tooltipBackground,
          borderColor: theme.border,
          borderWidth: 1,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          padding: 12,
          callbacks: {
            label: context => this.topDrugTooltipLabel(context),
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: theme.grid,
          },
          border: {
            display: false,
          },
          ticks: {
            color: theme.muted,
            callback: value => `${this.formatNumber(Number(value), 0)}%`,
            font: {
              family: FONT_FAMILY,
              size: 11,
            },
          },
        },
        y: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: theme.text,
            font: {
              family: FONT_FAMILY,
              size: 12,
              weight: 600,
            },
          },
        },
      },
    };
  });

  constructor() {
    this.watchReducedMotionPreference();

    if (this.isOwner()) {
      this.branchesApi
        .getAll()
        .pipe(
          catchError(() => of([])),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(branches => this.branches.set(branches));
    }

    this.loadDashboard();
  }

  private loadSeq = 0;

  protected onBranchChange(event: Event): void {
    const branchId = (event.target as HTMLSelectElement).value;
    this.selectedBranchId.set(branchId);
    this.loadDashboard(branchId || undefined);
  }

  protected formatChartDay(dateStr: string): string {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString(this.isArabic() ? 'ar-EG' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
    });
  }

  protected alertDrugLabel(alert: Alert): string {
    return this.isArabic() ? alert.drugTradeNameAr : alert.drugTradeNameEn;
  }

  protected severityClass(severity: AlertSeverity): string {
    return `dash-alert__severity--${severity.toLowerCase()}`;
  }

  private drugLabel(drug: TopDrug): string {
    return this.isArabic() ? drug.tradeNameAr : drug.tradeNameEn;
  }

  private weeklyTooltipLabel(context: TooltipItem<'bar' | 'line'>): string {
    const label = context.dataset.label ?? '';
    const value = Number(context.parsed.y ?? context.raw ?? 0);

    if (context.dataset.yAxisID === 'orders') {
      return `${label}: ${this.formatNumber(value, 0)}`;
    }

    return `${label}: ${this.i18n.translate('dashboard.kpi.currency')} ${this.formatNumber(value, 2)}`;
  }

  private topDrugTooltipLabel(context: TooltipItem<'bar'>): string[] {
    const point = this.topDrugRankingPoints()[context.dataIndex];
    if (!point) return [];

    return [
      `${this.i18n.translate('dashboard.charts.share')}: ${this.formatNumber(point.sharePercent, 1)}%`,
      `${this.i18n.translate('dashboard.charts.revenue')}: ${this.i18n.translate('dashboard.kpi.currency')} ${this.formatNumber(point.revenue, 2)}`,
      `${this.i18n.translate('dashboard.charts.units')}: ${this.formatNumber(point.quantitySold, 0)}`,
    ];
  }

  private formatCompactNumber(value: number): string {
    return new Intl.NumberFormat(this.isArabic() ? 'ar-EG' : 'en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  private formatNumber(value: number, maximumFractionDigits: number): string {
    return new Intl.NumberFormat(this.isArabic() ? 'ar-EG' : 'en-US', {
      maximumFractionDigits,
    }).format(value);
  }

  private readChartTheme(): DashboardChartTheme {
    this.themeService.theme();
    this.themeService.colorTheme();
    this.themeService.darkPreset();

    const root = this.document.documentElement;
    const styles = getComputedStyle(root);
    const primary = this.cssVar(styles, '--color-primary', '#10b981');
    const secondary = this.cssVar(styles, '--color-secondary', '#e8a838');
    const text = this.cssVar(styles, '--text-color', '#0f172a');
    const muted = this.cssVar(styles, '--text-muted', '#64748b');
    const border = this.cssVar(styles, '--surface-border', '#dbe5df');
    const panel = this.cssVar(styles, '--surface-panel', '#ffffff');
    const isDark = this.themeService.isDark();

    return {
      primary,
      primarySoft: this.withAlpha(primary, isDark ? 0.58 : 0.72),
      secondary,
      text,
      muted,
      border,
      grid: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(100, 116, 139, 0.16)',
      tooltipBackground: isDark ? '#0f172a' : '#ffffff',
      tooltipText: isDark ? '#f8fafc' : '#0f172a',
      rankingColors: [
        primary,
        secondary,
        '#38bdf8',
        '#a78bfa',
        '#fb7185',
      ],
    };
  }

  private cssVar(styles: CSSStyleDeclaration, name: string, fallback: string): string {
    return styles.getPropertyValue(name).trim() || fallback;
  }

  private withAlpha(color: string, alpha: number): string {
    const hex = color.trim();
    const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(hex);
    const longHexMatch = /^#([0-9a-f]{6})$/i.exec(hex);
    const value = shortHexMatch
      ? shortHexMatch[1].split('').map(part => `${part}${part}`).join('')
      : longHexMatch?.[1];

    if (!value) return color;

    const red = Number.parseInt(value.slice(0, 2), 16);
    const green = Number.parseInt(value.slice(2, 4), 16);
    const blue = Number.parseInt(value.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  private watchReducedMotionPreference(): void {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion.set(motionQuery.matches);

    const onChange = (event: MediaQueryListEvent) => {
      this.prefersReducedMotion.set(event.matches);
    };

    motionQuery.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => motionQuery.removeEventListener('change', onChange));
  }

  private loadDashboard(branchId?: string): void {
    const seq = ++this.loadSeq;
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      summary: this.dashboardApi.getSummary(branchId),
      weekly: this.dashboardApi.getWeeklySales(branchId, 7).pipe(catchError(() => of([]))),
      topDrugs: this.dashboardApi.getTopDrugs(branchId, 5).pipe(catchError(() => of([]))),
      recent: this.dashboardApi.getRecentSales(branchId, 5).pipe(catchError(() => of([]))),
      alerts: this.alertsApi
        .getAll({ branchId, limit: 5 })
        .pipe(catchError(() => of([]))),
    })
      .pipe(
        catchError(() => {
          this.error.set('common.error');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        if (seq !== this.loadSeq) return;

        if (!result) {
          this.isLoading.set(false);
          return;
        }

        this.summary.set(result.summary);
        this.weeklySales.set(result.weekly);
        this.topDrugs.set(result.topDrugs);
        this.recentSales.set(result.recent);
        this.previewAlerts.set(result.alerts);
        this.isLoading.set(false);
      });
  }
}
