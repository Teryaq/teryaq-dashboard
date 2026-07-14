import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiService } from '../../../core/api/api.service';
import { PosApiService } from './pos-api.service';

describe('PosApiService', () => {
  let api: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    api = {
      get: vi.fn(),
      post: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: api }],
    });
  });

  it('calls sale return, void, and receipt endpoints', () => {
    const service = TestBed.inject(PosApiService);
    const returnRequest = {
      reason: 'Customer changed medicine',
      lines: [{ saleLineId: 'line-1', quantity: 1, restockToInventory: true }],
    };
    const voidRequest = { reason: 'Wrong sale' };

    service.returnSale('sale-1', returnRequest);
    service.voidSale('sale-1', voidRequest);
    service.getReceipt('sale-1');

    expect(api.post).toHaveBeenCalledWith('pos/sales/sale-1/return', returnRequest);
    expect(api.post).toHaveBeenCalledWith('pos/sales/sale-1/void', voidRequest);
    expect(api.get).toHaveBeenCalledWith('pos/sales/sale-1/receipt');
  });
});
