/**
 * Color theme + dark preset catalog.
 *
 * Ported from COLOR_THEMES.md. Each color theme is a full 50–950 primary
 * palette; the ThemeService maps shades to the app's `--color-primary` tokens
 * and feeds PrimeNG via `updatePrimaryPalette`. Dark presets are standalone
 * dark looks that override surfaces (CSS); the selected color theme still
 * controls the primary/action palette.
 */

export type PaletteShade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950;

export type Palette = Record<PaletteShade, string>;

export type ColorThemeKey =
  | 'cornflower'
  | 'cyan'
  | 'magenta'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'indigo'
  | 'violet';

export interface ColorTheme {
  /** i18n key for the display/aria label. */
  readonly labelKey: string;
  /** Representative chip color shown in the picker. */
  readonly swatch: string;
  readonly palette: Palette;
}

export const COLOR_THEMES: Record<ColorThemeKey, ColorTheme> = {
  cornflower: {
    labelKey: 'theme.colors.cornflower',
    swatch: '#4a74c1',
    palette: {
      50: '#f3f6fc',
      100: '#e7edf9',
      200: '#cedbf0',
      300: '#a7bfe4',
      400: '#7899d2',
      500: '#4a74c1',
      600: '#3b5ba5',
      700: '#2e4785',
      800: '#25396a',
      900: '#21325b',
      950: '#141e38',
    },
  },
  cyan: {
    labelKey: 'theme.colors.cyan',
    swatch: '#06b6d4',
    palette: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
    },
  },
  magenta: {
    labelKey: 'theme.colors.magenta',
    swatch: '#d946ef',
    palette: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
      950: '#4a044e',
    },
  },
  emerald: {
    labelKey: 'theme.colors.emerald',
    swatch: '#10b981',
    palette: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
  },
  amber: {
    labelKey: 'theme.colors.amber',
    swatch: '#f59e0b',
    palette: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
  },
  rose: {
    labelKey: 'theme.colors.rose',
    swatch: '#f43f5e',
    palette: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
      950: '#4c0519',
    },
  },
  indigo: {
    labelKey: 'theme.colors.indigo',
    swatch: '#6366f1',
    palette: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },
  },
  violet: {
    labelKey: 'theme.colors.violet',
    swatch: '#8b5cf6',
    palette: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
    },
  },
};

export const COLOR_THEME_KEYS = Object.keys(COLOR_THEMES) as ColorThemeKey[];

export const DEFAULT_COLOR_THEME: ColorThemeKey = 'emerald';

export type DarkPresetKey = 'none' | 'obsidian' | 'amber';

export interface DarkPreset {
  /** i18n key for the display/aria label. */
  readonly labelKey: string;
  /** Chip color shown in the picker. */
  readonly swatch: string;
  /** CSS class toggled on <html> (empty for `none`). */
  readonly className: string;
}

export const DARK_PRESETS: Record<DarkPresetKey, DarkPreset> = {
  none: {
    labelKey: 'theme.presets.none',
    swatch: '#0c1222',
    className: '',
  },
  obsidian: {
    labelKey: 'theme.presets.obsidian',
    swatch: '#0a0b0f',
    className: 'theme-obsidian',
  },
  amber: {
    labelKey: 'theme.presets.amber',
    swatch: '#f5a100',
    className: 'theme-amber',
  },
};

export const DARK_PRESET_KEYS = Object.keys(DARK_PRESETS) as DarkPresetKey[];

export const DEFAULT_DARK_PRESET: DarkPresetKey = 'none';

/** All preset classes — used to clear stale classes before applying one. */
export const DARK_PRESET_CLASSES = DARK_PRESET_KEYS.map((k) => DARK_PRESETS[k].className).filter(
  Boolean,
);
