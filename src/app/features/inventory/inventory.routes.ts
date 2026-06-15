import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inventory-page').then((m) => m.InventoryPage),
  },
];
