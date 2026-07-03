import { Routes } from '@angular/router';

import { ownerGuard } from '../../core/auth/guards/owner.guard';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/catalog-page').then(m => m.CatalogPage),
  },
  {
    path: 'import',
    canActivate: [ownerGuard],
    loadComponent: () =>
      import('./pages/drug-import-page').then(m => m.DrugImportPage),
  },
];
