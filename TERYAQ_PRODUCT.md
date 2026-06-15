# Teryaq (ترياق) — Product Features & Roadmap

> **One sentence:** Teryaq is a cloud pharmacy management platform that helps Egyptian pharmacists
> stop losing money to expired drugs, missed sales, and manual paperwork.

---

## Who Is This For?

| Person | Their biggest pain today |
|---|---|
| **Pharmacy Owner** | Doesn't know what's expiring, what's running out, or how much money was made today |
| **Pharmacist (staff)** | Wastes time searching for drugs, writing receipts by hand, checking prices manually |
| **Multi-branch Owner** | Has no unified view — visits each branch physically to check stock |

---

## Core Value Promises

1. **Never throw away a drug again** — know what expires before it does, act early.
2. **Sell faster** — POS that works in seconds, not minutes.
3. **Know your numbers** — real sales data, not guesses.
4. **One system for everything** — catalog, stock, sales, alerts, all connected.

---

## Features — What's Built Today

### 1. Drug Catalog
A searchable database of **24,868 EDA-approved Egyptian drugs**, plus the ability to add your own drugs manually or import them.

- Search by trade name (Arabic or English), generic name, or barcode
- Filter by source (EDA / Import / Manual) and active/inactive status
- View full drug details: form, strength, pack size, price, manufacturer
- Add custom drugs not in the EDA list
- Activate or deactivate drugs to control what appears at the point of sale
- Pagination for smooth browsing of large catalogs

---

### 2. Inventory Management
Track every box, every batch, every shelf — without a spreadsheet.

- Receive new stock with batch number, expiry date, quantity, and cost price
- Full batch history per drug — know exactly when each shipment arrived
- See all batches sorted by expiry date (oldest first)
- Stock levels update automatically when sales are made
- Per-branch inventory — each branch manages its own stock

---

### 3. Point of Sale (POS)
A fast, clean sales screen designed for busy pharmacists.

- Search by drug name or scan a barcode
- Add multiple items to a cart
- Automatically deducts sold quantity from inventory
- Calculates total, applies discounts if needed
- Print receipt or export to PDF
- Works for both the owner and pharmacist staff

---

### 4. Alerts System
Teryaq watches your inventory 24/7 and alerts you before problems become losses.

- **Near-expiry alert** — notified when a batch is within 30/60/90 days of expiry
- **Low stock alert** — notified when a drug falls below a minimum quantity threshold
- Alerts rated by severity: High / Medium / Low
- Dismiss alerts once handled
- Dashboard shows the count of open alerts at a glance

---

### 5. Dashboard
Your pharmacy's daily health report, visible the moment you log in.

- Today's total sales (revenue + transaction count)
- Open alerts count with urgency indicator
- Total drug catalog size
- Near-expiry drug count
- Quick shortcuts to the most-used actions
- Recent alert list with severity badges

---

### 6. Multi-Branch Management
Run more than one pharmacy location from a single account.

- Register multiple branches under one tenant (pharmacy business)
- Each branch has its own inventory, sales, and alerts
- Staff can be assigned to specific branches
- Owner can see all branches from a unified view

---

### 7. User Roles & Access Control
Not everyone should see everything.

- **Owner** — full access: settings, reports, all branches, user management
- **Pharmacist** — operational access: POS, catalog search, inventory receiving, alerts
- Role is enforced on both the screen and the server — no workarounds

---

### 8. Bilingual Interface (Arabic / English)
Built for Egypt — works in Arabic by default, switches to English in one click.

- Full right-to-left (RTL) layout when in Arabic
- All labels, buttons, and messages translated
- Numbers and dates formatted for the Egyptian locale

---

---

## Features — Suggested Roadmap

> These are ideas organized by business impact. Each is described from the user's perspective.

---

### 🟣 Tier 1 — High Impact, Build Next

#### Supplier & Purchase Order Management
Right now, when you need to restock, you call your supplier and write the order on paper. Teryaq should own that process.

- Maintain a list of your suppliers with contact info and drug catalogs
- Create a purchase order (list of drugs + quantities needed)
- Send the order by WhatsApp or email directly from the system
- When goods arrive, match them to the order — receive only what was delivered
- Track outstanding vs. received orders
- Compare supplier prices over time to find the best deal

**Why it matters:** Pharmacies often overpay because they don't compare prices. A single month of price optimization can pay for the entire subscription.

---

#### Financial Reports & Daily Closing
At the end of each day, the owner needs to know: how much did we make, how much did we spend, what's the profit?

- Daily sales report: total revenue, number of transactions, top-selling drugs
- Monthly and yearly revenue trends with visual charts
- Cost of goods sold (COGS) vs. revenue → gross profit
- Most profitable drugs vs. least profitable
- Shift report: sales per cashier/pharmacist per day
- Export reports to PDF or Excel for accountants

