import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';

interface Drug {
  id: string;
  tradeName: string;
  genericName: string;
  price: number;
  qty: number;
  status: 'ok' | 'low' | 'out';
}

interface CartItem {
  drug: Drug;
  quantity: number;
}

@Component({
  selector: 'app-pos-page',
  imports: [TranslatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pos-page.html',
  styleUrl: './pos-page.css',
})
export class PosPage {
  protected readonly searchQuery = signal('');
  protected readonly discount = signal(0);
  protected readonly cartItems = signal<CartItem[]>([]);

  private readonly allDrugs = signal<Drug[]>([
    { id: '1', tradeName: 'Panadol Extra', genericName: 'Paracetamol 500mg', price: 27, qty: 120, status: 'ok' },
    { id: '2', tradeName: 'Augmentin 625', genericName: 'Amoxicillin/Clavulanate', price: 95, qty: 8, status: 'low' },
    { id: '3', tradeName: 'Concor 5mg', genericName: 'Bisoprolol Fumarate', price: 52, qty: 5, status: 'low' },
    { id: '4', tradeName: 'Nexium 40mg', genericName: 'Esomeprazole', price: 80, qty: 0, status: 'out' },
    { id: '5', tradeName: 'Lipitor 20mg', genericName: 'Atorvastatin', price: 65, qty: 90, status: 'ok' },
    { id: '6', tradeName: 'Glucophage 500', genericName: 'Metformin HCl', price: 18, qty: 200, status: 'ok' },
    { id: '7', tradeName: 'Inderal 40mg', genericName: 'Propranolol HCl', price: 38, qty: 60, status: 'ok' },
    { id: '8', tradeName: 'Cataflam 50mg', genericName: 'Diclofenac Potassium', price: 45, qty: 0, status: 'out' },
    { id: '9', tradeName: 'Ventolin 100', genericName: 'Salbutamol', price: 72, qty: 30, status: 'ok' },
  ]);

  protected readonly filteredDrugs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.allDrugs();
    return this.allDrugs().filter(d =>
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

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onDiscountInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.discount.set(val);
  }

  protected addToCart(drug: Drug): void {
    if (drug.status === 'out') return;
    this.cartItems.update(items => {
      const existing = items.find(i => i.drug.id === drug.id);
      if (existing) {
        return items.map(i => i.drug.id === drug.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...items, { drug, quantity: 1 }];
    });
  }

  protected increment(id: string): void {
    this.cartItems.update(items =>
      items.map(i => i.drug.id === id ? { ...i, quantity: i.quantity + 1 } : i),
    );
  }

  protected decrement(id: string): void {
    this.cartItems.update(items =>
      items
        .map(i => i.drug.id === id ? { ...i, quantity: i.quantity - 1 } : i)
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
}
