# Color Theme System

A portable reference for the color/theming system used in this dashboard. It pairs **CSS custom properties** (design tokens in `styles.scss`) with a **runtime `ThemeService`** that injects the active primary palette and dark presets. Copy the tokens and the service into a new project to reproduce the exact look.

Source files:
- Tokens & component overrides: `src/styles.scss`
- Runtime theming logic & palettes: `src/app/core/services/theme.service.ts`

---

## 1. How It Works

There are three independent axes:

| Axis | Controls | Where it lives | Persisted key |
|------|----------|----------------|---------------|
| **Light / Dark** | Surfaces, text, borders | `.app-dark` class on `<html>` + tokens | `theme` (`light`/`dark`) |
| **Color Theme** | Primary/accent palette (8 choices) | `ThemeService` injects `--primary-*` + `--p-primary-*` | `color-theme` |
| **Dark Preset** | Standalone dark looks that own *both* surfaces and primary | `.theme-obsidian` / `.theme-amber` class + injected vars | `dark-preset` (`none`/`obsidian`/`amber`) |

Rules:
- In **light mode** (or dark mode with preset `none`), the **Color Theme** drives the primary palette.
- When a **Dark Preset** (`obsidian`/`amber`) is active, it owns the primary variables and overrides the color theme.
- Primary values are applied **inline on `document.documentElement`** at runtime; surfaces/radii/shadows are **static CSS tokens**.

---

## 2. Static Design Tokens (`:root`)

These are theme-independent. Copy verbatim.

```css
:root {
  color-scheme: light;

  /* Radii */
  --app-radius-xs: 6px;
  --app-radius-sm: 8px;
  --app-radius-md: 12px;
  --app-radius-lg: 16px;
  --app-radius-xl: 20px;
  --app-radius-2xl: 24px;

  /* Shadows */
  --app-shadow-xs: 0 1px 2px rgb(0 0 0 / 3%);
  --app-shadow-sm: 0 1px 3px rgb(0 0 0 / 4%), 0 1px 2px rgb(0 0 0 / 6%);
  --app-shadow-md: 0 4px 6px rgb(0 0 0 / 5%), 0 2px 4px rgb(0 0 0 / 4%);
  --app-shadow-lg: 0 10px 25px rgb(0 0 0 / 7%), 0 4px 10px rgb(0 0 0 / 4%);
  --app-shadow-xl: 0 20px 50px rgb(0 0 0 / 10%), 0 8px 20px rgb(0 0 0 / 5%);

  /* Transitions */
  --app-transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --app-transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);

  /* Spacing */
  --page-padding: 1.75rem 2.25rem;
  --page-padding-mobile: 1rem 1.25rem;

  /* Entity cards */
  --entity-card-image-height: 250px;
}
```

---

## 3. Light Theme — Surface & Text Tokens

Default `:root` surface values (Cornflower primary is the default).

```css
:root {
  /* Primary (defaults — overwritten at runtime by ThemeService) */
  --primary-color:  #4a74c1; /* Cornflower Blue */
  --primary-hover:  #3b5ba5;
  --primary-subtle: #f3f6fc;
  --primary-muted:  #e7edf9;
  --accent-gradient: linear-gradient(135deg, #4a74c1 0%, #3b5ba5 100%);

  /* Text */
  --text-color:     #0f172a;
  --text-secondary: #64748b;
  --text-muted:     #94a3b8;

  /* Surfaces */
  --surface-ground:  #f8fafc;
  --surface-card:    #ffffff;
  --surface-border:  #e2e8f0;
  --surface-hover:   #f1f5f9;
  --surface-section: #ffffff;
  --surface-overlay: rgb(0 0 0 / 40%);
}
```

