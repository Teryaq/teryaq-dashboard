import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';

import { AuthResponse } from '../models/auth.models';
import { AuthApiService } from './auth-api.service';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

describe('AuthService', () => {
  const response: AuthResponse = {
    accessToken: 'access',
    refreshToken: 'refresh',
    expiresAt: '2026-07-11T12:00:00Z',
    tenantId: 'tenant-1',
    branchId: null,
    user: {
      id: 'user-1',
      email: 'owner@example.com',
      name: 'Owner Name',
      role: 'Owner',
      tenantId: 'tenant-1',
      branchId: null,
    },
  };

  it('maps the nested backend user into the authenticated session', async () => {
    const save = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthApiService, useValue: { login: () => of(response) } },
        { provide: TokenStorageService, useValue: { save, load: () => null, clear: vi.fn() } },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
      ],
    });

    const service = TestBed.inject(AuthService);
    await firstValueFrom(service.login({ email: 'owner@example.com', password: 'password' }));

    expect(service.session()?.user.name).toBe('Owner Name');
    expect(service.userRole()).toBe('Owner');
    expect(service.isOwner()).toBe(true);
    expect(save).toHaveBeenCalledOnce();
  });
});
