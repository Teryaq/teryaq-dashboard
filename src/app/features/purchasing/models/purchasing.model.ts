import { PaginationParams } from '../../../shared/models/paginated-list.model';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {
  isActive: boolean;
}

export interface SupplierSearchParams extends PaginationParams {
  search?: string;
  isActive?: boolean;
}

export type PurchaseOrderStatus = 'Draft' | 'Sent' | 'PartiallyReceived' | 'Received';

export interface PurchaseOrderLine {
  id: string;
  drugId: string;
  drugTradeNameEn: string;
  drugTradeNameAr: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  branchId: string;
  branchName: string;
  supplierId: string;
  supplierName: string;
  orderNumber: string;
  status: PurchaseOrderStatus;
  sentAt: string | null;
  expectedDeliveryDate: string | null;
  notes: string | null;
  lines: PurchaseOrderLine[];
  createdAt: string;
}

export interface CreatePurchaseOrderLineRequest {
  drugId: string;
  quantityOrdered: number;
  unitCost: number;
}

export interface CreatePurchaseOrderRequest {
  branchId: string;
  supplierId: string;
  expectedDeliveryDate: string | null;
  notes: string | null;
  lines: CreatePurchaseOrderLineRequest[];
}

export interface UpdatePurchaseOrderRequest {
  expectedDeliveryDate: string | null;
  notes: string | null;
  lines: CreatePurchaseOrderLineRequest[];
}

export interface ReceivePurchaseOrderLineRequest {
  purchaseOrderLineId: string;
  quantityReceived: number;
  batchNumber: string;
  expiryDate: string;
  sellingPrice: number | null;
  reorderLevel: number;
}

export interface ReceivePurchaseOrderRequest {
  lines: ReceivePurchaseOrderLineRequest[];
}

export interface PurchaseOrderSearchParams extends PaginationParams {
  branchId?: string;
  supplierId?: string;
  status?: PurchaseOrderStatus;
}

export interface SupplierInvoice {
  id: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId: string | null;
  invoiceNumber: string;
  amount: number;
  amountPaid: number;
  outstandingBalance: number;
  issuedAt: string;
  dueAt: string | null;
}

export interface CreateSupplierInvoiceRequest {
  supplierId: string;
  purchaseOrderId: string | null;
  invoiceNumber: string;
  amount: number;
  issuedAt: string;
  dueAt: string | null;
}

export interface UpdateSupplierInvoiceRequest {
  invoiceNumber: string;
  dueAt: string | null;
}

export interface SupplierInvoiceSearchParams extends PaginationParams {
  supplierId?: string;
  hasOutstandingBalance?: boolean;
}

export interface PurchaseReturnLine {
  id: string;
  drugId: string;
  drugTradeNameEn: string;
  drugTradeNameAr: string;
  batchId: string;
  quantity: number;
  unitCost: number;
  creditAmount: number;
}

export interface PurchaseReturn {
  id: string;
  branchId: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId: string | null;
  supplierInvoiceId: string | null;
  returnNumber: string;
  reason: string;
  totalCreditAmount: number;
  returnedAt: string;
  lines: PurchaseReturnLine[];
}

export interface CreatePurchaseReturnLineRequest {
  drugId: string;
  batchId: string;
  quantity: number;
  unitCost: number | null;
}

export interface CreatePurchaseReturnRequest {
  branchId: string;
  supplierId: string;
  purchaseOrderId: string | null;
  supplierInvoiceId: string | null;
  reason: string;
  lines: CreatePurchaseReturnLineRequest[];
}

export interface PurchaseReturnSearchParams extends PaginationParams {
  branchId?: string;
  supplierId?: string;
}
