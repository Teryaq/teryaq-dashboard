import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiService } from '../../../core/api/api.service';
import { StockTransfersApiService } from './stock-transfers-api.service';

describe('StockTransfersApiService', () => {
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

  it('calls transfer list, detail, create, and lifecycle endpoints', () => {
    const service = TestBed.inject(StockTransfersApiService);
    const createRequest = {
      fromBranchId: 'branch-1',
      toBranchId: 'branch-2',
      notes: null,
      lines: [{ drugId: 'drug-1', batchId: 'batch-1', quantity: 3 }],
    };

    service.getStockTransfers('branch-1', 'Requested', 2, 10);
    service.getStockTransfer('transfer-1');
    service.createStockTransfer(createRequest);
    service.dispatchStockTransfer('transfer-1');
    service.receiveStockTransfer('transfer-1');
    service.rejectStockTransfer('transfer-1', 'Damaged in transit');

    expect(api.get).toHaveBeenCalledWith('stock-transfers', {
      params: { branchId: 'branch-1', status: 'Requested', pageNumber: 2, pageSize: 10 },
    });
    expect(api.get).toHaveBeenCalledWith('stock-transfers/transfer-1');
    expect(api.post).toHaveBeenCalledWith('stock-transfers', createRequest);
    expect(api.post).toHaveBeenCalledWith('stock-transfers/transfer-1/dispatch', {});
    expect(api.post).toHaveBeenCalledWith('stock-transfers/transfer-1/receive', {});
    expect(api.post).toHaveBeenCalledWith('stock-transfers/transfer-1/reject', {
      reason: 'Damaged in transit',
    });
  });
});
