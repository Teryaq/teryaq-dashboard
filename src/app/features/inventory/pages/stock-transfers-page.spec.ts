import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { of } from 'rxjs';

import { BranchesApiService } from '../../branches/services/branches-api.service';
import { InventoryApiService } from '../services/inventory-api.service';
import { StockTransfersApiService } from '../services/stock-transfers-api.service';
import { StockTransfersPage } from './stock-transfers-page';

describe('StockTransfersPage', () => {
  let fixture: ComponentFixture<StockTransfersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockTransfersPage],
      providers: [
        {
          provide: StockTransfersApiService,
          useValue: {
            getStockTransfers: () =>
              of({
                items: [],
                totalCount: 0,
                pageNumber: 1,
                pageSize: 20,
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
          provide: InventoryApiService,
          useValue: {
            getAllPages: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockTransfersPage);
    fixture.detectChanges();
  });

  it('renders stock transfer controls and status actions surface', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('[data-testid="stock-transfers-page"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="create-transfer"]')).not.toBeNull();
    expect(host.textContent).toContain('inventory.transfers.title');
  });

  it('uses the compact transfer line layout for batch and quantity inputs', () => {
    const component = fixture.componentInstance as unknown as {
      openCreate: () => void;
    };

    component.openCreate();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.stock-transfer-line')).not.toBeNull();
  });
});
