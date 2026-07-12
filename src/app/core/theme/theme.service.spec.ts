import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { COLOR_THEMES, DARK_PRESETS } from './color-themes';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let documentRef: Document;

  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string): MediaQueryList =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => undefined,
          removeListener: () => undefined,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          dispatchEvent: () => true,
        }) as MediaQueryList,
    });
    TestBed.configureTestingModule({});
    documentRef = TestBed.inject(DOCUMENT);
    documentRef.documentElement.className = '';
    documentRef.documentElement.removeAttribute('style');
  });

  afterEach(() => {
    localStorage.clear();
    documentRef.documentElement.className = '';
    documentRef.documentElement.removeAttribute('style');
  });

  it('uses the Obsidian palette instead of the selected color theme when Obsidian is enabled', () => {
    const service = TestBed.inject(ThemeService);
    const obsidian = DARK_PRESETS.obsidian;
    const obsidianPalette = DARK_PRESETS.obsidian.palette!;

    service.setTheme('dark');
    service.setDarkPreset('obsidian');
    service.setColorTheme('rose');

    const root = documentRef.documentElement;

    expect(root.classList.contains('dark')).toBe(true);
    expect(root.classList.contains('theme-obsidian')).toBe(true);
    expect(obsidianPalette[400]).toBe('#8aaafe');
    expect(obsidianPalette[500]).toBe('#7c9cff');
    expect(obsidian.actionPrimary).toBe('#7c9cff');
    expect(obsidian.actionPrimaryHover).toBe('#a5baff');
    expect(obsidian.actionText).toBe('#f2f4f7');
    expect(root.style.getPropertyValue('--color-primary')).toBe(obsidian.actionPrimary);
    expect(root.style.getPropertyValue('--color-primary-hover')).toBe(obsidian.actionPrimaryHover);
    expect(root.style.getPropertyValue('--action-text')).toBe(obsidian.actionText);
    expect(root.style.getPropertyValue('--sidebar-active-bg')).toBe(obsidian.actionPrimary);
    expect(root.style.getPropertyValue('--p-button-primary-background')).toBe(obsidian.actionPrimary);
    expect(root.style.getPropertyValue('--p-button-primary-color')).toBe(obsidian.actionText);
    expect(root.style.getPropertyValue('--p-inputtext-focus-border-color')).toBe('var(--color-primary)');
  });

  it('restores the selected color palette when the dark preset is reset to none', () => {
    const service = TestBed.inject(ThemeService);

    service.setTheme('dark');
    service.setColorTheme('rose');
    service.setDarkPreset('obsidian');
    service.setDarkPreset('none');

    const root = documentRef.documentElement;

    expect(root.classList.contains('theme-obsidian')).toBe(false);
    expect(root.style.getPropertyValue('--color-primary')).toBe(COLOR_THEMES.rose.palette[400]);
    expect(root.style.getPropertyValue('--color-primary-hover')).toBe(COLOR_THEMES.rose.palette[500]);
  });
});
