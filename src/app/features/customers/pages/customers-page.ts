import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Customer } from '../models/customer.model';
import { CustomersApiService } from '../services/customers-api.service';

@Component({
  selector: 'app-customers-page',
  imports: [ReactiveFormsModule, Button, Dialog, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customers-page.html',
  styleUrl: './customers-page.css',
})
export class CustomersPage {
  private readonly api = inject(CustomersApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();

  protected readonly customers = signal<Customer[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal(false);
  protected readonly isCreateOpen = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly pageNumber = signal(1);
  protected readonly pageSize = 20;
  protected readonly totalCount = signal(0);
  protected readonly search = signal('');

  protected readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    phone: ['', [Validators.maxLength(30)]],
    email: ['', [Validators.email, Validators.maxLength(256)]],
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
    if (this.pageNumber() * this.pageSize < this.totalCount()) {
      this.load(this.pageNumber() + 1);
    }
  }

  protected openCreate(): void {
    this.createForm.reset();
    this.isCreateOpen.set(true);
  }

  protected closeCreate(): void {
    this.isCreateOpen.set(false);
  }

  protected submit(): void {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) return;
    const value = this.createForm.getRawValue();
    this.isSubmitting.set(true);
    this.api
      .create({ name: value.name, phone: value.phone || null, email: value.email || null })
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

  private load(pageNumber: number): void {
    this.isLoading.set(true);
    this.error.set(false);
    this.api
      .getAll({ search: this.search() || undefined, pageNumber, pageSize: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.customers.set(result.items);
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
