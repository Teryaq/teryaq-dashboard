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
    const activePreset = isDark ? DARK_PRESETS[this.darkPreset()] : undefined;

    if (activePreset?.primary) {
      // A dark preset owns the primary palette.
      style.setProperty('--color-primary', activePreset.primary.color);
      style.setProperty('--color-primary-hover', activePreset.primary.hover);
      updatePrimaryPalette({ ...activePreset.primary.palette });
      return;
    }

    const palette = COLOR_THEMES[this.colorTheme()].palette;
    // Light: 500/600 · Dark: 400/500 (matches existing emerald tokens).
    style.setProperty('--color-primary', isDark ? palette[400] : palette[500]);
    style.setProperty('--color-primary-hover', isDark ? palette[500] : palette[600]);
    updatePrimaryPalette({ ...palette });
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