| Token | Light value | Role |
|-------|-------------|------|
| `--text-color` | `#0f172a` | Primary text |
| `--text-secondary` | `#64748b` | Secondary / labels |
| `--text-muted` | `#94a3b8` | Muted / placeholder |
| `--surface-ground` | `#f8fafc` | Page background |
| `--surface-card` | `#ffffff` | Cards / panels |
| `--surface-border` | `#e2e8f0` | Borders / dividers |
| `--surface-hover` | `#f1f5f9` | Hover background |
| `--surface-section` | `#ffffff` | Section background |
| `--surface-overlay` | `rgb(0 0 0 / 40%)` | Modal scrim |

---

## 4. Dark Theme — Surface & Text Tokens (`.app-dark`)

```css
.app-dark {
  color-scheme: dark;

  /* Primary falls back to Cornflower's dark shades unless overridden */
  --primary-color:  var(--dark-primary-color, #7899d2);
  --primary-hover:  var(--dark-primary-hover, #a7bfe4);
  --primary-subtle: var(--dark-primary-subtle, rgba(74, 116, 193, 0.12));
  --primary-muted:  var(--dark-primary-muted, rgba(74, 116, 193, 0.08));
  --accent-gradient: var(--dark-accent-gradient,
    linear-gradient(135deg, #7899d2 0%, #a7bfe4 100%));

  /* Text */
  --text-color:     #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted:     #64748b;

  /* Surfaces */
  --surface-ground:  #0c1222;
  --surface-card:    #1e293b;
  --surface-border:  #334155;
  --surface-hover:   rgba(255, 255, 255, 0.04);
  --surface-section: #1e293b;
  --surface-overlay: rgb(0 0 0 / 60%);
}
```

| Token | Dark value | Role |
|-------|-----------|------|
| `--text-color` | `#f1f5f9` | Primary text |
| `--text-secondary` | `#94a3b8` | Secondary / labels |
| `--text-muted` | `#64748b` | Muted / placeholder |
| `--surface-ground` | `#0c1222` | Page background |
| `--surface-card` | `#1e293b` | Cards / panels |
| `--surface-border` | `#334155` | Borders / dividers |
| `--surface-hover` | `rgba(255,255,255,0.04)` | Hover background |
| `--surface-section` | `#1e293b` | Section background |
| `--surface-overlay` | `rgb(0 0 0 / 60%)` | Modal scrim |

---

## 5. Color Themes (Primary Palettes)

Eight selectable palettes. Each is a full 50–950 scale. At runtime the service maps shades to the primary tokens:

- **Light mode:** `--primary-color = 500`, `--primary-hover = 600`, `--primary-subtle = 50`, `--primary-muted = 100`.
- **Dark mode:** `--primary-color = 400`, `--primary-hover = 300`, `--primary-subtle = rgba(500, .18)`, `--primary-muted = rgba(500, .12)`.
- The whole scale is also exported as `--p-primary-50 … --p-primary-950` (PrimeNG compatibility).

### Cornflower Blue (`cornflower`) — default
| Shade | Hex |  | Shade | Hex |
|---|---|---|---|---|
| 50 | `#f3f6fc` | | 500 | `#4a74c1` |
| 100 | `#e7edf9` | | 600 | `#3b5ba5` |
| 200 | `#cedbf0` | | 700 | `#2e4785` |
| 300 | `#a7bfe4` | | 800 | `#25396a` |
| 400 | `#7899d2` | | 900 | `#21325b` |
| | | | 950 | `#141e38` |

### Cyber Cyan (`cyan`)
| Shade | Hex |  | Shade | Hex |
|---|---|---|---|---|
| 50 | `#ecfeff` | | 500 | `#06b6d4` |
| 100 | `#cffafe` | | 600 | `#0891b2` |
| 200 | `#a5f3fc` | | 700 | `#0e7490` |
| 300 | `#67e8f9` | | 800 | `#155e75` |
| 400 | `#22d3ee` | | 900 | `#164e63` |
| | | | 950 | `#083344` |

