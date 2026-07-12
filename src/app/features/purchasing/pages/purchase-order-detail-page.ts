import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { PurchaseOrder, PurchaseOrderStatus } from '../models/purchasing.model';
import { PurchaseOrdersApiService } from '../services/purchase-orders-api.service';

@Component({
  selector: 'app-purchase-order-detail-page',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './purchase-order-detail-page.html',
  styleUrl: './purchasing-pages.css',
})
export class PurchaseOrderDetailPage {
  private readonly api = inject(PurchaseOrdersApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly order = signal<PurchaseOrder | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly error = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isReceiveOpen = signal(false);

  protected readonly canSend = computed(() => this.order()?.status === 'Draft');
  protected readonly canReceive = computed(() => {
    const status = this.order()?.status;
    return status === 'Sent' || status === 'PartiallyReceived';
  });

  protected readonly receiveForm = this.fb.group({
    lines: this.fb.array([]),
  });

  protected get receiveLines(): FormArray {
    return this.receiveForm.controls.lines;
  }

  constructor() {
    this.load();
  }

  protected send(): void {
    const order = this.order();
    if (!order) return;
    this.isSubmitting.set(true);
    this.api
      .sendPurchaseOrder(order.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.order.set(updated);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected openReceive(): void {
    const order = this.order();
    if (!order) return;
    this.receiveLines.clear();
    for (const line of order.lines.filter(item => item.quantityReceived < item.quantityOrdered)) {
      this.receiveLines.push(
        this.fb.nonNullable.group({
          purchaseOrderLineId: [line.id, [Validators.required]],
          label: [`${line.drugTradeNameEn} - ${line.drugTradeNameAr}`],
          remaining: [String(line.quantityOrdered - line.quantityReceived)],
          quantityReceived: ['0', [Validators.required, Validators.min(0)]],
          batchNumber: ['', [Validators.required, Validators.maxLength(100)]],
          expiryDate: ['', [Validators.required]],
          sellingPrice: [''],
          reorderLevel: ['0', [Validators.required, Validators.min(0)]],
        }),
      );
    }
    this.isReceiveOpen.set(true);
  }

  protected closeReceive(): void {
    this.isReceiveOpen.set(false);
  }

  protected receive(): void {
    const order = this.order();
    if (!order) return;
    this.receiveForm.markAllAsTouched();
    if (this.receiveForm.invalid) return;
    const lines = this.receiveLines.getRawValue()
      .filter(line => Number(line.quantityReceived) > 0)
      .map(line => ({
        purchaseOrderLineId: line.purchaseOrderLineId,
        quantityReceived: Number(line.quantityReceived),
        batchNumber: line.batchNumber,
        expiryDate: line.expiryDate,
        sellingPrice: line.sellingPrice ? Number(line.sellingPrice) : null,
        reorderLevel: Number(line.reorderLevel),
      }));
    if (!lines.length) return;
    this.isSubmitting.set(true);
    this.api
      .receivePurchaseOrder(order.id, { lines })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.order.set(updated);
          this.isReceiveOpen.set(false);
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false),
      });
  }

  protected statusKey(status: PurchaseOrderStatus): string {
    return `purchasing.orders.status.${status}`;
  }

  private load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set(true);
      this.isLoading.set(false);
      return;
    }
    this.api
      .getPurchaseOrder(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: order => {
          this.order.set(order);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.isLoading.set(false);
        },
      });
  }
}
