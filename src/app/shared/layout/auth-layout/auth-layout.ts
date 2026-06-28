import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { ThemePicker } from '../../components/theme-picker/theme-picker';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, FormsModule, Button, ToggleSwitch, TranslatePipe, ThemePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  protected readonly themeService = inject(ThemeService);
  protected readonly i18n = inject(I18nService);

  protected setDarkMode(isDark: boolean): void {
    this.themeService.setTheme(isDark ? 'dark' : 'light');
  }

  protected toggleLocale(): void {
    void this.i18n.setLocale(this.i18n.locale() === 'en' ? 'ar' : 'en');
  }
}
