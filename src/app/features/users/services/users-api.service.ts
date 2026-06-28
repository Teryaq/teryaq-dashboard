import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { CreateUserDto, UpdateUserDto, User } from '../models/users.model';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly api = inject(ApiService);

  getAll(): Observable<User[]> {
    return this.api.get<User[]>('users');
  }

  getById(id: string): Observable<User> {
    return this.api.get<User>(`users/${id}`);
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.api.post<User>('users', dto);
  }

  update(id: string, dto: UpdateUserDto): Observable<User> {
    return this.api.put<User>(`users/${id}`, dto);
  }

  /** Locks the user account. Locked users cannot log in. */
  deactivate(id: string): Observable<User> {
    return this.api.put<User>(`users/${id}/deactivate`, {});
  }
}