### Deep Magenta (`magenta`)
| Shade | Hex |  | Shade | Hex |
|---|---|---|---|---|
| 50 | `#fdf4ff` | | 500 | `#d946ef` |
| 100 | `#fae8ff` | | 600 | `#c026d3` |
| 200 | `#f5d0fe` | | 700 | `#a21caf` |
| 300 | `#f0abfc` | | 800 | `#86198f` |
| 400 | `#e879f9` | | 900 | `#701a75` |
| | | | 950 | `#4a044e` |

### Emerald Green (`emerald`)
| Shade | Hex |  | Shade | Hex |
|---|---|---|---|---|
| 50 | `#ecfdf5` | | 500 | `#10b981` |
| 100 | `#d1fae5` | | 600 | `#059669` |
| 200 | `#a7f3d0` | | 700 | `#047857` |
| 300 | `#6ee7b7` | | 800 | `#065f46` |
| 400 | `#34d399` | | 900 | `#064e3b` |
| | | | 950 | `#022c22` |

### Amber Gold (`amber`)
| Shade | Hex |  | Shade | Hex |
|---|---|---|---|---|
| 50 | `#fffbeb` | | 500 | `#f59e0b` |
| 100 | `#fef3c7` | | 600 | `#d97706` |
| 200 | `#fde68a` | | 700 | `#b45309` |
| 300 | `#fcd34d` | | 800 | `#92400e` |
| 400 | `#fbbf24` | | 900 | `#78350f` |
| | | | 950 | `#451a03` |

### Rose Pink (`rose`)
| Shade | Hex |  | Shade | Hex |
|---|---|---|---|---|
| 50 | `#fff1f2` | | 500 | `#f43f5e` |
| 100 | `#ffe4e6` | | 600 | `#e11d48` |
| 200 | `#fecdd3` | | 700 | `#be123c` |
| 300 | `#fda4af` | | 800 | `#9f1239` |
| 400 | `#fb7185` | | 900 | `#881337` |
| | | | 950 | `#4c0519` |

### Indigo Purple (`indigo`)
| Shade | Hex |  | Shade | Hex |
|---|---|---|---|---|
| 50 | `#eef2ff` | | 500 | `#6366f1` |
| 100 | `#e0e7ff` | | 600 | `#4f46e5` |
| 200 | `#c7d2fe` | | 700 | `#4338ca` |
| 300 | `#a5b4fc` | | 800 | `#3730a3` |
| 400 | `#818cf8` | | 900 | `#312e81` |
| | | | 950 | `#1e1b4b` |

### Violet Dream (`violet`)
| Shade | Hex |  | Shade | Hex |
|---|---|---|---|---|
| 50 | `#f5f3ff` | | 500 | `#8b5cf6` |
| 100 | `#ede9fe` | | 600 | `#7c3aed` |
| 200 | `#ddd6fe` | | 700 | `#6d28d9` |
| 300 | `#c4b5fd` | | 800 | `#5b21b6` |
| 400 | `#a78bfa` | | 900 | `#4c1d95` |
| | | | 950 | `#2e1065` |

---

## 6. Dark Presets

Standalone dark looks applied via a class on `<html>` (`theme-obsidian` / `theme-amber`). They override **both** surfaces (CSS below) **and** the primary palette (injected by the service). Default preset on first load is **Obsidian**.

### Obsidian — surfaces (`html.app-dark.theme-obsidian`)
```css
--surface-ground:  #0a0b0f;
--surface-card:    #13151b;
--surface-section: #13151b;
--surface-border:  #1f232d;
--surface-hover:   #1a1d26;
--text-color:      #f2f4f7;
--text-secondary:  #9aa3b2;
--text-muted:      #6b7589;
```
Obsidian primary (injected): `--primary-color #7c9cff`, `--primary-hover #a5baff`, subtle `rgba(124,156,255,0.18)`, muted `rgba(124,156,255,0.12)`, gradient `linear-gradient(135deg, #7c9cff 0%, #a5baff 100%)`. Palette: `50 #eef2ff · 100 #e0e9ff · 200 #c3d3ff · 300 #a5baff · 400 #8aaafe · 500 #7c9cff · 600 #5c7de0 · 700 #4060c0 · 800 #2f4a9a · 900 #243878 · 950 #141f4e`.

