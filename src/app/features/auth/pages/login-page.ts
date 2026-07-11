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
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';

import {
  AuthFieldErrors,
  mapApiError,
  mapAuthFieldErrors,
} from '../../../core/auth/utils/auth-error.mapper';
import { AuthService } from '../../../core/auth/services/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AppLogo } from '../../../shared/components/app-logo/app-logo';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    Card,
    FloatLabel,
    InputText,
    Message,
    Password,
    TranslatePipe,
    AppLogo,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly authServiceRef = this.authService;

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected onSubmit(): void {
    this.errorMessage.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.authService
      .login(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => this.handleError(error as HttpErrorResponse),
      });
  }

  protected fieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'auth.validation.required';
    }
    if (control.errors['email']) {
      return 'auth.validation.email';
    }
    if (control.errors['server']) {
      return control.errors['server'] as string;
    }

    return null;
  }

  private handleError(error: HttpErrorResponse): void {
    const fieldErrors = mapAuthFieldErrors(error);
    this.applyFieldErrors(fieldErrors);

    if (error.status === 400 || error.status === 422) {
      this.errorMessage.set(mapApiError(error).key);
      return;
    }

    if (error.status >= 500 || error.status === 0) {
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
