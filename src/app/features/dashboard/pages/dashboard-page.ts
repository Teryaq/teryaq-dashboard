import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/services/auth.service';
import { BranchesApiService } from '../../branches/services/branches-api.service';
import { Branch } from '../../branches/models/branches.model';
import { DashboardApiService } from '../services/dashboard-api.service';
import { DashboardSummary } from '../models/dashboard.model';

@Component({
  selector: 'app-dashboard-page',
  imports: [TranslatePipe, DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly summary = signal<DashboardSummary | null>(null);
  protected readonly branches = signal<Branch[]>([]);
  protected readonly selectedBranchId = signal<string>('');

  protected readonly isOwner = this.authService.isOwner;

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

    this.loadSummary();
  }

  protected onBranchChange(event: Event): void {
    const branchId = (event.target as HTMLSelectElement).value;
    this.selectedBranchId.set(branchId);
    this.loadSummary(branchId || undefined);
  }

  private loadSummary(branchId?: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardApi
      .getSummary(branchId)
      .pipe(
        catchError(() => {
          this.error.set('common.error');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(data => {
        this.summary.set(data);
        this.isLoading.set(false);
      });
  }
}
