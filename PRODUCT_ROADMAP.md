# Teryaq Product Roadmap

Operational pharmacy system for Egyptian independent pharmacies and small multi-branch chains. This roadmap guides **teryaq-dashboard** from an inventory-focused dashboard toward a full daily-operations platform.

**North star:** protect money, keep POS running, and make every stock movement traceable.

---

## Summary

Build Teryaq into an operational pharmacy system, not only an inventory dashboard. The first priorities should protect money, keep POS running, and make stock movement traceable. Target Egyptian independent pharmacies and small multi-branch chains.

---

## Phase 1 — Essential Daily Operations

- Add suppliers, purchase orders, supplier invoices, purchase returns, costs, and outstanding balances.
- Add sales returns, refunds, voiding with owner approval, receipt reprinting, and return-to-stock rules.
- Add stock transfers between branches with requested, dispatched, received, and rejected states.
- Add stock adjustments with mandatory reasons, cycle counts, damaged/expired stock write-offs, and complete movement history.
- Add cashier shifts with opening cash, closing reconciliation, expenses, shortages, and overages.
- Add configurable permissions beyond Owner/Pharmacist: cashier, inventory manager, branch manager, and accountant.
- Make POS resilient with barcode-first navigation, keyboard shortcuts, customer creation, suspended carts, and safe retry after network failure.

---

## Phase 2 — Purchasing and Expiry Intelligence

- Suggest purchase quantities using sales velocity, current stock, lead time, reorder level, and seasonality.
- Show expiring-stock value, expected loss, dead stock, and recommended inter-branch transfers.
- Support supplier-specific cost history, discounts, bonus quantities, payment terms, and preferred suppliers.
- Add FEFO visibility so pharmacists can see which batch will be dispensed.
- Add configurable alert escalation and daily owner summaries.
- Add product alternatives based on generic name, strength, dosage form, and available inventory.

---

## Phase 3 — Financial and Management Reporting

- Add daily profit, gross margin, cost of goods sold, discounts, refunds, taxes, expenses, and net cash reporting.
- Provide branch comparison, pharmacist performance, hourly sales, top/slow products, and stock-turnover reports.
- Add cash, card, wallet, mixed-payment, and credit-sale support.
- Export reports and accounting data to CSV/PDF.
- Add immutable audit logs for prices, discounts, stock, users, refunds, and settings.
- Provide scheduled owner reports with branch-level summaries.

---

## Phase 4 — Customer and Prescription Services

- Add customer purchase history, allergies, chronic medications, notes, and consent-controlled profiles.
- Add loyalty points, membership discounts, customer credit limits, and account balances.
- Store prescriptions securely and link them to dispensing records.
- Add refill reminders and repeat-prescription workflows with explicit customer consent.
- Add delivery orders with address, status, assigned courier, payment collection, and proof of delivery.
- Add customer segmentation without exposing sensitive medical information unnecessarily.

---

## Phase 5 — Reliability and Platform Capabilities

- Add offline-capable POS with an encrypted local queue and conflict-safe synchronization.
- Add automatic backups, restore testing, monitoring, and a visible system-status page.
- Add MFA for owners, session/device management, login alerts, and privileged-action confirmation.
- Add tenant-configurable receipt, currency, tax, timezone, alert, and inventory policies.
- Add bulk import/export for drugs, inventory, customers, suppliers, and opening balances.
- Add onboarding checklists and a demo-data mode for new pharmacies.

---

## Important Interfaces and Data Models

- Introduce `Supplier`, `PurchaseOrder`, `SupplierInvoice`, `StockTransfer`, `StockMovement`, `StockCount`, `Shift`, `Expense`, `SaleReturn`, and `Payment` APIs.
- Extend sales with return status, multiple payments, shift ID, prescription ID, and approval metadata.
- Preserve append-only stock and financial ledgers; calculated balances must derive from traceable movements.
- Add granular permission policies and require server-side enforcement for every privileged action.
- Keep health-related customer data separated from ordinary loyalty/contact data.

---

## Test and Acceptance Plan

- Verify purchase receipt, FEFO sale, refund, transfer, adjustment, and write-off flows produce correct stock movements.
- Test concurrent sales and transfers so inventory cannot become negative.
- Verify shift totals reconcile with payments, refunds, expenses, and expected cash.
- Test offline checkout recovery, duplicate-request protection, and synchronization conflicts.
- Test tenant and branch isolation, permissions, audit records, and sensitive customer-data access.
- Validate Arabic/English layouts, barcode workflows, printing, accessibility, and mobile responsiveness.

---

## Assumptions and Priorities

- The product serves Egyptian independent pharmacies and small multi-branch chains.
- Supplier purchasing, returns, transfers, shifts, and financial reporting come before loyalty or delivery.
- Teryaq remains cloud-first, while POS eventually gains offline continuity.
- Regulatory, tax, prescription, and controlled-drug requirements must be verified before those modules are released.
