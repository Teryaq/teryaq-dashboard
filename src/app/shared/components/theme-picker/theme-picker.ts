import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { Popover } from 'primeng/popover';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { ThemeService } from '../../../core/theme/theme.service';
import {
  COLOR_THEMES,
  COLOR_THEME_KEYS,
  ColorThemeKey,
  DARK_PRESETS,
  DARK_PRESET_KEYS,
  DarkPresetKey,
} from '../../../core/theme/color-themes';

@Component({
  selector: 'app-theme-picker',
  imports: [Button, Popover, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme-picker.html',
  styleUrl: './theme-picker.css',
})
export class ThemePicker {
  protected readonly themeService = inject(ThemeService);

  private readonly popover = viewChild.required(Popover);

  protected readonly colorThemes = COLOR_THEME_KEYS.map((key) => ({
    key,
    ...COLOR_THEMES[key],
  }));

  protected readonly darkPresets = DARK_PRESET_KEYS.map((key) => ({
    key,
    ...DARK_PRESETS[key],
  }));

  protected toggle(event: Event): void {
    this.popover().toggle(event);
  }

  protected selectColor(key: ColorThemeKey): void {
    this.themeService.setColorTheme(key);
  }

  protected selectPreset(key: DarkPresetKey): void {
    this.themeService.setDarkPreset(key);
  }
}
