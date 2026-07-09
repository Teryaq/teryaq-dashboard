import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { BranchesApiService } from '../../branches/services/branches-api.service';
import { CatalogApiService } from '../../catalog/services/catalog-api.service';
import { InventoryApiService } from '../../inventory/services/inventory-api.service';
import { PosApiService } from '../services/pos-api.service';
import { PosPage } from './pos-page';

describe('PosPage', () => {
  let fixture: ComponentFixture<PosPage>;

  beforeEach(async () => {
    const session = signal({
      accessToken: '',
      refreshToken: '',
      expiresAt: '',
      tenantId: 'tenant-1',
      branchId: 'branch-1',
      role: 'Pharmacist',
    });

    await TestBed.configureTestingModule({
      imports: [PosPage],
      providers: [
        {
          provide: AuthService,
          useValue: {
            session: session.asReadonly(),
          },
        },
        {
          provide: InventoryApiService,
          useValue: {
            getAll: () =>
              of({
                items: [],
                totalCount: 0,
                pageNumber: 1,
                pageSize: 500,
              }),
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
          useValue: {
            getTodaysSales: () => of([]),
          },
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
});
