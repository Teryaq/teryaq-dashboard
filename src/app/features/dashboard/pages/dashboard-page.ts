import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { BranchesApiService } from '../../branches/services/branches-api.service';
import { Branch } from '../../branches/models/branches.model';
import { AlertsApiService } from '../../alerts/services/alerts-api.service';
import { Alert, AlertSeverity } from '../../alerts/models/alert.model';
import { DashboardApiService } from '../services/dashboard-api.service';
import {
  DailySales,
  DashboardSummary,
  DonutSegment,
  RecentSale,
  TopDrug,
} from '../models/dashboard.model';

const DONUT_COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626'];

@Component({
  selector: 'app-dashboard-page',
  imports: [TranslatePipe, DecimalPipe, DatePipe, RouterLink],
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

  protected readonly isOwner = this.authService.isOwner;
  protected readonly isArabic = computed(() => this.i18n.locale() === 'ar');

  protected readonly weeklyMaxTotal = computed(() =>
    Math.max(...this.weeklySales().map(d => d.salesTotal), 1),
  );

  protected readonly donutSegments = computed(() => this.buildDonutSegments(this.topDrugs()));

  protected readonly donutGradient = computed(() => {
    const segments = this.donutSegments();
    if (segments.length === 0) return 'conic-gradient(var(--surface-border) 0 100%)';
    return `conic-gradient(${segments
      .map(s => `${s.color} ${s.startPercent}% ${s.endPercent}%`)
      .join(', ')})`;
  });

  constructor() {
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

  protected barHeight(total: number): number {
    return Math.round((total / this.weeklyMaxTotal()) * 100);
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

  private buildDonutSegments(drugs: TopDrug[]): DonutSegment[] {
    let cursor = 0;
    return drugs.map((drug, index) => {
      const startPercent = cursor;
      cursor += drug.sharePercent;
      return {
        drugId: drug.drugId,
        label: this.isArabic() ? drug.tradeNameAr : drug.tradeNameEn,
        sharePercent: drug.sharePercent,
        color: DONUT_COLORS[index % DONUT_COLORS.length],
        startPercent,
        endPercent: cursor,
      };
    });
  }
}
