import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';

import {
  AuthResponse,
  AuthSession,
  LoginRequest,
  RegisterRequest,
} from '../models/auth.models';
import { AuthApiService } from './auth-api.service';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly sessionState = signal<AuthSession | null>(null);
  private readonly loadingState = signal(false);
  private refreshInFlight: Observable<AuthSession | null> | null = null;

  readonly session = this.sessionState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionState() !== null);
  readonly userRole = computed(() => this.sessionState()?.role ?? null);
  readonly isOwner = computed(() => this.sessionState()?.role === 'Owner');

  initializeFromStorage(): void {
    const stored = this.tokenStorage.load();
    if (stored) {
      this.sessionState.set(stored);
    }
  }

  login(request: LoginRequest): Observable<void> {
    this.loadingState.set(true);
    return this.authApi.login(request).pipe(
      tap((response) => this.persistSession(response)),
      switchMap(() => this.router.navigate(['/dashboard'])),
      map(() => void 0),
      finalize(() => this.loadingState.set(false)),
    );
  }

  register(request: RegisterRequest): Observable<void> {
    this.loadingState.set(true);
    return this.authApi.register(request).pipe(
      tap((response) => this.persistSession(response)),
      switchMap(() => this.router.navigate(['/dashboard'])),
      map(() => void 0),
      finalize(() => this.loadingState.set(false)),
    );
  }

  refresh(): Observable<AuthSession | null> {
    const current = this.sessionState();
    if (!current?.refreshToken) {
      return of(null);
    }

    if (!this.refreshInFlight) {
      this.refreshInFlight = this.authApi.refresh(current.refreshToken).pipe(
        tap((response) => this.persistSession(response)),
        map(() => this.sessionState()),
        catchError(() => {
          this.logout();
          return of(null);
        }),
        finalize(() => {
          this.refreshInFlight = null;
        }),
        shareReplay(1),
      );
    }

    return this.refreshInFlight;
  }

  logout(): void {
    this.sessionState.set(null);
    this.tokenStorage.clear();
    void this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return this.sessionState()?.accessToken ?? null;
  }

  private persistSession(response: AuthResponse): void {
    const session: AuthSession = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
      tenantId: response.tenantId,
      branchId: response.branchId,
      role: response.role,
    };
    this.sessionState.set(session);
    this.tokenStorage.save(session);
  }
}
