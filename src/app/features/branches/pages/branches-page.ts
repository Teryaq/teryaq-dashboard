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
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { BranchesApiService } from '../services/branches-api.service';
import { Branch } from '../models/branches.model';

@Component({
  selector: 'app-branches-page',
  imports: [TranslatePipe, ReactiveFormsModule, Button, Dialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './branches-page.html',
  styleUrl: './branches-page.css',
})
export class BranchesPage {
  private readonly api = inject(BranchesApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly deactivatingId = signal<string | null>(null);
  protected readonly deleteConfirmId = signal<string | null>(null);

  protected readonly isCreateOpen = signal(false);
  protected readonly isEditOpen = signal(false);
  protected readonly selectedBranch = signal<Branch | null>(null);
  protected readonly isSubmitting = signal(false);

  private readonly allBranches = signal<Branch[]>([]);

  protected readonly filteredBranches = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.allBranches();
    return this.allBranches().filter(
      b =>
        b.name.toLowerCase().includes(q) ||
        (b.address ?? '').toLowerCase().includes(q),
    );
  });

  protected readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    address: [''],
    phone: [''],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    address: [''],
    phone: [''],
  });

  constructor() {
    this.api
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: branches => {
          this.allBranches.set(branches);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('common.error');
          this.isLoading.set(false);
        },
      });
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected openCreate(): void {
    this.createForm.reset();
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
      .create({ name: raw.name, address: raw.address || null, phone: raw.phone || null })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: branch => {
          this.allBranches.update(list => [...list, branch]);
          this.isCreateOpen.set(false);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected openEdit(branch: Branch): void {
    this.selectedBranch.set(branch);
    this.editForm.reset({
      name: branch.name,
      address: branch.address ?? '',
      phone: branch.phone ?? '',
    });
    this.isEditOpen.set(true);
  }

  protected closeEdit(): void {
    this.isEditOpen.set(false);
    this.selectedBranch.set(null);
  }

  protected onEditSubmit(): void {
    const branch = this.selectedBranch();
    if (!branch) return;
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;
    this.isSubmitting.set(true);
    const raw = this.editForm.getRawValue();
    this.api
      .update(branch.id, { name: raw.name, address: raw.address || null, phone: raw.phone || null })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.allBranches.update(list => list.map(b => (b.id === updated.id ? updated : b)));
          this.isEditOpen.set(false);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected deactivate(branch: Branch): void {
    if (branch.isMain || this.deactivatingId()) return;
    this.deactivatingId.set(branch.id);
    this.api
      .deactivate(branch.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.allBranches.update(list => list.map(b => (b.id === updated.id ? updated : b)));
          this.deactivatingId.set(null);
        },
        error: () => this.deactivatingId.set(null),
      });
  }

  protected requestDelete(id: string): void {
    this.deleteConfirmId.set(id);
  }

  protected cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  protected deleteBranch(id: string): void {
    this.isSubmitting.set(true);
    this.api.delete(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.allBranches.update(branches => branches.filter(branch => branch.id !== id));
        this.deleteConfirmId.set(null);
        this.isSubmitting.set(false);
      },
      error: () => this.isSubmitting.set(false),
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
}
