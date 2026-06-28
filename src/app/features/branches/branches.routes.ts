import { Routes } from '@angular/router';

export const BRANCHES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/branches-page').then(m => m.BranchesPage),
  },
];
