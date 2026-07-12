import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Supplier, SupplierInvoice } from '../models/purchasing.model';
import { SupplierInvoicesApiService } from '../services/supplier-invoices-api.service';
import { SuppliersApiService } from '../services/suppliers-api.service';

@Component({
  selector: 'app-supplier-invoices-page',
  imports: [ReactiveFormsModule, FormsModule, Button, Checkbox, DatePicker, Dialog, InputNumber, InputText, Select, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-invoices-page.html',
  styleUrl: './purchasing-pages.css',
})
export class SupplierInvoicesPage {
  private readonly api = inject(SupplierInvoicesApiService);
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly invoices = signal<SupplierInvoice[]>([]);
  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly selected = signal<SupplierInvoice | null>(null);
  protected readonly paymentTarget = signal<SupplierInvoice | null>(null);
  protected readonly supplierFilter = signal('');
  protected readonly outstandingOnly = signal(false);
  protected readonly isLoading = signal(true);
  protected readonly error = signal(false);
  protected readonly isFormOpen = signal(false);
  protected readonly isPaymentOpen = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly pageNumber = signal(1);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = 20;

  protected readonly form = this.fb.nonNullable.group({
    supplierId: ['', [Validators.required]],
    purchaseOrderId: [''],
    invoiceNumber: ['', [Validators.required, Validators.maxLength(50)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    issuedAt: this.fb.control<Date | null>(null, [Validators.required]),
    dueAt: this.fb.control<Date | null>(null),
  });

  protected readonly paymentForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
  });

  constructor() {
    this.loadLookups();
    this.load(1);
  }

  protected onFilterChange(): void {
    this.load(1);
  }

  protected openCreate(): void {
    this.selected.set(null);
    this.form.reset({ supplierId: '', purchaseOrderId: '', invoiceNumber: '', amount: 0, issuedAt: null, dueAt: null });
    this.isFormOpen.set(true);
  }

  protected openEdit(invoice: SupplierInvoice): void {
    this.selected.set(invoice);
    this.form.reset({
      supplierId: invoice.supplierId,
      purchaseOrderId: invoice.purchaseOrderId ?? '',
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      issuedAt: this.parseDateValue(invoice.issuedAt),
      dueAt: this.parseDateValue(invoice.dueAt),
    });
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const selected = this.selected();
    this.isSubmitting.set(true);
    const request = selected
      ? this.api.updateSupplierInvoice(selected.id, {
          invoiceNumber: raw.invoiceNumber,
          dueAt: this.formatNullableDatePayload(raw.dueAt),
        })
      : this.api.createSupplierInvoice({
          supplierId: raw.supplierId,
          purchaseOrderId: raw.purchaseOrderId || null,
          invoiceNumber: raw.invoiceNumber,
          amount: Number(raw.amount),
          issuedAt: this.formatDatePayload(raw.issuedAt),
          dueAt: this.formatNullableDatePayload(raw.dueAt),
        });
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isFormOpen.set(false);
        this.load(selected ? this.pageNumber() : 1);
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  protected openPayment(invoice: SupplierInvoice): void {
    this.paymentTarget.set(invoice);
    this.paymentForm.reset({ amount: invoice.outstandingBalance });
    this.isPaymentOpen.set(true);
  }

  protected closePayment(): void {
    this.isPaymentOpen.set(false);
  }

  protected recordPayment(): void {
    const invoice = this.paymentTarget();
    if (!invoice) return;
    this.paymentForm.markAllAsTouched();
    if (this.paymentForm.invalid) return;
    this.isSubmitting.set(true);
    this.api
      .recordInvoicePayment(invoice.id, Number(this.paymentForm.getRawValue().amount))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.invoices.update(items => items.map(item => item.id === updated.id ? updated : item));
          this.isPaymentOpen.set(false);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected deleteInvoice(id: string): void {
    this.isSubmitting.set(true);
    this.api
      .deleteSupplierInvoice(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.load(this.pageNumber());
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
      .getSupplierInvoices(this.supplierFilter() || undefined, this.outstandingOnly() || undefined, pageNumber, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.invoices.set(result.items);
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
  }

  private parseDateValue(value: string | null | undefined): Date | null {
    return value ? new Date(`${value}T00:00:00`) : null;
  }

  private formatDatePayload(value: Date | string | null): string {
    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return value ?? '';
  }

  private formatNullableDatePayload(value: Date | string | null): string | null {
    return value ? this.formatDatePayload(value) : null;
  }
}