**Why it matters:** Most pharmacy owners in Egypt rely on end-of-day cash counting. Digital reports are their first step toward understanding the business.

---

#### Customer Profiles & Prescription History
Know your repeat customers and serve them better.

- Register a customer by phone number or national ID
- Store their purchase history and chronic medications
- Alert pharmacist if customer is buying a drug they bought recently (possible duplication)
- Customer can call and ask "what did I buy last time?" — pharmacist can look it up instantly
- Track which customers have open prescriptions to fill

**Why it matters:** Chronic disease patients (diabetes, hypertension) come every month. Knowing them builds loyalty and reduces errors.

---

#### Drug Substitution Finder
The drug a customer wants is out of stock — what can you offer instead?

- When searching a drug that has zero stock, automatically suggest bioequivalent alternatives
- Show generic alternatives that are cheaper but therapeutically equivalent
- Filter substitutes by what's actually in stock right now

**Why it matters:** Every "we don't have it" without an alternative is a lost sale AND a lost customer. This feature directly increases revenue.

---

#### Barcode & Price Label Printing
Print shelf labels and pricing stickers directly from the system.

- Generate a barcode for any drug (including manually added drugs)
- Print a price label with: trade name, price, expiry date, batch number
- Print in bulk when receiving a new shipment
- Compatible with standard label printers

**Why it matters:** Manually writing price labels is time-consuming and leads to errors. This is a daily operational need in every pharmacy.

---

### 🔵 Tier 2 — Competitive Advantage

#### Smart Reorder Suggestions
Teryaq learns what you sell and tells you when to reorder — before you run out.

- Analyzes the last 30/60/90 days of sales per drug
- Predicts how many days of stock remain based on average daily sales
- Suggests a reorder quantity automatically
- Sends an alert: "You have 5 days of Panadol left — reorder now"
- One-click to create a purchase order from the suggestion

**Why it matters:** Running out of fast-moving drugs (Panadol, Brufen, insulin) during peak hours is one of the most common and preventable losses in pharmacies.

---

#### Expiry Discount Manager
Instead of throwing away near-expiry drugs, sell them at a discount before they expire.

- Tag near-expiry batches with a custom discount percentage
- At POS, the discounted price is applied automatically when that batch is scanned
- Track how much was recovered from would-have-been-wasted stock
- Generate an "expiry recovery report" monthly

**Why it matters:** This is the core promise of Teryaq. Turning near-expiry waste into recovered revenue is a direct, measurable financial benefit.

---

#### Drug Interaction Checker
Protect your patients and protect yourself from liability.

- When adding multiple drugs to a POS transaction, check for known dangerous interactions
- Show a warning to the pharmacist: "Drug A + Drug B — potential interaction, verify with prescriber"
- Based on publicly available drug interaction databases
- Not a block — just a warning the pharmacist can acknowledge

**Why it matters:** A pharmacist who catches a dangerous interaction gains trust for life. It also protects the pharmacy legally.

---

#### WhatsApp / SMS Notifications
Reach customers where they already are.

- Notify a customer when their reserved drug arrives
- Send a monthly refill reminder for chronic medication patients
- Send a low-stock alert to the owner via WhatsApp even when not logged in
- Automated birthday or health tip messages to build loyalty

**Why it matters:** In Egypt, WhatsApp is how business is done. Connecting the pharmacy to customers via WhatsApp is a massive loyalty driver.

---

#### Employee Management & Shift Tracking
Manage your staff properly, even across branches.

- Add staff members with their role, contact info, and assigned branch
- Track login/logout times as a shift log
- See daily sales per employee (who sold how much)
- Set commissions or bonuses based on sales performance
- Owner can disable access for an employee immediately if they leave

**Why it matters:** For pharmacies with more than 2 staff, accountability and shift management is a real operational need.

---

### 🟡 Tier 3 — Premium / Growth Features

#### Health Insurance Processing
Many Egyptian patients have insurance — processing claims is currently done manually on paper.

- Register insurance providers (Tahya Masr, private insurers, etc.)
- Attach an insurance claim to a sale
- Calculate the patient's copayment vs. insurance coverage
- Track pending insurance reimbursements
- Generate monthly insurance claim reports

**Why it matters:** Pharmacies lose significant revenue on insurance because the manual tracking is too complex. Automating it recaptures that revenue.

---

#### Wholesale / B2B Sales Module
Some pharmacies sell to clinics, hospitals, or other small pharmacies.

- Create B2B customer profiles (clinics, hospitals, other pharmacies)
- Issue a wholesale invoice with different pricing tiers
- Track outstanding payments (credit sales) per B2B customer
- Generate a statement of account for each B2B client

**Why it matters:** Wholesale volume is often 30–50% of revenue for larger pharmacies. Tracking it separately from retail is a real need.

