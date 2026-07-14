import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from '../../../core/auth/services/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { BranchesApiService } from '../../branches/services/branches-api.service';
import { CatalogApiService } from '../../catalog/services/catalog-api.service';
import { InventoryApiService } from '../../inventory/services/inventory-api.service';
import { PosApiService } from '../services/pos-api.service';
import { PosPage } from './pos-page';
import { CustomersApiService } from '../../customers/services/customers-api.service';

describe('PosPage', () => {
  let fixture: ComponentFixture<PosPage>;
  let posApi: {
    getTodaysSales: ReturnType<typeof vi.fn>;
    getSaleById: ReturnType<typeof vi.fn>;
    returnSale: ReturnType<typeof vi.fn>;
    voidSale: ReturnType<typeof vi.fn>;
    getReceipt: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const session = signal({
      accessToken: '',
      refreshToken: '',
      expiresAt: '',
      tenantId: 'tenant-1',
      branchId: 'branch-1',
      role: 'Pharmacist',
      user: {
        id: 'user-1', email: 'pharmacist@example.com', name: 'Pharmacist', role: 'Pharmacist', tenantId: 'tenant-1', branchId: 'branch-1',
      },
    });

    posApi = {
      getTodaysSales: vi.fn(() => of([])),
      getSaleById: vi.fn(),
      returnSale: vi.fn(),
      voidSale: vi.fn(),
      getReceipt: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PosPage],
      providers: [
        {
          provide: AuthService,
          useValue: {
            session: session.asReadonly(),
            isOwner: () => false,
          },
        },
        {
          provide: InventoryApiService,
          useValue: {
            getAllPages: () => of([]),
          },
        },
        {
          provide: CustomersApiService,
          useValue: {
            getAll: () => of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 8 }),
          },
        },
        {
          provide: BranchesApiService,
          useValue: {
            getAll: () => of([]),
          },
        },
        {
          provide: CatalogApiService,
          useValue: {
            getByBarcode: () => of(null),
          },
        },
        {
          provide: PosApiService,
          useValue: posApi,
        },
        {
          provide: NotificationService,
          useValue: {
            showError: () => undefined,
            showSuccess: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PosPage);
    fixture.detectChanges();
  });

  it('renders the POS workspace with a grouped search panel and active invoice', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.pos__search-panel[role="search"]')).not.toBeNull();
    expect(host.querySelectorAll('.pos__search-field').length).toBe(2);
    expect(host.querySelector('.pos__cart[aria-label="Active invoice"]')).not.toBeNull();
  });

  it('renders return, void, and reprint actions for a completed sale receipt', () => {
    const component = fixture.componentInstance as unknown as {
      lastSale: { set: (sale: unknown) => void };
      showReceiptModal: { set: (value: boolean) => void };
    };
    component.lastSale.set(createSale());
    component.showReceiptModal.set(true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('pos.sales.return.action');
    expect(host.textContent).toContain('pos.sales.void.action');
    expect(host.textContent).toContain('pos.sales.receipt.reprint');
  });

  it('caps return quantity at the line remaining quantity', () => {
    const component = fixture.componentInstance as unknown as {
      lastSale: { set: (sale: unknown) => void };
      openReturn: () => void;
      onReturnQuantityInput: (index: number, event: Event) => void;
      returnLines: () => Array<{ quantity: number; maxQuantity: number }>;
    };
    component.lastSale.set(createSale({ quantity: 3, quantityReturned: 1 }));
    component.openReturn();

    const input = document.createElement('input');
    input.value = '99';
    component.onReturnQuantityInput(0, { target: input } as unknown as Event);

    expect(component.returnLines()[0].maxQuantity).toBe(2);
    expect(component.returnLines()[0].quantity).toBe(2);
  });

  it('shows the Owner approval message when voiding returns 403', () => {
    posApi.voidSale.mockReturnValue(throwError(() => ({ status: 403 })));
    const component = fixture.componentInstance as unknown as {
      lastSale: { set: (sale: unknown) => void };
      voidReason: { set: (reason: string) => void };
      submitVoid: () => void;
      ownerApprovalMessage: () => boolean;
    };
    component.lastSale.set(createSale());
    component.voidReason.set('Needs approval');

    component.submitVoid();

    expect(component.ownerApprovalMessage()).toBe(true);
  });
});

function createSale(line?: { quantity: number; quantityReturned: number }) {
  return {
    id: 'sale-1',
    branchId: 'branch-1',
    branchName: 'Main',
    saleNumber: 'TRQ-1',
    cashierUserId: 'user-1',
    total: 100,
    discount: 0,
    grandTotal: 100,
    paymentMethod: 'Cash',
    status: 'Completed',
    voidedAt: null,
    voidApprovedByUserId: null,
    completedAt: '2026-07-14T08:00:00Z',
    customerId: null,
    customerName: null,
    createdAt: '2026-07-14T08:00:00Z',
    lines: [
      {
        id: 'line-1',
        drugId: 'drug-1',
        drugTradeNameEn: 'Drug',
        drugTradeNameAr: 'دواء',
        batchId: 'batch-1',
        batchNumber: 'B-1',
        quantity: line?.quantity ?? 1,
        quantityReturned: line?.quantityReturned ?? 0,
        unitPrice: 100,
        lineTotal: 100,
      },
    ],
  };
}
