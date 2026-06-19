import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-dashboard-page',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {}
