import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { AppLogo } from '../app-logo/app-logo';
import { ThemePicker } from '../theme-picker/theme-picker';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive,
    FormsModule,
    Button,
    Drawer,
    ToggleSwitch,
    TranslatePipe,
    AppLogo,
    ThemePicker,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-navbar.html',
  styleUrl: './app-navbar.css',
})
export class AppNavbar {
  protected readonly themeService = inject(ThemeService);
  protected readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly mobileOpenState = signal(false);
  protected readonly mobileOpen = this.mobileOpenState.asReadonly();

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly isRegisterRoute = computed(() =>
    this.currentUrl().includes('/auth/register'),
  );

  protected readonly drawerPosition = computed(() =>
    this.i18n.direction() === 'rtl' ? 'right' : 'left',
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeMobile());
  }

  protected setDarkMode(isDark: boolean): void {
    this.themeService.setTheme(isDark ? 'dark' : 'light');
  }

  protected toggleLocale(): void {
    void this.i18n.setLocale(this.i18n.locale() === 'en' ? 'ar' : 'en');
  }

  protected navigateToRegister(): void {
    this.closeMobile();
    void this.router.navigate(['/auth/register']);
  }

  protected openMobile(): void {
    this.mobileOpenState.set(true);
  }

  protected closeMobile(): void {
    this.mobileOpenState.set(false);
  }

  protected onMobileDrawerVisibleChange(visible: boolean): void {
    this.mobileOpenState.set(visible);
  }

  protected onDrawerNavClick(): void {
    this.closeMobile();
  }
}
