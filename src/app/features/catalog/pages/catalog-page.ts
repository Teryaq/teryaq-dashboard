import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/services/auth.service';
import { CatalogApiService } from '../services/catalog-api.service';
import { Drug, DrugSource, DrugSourceValue } from '../models/catalog.model';

type SourceFilter = 'all' | DrugSource;

@Component({
  selector: 'app-catalog-page',
  imports: [TranslatePipe, ReactiveFormsModule, RouterLink, Button, Dialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.css',
})
export class CatalogPage {
  private readonly api = inject(CatalogApiService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly isOwner = this.authService.isOwner;

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly sourceFilter = signal<SourceFilter>('all');
  protected readonly pageNumber = signal(1);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = 20;
  private readonly searchChanges = new Subject<string>();

  protected readonly isCreateOpen = signal(false);
  protected readonly isEditOpen = signal(false);
  protected readonly selectedDrug = signal<Drug | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly confirmDeleteId = signal<string | null>(null);
  protected readonly isDeleting = signal(false);

  private readonly allDrugs = signal<Drug[]>([]);

  protected readonly filteredDrugs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const source = this.sourceFilter();
    return this.allDrugs().filter(d => {
      const matchesSearch =
        !q ||
        d.tradeNameEn.toLowerCase().includes(q) ||
        d.tradeNameAr.includes(q) ||
        d.genericName.toLowerCase().includes(q);
      const matchesSource = source === 'all' || d.source === source;
      return matchesSearch && matchesSource;
    });
  });

  protected readonly sources: SourceFilter[] = ['all', 'EDA', 'Import', 'Manual'];

  protected readonly createForm = this.fb.nonNullable.group({
    tradeNameEn: ['', [Validators.required, Validators.maxLength(300)]],
    tradeNameAr: ['', [Validators.required, Validators.maxLength(300)]],
    genericName: ['', [Validators.required, Validators.maxLength(300)]],
    dosageForm: ['', [Validators.required, Validators.maxLength(100)]],
    strength: ['', [Validators.required, Validators.maxLength(100)]],
    packSize: ['1', [Validators.required]],
    price: ['0', [Validators.required]],
    barcode: [''],
    manufacturerEn: [''],
    manufacturerAr: [''],
    source: ['0', [Validators.required]],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    tradeNameEn: ['', [Validators.required, Validators.maxLength(300)]],
    tradeNameAr: ['', [Validators.required, Validators.maxLength(300)]],
    genericName: ['', [Validators.required, Validators.maxLength(300)]],
    dosageForm: ['', [Validators.required, Validators.maxLength(100)]],
    strength: ['', [Validators.required, Validators.maxLength(100)]],
    packSize: ['1', [Validators.required]],
    price: ['0', [Validators.required]],
    barcode: [''],
    manufacturerEn: [''],
    manufacturerAr: [''],
    isActive: [true],
  });

  constructor() {
    this.searchChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load(1));
    this.load(1);
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.searchChanges.next(this.searchQuery());
  }

  protected setSourceFilter(source: SourceFilter): void {
    this.sourceFilter.set(source);
    this.load(1);
  }

  protected previousPage(): void { if (this.pageNumber() > 1) this.load(this.pageNumber() - 1); }
  protected nextPage(): void { if (this.pageNumber() * this.pageSize < this.totalCount()) this.load(this.pageNumber() + 1); }

  protected sourceKey(source: SourceFilter): string {
    return source === 'all' ? 'catalog.source.all' : `catalog.source.${source}`;
  }

  protected openCreate(): void {
    this.createForm.reset({ source: '0', packSize: '1', price: '0' });
    this.isCreateOpen.set(true);
  }

  protected closeCreate(): void {
    this.isCreateOpen.set(false);
  }

  protected onCreateSubmit(): void {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) return;
    this.isSubmitting.set(true);
    const raw = this.createForm.getRawValue();
    this.api
      .create({
        tradeNameEn: raw.tradeNameEn,
        tradeNameAr: raw.tradeNameAr,
        genericName: raw.genericName,
        dosageForm: raw.dosageForm,
        strength: raw.strength,
        packSize: Number(raw.packSize),
        price: Number(raw.price),
        barcode: raw.barcode || null,
        manufacturerEn: raw.manufacturerEn || null,
        manufacturerAr: raw.manufacturerAr || null,
        source: Number(raw.source) as DrugSourceValue,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: drug => {
          this.allDrugs.update(list => [...list, drug]);
          this.isCreateOpen.set(false);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected openEdit(drug: Drug): void {
    this.selectedDrug.set(drug);
    this.editForm.reset({
      tradeNameEn: drug.tradeNameEn,
      tradeNameAr: drug.tradeNameAr,
      genericName: drug.genericName,
      dosageForm: drug.dosageForm,
      strength: drug.strength,
      packSize: String(drug.packSize),
      price: String(drug.price),
      barcode: drug.barcode ?? '',
      manufacturerEn: drug.manufacturerEn ?? '',
      manufacturerAr: drug.manufacturerAr ?? '',
      isActive: drug.isActive,
    });
    this.isEditOpen.set(true);
  }

  protected closeEdit(): void {
    this.isEditOpen.set(false);
    this.selectedDrug.set(null);
  }

  protected onEditSubmit(): void {
    const drug = this.selectedDrug();
    if (!drug) return;
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;
    this.isSubmitting.set(true);
    const raw = this.editForm.getRawValue();
    this.api
      .update(drug.id, {
        tradeNameEn: raw.tradeNameEn,
        tradeNameAr: raw.tradeNameAr,
        genericName: raw.genericName,
        dosageForm: raw.dosageForm,
        strength: raw.strength,
        packSize: Number(raw.packSize),
        price: Number(raw.price),
        barcode: raw.barcode || null,
        manufacturerEn: raw.manufacturerEn || null,
        manufacturerAr: raw.manufacturerAr || null,
        isActive: raw.isActive,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.allDrugs.update(list => list.map(d => (d.id === updated.id ? updated : d)));
          this.isEditOpen.set(false);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected requestDelete(drugId: string): void {
    this.confirmDeleteId.set(drugId);
  }

  protected cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  protected confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.isDeleting.set(true);
    this.api
      .delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.allDrugs.update(list => list.filter(d => d.id !== id));
          this.confirmDeleteId.set(null);
          this.isDeleting.set(false);
        },
        error: () => {
          this.confirmDeleteId.set(null);
          this.isDeleting.set(false);
        },
      });
  }

  protected createFieldError(field: string): string | null {
    const c = this.createForm.get(field);
    if (!c?.touched || !c.errors) return null;
    if (c.errors['required']) return 'form.validation.required';
    if (c.errors['maxlength']) return 'form.validation.tooLong';
    return null;
  }

  protected editFieldError(field: string): string | null {
    const c = this.editForm.get(field);
    if (!c?.touched || !c.errors) return null;
    if (c.errors['required']) return 'form.validation.required';
    if (c.errors['maxlength']) return 'form.validation.tooLong';
    return null;
  }

  private load(pageNumber: number): void {
    const sourceMap: Record<DrugSource, DrugSourceValue> = { EDA: 0, Import: 1, Manual: 2 };
    const source = this.sourceFilter();
    this.isLoading.set(true);
    this.error.set(null);
    this.api.getAll({
      search: this.searchQuery().trim() || undefined,
      source: source === 'all' ? undefined : sourceMap[source],
      pageNumber,
      pageSize: this.pageSize,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.allDrugs.set(result.items);
        this.pageNumber.set(result.pageNumber);
        this.totalCount.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => { this.error.set('common.error'); this.isLoading.set(false); },
    });
  }
}
