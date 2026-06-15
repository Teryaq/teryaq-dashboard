import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
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
];
