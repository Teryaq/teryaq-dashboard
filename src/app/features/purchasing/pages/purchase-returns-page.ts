import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Branch } from '../../branches/models/branches.model';
import { BranchesApiService } from '../../branches/services/branches-api.service';
import { StockBatch } from '../../inventory/models/inventory.model';
import { InventoryApiService } from '../../inventory/services/inventory-api.service';
import { PurchaseReturn, Supplier } from '../models/purchasing.model';
import { PurchaseReturnsApiService } from '../services/purchase-returns-api.service';
import { SuppliersApiService } from '../services/suppliers-api.service';

@Component({
  selector: 'app-purchase-returns-page',
  imports: [ReactiveFormsModule, FormsModule, Button, Dialog, InputNumber, InputText, Select, Textarea, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './purchase-returns-page.html',
  styleUrl: './purchasing-pages.css',
})
export class PurchaseReturnsPage {
  private readonly api = inject(PurchaseReturnsApiService);
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly inventoryApi = inject(InventoryApiService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly returns = signal<PurchaseReturn[]>([]);
  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly branches = signal<Branch[]>([]);
  protected readonly batches = signal<StockBatch[]>([]);
  protected readonly branchFilter = signal('');
  protected readonly supplierFilter = signal('');
  protected readonly isLoading = signal(true);
  protected readonly error = signal(false);
  protected readonly isFormOpen = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly pageNumber = signal(1);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = 20;
  protected readonly batchOptions = computed(() =>
    this.batches().map(batch => ({
      label: `${batch.drugTradeNameEn} - ${batch.batchNumber} (${batch.quantityOnHand})`,
      value: batch.id,
    })),
  );

  protected readonly form = this.fb.nonNullable.group({
    branchId: ['', [Validators.required]],
    supplierId: ['', [Validators.required]],
    purchaseOrderId: [''],
    supplierInvoiceId: [''],
    reason: ['', [Validators.required, Validators.maxLength(500)]],
    lines: this.fb.array([this.createLineGroup()]),
  });

  protected get lines(): FormArray {
    return this.form.controls.lines;
  }

  constructor() {
    this.loadLookups();
    this.load(1);
  }

  protected onFilterChange(): void {
    this.load(1);
  }

  protected openCreate(): void {
    this.form.reset({
      branchId: this.authService.isOwner() ? '' : (this.authService.session()?.branchId ?? ''),
      supplierId: '',
      purchaseOrderId: '',
      supplierInvoiceId: '',
      reason: '',
    });
    this.lines.clear();
    this.lines.push(this.createLineGroup());
    this.loadBatches();
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
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
    this.lines.at(index).patchValue({
      drugId: batch.drugId,
      unitCost: batch.costPrice,
    });
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.api
      .createPurchaseReturn({
        branchId: raw.branchId,
        supplierId: raw.supplierId,
        purchaseOrderId: raw.purchaseOrderId || null,
        supplierInvoiceId: raw.supplierInvoiceId || null,
        reason: raw.reason,
        lines: raw.lines.map(line => ({
          drugId: line.drugId,
          batchId: line.batchId,
          quantity: Number(line.quantity),
          unitCost: line.unitCost ? Number(line.unitCost) : null,
        })),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isFormOpen.set(false);
          this.load(1);
          this.loadBatches();
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected previousPage(): void {
    if (this.pageNumber() > 1) this.load(this.pageNumber() - 1);
  }

  protected nextPage(): void {
    if (this.pageNumber() * this.pageSize < this.totalCount()) this.load(this.pageNumber() + 1);
  }

  private load(pageNumber: number): void {
    this.isLoading.set(true);
    this.error.set(false);
    this.api
      .getPurchaseReturns(this.branchFilter() || undefined, this.supplierFilter() || undefined, pageNumber, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.returns.set(result.items);
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
    this.suppliersApi
      .getSuppliers(undefined, true, 1, 100)
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 100 })))
      .subscribe(result => this.suppliers.set(result.items));

    const assignedBranchId = this.authService.session()?.branchId;
    if (this.authService.isOwner()) {
      this.branchesApi
        .getAll()
        .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of([])))
        .subscribe(branches => this.branches.set(branches));
    } else if (assignedBranchId) {
      this.branches.set([{ id: assignedBranchId, name: 'Assigned branch', address: null, phone: null, isMain: false, isActive: true }]);
    }
    this.loadBatches();
  }

  private loadBatches(): void {
    this.inventoryApi
      .getAllPages()
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of([] as StockBatch[])))
      .subscribe(batches => this.batches.set(batches.filter(batch => batch.quantityOnHand > 0)));
  }

  private createLineGroup() {
    return this.fb.nonNullable.group({
      drugId: ['', [Validators.required]],
      batchId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitCost: this.fb.control<number | null>(null),
    });
  }
}
