import { PaginationParams } from '../../../shared/models/paginated-list.model';

export type StockTransferStatus = 'Requested' | 'Dispatched' | 'Received' | 'Rejected';

export interface StockTransferLine {
  id: string;
  drugId: string;
  drugTradeNameEn: string;
  drugTradeNameAr: string;
  batchId: string;
  quantity: number;
}

export interface StockTransfer {
  id: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  transferNumber: string;
  status: StockTransferStatus;
  notes: string | null;
  requestedByUserId: string;
  requestedAt: string;
  dispatchedAt: string | null;
  receivedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  lines: StockTransferLine[];
  createdAt: string;
}

export interface StockTransferLineRequest {
  drugId: string;
  batchId: string;
  quantity: number;
}

export interface CreateStockTransferRequest {
  fromBranchId: string;
  toBranchId: string;
  notes: string | null;
  lines: StockTransferLineRequest[];
}

export interface StockTransferSearchParams extends PaginationParams {
  branchId?: string;
  status?: StockTransferStatus;
}
