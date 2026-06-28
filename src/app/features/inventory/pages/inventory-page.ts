import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';

interface DrugRow {
  id: string;
  tradeName: string;
  genericName: string;
  batchNo: string;
  expiry: string;
  qty: number;
  cost: number;
  price: number;
  status: 'ok' | 'nearExpiry' | 'expired';
}

@Component({
  selector: 'app-inventory-page',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inventory-page.html',
  styleUrl: './inventory-page.css',
})
export class InventoryPage {
  protected readonly searchQuery = signal('');

  private readonly allDrugs = signal<DrugRow[]>([
    { id: '1', tradeName: 'Panadol Extra', genericName: 'Paracetamol 500mg', batchNo: 'B2024-01', expiry: '2026-09-01', qty: 120, cost: 18, price: 27, status: 'ok' },
    { id: '2', tradeName: 'Augmentin 625', genericName: 'Amoxicillin/Clavulanate', batchNo: 'B2024-02', expiry: '2025-08-15', qty: 42, cost: 68, price: 95, status: 'nearExpiry' },
    { id: '3', tradeName: 'Concor 5mg', genericName: 'Bisoprolol Fumarate', batchNo: 'B2024-03', expiry: '2027-01-10', qty: 5, cost: 34, price: 52, status: 'ok' },
    { id: '4', tradeName: 'Nexium 40mg', genericName: 'Esomeprazole', batchNo: 'B2023-11', expiry: '2025-06-01', qty: 18, cost: 55, price: 80, status: 'expired' },
    { id: '5', tradeName: 'Lipitor 20mg', genericName: 'Atorvastatin', batchNo: 'B2024-04', expiry: '2027-03-20', qty: 90, cost: 42, price: 65, status: 'ok' },
    { id: '6', tradeName: 'Glucophage 500', genericName: 'Metformin HCl', batchNo: 'B2024-05', expiry: '2026-12-01', qty: 200, cost: 12, price: 18, status: 'ok' },
  ]);

  protected readonly filteredDrugs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.allDrugs();
    return this.allDrugs().filter(d =>
      d.tradeName.toLowerCase().includes(q) ||
      d.genericName.toLowerCase().includes(q) ||
      d.batchNo.toLowerCase().includes(q),
    );
  });

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }
}
