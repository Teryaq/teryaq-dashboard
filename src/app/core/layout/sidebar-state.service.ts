import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'teryaq.sidebar.collapsed';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  private readonly collapsedState = signal(this.readCollapsed());
  private readonly mobileOpenState = signal(false);

  readonly collapsed = this.collapsedState.asReadonly();
  readonly mobileOpen = this.mobileOpenState.asReadonly();

  toggleCollapsed(): void {
    const next = !this.collapsedState();
    this.collapsedState.set(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  openMobile(): void {
    this.mobileOpenState.set(true);
  }

  closeMobile(): void {
    this.mobileOpenState.set(false);
  }

  closeMobileOnNavigate(): void {
    this.closeMobile();
  }

  onMobileDrawerVisibleChange(visible: boolean): void {
    this.mobileOpenState.set(visible);
  }

  private readCollapsed(): boolean {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }
}
