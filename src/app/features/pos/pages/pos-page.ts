import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { Subject, catchError, debounceTime, finalize, of, switchMap } from 'rxjs';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/services/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { InventoryApiService } from '../../inventory/services/inventory-api.service';
import { StockBatch } from '../../inventory/models/inventory.model';
import { BranchesApiService } from '../../branches/services/branches-api.service';
import { Branch } from '../../branches/models/branches.model';
import { CatalogApiService } from '../../catalog/services/catalog-api.service';
import { PosApiService } from '../services/pos-api.service';
import { SaleDto, TodaySaleSummaryDto } from '../models/sale.model';
import { CustomersApiService } from '../../customers/services/customers-api.service';
import { Customer } from '../../customers/models/customer.model';

/** A drug row aggregated from one or more stock batches for the same drug. */
interface DrugRow {
  /** The drug GUID — sent as `drugId` in CreateSaleDto.items. */
  id: string;
  tradeName: string;
  genericName: string;
  /** Selling price from the first available batch (EGP). */
  price: number;
  /** Total qty on hand across all batches for this drug at the branch. */
  qty: number;
  status: 'ok' | 'low' | 'out';
}

interface CartItem {
  drug: DrugRow;
  quantity: number;
}

interface ReturnLineDraft {
  saleLineId: string;
  label: string;
  maxQuantity: number;
  quantity: number;
  restockToInventory: boolean;
}

