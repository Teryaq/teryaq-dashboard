import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AlertsApiService } from '../services/alerts-api.service';
import { Alert, AlertType } from '../models/alert.model';

type ActiveTab = 'all' | AlertType;

@Component({
  selector: 'app-alerts-page',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alerts-page.html',
  styleUrl: './alerts-page.css',
})
export class AlertsPage {
  private readonly api = inject(AlertsApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly activeTab = signal<ActiveTab>('all');

  private readonly allAlerts = signal<Alert[]>([]);

  protected readonly filteredAlerts = computed(() => {
    const tab = this.activeTab();
    if (tab === 'all') return this.allAlerts();
    return this.allAlerts().filter(a => a.type === tab);
  });

  protected readonly totalCount = computed(() => this.allAlerts().length);

  protected readonly nearExpiryCount = computed(
    () => this.allAlerts().filter(a => a.type === 'NearExpiry').length,
  );

  protected readonly lowStockCount = computed(
    () => this.allAlerts().filter(a => a.type === 'LowStock').length,
  );

  constructor() {
    this.api
      .getAll()
      .pipe(
        catchError(() => {
          this.error.set('common.error');
          this.isLoading.set(false);
          return of([]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(alerts => {
        this.allAlerts.set(alerts);
        this.isLoading.set(false);
      });
  }

  protected setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
  }

  protected severityClass(severity: string): string {
    switch (severity) {
      case 'High':
        return 'alerts__badge--high';
      case 'Medium':
        return 'alerts__badge--medium';
      default:
        return 'alerts__badge--low';
    }
  }
}
