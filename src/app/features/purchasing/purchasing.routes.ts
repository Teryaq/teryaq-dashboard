import { Routes } from '@angular/router';

export const PURCHASING_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'orders' },
  {
    path: 'suppliers',
    loadComponent: () => import('./pages/suppliers-page').then(m => m.SuppliersPage),
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/purchase-orders-page').then(m => m.PurchaseOrdersPage),
  },
  {
    path: 'orders/:id',
    loadComponent: () =>
      import('./pages/purchase-order-detail-page').then(m => m.PurchaseOrderDetailPage),
  },
  {
    path: 'invoices',
    loadComponent: () =>
      import('./pages/supplier-invoices-page').then(m => m.SupplierInvoicesPage),
  },
  {
    path: 'returns',
    loadComponent: () => import('./pages/purchase-returns-page').then(m => m.PurchaseReturnsPage),
  },
];
