import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { Drawer } from 'primeng/drawer';
import { Tooltip } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

import { AuthService } from '../../../core/auth/services/auth.service';
import { SidebarStateService } from '../../../core/layout/sidebar-state.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AppLogo } from '../app-logo/app-logo';

interface SidebarNavItem {
  route: string;
  labelKey: string;
  icon: string;
  ownerOnly?: boolean;
  child?: boolean;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    Drawer,
    Tooltip,
    Button,
    Dialog,
    TranslatePipe,
    AppLogo,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-sidebar.html',
  styleUrl: './app-sidebar.css',
})
export class AppSidebar {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly sidebarState = inject(SidebarStateService);
  protected readonly authService = inject(AuthService);
  protected readonly i18n = inject(I18nService);

  protected readonly navItems: SidebarNavItem[] = [
    { route: '/dashboard', labelKey: 'nav.dashboard', icon: 'pi pi-chart-bar' },
    { route: '/inventory', labelKey: 'nav.inventory', icon: 'pi pi-box', exact: true },
    { route: '/inventory/transfers', labelKey: 'nav.stockTransfers', icon: 'pi pi-arrow-right-arrow-left' },
    { route: '/catalog', labelKey: 'nav.catalog', icon: 'pi pi-database' },
    { route: '/pos', labelKey: 'nav.pos', icon: 'pi pi-shopping-cart' },
    { route: '/purchasing', labelKey: 'nav.purchasing', icon: 'pi pi-truck' },
    { route: '/customers', labelKey: 'nav.customers', icon: 'pi pi-address-book' },
    { route: '/branches', labelKey: 'nav.branches', icon: 'pi pi-building', ownerOnly: true },
    { route: '/users', labelKey: 'nav.users', icon: 'pi pi-users', ownerOnly: true },
    { route: '/alerts', labelKey: 'nav.alerts', icon: 'pi pi-bell' },
  ];

  protected readonly visibleNavItems = computed(() =>
    this.navItems.filter(item => !item.ownerOnly || this.authService.isOwner()),
  );

  protected readonly drawerPosition = computed(() =>
    this.i18n.direction() === 'rtl' ? 'right' : 'left',
  );

  protected readonly showLogoutConfirm = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.sidebarState.closeMobileOnNavigate());
  }

  protected requestLogout(): void {
    this.showLogoutConfirm.set(true);
  }

  protected cancelLogout(): void {
    this.showLogoutConfirm.set(false);
  }

  protected confirmLogout(): void {
    this.showLogoutConfirm.set(false);
    this.sidebarState.closeMobile();
    this.authService.logout();
  }

  protected onNavClick(): void {
    this.sidebarState.closeMobileOnNavigate();
  }

  protected roleIcon(role: string): string {
    switch (role.toUpperCase()) {
      case 'OWNER':
        return 'pi pi-shield';
      case 'PHARMACIST':
        return 'pi pi-user';
      default:
        return 'pi pi-id-card';
    }
  }

  protected roleLabelKey(role: string): string {
    return `roles.${role.toLowerCase()}`;
  }
}
