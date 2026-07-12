import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, of, Subject, switchMap } from 'rxjs';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Branch } from '../../branches/models/branches.model';
import { BranchesApiService } from '../../branches/services/branches-api.service';
import { Drug } from '../../catalog/models/catalog.model';
import { CatalogApiService } from '../../catalog/services/catalog-api.service';
import { PurchaseOrder, PurchaseOrderStatus, Supplier } from '../models/purchasing.model';
import { PurchaseOrdersApiService } from '../services/purchase-orders-api.service';
import { SuppliersApiService } from '../services/suppliers-api.service';

@Component({
  selector: 'app-purchase-orders-page',
  imports: [ReactiveFormsModule, RouterLink, Button, Dialog, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './purchase-orders-page.html',
  styleUrl: './purchasing-pages.css',
})
export class PurchaseOrdersPage {
  private readonly api = inject(PurchaseOrdersApiService);
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly catalogApi = inject(CatalogApiService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly drugSearch = new Subject<{ index: number; query: string }>();

  protected readonly orders = signal<PurchaseOrder[]>([]);
  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly branches = signal<Branch[]>([]);
  protected readonly drugResults = signal<Drug[]>([]);
  protected readonly activeDrugLine = signal<number | null>(null);
  protected readonly drugLabels = signal<Record<number, string>>({});
  protected readonly isLoading = signal(true);
  protected readonly error = signal(false);
  protected readonly isFormOpen = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly pageNumber = signal(1);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = 20;
  protected readonly branchFilter = signal('');
  protected readonly supplierFilter = signal('');
  protected readonly statusFilter = signal<PurchaseOrderStatus | ''>('');
  protected readonly statuses: PurchaseOrderStatus[] = ['Draft', 'Sent', 'PartiallyReceived', 'Received'];

  protected readonly form = this.fb.nonNullable.group({
    branchId: ['', [Validators.required]],
    supplierId: ['', [Validators.required]],
    expectedDeliveryDate: [''],
    notes: ['', [Validators.maxLength(1000)]],
    lines: this.fb.array([this.createLineGroup()]),
  });

  protected get lines(): FormArray {
    return this.form.controls.lines;
  }

  constructor() {
    this.loadLookups();
    this.load(1);
    this.drugSearch
      .pipe(
        debounceTime(250),
        switchMap(({ index, query }) => {
          this.activeDrugLine.set(index);
          if (!query.trim()) return of({ items: [] as Drug[], totalCount: 0, pageNumber: 1, pageSize: 8 });
          return this.catalogApi
            .getAll({ search: query, pageSize: 8 })
            .pipe(catchError(() => of({ items: [] as Drug[], totalCount: 0, pageNumber: 1, pageSize: 8 })));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => this.drugResults.set(result.items));
  }

  protected openCreate(): void {
    this.form.reset({
      branchId: this.authService.isOwner() ? '' : (this.authService.session()?.branchId ?? ''),
      supplierId: '',
      expectedDeliveryDate: '',
      notes: '',
    });
    this.lines.clear();
    this.lines.push(this.createLineGroup());
    this.drugLabels.set({});
    this.drugResults.set([]);
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
  }

  protected onFilterChange(): void {
    this.load(1);
  }

  protected previousPage(): void {
    if (this.pageNumber() > 1) this.load(this.pageNumber() - 1);
  }

  protected nextPage(): void {
    if (this.pageNumber() * this.pageSize < this.totalCount()) this.load(this.pageNumber() + 1);
  }

  protected addLine(): void {
    this.lines.push(this.createLineGroup());
  }

  protected removeLine(index: number): void {
    if (this.lines.length > 1) this.lines.removeAt(index);
  }

  protected onDrugInput(index: number, event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.drugLabels.update(labels => ({ ...labels, [index]: query }));
    this.lines.at(index).patchValue({ drugId: '' });
    this.drugSearch.next({ index, query });
  }

  protected selectDrug(index: number, drug: Drug): void {
    this.lines.at(index).patchValue({ drugId: drug.id });
    this.drugLabels.update(labels => ({ ...labels, [index]: `${drug.tradeNameEn} - ${drug.tradeNameAr}` }));
    this.drugResults.set([]);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.api
      .createPurchaseOrder({
        branchId: raw.branchId,
        supplierId: raw.supplierId,
        expectedDeliveryDate: raw.expectedDeliveryDate || null,
        notes: raw.notes || null,
        lines: raw.lines.map(line => ({
          drugId: line.drugId,
          quantityOrdered: Number(line.quantityOrdered),
          unitCost: Number(line.unitCost),
        })),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isFormOpen.set(false);
          this.load(1);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected deleteOrder(id: string): void {
    this.isSubmitting.set(true);
    this.api
      .deletePurchaseOrder(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.load(this.pageNumber());
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected statusKey(status: PurchaseOrderStatus): string {
    return `purchasing.orders.status.${status}`;
  }

  private load(pageNumber: number): void {
    this.isLoading.set(true);
    this.error.set(false);
    this.api
      .getPurchaseOrders(
        this.branchFilter() || undefined,
        this.supplierFilter() || undefined,
        this.statusFilter() || undefined,
        pageNumber,
        this.pageSize,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.orders.set(result.items);
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
  }

  private createLineGroup() {
    return this.fb.nonNullable.group({
      drugId: ['', [Validators.required]],
      quantityOrdered: ['1', [Validators.required, Validators.min(1)]],
      unitCost: ['0', [Validators.required, Validators.min(0)]],
    });
  }
}
