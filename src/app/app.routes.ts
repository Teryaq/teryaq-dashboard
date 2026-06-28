import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./shared/layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then(
            (m) => m.INVENTORY_ROUTES,
          ),
      },
      {
        path: 'pos',
        loadChildren: () =>
          import('./features/pos/pos.routes').then((m) => m.POS_ROUTES),
      },
      {
        path: 'catalog',
        loadChildren: () =>
          import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES),
      },
      {
        path: 'branches',
        loadChildren: () =>
          import('./features/branches/branches.routes').then((m) => m.BRANCHES_ROUTES),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
