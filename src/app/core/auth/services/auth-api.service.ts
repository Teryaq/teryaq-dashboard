import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../api/api.service';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiService);

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', request, {
      context: this.api.skipErrorToastContext(),
    });
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/register', request, {
      context: this.api.skipErrorToastContext(),
    });
  }

  refresh(refreshToken: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>(
      'auth/refresh',
      { refreshToken },
      { context: this.api.skipErrorToastContext() },
    );
  }
}
