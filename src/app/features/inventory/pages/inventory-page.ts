import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, catchError, debounceTime, of, switchMap } from 'rxjs';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { InventoryApiService } from '../services/inventory-api.service';
import { StockBatch } from '../models/inventory.model';
import { CatalogApiService } from '../../catalog/services/catalog-api.service';
import { Drug } from '../../catalog/models/catalog.model';
import { BranchesApiService } from '../../branches/services/branches-api.service';
import { Branch } from '../../branches/models/branches.model';

type BatchStatus = 'ok' | 'nearExpiry' | 'expired';
type ActiveFilter = 'all' | BatchStatus;

interface BatchRow extends StockBatch {
  status: BatchStatus;
}

@Component({
  selector: 'app-inventory-page',
  imports: [TranslatePipe, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inventory-page.html',
  styleUrl: './inventory-page.css',
})
export class InventoryPage {
  private readonly api = inject(InventoryApiService);
  private readonly catalogApi = inject(CatalogApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly activeFilter = signal<ActiveFilter>('all');

  protected readonly isReceiveOpen = signal(false);
  protected readonly isAdjustOpen = signal(false);
  protected readonly selectedBatch = signal<BatchRow | null>(null);
  protected readonly isSubmitting = signal(false);

  protected readonly branches = signal<Branch[]>([]);
  protected readonly drugResults = signal<Drug[]>([]);
  protected readonly isDrugSearching = signal(false);
  protected readonly drugDisplayValue = signal('');

  private readonly drugSearch$ = new Subject<string>();
  private readonly allBatches = signal<BatchRow[]>([]);

  protected readonly filteredBatches = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const filter = this.activeFilter();
    return this.allBatches().filter(b => {
      const matchesSearch =
        !q ||
        b.drugTradeNameEn.toLowerCase().includes(q) ||
        b.drugTradeNameAr.includes(q) ||
        b.batchNumber.toLowerCase().includes(q) ||
        b.branchName.toLowerCase().includes(q);
      const matchesFilter = filter === 'all' || b.status === filter;
      return matchesSearch && matchesFilter;
    });
  });

  protected readonly receiveForm = this.fb.nonNullable.group({
    branchId: ['', [Validators.required]],
    drugId: ['', [Validators.required]],
    batchNumber: ['', [Validators.required, Validators.maxLength(100)]],
    expiryDate: ['', [Validators.required]],
    quantity: ['1', [Validators.required]],
    reorderLevel: ['0', [Validators.required]],
    costPrice: ['0', [Validators.required]],
    sellingPrice: [''],
  });

  protected readonly adjustForm = this.fb.nonNullable.group({
    quantityOnHand: ['0', [Validators.required]],
    reorderLevel: ['0', [Validators.required]],
    sellingPrice: ['0', [Validators.required]],
    expiryDate: ['', [Validators.required]],
  });

  constructor() {
    this.api
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.allBatches.set(
            result.items.map(b => ({ ...b, status: this.computeStatus(b.expiryDate) })),
          );
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('common.error');
          this.isLoading.set(false);
        },
      });

    this.branchesApi
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: branches => this.branches.set(branches) });

    this.drugSearch$
      .pipe(
        debounceTime(300),
        switchMap(q => {
          if (!q.trim()) {
            this.isDrugSearching.set(false);
            return of({ items: [] as Drug[], totalCount: 0, pageNumber: 1, pageSize: 8 });
          }
          this.isDrugSearching.set(true);
          return this.catalogApi.getAll({ search: q, pageSize: 8 }).pipe(
            catchError(() =>
              of({ items: [] as Drug[], totalCount: 0, pageNumber: 1, pageSize: 8 }),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        this.drugResults.set(result.items);
        this.isDrugSearching.set(false);
      });
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected setFilter(filter: ActiveFilter): void {
    this.activeFilter.set(filter);
  }

  protected openReceive(): void {
    this.receiveForm.reset({ quantity: '1', reorderLevel: '0', costPrice: '0', sellingPrice: '' });
    this.drugDisplayValue.set('');
    this.drugResults.set([]);
    this.isReceiveOpen.set(true);
  }

  protected closeReceive(): void {
    this.isReceiveOpen.set(false);
  }

  protected onDrugSearchInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.drugDisplayValue.set(q);
    if (!q) {
      this.receiveForm.patchValue({ drugId: '' });
      this.drugResults.set([]);
    }
    this.drugSearch$.next(q);
  }

  protected selectDrug(drug: Drug): void {
    this.receiveForm.patchValue({ drugId: drug.id });
    this.drugDisplayValue.set(`${drug.tradeNameEn} — ${drug.tradeNameAr}`);
    this.drugResults.set([]);
  }

  protected onReceiveSubmit(): void {
    this.receiveForm.markAllAsTouched();
    if (this.receiveForm.invalid) return;
    this.isSubmitting.set(true);
    const raw = this.receiveForm.getRawValue();
    this.api
      .create({
        branchId: raw.branchId,
        drugId: raw.drugId,
        batchNumber: raw.batchNumber,
        expiryDate: raw.expiryDate,
        quantity: Number(raw.quantity),
        reorderLevel: Number(raw.reorderLevel),
        costPrice: Number(raw.costPrice),
        sellingPrice: raw.sellingPrice ? Number(raw.sellingPrice) : null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: batch => {
          this.allBatches.update(list => [
            { ...batch, status: this.computeStatus(batch.expiryDate) },
            ...list,
          ]);
          this.isReceiveOpen.set(false);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected openAdjust(batch: BatchRow): void {
    this.selectedBatch.set(batch);
    this.adjustForm.reset({
      quantityOnHand: String(batch.quantityOnHand),
      reorderLevel: String(batch.reorderLevel),
      sellingPrice: String(batch.sellingPrice),
      expiryDate: batch.expiryDate,
    });
    this.isAdjustOpen.set(true);
  }

  protected closeAdjust(): void {
    this.isAdjustOpen.set(false);
    this.selectedBatch.set(null);
  }

  protected onAdjustSubmit(): void {
    const batch = this.selectedBatch();
    if (!batch) return;
    this.adjustForm.markAllAsTouched();
    if (this.adjustForm.invalid) return;
    this.isSubmitting.set(true);
    const raw = this.adjustForm.getRawValue();
    this.api
      .update(batch.id, {
        quantityOnHand: Number(raw.quantityOnHand),
        reorderLevel: Number(raw.reorderLevel),
        sellingPrice: Number(raw.sellingPrice),
        expiryDate: raw.expiryDate,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.allBatches.update(list =>
            list.map(b =>
              b.id === updated.id
                ? { ...updated, status: this.computeStatus(updated.expiryDate) }
                : b,
            ),
          );
          this.isAdjustOpen.set(false);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected receiveFieldError(field: string): string | null {
    const c = this.receiveForm.get(field);
    if (!c?.touched || !c.errors) return null;
    if (c.errors['required']) return 'form.validation.required';
    if (c.errors['maxlength']) return 'form.validation.tooLong';
    return null;
  }

  protected adjustFieldError(field: string): string | null {
    const c = this.adjustForm.get(field);
    if (!c?.touched || !c.errors) return null;
    if (c.errors['required']) return 'form.validation.required';
    return null;
  }

  private computeStatus(expiryDate: string): BatchStatus {
    const msPerDay = 86_400_000;
    const days = Math.floor(
      (new Date(expiryDate).getTime() - new Date().getTime()) / msPerDay,
    );
    if (days < 0) return 'expired';
    if (days <= 90) return 'nearExpiry';
    return 'ok';
  }
}
