import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';

interface Transaction {
  id: string;
  cashier: string;
  items: number;
  total: number;
  time: string;
}

interface StockAlert {
  id: string;
  name: string;
  type: 'nearExpiry' | 'lowStock';
  severity: 'high' | 'medium' | 'low';
  detail: string;
}

interface BarData {
  day: string;
  pct: number;
  label: string;
}

interface DrugData {
  name: string;
  pct: number;
  color: string;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [TranslatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  protected readonly salesTotal = signal(18450);
  protected readonly unitsSold = signal(234);
  protected readonly activeAlerts = signal(7);
  protected readonly lowStockItems = signal(12);

  protected readonly weeklySalesData = signal<BarData[]>([
    { day: 'Mon', pct: 55, label: 'EGP 10,200' },
    { day: 'Tue', pct: 72, label: 'EGP 13,300' },
    { day: 'Wed', pct: 48, label: 'EGP 8,880' },
    { day: 'Thu', pct: 90, label: 'EGP 16,650' },
    { day: 'Fri', pct: 65, label: 'EGP 12,025' },
    { day: 'Sat', pct: 38, label: 'EGP 7,030' },
    { day: 'Sun', pct: 100, label: 'EGP 18,450' },
  ]);

  protected readonly topDrugsData = signal<DrugData[]>([
    { name: 'Panadol Extra', pct: 34, color: '#10b981' },
    { name: 'Augmentin 625', pct: 22, color: '#3b82f6' },
    { name: 'Concor 5mg', pct: 18, color: '#f59e0b' },
    { name: 'Lipitor 20mg', pct: 15, color: '#8b5cf6' },
    { name: 'Nexium 40mg', pct: 11, color: '#ef4444' },
  ]);

  protected readonly recentTransactions = signal<Transaction[]>([
    { id: '1042', cashier: 'Ahmed M.', items: 5, total: 420.5, time: '14:32' },
    { id: '1041', cashier: 'Sara K.', items: 2, total: 185.0, time: '14:15' },
    { id: '1040', cashier: 'Ahmed M.', items: 8, total: 930.75, time: '13:58' },
    { id: '1039', cashier: 'Sara K.', items: 1, total: 65.0, time: '13:44' },
    { id: '1038', cashier: 'Ahmed M.', items: 3, total: 278.25, time: '13:21' },
  ]);

  protected readonly stockAlerts = signal<StockAlert[]>([
    { id: 'a1', name: 'Augmentin 625mg × 14', type: 'nearExpiry', severity: 'high', detail: 'Expires in 8 days — 42 units' },
    { id: 'a2', name: 'Concor 5mg × 30', type: 'lowStock', severity: 'medium', detail: '5 units remaining' },
    { id: 'a3', name: 'Nexium 40mg × 28', type: 'nearExpiry', severity: 'medium', detail: 'Expires in 21 days' },
    { id: 'a4', name: 'Paracetamol 500mg', type: 'lowStock', severity: 'low', detail: '18 units remaining' },
  ]);
}
