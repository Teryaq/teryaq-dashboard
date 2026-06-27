# Teryaq Dashboard — CLAUDE.md

Angular 21 SPA (standalone components, no NgModules) for a pharmacy management system.
Supports English and Arabic (RTL), dark/light theme, and multi-branch/multi-tenant auth.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone, no NgModules) |
| Language | TypeScript 5.9 (strict mode) |
| Routing | Angular Router — lazy-loaded, functional guards |
| State | Angular Signals (`signal`, `computed`, `effect`) |
| HTTP | `HttpClient` + functional interceptors via `ApiService` |
| Forms | Reactive Forms (`FormBuilder.nonNullable`) |
| UI | PrimeNG 21 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| i18n | Custom `I18nService` (en / ar) |
| Testing | Vitest |
| Build | Angular CLI + Esbuild |

---

## Project Structure

```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors — never import between features
│   │   ├── api/                 # ApiService, error interceptor, error mapper, SKIP_ERROR_TOAST token
│   │   ├── auth/                # AuthService, AuthApiService, TokenStorageService, guards, interceptors
│   │   ├── i18n/                # I18nService, I18nApiService, translate pipe
│   │   ├── layout/              # SidebarStateService
│   │   ├── notifications/       # NotificationService (toast wrapper around PrimeNG MessageService)
│   │   └── theme/               # ThemeService, teryaq PrimeNG preset
│   │
│   ├── features/                # One folder per product domain — all lazy-loaded
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── pos/
│   │   ├── alerts/
│   │   ├── branches/
│   │   ├── catalog/
│   │   ├── customers/
│   │   ├── labels/
│   │   ├── reports/
│   │   ├── substitutions/
│   │   ├── suppliers/
│   │   └── users/
│   │       ├── pages/           # One page component per route
│   │       ├── components/      # Feature-private components (each in its own subfolder)
│   │       ├── services/        # Feature API services
│   │       ├── models/          # TypeScript interfaces/types
│   │       └── <feature>.routes.ts
│   │
│   ├── shared/                  # Reusable across features
│   │   ├── components/          # App-wide UI pieces (app-logo, app-navbar, app-sidebar, app-topbar)
│   │   │   └── <component-name>/
│   │   │       ├── <component-name>.ts
│   │   │       ├── <component-name>.html
│   │   │       └── <component-name>.css
│   │   ├── layout/
│   │   │   ├── auth-layout/     # Wraps /auth pages (gradient background)
│   │   │   └── main-layout/     # Wraps authenticated pages (sidebar + topbar)
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── models/              # Shared interfaces
│   │
│   ├── app.ts                   # Root component
│   ├── app.routes.ts            # Top-level routes (lazy-loads each feature)
│   ├── app.config.ts            # provideRouter, provideHttpClient, etc.
│   ├── app.html
│   └── app.css
│
├── assets/
│   └── i18n/
│       ├── en.json
│       └── ar.json
│
├── environments/
│   └── environment.ts           # API base URL: https://teryaq.runasp.net/api/v1
│
├── main.ts
└── styles.css                   # Global Tailwind + CSS custom properties + theme tokens
```

---

## How to Add a New Feature

### 1. Create the folder structure

```
src/app/features/<feature-name>/
├── pages/
│   ├── <feature-name>-page.ts
│   ├── <feature-name>-page.html
│   └── <feature-name>-page.css
├── components/               # Only when the page needs sub-components
│   └── <component-name>/
│       ├── <component-name>.ts
│       ├── <component-name>.html
│       └── <component-name>.css
├── services/
│   └── <feature-name>-api.service.ts
├── models/
│   └── <feature-name>.model.ts
└── <feature-name>.routes.ts
```

### 2. Create the routes file

```typescript
// features/customers/customers.routes.ts
import { Routes } from '@angular/router';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/customers-page').then(m => m.CustomersPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/customer-detail-page').then(m => m.CustomerDetailPage),
  },
];
```

### 3. Register in `app.routes.ts`

Add inside the `main-layout` children array (do NOT add `authGuard` again — it is inherited):

```typescript
{
  path: 'customers',
  loadChildren: () =>
    import('./features/customers/customers.routes').then(m => m.CUSTOMERS_ROUTES),
},
```

### 4. Add i18n keys to both locale files

`src/assets/i18n/en.json` and `src/assets/i18n/ar.json`:
```json
{
  "customers": {
    "page": { "title": "Customers" },
    "list": { "empty": "No customers found" },
    "form": { "name": "Name", "phone": "Phone" }
  }
}
```

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `login-page.ts`, `customers-api.service.ts` |
| Classes / Components | PascalCase | `LoginPage`, `CustomerListComponent` |
| Component selectors | `app-` prefix | `app-login-page`, `app-customer-list` |
| Route constant | `SCREAMING_SNAKE_ROUTES` | `CUSTOMERS_ROUTES` |
| Services | PascalCase + `.service.ts` | `CustomersApiService` |
| Models file | `<feature>.model.ts` | `customers.model.ts` |
| i18n keys | dot-notation hierarchy | `customers.list.title` |
| localStorage keys | `teryaq.` prefix | `teryaq.auth`, `teryaq.locale` |

---

## Component Rules

