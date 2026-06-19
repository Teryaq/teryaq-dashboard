import { HttpErrorResponse } from '@angular/common/http';

export interface AuthFieldErrors {
  [field: string]: string[];
}

export interface MappedApiError {
  key: string;
  params?: Record<string, string>;
}

export function mapAuthFieldErrors(error: HttpErrorResponse): AuthFieldErrors {
  if (error.status !== 422) {
    return {};
  }

  const body = error.error as { errors?: AuthFieldErrors } | null;
  return body?.errors ?? {};
}

export function extractErrorMessage(error: HttpErrorResponse): string {
  if (typeof error.error === 'string') {
    return error.error;
  }

  const body = error.error as
    | { title?: string; detail?: string; message?: string }
    | null
    | undefined;

  return body?.detail ?? body?.title ?? body?.message ?? '';
}

export function mapApiError(error: HttpErrorResponse): MappedApiError {
  if (error.status === 0) {
    return { key: 'errors.network' };
  }

  const message = extractErrorMessage(error);

  if (error.status === 400) {
    if (message.toLowerCase().includes('invalid email or password')) {
      return { key: 'auth.login.invalidCredentials' };
    }
    return { key: 'errors.badRequest' };
  }

  if (error.status === 403) {
    return { key: 'errors.forbidden' };
  }

  if (error.status === 404) {
    return { key: 'errors.notFound' };
  }

  if (error.status === 409) {
    return { key: 'auth.register.emailTaken' };
  }

  if (error.status === 422) {
    return { key: 'errors.validation' };
  }

  if (error.status >= 500) {
    return { key: 'errors.server' };
  }

  return { key: 'errors.unknown' };
}

export function shouldShowErrorToast(error: HttpErrorResponse): boolean {
  return error.status !== 401;
}
