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
import { UsersApiService } from '../services/users-api.service';
import { User } from '../models/users.model';
import { BranchesApiService } from '../../branches/services/branches-api.service';
import { Branch } from '../../branches/models/branches.model';

@Component({
  selector: 'app-users-page',
  imports: [TranslatePipe, ReactiveFormsModule, Button, Dialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
})
export class UsersPage {
  private readonly api = inject(UsersApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly deactivatingId = signal<string | null>(null);

  protected readonly isInviteOpen = signal(false);
  protected readonly isEditOpen = signal(false);
  protected readonly selectedUser = signal<User | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly branches = signal<Branch[]>([]);

  private readonly allUsers = signal<User[]>([]);

  protected readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.allUsers();
    return this.allUsers().filter(
      u =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  });

  protected readonly inviteForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    branchId: [''],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    branchId: [''],
  });

  constructor() {
    this.api
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: users => {
          this.allUsers.set(users);
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
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected openInvite(): void {
    this.inviteForm.reset();
    this.isInviteOpen.set(true);
  }

  protected closeInvite(): void {
    this.isInviteOpen.set(false);
  }

  protected onInviteSubmit(): void {
    this.inviteForm.markAllAsTouched();
    if (this.inviteForm.invalid) return;
    this.isSubmitting.set(true);
    const raw = this.inviteForm.getRawValue();
    this.api
      .create({
        email: raw.email,
        fullName: raw.fullName,
        password: raw.password,
        branchId: raw.branchId || null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: user => {
          this.allUsers.update(list => [...list, user]);
          this.isInviteOpen.set(false);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected openEdit(user: User): void {
    this.selectedUser.set(user);
    this.editForm.reset({
      fullName: user.fullName,
      branchId: user.branchId ?? '',
    });
    this.isEditOpen.set(true);
  }

  protected closeEdit(): void {
    this.isEditOpen.set(false);
    this.selectedUser.set(null);
  }

  protected onEditSubmit(): void {
    const user = this.selectedUser();
    if (!user) return;
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;
    this.isSubmitting.set(true);
    const raw = this.editForm.getRawValue();
    this.api
      .update(user.id, { fullName: raw.fullName, branchId: raw.branchId || null })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.allUsers.update(list => list.map(u => (u.id === updated.id ? updated : u)));
          this.isEditOpen.set(false);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected deactivate(user: User): void {
    if (user.isLocked || this.deactivatingId()) return;
    this.deactivatingId.set(user.id);
    this.api
      .deactivate(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.allUsers.update(list => list.map(u => (u.id === updated.id ? updated : u)));
          this.deactivatingId.set(null);
        },
        error: () => this.deactivatingId.set(null),
      });
  }

  protected inviteFieldError(field: string): string | null {
    const c = this.inviteForm.get(field);
    if (!c?.touched || !c.errors) return null;
    if (c.errors['required']) return 'form.validation.required';
    if (c.errors['email']) return 'form.validation.email';
    if (c.errors['minlength']) return 'form.validation.minLength8';
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

  protected roleIcon(role: string): string {
    return role === 'Owner' ? 'pi-shield' : 'pi-user';
  }

  protected branchName(branchId: string | null | undefined): string {
    if (!branchId) return '';
    return this.branches().find(b => b.id === branchId)?.name ?? branchId;
  }
}
