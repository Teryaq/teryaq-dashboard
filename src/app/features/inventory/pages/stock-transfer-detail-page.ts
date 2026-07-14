import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { StockTransfer, StockTransferStatus } from '../models/stock-transfer.model';
import { StockTransfersApiService } from '../services/stock-transfers-api.service';

@Component({
  selector: 'app-stock-transfer-detail-page',
  imports: [ReactiveFormsModule, RouterLink, Button, Dialog, Textarea, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stock-transfer-detail-page.html',
  styleUrl: './inventory-page.css',
})
export class StockTransferDetailPage {
  private readonly api = inject(StockTransfersApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly transfer = signal<StockTransfer | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly error = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isRejectOpen = signal(false);

  protected readonly rejectForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.maxLength(500)]],
  });

  constructor() {
    this.load();
  }

  protected dispatch(): void {
    this.runLifecycle(id => this.api.dispatchStockTransfer(id));
  }

  protected receive(): void {
    this.runLifecycle(id => this.api.receiveStockTransfer(id));
  }

  protected openReject(): void {
    this.rejectForm.reset({ reason: '' });
    this.isRejectOpen.set(true);
  }

  protected closeReject(): void {
    this.isRejectOpen.set(false);
  }

  protected reject(): void {
    const transfer = this.transfer();
    this.rejectForm.markAllAsTouched();
    if (!transfer || this.rejectForm.invalid) return;
    this.isSubmitting.set(true);
    this.api
      .rejectStockTransfer(transfer.id, this.rejectForm.getRawValue().reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.transfer.set(updated);
          this.isRejectOpen.set(false);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected canDispatch(status: StockTransferStatus): boolean {
    return status === 'Requested';
  }

  protected canReceive(status: StockTransferStatus): boolean {
    return status === 'Dispatched';
  }

  protected canReject(status: StockTransferStatus): boolean {
    return status === 'Requested' || status === 'Dispatched';
  }

  protected statusKey(status: StockTransferStatus): string {
    return `inventory.transfers.status.${status}`;
  }

  private load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set(true);
      this.isLoading.set(false);
      return;
    }
    this.api
      .getStockTransfer(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: transfer => {
          this.transfer.set(transfer);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.isLoading.set(false);
        },
      });
  }

  private runLifecycle(request: (id: string) => ReturnType<StockTransfersApiService['dispatchStockTransfer']>): void {
    const transfer = this.transfer();
    if (!transfer) return;
    this.isSubmitting.set(true);
    request(transfer.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.transfer.set(updated);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }
}