### Amber — surfaces (`html.app-dark.theme-amber`)
```css
--surface-ground:  #050505;
--surface-card:    #0a0a09;
--surface-section: #0a0a09;
--surface-border:  #1c1b17;
--surface-hover:   #121210;
--text-color:      #edeae2;
--text-secondary:  #7c7a71;
--text-muted:      #504e49;
```
Amber primary (injected): `--primary-color #f5a100`, `--primary-hover #fbbf24`, subtle `rgba(245,161,0,0.18)`, muted `rgba(245,161,0,0.12)`, gradient `linear-gradient(135deg, #f5a100 0%, #fbbf24 100%)`. Palette: `50 #fffbeb · 100 #fef3c7 · 200 #fde68a · 300 #fcd34d · 400 #fbbf24 · 500 #f59e0b · 600 #d97706 · 700 #b45309 · 800 #92400e · 900 #78350f · 950 #451a03`.

Swatch chips used in the picker UI: Default `#0c1222`, Obsidian `#0a0b0f`, Amber `#f5a100`.

---

## 7. Fixed Accent Gradients (stat cards)

Theme-independent gradients defined once in `:root`:

```css
--gradient-amber:   linear-gradient(135deg, #f59e0b, #f97316);
--gradient-emerald: linear-gradient(135deg, #10b981, #059669);
--gradient-violet:  linear-gradient(135deg, #8b5cf6, #6d28d9);
--gradient-rose:    linear-gradient(135deg, #f43f5e, #e11d48);
--gradient-sky:     linear-gradient(135deg, #0ea5e9, #0284c7);
--gradient-indigo:  linear-gradient(135deg, #6366f1, #4f46e5);
```

Status/semantic colors used inline across components:
- Error/danger: `#ef4444`, `#f44336`
- Success: `#16a34a`
- Info accent (students): `#2563eb`
- Accent (posts): `#7c3aed`

---

## 8. Porting to Another Project

1. **Copy the tokens** — paste sections 2–4, 6, 7 of the CSS into your global stylesheet.
2. **Copy `theme.service.ts`** — it is framework-light (Angular signals, but the palette data + `applyColorTheme`/`applyDarkPreset` logic is portable to any framework). Keep the `COLOR_THEMES`, `PRESET_VARS`, and `DARK_PRESET_OPTIONS` constants.
3. **Toggle classes on `<html>`:**
   - Dark mode → add/remove `app-dark`.
   - Dark preset → add `theme-obsidian` or `theme-amber` (and inject its primary vars).
4. **Reference tokens, never raw hex**, in components: use `var(--primary-color)`, `var(--surface-card)`, `var(--text-color)`, etc. Use `color-mix(in srgb, var(--primary-color) 12%, transparent)` for tints.
5. **PrimeNG users:** the service also sets `--p-primary-50…950`; non-PrimeNG projects can ignore those lines.

### Minimal vanilla-JS equivalent of the runtime injection
```js
function applyColorTheme(palette, isDark) {
  const root = document.documentElement.style;
  if (isDark) {
    root.setProperty('--primary-color', palette[400]);
    root.setProperty('--primary-hover', palette[300]);
  } else {
    root.setProperty('--primary-color', palette[500]);
    root.setProperty('--primary-hover', palette[600]);
    root.setProperty('--primary-subtle', palette[50]);
    root.setProperty('--primary-muted', palette[100]);
  }
  for (const k of [50,100,200,300,400,500,600,700,800,900,950])
    root.setProperty(`--p-primary-${k}`, palette[k]);
}
```
