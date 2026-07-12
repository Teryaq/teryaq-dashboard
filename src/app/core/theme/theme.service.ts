import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { updatePrimaryPalette } from '@primeuix/themes';

import {
  COLOR_THEMES,
  ColorThemeKey,
  DARK_PRESETS,
  DARK_PRESET_CLASSES,
  DEFAULT_COLOR_THEME,
  DEFAULT_DARK_PRESET,
  DarkPresetKey,
  getEffectiveThemeColors,
} from './color-themes';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'teryaq.theme';
const COLOR_KEY = 'teryaq.color-theme';
const PRESET_KEY = 'teryaq.dark-preset';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<ThemeMode>(this.readInitialTheme());
  readonly colorTheme = signal<ColorThemeKey>(this.readInitialColorTheme());
  readonly darkPreset = signal<DarkPresetKey>(this.readInitialDarkPreset());

  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    this.applyAll();
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: ThemeMode): void {
    this.theme.set(theme);
    localStorage.setItem(THEME_KEY, theme);
    this.applyAll();
  }

  setColorTheme(key: ColorThemeKey): void {
    this.colorTheme.set(key);
    localStorage.setItem(COLOR_KEY, key);
    this.applyAll();
  }

  setDarkPreset(key: DarkPresetKey): void {
    this.darkPreset.set(key);
    localStorage.setItem(PRESET_KEY, key);
    this.applyAll();
  }

  private applyAll(): void {
    const isDark = this.theme() === 'dark';
    const root = this.document.documentElement;

    root.classList.toggle('dark', isDark);
    this.applyDarkPresetClass(isDark);
    this.applyColorVars(isDark);
  }

  private applyDarkPresetClass(isDark: boolean): void {
    const root = this.document.documentElement;
    root.classList.remove(...DARK_PRESET_CLASSES);

    if (isDark) {
      const className = DARK_PRESETS[this.darkPreset()].className;
      if (className) {
        root.classList.add(className);
      }
    }
  }

  private applyColorVars(isDark: boolean): void {
    const style = this.document.documentElement.style;
    const { palette, primary, primaryHover, actionText } = getEffectiveThemeColors(
      this.colorTheme(),
      this.darkPreset(),
      isDark,
    );
    style.setProperty('--color-primary', primary);
    style.setProperty('--color-primary-hover', primaryHover);
    style.setProperty('--action-bg', primary);
    style.setProperty('--action-bg-hover', primaryHover);
    style.setProperty('--action-text', actionText);
    style.setProperty('--sidebar-active-bg', primary);
    this.applyPrimeNgComponentVars(style, primary, primaryHover, actionText);
    updatePrimaryPalette({ ...palette });
  }

  private applyPrimeNgComponentVars(
    style: CSSStyleDeclaration,
    primary: string,
    primaryHover: string,
    actionText: string,
  ): void {
    style.setProperty('--p-toggleswitch-checked-background', primary);
    style.setProperty('--p-toggleswitch-checked-hover-background', primaryHover);
    style.setProperty('--p-toggleswitch-checked-border-color', primary);
    style.setProperty('--p-toggleswitch-checked-hover-border-color', primaryHover);
    style.setProperty('--p-toggleswitch-focus-ring-color', 'var(--action-focus-ring)');

    style.setProperty('--p-focus-ring-color', 'var(--color-primary)');
    style.setProperty('--p-focus-ring-shadow', '0 0 0 3px var(--action-focus-ring)');
    style.setProperty('--p-inputtext-focus-border-color', 'var(--color-primary)');
    style.setProperty('--p-password-focus-border-color', 'var(--color-primary)');
    style.setProperty('--p-select-focus-border-color', 'var(--color-primary)');
    style.setProperty('--p-select-option-selected-background', 'var(--action-subtle-bg)');
    style.setProperty('--p-select-option-selected-focus-background', 'var(--action-subtle-bg-hover)');
    style.setProperty('--p-select-option-selected-color', 'var(--color-primary)');
    style.setProperty('--p-datepicker-date-selected-background', primary);
    style.setProperty('--p-datepicker-date-selected-color', actionText);
    style.setProperty('--p-datepicker-date-selected-hover-background', primaryHover);
    style.setProperty('--p-checkbox-checked-background', primary);
    style.setProperty('--p-checkbox-checked-border-color', primary);
    style.setProperty('--p-checkbox-checked-hover-background', primaryHover);
    style.setProperty('--p-checkbox-checked-hover-border-color', primaryHover);
    style.setProperty('--p-button-primary-background', primary);
    style.setProperty('--p-button-primary-hover-background', primaryHover);
    style.setProperty('--p-button-primary-active-background', primaryHover);
    style.setProperty('--p-button-primary-border-color', primary);
    style.setProperty('--p-button-primary-hover-border-color', primaryHover);
    style.setProperty('--p-button-primary-active-border-color', primaryHover);
    style.setProperty('--p-button-primary-color', actionText);
    style.setProperty('--p-button-primary-hover-color', actionText);
    style.setProperty('--p-button-primary-active-color', actionText);
    style.setProperty('--p-button-primary-focus-ring-color', 'var(--action-focus-ring)');
    style.setProperty('--p-button-secondary-focus-ring-color', 'var(--action-focus-ring)');
    style.setProperty('--p-button-text-focus-ring-color', 'var(--action-focus-ring)');
  }

  private readInitialTheme(): ThemeMode {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private readInitialColorTheme(): ColorThemeKey {
    const stored = localStorage.getItem(COLOR_KEY);
    return stored && stored in COLOR_THEMES ? (stored as ColorThemeKey) : DEFAULT_COLOR_THEME;
  }

  private readInitialDarkPreset(): DarkPresetKey {
    const stored = localStorage.getItem(PRESET_KEY);
    return stored && stored in DARK_PRESETS ? (stored as DarkPresetKey) : DEFAULT_DARK_PRESET;
  }
}
