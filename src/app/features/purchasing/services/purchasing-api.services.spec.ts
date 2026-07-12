import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiService } from '../../../core/api/api.service';
import { PurchaseOrdersApiService } from './purchase-orders-api.service';
import { PurchaseReturnsApiService } from './purchase-returns-api.service';
import { SupplierInvoicesApiService } from './supplier-invoices-api.service';
import { SuppliersApiService } from './suppliers-api.service';

describe('Purchasing API services', () => {
  let api: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    api = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: api }],
    });
  });

  it('calls suppliers endpoints with filters and payloads', () => {
    const service = TestBed.inject(SuppliersApiService);
    const create = { name: 'Supplier', contactPerson: null, phone: null, email: null, address: null };

    service.getSuppliers('med', true, 2, 30);
    service.createSupplier(create);
    service.updateSupplier('supplier-1', { ...create, isActive: false });
    service.deleteSupplier('supplier-1');

    expect(api.get).toHaveBeenCalledWith('suppliers', {
      params: { search: 'med', isActive: true, pageNumber: 2, pageSize: 30 },
    });
    expect(api.post).toHaveBeenCalledWith('suppliers', create);
    expect(api.put).toHaveBeenCalledWith('suppliers/supplier-1', { ...create, isActive: false });
    expect(api.delete).toHaveBeenCalledWith('suppliers/supplier-1');
  });

  it('calls purchase order lifecycle endpoints', () => {
    const service = TestBed.inject(PurchaseOrdersApiService);
    const create = {
      branchId: 'branch-1',
      supplierId: 'supplier-1',
      expectedDeliveryDate: null,
      notes: null,
      lines: [{ drugId: 'drug-1', quantityOrdered: 4, unitCost: 12 }],
    };
    const receive = {
      lines: [
        {
          purchaseOrderLineId: 'line-1',
          quantityReceived: 2,
          batchNumber: 'B-1',
          expiryDate: '2027-01-01',
          sellingPrice: null,
          reorderLevel: 1,
        },
      ],
    };

    service.getPurchaseOrders('branch-1', 'supplier-1', 'Draft', 1, 20);
    service.createPurchaseOrder(create);
    service.sendPurchaseOrder('po-1');
    service.receivePurchaseOrder('po-1', receive);

    expect(api.get).toHaveBeenCalledWith('purchase-orders', {
      params: {
        branchId: 'branch-1',
        supplierId: 'supplier-1',
        status: 'Draft',
        pageNumber: 1,
        pageSize: 20,
      },
    });
    expect(api.post).toHaveBeenCalledWith('purchase-orders', create);
    expect(api.post).toHaveBeenCalledWith('purchase-orders/po-1/send', {});
    expect(api.post).toHaveBeenCalledWith('purchase-orders/po-1/receive', receive);
  });

  it('calls supplier invoice payment endpoint', () => {
    const service = TestBed.inject(SupplierInvoicesApiService);

    service.getSupplierInvoices('supplier-1', true, 3, 10);
    service.recordInvoicePayment('invoice-1', 50);

    expect(api.get).toHaveBeenCalledWith('supplier-invoices', {
      params: {
        supplierId: 'supplier-1',
        hasOutstandingBalance: true,
        pageNumber: 3,
        pageSize: 10,
      },
    });
    expect(api.put).toHaveBeenCalledWith('supplier-invoices/invoice-1/payments', { amount: 50 });
  });

  it('calls purchase return endpoints', () => {
    const service = TestBed.inject(PurchaseReturnsApiService);
    const create = {
      branchId: 'branch-1',
      supplierId: 'supplier-1',
      purchaseOrderId: null,
      supplierInvoiceId: null,
      reason: 'Damaged',
      lines: [{ drugId: 'drug-1', batchId: 'batch-1', quantity: 1, unitCost: null }],
    };

    service.getPurchaseReturns('branch-1', 'supplier-1', 1, 20);
    service.createPurchaseReturn(create);

    expect(api.get).toHaveBeenCalledWith('purchase-returns', {
      params: { branchId: 'branch-1', supplierId: 'supplier-1', pageNumber: 1, pageSize: 20 },
    });
    expect(api.post).toHaveBeenCalledWith('purchase-returns', create);
  });
});
