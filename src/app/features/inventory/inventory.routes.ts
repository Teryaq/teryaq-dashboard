import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inventory-page').then((m) => m.InventoryPage),
  },
  {
    path: 'transfers',
    loadComponent: () =>
      import('./pages/stock-transfers-page').then((m) => m.StockTransfersPage),
  },
  {
    path: 'transfers/:id',
    loadComponent: () =>
      import('./pages/stock-transfer-detail-page').then((m) => m.StockTransferDetailPage),
  },
];
