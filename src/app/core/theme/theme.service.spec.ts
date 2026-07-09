import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { COLOR_THEMES } from './color-themes';
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

  it('keeps the selected color theme active when the Obsidian dark preset is enabled', () => {
    const service = TestBed.inject(ThemeService);

    service.setTheme('dark');
    service.setDarkPreset('obsidian');
    service.setColorTheme('rose');

    const root = documentRef.documentElement;

    expect(root.classList.contains('dark')).toBe(true);
    expect(root.classList.contains('theme-obsidian')).toBe(true);
    expect(root.style.getPropertyValue('--color-primary')).toBe(COLOR_THEMES.rose.palette[400]);
    expect(root.style.getPropertyValue('--color-primary-hover')).toBe(COLOR_THEMES.rose.palette[500]);
  });
});
