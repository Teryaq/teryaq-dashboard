import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-pos-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pos-page.html',
  styleUrl: './pos-page.css',
})
export class PosPage {}