---

#### Online Ordering (Customer-Facing)
Let customers order from your pharmacy through their phone.

- Pharmacy gets a simple public page (e.g., teryaq.app/yourpharmacy)
- Customer searches drugs, adds to cart, submits order
- Pharmacist confirms order, customer picks up or delivery is arranged
- Customer gets WhatsApp confirmation

**Why it matters:** Post-COVID, Egyptians are comfortable ordering medications online. This opens a new revenue channel without needing a separate delivery app.

---

#### Mobile App for Owners
Check your pharmacy numbers from anywhere, on your phone.

- See today's sales, alerts, and stock levels without going to the pharmacy
- Receive push notifications for critical alerts (drug about to expire, stock out)
- Approve purchase orders from the phone
- See which staff member is currently logged in

**Why it matters:** Pharmacy owners are often not physically present. A mobile dashboard that gives them real-time visibility is a strong premium feature.

---

#### AI-Powered Demand Forecasting
Predict which drugs will be in demand before the season changes.

- Analyzes historical sales patterns by month and season
- Predicts demand spikes (e.g., antihistamines in spring, flu medicine in winter)
- Suggests pre-season stocking recommendations
- Alerts when a drug's sales velocity suddenly increases (possible shortage forming)

**Why it matters:** Pharmacies that stock the right drug before demand spikes win market share from competitors who run out.

---

#### Tax & VAT Reports
As Egypt enforces e-invoicing (Fatora Electroneya), pharmacies need to be compliant.

- Tag each sale with VAT rate
- Generate a monthly VAT report ready for the tax authority
- Support for e-invoice format required by the Egyptian Tax Authority (ETA)
- Export in the format required for the pharmacy's accountant

**Why it matters:** Tax compliance is a legal obligation that's becoming increasingly enforced. Being the first pharmacy system to handle this correctly is a major differentiator.

---

---

## Feature Priority Matrix

| Feature | User Value | Build Effort | Suggested Priority |
|---|---|---|---|
| Supplier & Purchase Orders | ⭐⭐⭐⭐⭐ | Medium | **Build next** |
| Financial Reports | ⭐⭐⭐⭐⭐ | Medium | **Build next** |
| Drug Substitution Finder | ⭐⭐⭐⭐⭐ | Low | **Build next** |
| Barcode Label Printing | ⭐⭐⭐⭐ | Low | **Build next** |
| Smart Reorder Suggestions | ⭐⭐⭐⭐⭐ | Medium | Soon |
| Expiry Discount Manager | ⭐⭐⭐⭐⭐ | Low | Soon |
| Customer Profiles | ⭐⭐⭐⭐ | Medium | Soon |
| WhatsApp Notifications | ⭐⭐⭐⭐ | Medium | Soon |
| Drug Interaction Checker | ⭐⭐⭐⭐ | High | Later |
| Employee Management | ⭐⭐⭐ | Medium | Later |
| Insurance Processing | ⭐⭐⭐⭐ | High | Later |
| Wholesale / B2B | ⭐⭐⭐ | High | Later |
| Online Ordering | ⭐⭐⭐ | Very High | Future |
| Mobile App | ⭐⭐⭐⭐ | Very High | Future |
| AI Demand Forecasting | ⭐⭐⭐ | Very High | Future |
| Tax / VAT Reports | ⭐⭐⭐⭐ | Medium | Future |

---

## Monetization Ideas

| Tier | What's Included | Suggested Price |
|---|---|---|
| **Free** | 1 branch, catalog only, manual inventory | Free forever |
| **Starter** | 1 branch, POS + inventory + alerts + reports | ~200 EGP/month |
| **Growth** | Up to 3 branches + suppliers + customer profiles + WhatsApp | ~450 EGP/month |
| **Pro** | Unlimited branches + insurance + wholesale + mobile app | ~900 EGP/month |

> 💡 **Freemium works here.** Pharmacists need to feel the value before paying. Let them start free,
> then the first time they avoid throwing away EGP 2,000 of expired drugs, the subscription pays for itself.

---

## What Makes Teryaq Different from Competitors

| Feature | Teryaq | Generic ERP | Paper/Excel |
|---|---|---|---|
| EDA drug database pre-loaded | ✅ 24,868 drugs | ❌ Manual entry | ❌ |
| Near-expiry alerts | ✅ Automated | ❌ Manual | ❌ |
| Arabic-first, RTL | ✅ Native | 🟡 Sometimes | ✅ |
| Multi-branch in one account | ✅ | 🟡 Expensive add-on | ❌ |
| Cloud — no IT setup needed | ✅ | ❌ Usually local | ✅ |
| Built for Egyptian regulations | ✅ | ❌ Generic | — |
| Mobile-friendly | ✅ | 🟡 Sometimes | ❌ |

---

*Document last updated: June 2026*
