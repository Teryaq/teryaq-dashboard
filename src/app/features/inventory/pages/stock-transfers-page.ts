import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { AuthService } from '../../../core/auth/services/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Branch } from '../../branches/models/branches.model';
import { BranchesApiService } from '../../branches/services/branches-api.service';
import { StockBatch } from '../models/inventory.model';
import { StockTransfer, StockTransferStatus } from '../models/stock-transfer.model';
import { InventoryApiService } from '../services/inventory-api.service';
import { StockTransfersApiService } from '../services/stock-transfers-api.service';

@Component({
  selector: 'app-stock-transfers-page',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    Button,
    Dialog,
    InputNumber,
    Select,
    Textarea,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stock-transfers-page.html',
  styleUrl: './inventory-page.css',
})
export class StockTransfersPage {
  private readonly api = inject(StockTransfersApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly inventoryApi = inject(InventoryApiService);
  private readonly authService = inject(AuthService, { optional: true });
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly transfers = signal<StockTransfer[]>([]);
  protected readonly branches = signal<Branch[]>([]);
  protected readonly batches = signal<StockBatch[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal(false);
  protected readonly isCreateOpen = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly pageNumber = signal(1);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = 20;
  protected readonly branchFilter = signal('');
  protected readonly statusFilter = signal<StockTransferStatus | ''>('');
  protected readonly statuses: StockTransferStatus[] = ['Requested', 'Dispatched', 'Received', 'Rejected'];

  protected readonly statusOptions = computed(() =>
    this.statuses.map(status => ({ label: `inventory.transfers.status.${status}`, value: status })),
  );

  protected readonly batchOptions = computed(() => {
    const fromBranchId = this.form.controls.fromBranchId.value;
    return this.batches()
      .filter(batch => !fromBranchId || batch.branchId === fromBranchId)
      .filter(batch => batch.quantityOnHand > 0)
      .map(batch => ({
        label: `${batch.drugTradeNameEn} - ${batch.batchNumber} (${batch.quantityOnHand})`,
        value: batch.id,
      }));
  });

  protected readonly form = this.fb.nonNullable.group({
    fromBranchId: ['', [Validators.required]],
    toBranchId: ['', [Validators.required]],
    notes: [''],
    lines: this.fb.array([this.createLineGroup()]),
  });

  protected get lines(): FormArray {
    return this.form.controls.lines;
  }

  constructor() {
    this.loadLookups();
    this.load(1);
  }

  protected openCreate(): void {
    const assignedBranchId = this.authService?.session()?.branchId ?? '';
    this.form.reset({
      fromBranchId: this.authService?.isOwner() ? '' : assignedBranchId,
      toBranchId: '',
      notes: '',
    });
    this.lines.clear();
    this.lines.push(this.createLineGroup());
    this.isCreateOpen.set(true);
  }

  protected closeCreate(): void {
    this.isCreateOpen.set(false);
  }

  protected onFilterChange(): void {
    this.load(1);
  }

  protected addLine(): void {
    this.lines.push(this.createLineGroup());
  }

  protected removeLine(index: number): void {
    if (this.lines.length > 1) this.lines.removeAt(index);
  }

  protected onBatchChange(index: number, batchId: string): void {
    const batch = this.batches().find(item => item.id === batchId);
    if (!batch) return;
    this.lines.at(index).patchValue({ drugId: batch.drugId });
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    if (raw.fromBranchId === raw.toBranchId) return;

    this.isSubmitting.set(true);
    this.api
      .createStockTransfer({
        fromBranchId: raw.fromBranchId,
        toBranchId: raw.toBranchId,
        notes: raw.notes || null,
        lines: raw.lines.map(line => ({
          drugId: line.drugId,
          batchId: line.batchId,
          quantity: Number(line.quantity),
        })),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isCreateOpen.set(false);
          this.load(1);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected previousPage(): void {
    if (this.pageNumber() > 1) this.load(this.pageNumber() - 1);
  }

  protected nextPage(): void {
    if (this.pageNumber() * this.pageSize < this.totalCount()) {
      this.load(this.pageNumber() + 1);
    }
  }

  protected statusKey(status: StockTransferStatus): string {
    return `inventory.transfers.status.${status}`;
  }

  private load(pageNumber: number): void {
    this.isLoading.set(true);
    this.error.set(false);
    this.api
      .getStockTransfers(
        this.branchFilter() || undefined,
        this.statusFilter() || undefined,
        pageNumber,
        this.pageSize,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.transfers.set(result.items);
          this.pageNumber.set(result.pageNumber);
          this.totalCount.set(result.totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.isLoading.set(false);
        },
      });
  }

  private loadLookups(): void {
    this.branchesApi
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of([])))
      .subscribe(branches => this.branches.set(branches.filter(branch => branch.isActive)));

    this.inventoryApi
      .getAllPages()
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of([] as StockBatch[])))
      .subscribe(batches => this.batches.set(batches));
  }

  private createLineGroup() {
    return this.fb.nonNullable.group({
      drugId: ['', [Validators.required]],
      batchId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }
}
