import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { SidebarStateService } from '../../../core/layout/sidebar-state.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-topbar',
  imports: [FormsModule, Button, ToggleSwitch, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-topbar.html',
  styleUrl: './app-topbar.css',
})
export class AppTopbar {
  protected readonly sidebarState = inject(SidebarStateService);
  protected readonly themeService = inject(ThemeService);
  protected readonly i18n = inject(I18nService);
  protected readonly authService = inject(AuthService);

  protected readonly collapseIcon = computed(() => {
    const collapsed = this.sidebarState.collapsed();
    const rtl = this.i18n.direction() === 'rtl';
    if (rtl) {
      return collapsed ? 'pi pi-angle-left' : 'pi pi-angle-right';
    }
    return collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left';
  });

  protected readonly userRole = computed(() => {
    const role = this.authService.userRole();
    if (!role) return null;
    return `roles.${role.toLowerCase()}`;
  });

  protected readonly todayDate = computed(() => {
    const locale = this.i18n.locale();
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  });

  protected setDarkMode(isDark: boolean): void {
    this.themeService.setTheme(isDark ? 'dark' : 'light');
  }

  protected toggleLocale(): void {
    void this.i18n.setLocale(this.i18n.locale() === 'en' ? 'ar' : 'en');
  }
}
