import { Injectable } from '@angular/core';

import { AuthSession } from '../models/auth.models';

const STORAGE_KEY = 'teryaq.auth';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  save(session: AuthSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  load(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      this.clear();
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
