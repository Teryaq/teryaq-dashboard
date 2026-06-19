import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-logo.html',
  styleUrl: './app-logo.css',
})
export class AppLogo {
  readonly compact = input(false);
  readonly showSubtitle = input(true);
}