@Component({
  selector: 'app-pos-page',
  imports: [TranslatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pos-page.html',
  styleUrl: './pos-page.css',
})
export class PosPage {
  private readonly inventoryApi = inject(InventoryApiService);
  private readonly branchesApi = inject(BranchesApiService);
  private readonly catalogApi = inject(CatalogApiService);
  private readonly posApi = inject(PosApiService);
  private readonly customersApi = inject(CustomersApiService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly showReceiptModal = signal(false);
  protected readonly showReturnModal = signal(false);
  protected readonly showVoidModal = signal(false);
  protected readonly lastSale = signal<SaleDto | null>(null);
  protected readonly receiptPrintedAt = signal<string | null>(null);
  protected readonly returnReason = signal('');
  protected readonly voidReason = signal('');
  protected readonly returnLines = signal<ReturnLineDraft[]>([]);
  protected readonly lastRefundAmount = signal<number | null>(null);
  protected readonly ownerApprovalMessage = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly discount = signal(0);
  protected readonly cartItems = signal<CartItem[]>([]);
  protected readonly todaysSales = signal<TodaySaleSummaryDto[]>([]);
  protected readonly branchMissing = signal(false);
  protected readonly ownerBranches = signal<Branch[]>([]);
  protected readonly isOwner = this.authService.isOwner;
  protected readonly customerResults = signal<Customer[]>([]);
  protected readonly selectedCustomer = signal<Customer | null>(null);
  private readonly customerSearch = new Subject<string>();

  /** Resolved branch for this session — from JWT claim or first active branch. */
  protected readonly activeBranchId = signal<string | null>(
    this.authService.session()?.branchId ?? null,
  );

  private readonly allDrugRows = signal<DrugRow[]>([]);

  protected readonly filteredDrugs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.allDrugRows();
    return this.allDrugRows().filter(
      d =>
        d.tradeName.toLowerCase().includes(q) ||
        d.genericName.toLowerCase().includes(q),
    );
  });

  protected readonly subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.drug.price * item.quantity, 0),
  );

  protected readonly grandTotal = computed(() =>
    Math.max(0, this.subtotal() - this.discount()),
  );

  protected readonly cartItemCount = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0),
  );

  protected readonly canReturnCurrentSale = computed(() => {
    const sale = this.lastSale();
    return !!sale && sale.status === 'Completed' && sale.lines.some(line => this.remainingReturnQty(line) > 0);
  });

  protected readonly canVoidCurrentSale = computed(() => this.lastSale()?.status === 'Completed');

  protected readonly todayGrandTotal = computed(() =>
    this.todaysSales().reduce((sum, s) => sum + s.grandTotal, 0),
  );

  /** Cashier display name decoded from the JWT `name` claim. */
  protected readonly cashierName = computed<string>(() => {
    const userName = this.authService.session()?.user?.name;
    if (userName) return userName;
    const token = this.authService.session()?.accessToken;
    if (!token) return '—';
    try {
      const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(b64)) as Record<string, unknown>;
      return (
        (payload['name'] as string) ??
        (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] as string) ??
        (payload['email'] as string) ??
        '—'
      );
    } catch {
      return '—';
    }
  });

  constructor() {
    this.customerSearch
      .pipe(
        debounceTime(250),
        switchMap(search =>
          this.customersApi
            .getAll({ search: search || undefined, pageSize: 8 })
            .pipe(catchError(() => of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 8 }))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => this.customerResults.set(result.items));

    if (!this.activeBranchId()) {
      if (this.authService.isOwner()) {
        this.branchesApi
          .getAll()
          .pipe(catchError(() => of([])), takeUntilDestroyed(this.destroyRef))
          .subscribe(branches => {
            this.ownerBranches.set(branches.filter(branch => branch.isActive));
            const first = branches.find(branch => branch.isActive);
            if (!first) {
              this.branchMissing.set(true);
              this.isLoading.set(false);
              return;
            }
            this.activeBranchId.set(first.id);
            this.loadInventory();
            this.loadTodaysSales();
          });
      } else {
        this.branchMissing.set(true);
        this.isLoading.set(false);
      }
    } else {
      this.loadInventory();
      this.loadTodaysSales();
    }
  }

  // ── Data loading ──────────────────────────────────────────────────

  private loadInventory(): void {
    const branchId = this.activeBranchId() ?? undefined;
    this.inventoryApi
      .getAllPages({ branchId })
      .pipe(
        catchError(() => {
          this.isLoading.set(false);
          return of([] as StockBatch[]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(items => {
        this.allDrugRows.set(this.aggregateBatches(items));
        this.isLoading.set(false);
      });
  }

  private loadTodaysSales(): void {
    const branchId = this.activeBranchId() ?? undefined;
    this.posApi
      .getTodaysSales(branchId)
      .pipe(
        catchError(() => of([])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(sales => this.todaysSales.set(sales));
  }

  /**
   * Aggregates stock batches by drugId into POS grid rows.
   * Multiple batches of the same drug are merged: qty is summed,
   * price is taken from the first batch with a positive sellingPrice.
   */
  private aggregateBatches(batches: StockBatch[]): DrugRow[] {
    const map = new Map<string, DrugRow>();
    for (const batch of batches) {
      const existing = map.get(batch.drugId);
      if (existing) {
        existing.qty += batch.quantityOnHand;
        if (existing.price === 0 && batch.sellingPrice > 0) {
          existing.price = batch.sellingPrice;
        }
      } else {
        map.set(batch.drugId, {
          id: batch.drugId,
          tradeName: batch.drugTradeNameEn,
          genericName: batch.drugTradeNameAr,
          price: batch.sellingPrice ?? 0,
          qty: batch.quantityOnHand,
          status: 'ok',
        });
      }
    }
    // Assign status after aggregation
    for (const row of map.values()) {
      if (row.qty === 0) {
        row.status = 'out';
      } else if (row.qty <= 5) {
        row.status = 'low';
      } else {
        row.status = 'ok';
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.tradeName.localeCompare(b.tradeName),
    );
  }

  // ── Cart ──────────────────────────────────────────────────────────

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onBarcodeScan(event: Event): void {
    const input = event.target as HTMLInputElement;
    const barcode = input.value.trim();
    input.value = '';
    if (!barcode) return;

    this.catalogApi
      .getByBarcode(barcode)
      .pipe(
        catchError(err => {
          if (err?.status === 404) {
            this.notifications.showError('pos.barcode_not_found');
          }
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(drug => {
        if (!drug) return;
        const row = this.allDrugRows().find(d => d.id === drug.id);
        if (!row) {
          this.notifications.showError('pos.barcode_not_in_stock');
          return;
        }
        if (row.status === 'out') {
          this.notifications.showError('pos.checkout.insufficientStock');
          return;
        }
        this.addToCart(row);
      });
  }

  protected onDiscountInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.discount.set(val);
  }

  protected onBranchChange(event: Event): void {
    const branchId = (event.target as HTMLSelectElement).value;
    if (!branchId || branchId === this.activeBranchId()) return;
    this.activeBranchId.set(branchId);
    this.clearCart();
    this.isLoading.set(true);
    this.loadInventory();
    this.loadTodaysSales();
  }

  protected onCustomerSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    if (!value) this.selectedCustomer.set(null);
    this.customerSearch.next(value);
  }

  protected selectCustomer(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.customerResults.set([]);
  }

  protected addToCart(drug: DrugRow): void {
    if (drug.status === 'out') return;
    this.cartItems.update(items => {
      const existing = items.find(i => i.drug.id === drug.id);
      if (existing) {
        return items.map(i =>
          i.drug.id === drug.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...items, { drug, quantity: 1 }];
    });
  }

  protected increment(id: string): void {
    this.cartItems.update(items =>
      items.map(i => (i.drug.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
    );
  }

  protected decrement(id: string): void {
    this.cartItems.update(items =>
      items
        .map(i => (i.drug.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter(i => i.quantity > 0),
    );
  }

  protected removeItem(id: string): void {
    this.cartItems.update(items => items.filter(i => i.drug.id !== id));
  }

  protected clearCart(): void {
    this.cartItems.set([]);
    this.discount.set(0);
  }

  // ── Checkout ──────────────────────────────────────────────────────

  protected checkout(): void {
    const items = this.cartItems();
    if (items.length === 0) return;

    const branchId = this.activeBranchId();
    if (!branchId) {
      this.notifications.showError('errors.unknown');
      return;
    }

    this.isSubmitting.set(true);
    this.posApi
      .createSale({
        branchId,
        items: items.map(i => ({ drugId: i.drug.id, quantity: i.quantity })),
        discount: this.discount(),
        paymentMethod: 'Cash',
        customerId: this.selectedCustomer()?.id ?? null,
      })
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: sale => {
          this.lastSale.set(sale);
          this.showReceiptModal.set(true);
          this.clearCart();
          this.selectedCustomer.set(null);
          // Refresh today's sales and reload inventory (stock has changed)
          this.loadTodaysSales();
          this.isLoading.set(true);
          this.loadInventory();
        },
        error: err => {
          if (err?.status === 409) {
            this.notifications.showError('pos.checkout.insufficientStock');
          }
          // Other errors are handled globally by errorInterceptor
        },
      });
  }

  protected formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected formatReceiptDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  protected viewSale(id: string): void {
    this.posApi
      .getSaleById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(sale => {
        this.lastSale.set(sale);
        this.receiptPrintedAt.set(null);
        this.lastRefundAmount.set(null);
        this.ownerApprovalMessage.set(false);
        this.showReceiptModal.set(true);
      });
  }

  protected closeReceipt(): void {
    this.showReceiptModal.set(false);
    this.closeReturn();
    this.closeVoid();
  }

  protected printReceipt(): void {
    window.print();
  }

  protected reprintReceipt(): void {
    const sale = this.lastSale();
    if (!sale) return;
    this.posApi
      .getReceipt(sale.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(receipt => {
        this.lastSale.set(receipt.sale);
        this.receiptPrintedAt.set(receipt.printedAt);
        window.print();
      });
  }

  protected openReturn(): void {
    const sale = this.lastSale();
    if (!sale) return;
    this.returnReason.set('');
    this.returnLines.set(
      sale.lines
        .map(line => ({
          saleLineId: line.id,
          label: `${line.drugTradeNameEn} / ${line.drugTradeNameAr}`,
          maxQuantity: this.remainingReturnQty(line),
          quantity: 0,
          restockToInventory: true,
        }))
        .filter(line => line.maxQuantity > 0),
    );
    this.showReturnModal.set(true);
  }

  protected closeReturn(): void {
    this.showReturnModal.set(false);
  }

  protected onReturnReasonInput(event: Event): void {
    this.returnReason.set((event.target as HTMLTextAreaElement).value);
  }

  protected onReturnQuantityInput(index: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.returnLines.update(lines =>
      lines.map((line, lineIndex) =>
        lineIndex === index
          ? { ...line, quantity: Math.min(Math.max(0, value || 0), line.maxQuantity) }
          : line,
      ),
    );
  }

  protected toggleReturnRestock(index: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.returnLines.update(lines =>
      lines.map((line, lineIndex) =>
        lineIndex === index ? { ...line, restockToInventory: checked } : line,
      ),
    );
  }

  protected submitReturn(): void {
    const sale = this.lastSale();
    const lines = this.returnLines()
      .filter(line => line.quantity > 0)
      .map(line => ({
        saleLineId: line.saleLineId,
        quantity: line.quantity,
        restockToInventory: line.restockToInventory,
      }));
    if (!sale || !this.returnReason().trim() || lines.length === 0) return;

    this.isSubmitting.set(true);
    this.posApi
      .returnSale(sale.id, { reason: this.returnReason().trim(), lines })
      .pipe(finalize(() => this.isSubmitting.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.lastRefundAmount.set(result.refundAmount);
        this.showReturnModal.set(false);
        this.refreshSaleAndInventory(sale.id);
      });
  }

  protected openVoid(): void {
    this.voidReason.set('');
    this.ownerApprovalMessage.set(false);
    this.showVoidModal.set(true);
  }

  protected closeVoid(): void {
    this.showVoidModal.set(false);
  }

  protected onVoidReasonInput(event: Event): void {
    this.voidReason.set((event.target as HTMLTextAreaElement).value);
  }

  protected submitVoid(): void {
    const sale = this.lastSale();
    if (!sale || !this.voidReason().trim()) return;

    this.ownerApprovalMessage.set(false);
    this.isSubmitting.set(true);
    this.posApi
      .voidSale(sale.id, { reason: this.voidReason().trim() })
      .pipe(finalize(() => this.isSubmitting.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.lastRefundAmount.set(result.refundAmount);
          this.showVoidModal.set(false);
          this.refreshSaleAndInventory(sale.id);
        },
        error: err => {
          if (err?.status === 403) {
            this.ownerApprovalMessage.set(true);
            return;
          }
          throw err;
        },
      });
  }

  protected remainingReturnQty(line: { quantity: number; quantityReturned?: number }): number {
    return Math.max(0, line.quantity - (line.quantityReturned ?? 0));
  }

  protected formatReprintDate(isoString: string): string {
    return new Date(isoString).toLocaleString();
  }

  private refreshSaleAndInventory(saleId: string): void {
    this.posApi
      .getSaleById(saleId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(sale => this.lastSale.set(sale));
    this.loadTodaysSales();
    this.isLoading.set(true);
    this.loadInventory();
  }
}
