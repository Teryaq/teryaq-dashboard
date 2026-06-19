import {
  HttpClient,
  HttpContext,
  HttpContextToken,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export interface ApiRequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, string | number | boolean>;
  context?: HttpContext;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  get<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), options);
  }

  post<T>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.post<T>(this.buildUrl(path), body, options);
  }

  put<T>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.put<T>(this.buildUrl(path), body, options);
  }

  delete<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.delete<T>(this.buildUrl(path), options);
  }

  getAsset<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return this.http.get<T>(normalizedPath, options);
  }

  skipErrorToastContext(): HttpContext {
    return new HttpContext().set(SKIP_ERROR_TOAST, true);
  }

  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseUrl}/${normalizedPath}`;
  }
}