- **No `standalone: true`** in the decorator — it is the default in Angular v20+ and must be omitted
- **`OnPush`** change detection always
- **`inject()`** for DI — never constructor injection
- **Signals** for all local mutable state
- **`input()` / `output()` functions** — not `@Input()` / `@Output()` decorators
- **`@if` / `@for` / `@switch`** native control flow — not `*ngIf`, `*ngFor`, `*ngSwitch`
- **`class` bindings** — not `ngClass`
- **`style` bindings** — not `ngStyle`
- **No `@HostBinding` / `@HostListener`** — put host bindings in the `host` object of the decorator
- **`NgOptimizedImage`** for all static images (not inline base64)

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ /* only what this template uses */ ],
  templateUrl: './example.html',
  styleUrl: './example.css',
})
export class ExampleComponent {
  private readonly someService = inject(SomeService);
  protected readonly isLoading = signal(false);
}
```

---

## Page Component Template

Pages live in `features/<feature>/pages/`:

```typescript
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ExampleApiService } from '../services/example-api.service';

@Component({
  selector: 'app-example-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './example-page.html',
  styleUrl: './example-page.css',
})
export class ExamplePage {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly exampleApi = inject(ExampleApiService);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.exampleApi.create(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.isLoading.set(false),
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('example.errors.saveFailed');
        },
      });
  }
}
```

---

## Service Rules (Feature API Services)

- `providedIn: 'root'`
- Inject `ApiService` — never `HttpClient` directly
- Return typed `Observable<T>` — no `any`
- Method names: `getAll`, `getById`, `create`, `update`, `delete`

```typescript
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { Customer, CreateCustomerDto } from '../models/customers.model';

@Injectable({ providedIn: 'root' })
export class CustomersApiService {
  private readonly api = inject(ApiService);

  getAll(): Observable<Customer[]>            { return this.api.get('/customers'); }
  getById(id: string): Observable<Customer>  { return this.api.get(`/customers/${id}`); }
  create(dto: CreateCustomerDto): Observable<Customer> { return this.api.post('/customers', dto); }
  update(id: string, dto: Partial<CreateCustomerDto>): Observable<Customer> { return this.api.put(`/customers/${id}`, dto); }
  delete(id: string): Observable<void>       { return this.api.delete(`/customers/${id}`); }
}
```

---

## Model Rules

```typescript
// features/customers/models/customers.model.ts

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  email?: string;
}
```

- `interface` for data shapes, `type` for unions/aliases
- Request bodies suffixed with `Dto` (e.g., `CreateCustomerDto`)
- Never `any` — use `unknown` when type is truly dynamic

---

## Styling Rules

- **Tailwind utility classes first** in templates
- **CSS custom properties** for colors (defined in `styles.css`):
  - `--color-primary`, `--color-secondary`, `--surface-ground`, `--text-color`
- Component `.css` files for layout only (flex/grid, dimensions) — do not duplicate utilities
- **Logical CSS properties** for RTL: `padding-inline`, `margin-inline-start`, `inset-inline-end`
- **`dark:` prefix** for dark mode (toggled via `.dark` on `<html>`)
- Never hardcode color hex values

---

## i18n Rules

- All user-visible text must use the `translate` pipe — no hardcoded strings in templates
- Add keys to **both** `en.json` and `ar.json` at the same time
- Key hierarchy: `<feature>.<page/section>.<label>`
- Pipe usage: `{{ 'customers.list.title' | translate }}`
- TypeScript usage: `this.i18n.translate('customers.list.title')`

---

## Accessibility

- Must pass all AXE checks
- Must meet WCAG AA: focus management, color contrast, ARIA attributes

---

## Core Services Quick Reference

| Service | Location | Purpose |
|---|---|---|
| `ApiService` | `core/api` | `get`, `post`, `put`, `delete` — wraps HttpClient with base URL |
| `AuthService` | `core/auth/services` | Session signals, `login()`, `logout()`, `isAuthenticated()` |
| `I18nService` | `core/i18n` | `translate()`, `locale` signal, `direction` computed |
| `ThemeService` | `core/theme` | `theme` signal, `toggleTheme()` |
| `NotificationService` | `core/notifications` | `showSuccess()`, `showError()`, `showHttpError()` |
| `SidebarStateService` | `core/layout` | Sidebar collapsed/mobile state signals |

---

## Error Handling

1. `errorInterceptor` shows a global toast automatically — no extra code needed for most cases
2. For field-level errors: map with `mapApiError(error)` and apply to form controls
3. To suppress the global toast for one call: pass `SKIP_ERROR_TOAST` via `HttpContext`

---

## Routing Layouts

| Layout | Routes | Guards |
|---|---|---|
| `AuthLayout` | `/auth/login`, `/auth/register` | `guestGuard` |
| `MainLayout` | everything else | `authGuard` |

Feature routes inside `MainLayout` inherit `authGuard` — do not re-apply it inside feature route files.

---

## Checklist: New Feature

- [ ] Create `src/app/features/<feature>/` with all 5 subfolders (`pages`, `components`, `services`, `models`, routes file)
- [ ] `<feature>.model.ts` — interfaces and DTOs, no `any`
- [ ] `<feature>-api.service.ts` — wraps `ApiService`, typed returns
- [ ] Page component — no `standalone: true`, `OnPush`, `inject()`, signals
- [ ] `<feature>.routes.ts` — exports `FEATURE_ROUTES`
- [ ] Register in `app.routes.ts` under `main-layout` children with `loadChildren`
- [ ] i18n keys added to both `en.json` and `ar.json`
- [ ] RTL checked (logical CSS properties used)
- [ ] Dark mode checked (`dark:` Tailwind prefix)
- [ ] No `HttpClient` injected directly in features
- [ ] No hardcoded user-visible strings in templates
