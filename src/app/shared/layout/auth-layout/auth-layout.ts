import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppNavbar } from '../../components/app-navbar/app-navbar';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, AppNavbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {}
