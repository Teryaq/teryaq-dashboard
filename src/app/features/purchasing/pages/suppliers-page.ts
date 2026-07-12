import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Supplier } from '../models/purchasing.model';
import { SuppliersApiService } from '../services/suppliers-api.service';

@Component({
  selector: 'app-suppliers-page',
  imports: [ReactiveFormsModule, Button, Checkbox, Dialog, InputText, Textarea, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './suppliers-page.html',
  styleUrl: './purchasing-pages.css',
})
export class SuppliersPage {
  private readonly api = inject(SuppliersApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();

  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly selected = signal<Supplier | null>(null);
  protected readonly search = signal('');
  protected readonly isLoading = signal(true);
  protected readonly error = signal(false);
  protected readonly isFormOpen = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly pageNumber = signal(1);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = 20;

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    contactPerson: ['', [Validators.maxLength(200)]],
    phone: ['', [Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(256)]],
    address: ['', [Validators.maxLength(500)]],
    isActive: [true],
  });

  constructor() {
    this.searchChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.search.set(value);
        this.load(1);
      });
    this.load(1);
  }

  protected onSearch(event: Event): void {
    this.searchChanges.next((event.target as HTMLInputElement).value.trim());
  }

  protected previousPage(): void {
    if (this.pageNumber() > 1) this.load(this.pageNumber() - 1);
  }

  protected nextPage(): void {
    if (this.pageNumber() * this.pageSize < this.totalCount()) this.load(this.pageNumber() + 1);
  }

  protected openCreate(): void {
    this.selected.set(null);
    this.form.reset({ isActive: true });
    this.isFormOpen.set(true);
  }

  protected openEdit(supplier: Supplier): void {
    this.selected.set(supplier);
    this.form.reset({
      name: supplier.name,
      contactPerson: supplier.contactPerson ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      isActive: supplier.isActive,
    });
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const payload = {
      name: value.name,
      contactPerson: value.contactPerson || null,
      phone: value.phone || null,
      email: value.email || null,
      address: value.address || null,
    };
    const selected = this.selected();
    this.isSubmitting.set(true);
    const request = selected
      ? this.api.updateSupplier(selected.id, { ...payload, isActive: value.isActive })
      : this.api.createSupplier(payload);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isFormOpen.set(false);
        this.load(selected ? this.pageNumber() : 1);
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  protected deleteSupplier(id: string): void {
    this.isSubmitting.set(true);
    this.api
      .deleteSupplier(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.load(this.pageNumber());
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected fieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return null;
    if (control.errors['required']) return 'form.validation.required';
    if (control.errors['email']) return 'form.validation.email';
    if (control.errors['maxlength']) return 'form.validation.tooLong';
    return null;
  }

  private load(pageNumber: number): void {
    this.isLoading.set(true);
    this.error.set(false);
    this.api
      .getSuppliers(this.search() || undefined, undefined, pageNumber, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.suppliers.set(result.items);
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
}
