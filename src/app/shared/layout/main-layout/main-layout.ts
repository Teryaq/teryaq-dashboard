import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarStateService } from '../../../core/layout/sidebar-state.service';
import { AppSidebar } from '../../components/app-sidebar/app-sidebar';
import { AppTopbar } from '../../components/app-topbar/app-topbar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, AppSidebar, AppTopbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  protected readonly sidebarState = inject(SidebarStateService);
}
