import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { Textarea } from 'primeng/textarea';

import {
  AuthFieldErrors,
  mapApiError,
  mapAuthFieldErrors,
} from '../../../core/auth/utils/auth-error.mapper';
import { AuthService } from '../../../core/auth/services/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AppLogo } from '../../../shared/components/app-logo/app-logo';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('ownerPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    Card,
    FloatLabel,
    InputText,
    Message,
    Password,
    Textarea,
    TranslatePipe,
    AppLogo,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly step = signal<1 | 2>(1);
  protected readonly authServiceRef = this.authService;

  protected readonly form = this.fb.nonNullable.group(
    {
      pharmacyName: ['', [Validators.required, Validators.maxLength(200)]],
      branchName: ['', [Validators.required, Validators.maxLength(200)]],
      branchAddress: ['', [Validators.maxLength(500)]],
      branchPhone: ['', [Validators.maxLength(20)]],
      ownerEmail: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
      ownerPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  protected onSubmit(): void {
    this.errorMessage.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();

    this.authService
      .register({
        pharmacyName: raw.pharmacyName,
        branchName: raw.branchName,
        branchAddress: raw.branchAddress || null,
        branchPhone: raw.branchPhone || null,
        ownerEmail: raw.ownerEmail,
        ownerPassword: raw.ownerPassword,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => this.handleError(error as HttpErrorResponse),
      });
  }

  protected nextStep(): void {
    const controls = [
      this.form.controls.pharmacyName,
      this.form.controls.branchName,
      this.form.controls.branchAddress,
      this.form.controls.branchPhone,
    ];
    controls.forEach(control => control.markAsTouched());
    if (controls.some(control => control.invalid)) return;
    this.step.set(2);
  }

  protected previousStep(): void {
    this.step.set(1);
  }

  protected fieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) {
      if (field === 'confirmPassword' && this.form.errors?.['passwordMismatch'] && control?.touched) {
        return 'auth.register.passwordMismatch';
      }
      return null;
    }

    if (control.errors['required']) {
      return 'auth.validation.required';
    }
    if (control.errors['email']) {
      return 'auth.validation.email';
    }
    if (control.errors['minlength']) {
      return 'auth.validation.minLength';
    }
    if (control.errors['server']) {
      return control.errors['server'] as string;
    }

    return null;
  }

  protected minLengthParam(field: string): Record<string, string> {
    const control = this.form.get(field);
    const min = control?.errors?.['minlength']?.requiredLength ?? 8;
    return { min: String(min) };
  }

  private handleError(error: HttpErrorResponse): void {
    const fieldErrors = mapAuthFieldErrors(error);
    this.applyFieldErrors(fieldErrors);

    if ([400, 409, 422, 0].includes(error.status) || error.status >= 500) {
      this.errorMessage.set(mapApiError(error).key);
    }
  }

  private applyFieldErrors(errors: AuthFieldErrors): void {
    for (const [field, messages] of Object.entries(errors)) {
      const control = this.form.get(field);
      if (control && messages.length > 0) {
        control.setErrors({ server: messages[0] });
      }
    }
  }
}
