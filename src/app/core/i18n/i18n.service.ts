import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { I18nApiService } from './i18n-api.service';

export type AppLocale = 'en' | 'ar';

const STORAGE_KEY = 'teryaq.locale';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly i18nApi = inject(I18nApiService);
  private readonly document = inject(DOCUMENT);

  private readonly localeState = signal<AppLocale>(this.readInitialLocale());
  private readonly translationsState = signal<Record<string, unknown>>({});
  private readonly readyState = signal(false);
  private initializePromise: Promise<void> | null = null;

  readonly locale = this.localeState.asReadonly();
  readonly ready = this.readyState.asReadonly();
  readonly direction = computed(() => (this.locale() === 'ar' ? 'rtl' : 'ltr'));

  initialize(): Promise<void> {
    if (!this.initializePromise) {
      this.initializePromise = this.loadLocale(this.localeState());
    }
    return this.initializePromise;
  }

  async setLocale(locale: AppLocale): Promise<void> {
    if (locale === this.localeState()) {
      return;
    }

    const translations = await firstValueFrom(this.i18nApi.load(locale));
    this.translationsState.set(translations);
    this.localeState.set(locale);
    this.readyState.set(true);
    localStorage.setItem(STORAGE_KEY, locale);
    this.applyDocumentAttributes(locale);
  }

  translate(key: string, params?: Record<string, string>): string {
    const value = this.resolveKey(this.translationsState(), key);
    if (typeof value !== 'string') {
      return key;
    }

    if (!params) {
      return value;
    }

    return Object.entries(params).reduce(
      (text, [paramKey, paramValue]) =>
        text.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), paramValue),
      value,
    );
  }

  private readInitialLocale(): AppLocale {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'ar' ? 'ar' : 'en';
  }

  private async loadLocale(locale: AppLocale): Promise<void> {
    const translations = await firstValueFrom(this.i18nApi.load(locale));
    this.translationsState.set(translations);
    this.readyState.set(true);
    this.applyDocumentAttributes(locale);
  }

  private applyDocumentAttributes(locale: AppLocale): void {
    const root = this.document.documentElement;
    root.lang = locale;
    root.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }

  private resolveKey(
    translations: Record<string, unknown>,
    key: string,
  ): unknown {
    return key.split('.').reduce<unknown>((current, part) => {
      if (current && typeof current === 'object' && part in current) {
        return (current as Record<string, unknown>)[part];
      }
      return undefined;
    }, translations);
  }
}
