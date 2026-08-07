# AGENTS.md

## 1. Project Overview

* Project name: **Mahaputra Apps**
* Purpose: Mahaputra Apps adalah dashboard internal untuk membantu Mahaputra Group mengelola proses penjualan mobil bekas, mulai dari kendaraan masuk showroom, modal dan biaya kendaraan, penjualan cash/kredit, pelanggan, biaya operasional, hingga reporting dan analisis keuntungan.
* Primary users:

  * Admin Showroom
  * Owner Showroom
* Product status: **MVP**
* Product requirements: `docs/PRD.md`
* Architecture reference: `docs/ARCHITECTURE.md`
* UI reference: `docs/UI_SPEC.md`

### Product domain summary

Core domain Mahaputra Apps meliputi:

* Vehicle Management
* Vehicle Capital
* Collaborator
* Vehicle Costs
* Vehicle Documents
* Customer
* Sales
* Cash Payment
* Credit Payment
* Operational Expenses
* Employee/PIC
* Master Data
* Dashboard
* Reporting
* PDF/XLSX Export

### Source of truth

Gunakan dokumen berikut dengan urutan prioritas:

1. `docs/PRD.md` untuk product requirement dan business rule.
2. `docs/ARCHITECTURE.md` untuk technical architecture dan dependency rule.
3. `docs/UI_SPEC.md` untuk UI, responsive behavior, component, dan design token.
4. `AGENTS.md` untuk working rules Codex.

Jika terdapat konflik antar dokumen, jangan membuat asumsi diam-diam.

Laporkan konflik sebelum mengubah behavior terkait.

---

# 2. Repository Map

Struktur utama repository:

```text
mahaputra-apps/
│
├── app/
│   ├── Actions/              # Application/use-case actions
│   ├── Services/             # Shared domain/application services
│   ├── Enums/                # Stable domain enums
│   ├── Models/               # Laravel Eloquent models
│   ├── Policies/             # Authorization policies
│   ├── Support/              # Shared backend utilities
│   └── Http/
│       ├── Controllers/      # Thin HTTP controllers
│       ├── Middleware/       # Request middleware
│       └── Requests/         # Laravel Form Requests
│
├── database/
│   ├── factories/            # Test factories
│   ├── migrations/           # Database schema migrations
│   └── seeders/              # Seed/master data
│
├── resources/
│   └── js/
│       ├── Components/       # Reusable global UI components
│       ├── Features/         # Domain-specific frontend modules
│       ├── Layouts/          # Shared application layouts
│       ├── Pages/            # Inertia page components
│       ├── Hooks/            # Reusable React hooks
│       ├── Lib/              # Frontend helpers/utilities
│       └── Types/            # Shared TypeScript types
│
├── routes/
│   ├── web.php               # Web/Inertia routes
│   └── console.php           # CLI routes
│
├── tests/
│   ├── Feature/              # Laravel feature/integration tests
│   └── Unit/                 # Domain/unit tests
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── UI_SPEC.md
│   └── adr/
│
└── AGENTS.md
```

### Important paths

* `app/Actions/`: use-case orchestration.
* `app/Services/`: reusable business/domain services.
* `app/Models/`: persistence models.
* `app/Policies/`: access rules.
* `app/Http/Requests/`: request validation.
* `resources/js/Pages/`: Inertia page components.
* `resources/js/Components/`: reusable UI components.
* `resources/js/Features/`: feature-specific frontend code.
* `database/migrations/`: database schema.
* Tests: `tests/`
* Documentation: `docs/`

Do not create a new top-level folder or architectural pattern unless there is a clear reason and the architecture documentation is updated.

---

# 3. Technology Stack

Use the exact installed versions from `composer.lock` and frontend lockfile.

Do not assume package versions from documentation if the repository already exists.

* Backend: **Laravel**
* Backend language: **PHP**
* Frontend: **React**
* Frontend language: **TypeScript**
* Frontend/backend bridge: **Inertia.js**
* Database: **MySQL 8+**
* ORM: **Laravel Eloquent**
* Styling/UI: **Tailwind CSS**
* Icon library: **Lucide Icons**
* Chart library: **Recharts**
* Authentication: **Laravel Session Authentication**
* Authorization: **Laravel Policies + Middleware / RBAC**
* Backend package manager: **Composer**
* Frontend package manager: **npm**
* Backend testing: **Pest / PHPUnit**
* Frontend testing: **Vitest + React Testing Library**
* End-to-end testing: **Playwright**
* Deployment target: **Web server / VPS or equivalent hosting environment**
* Architecture style: **Modular Monolith**

Do not introduce:

* Microservices.
* Separate REST backend for React.
* GraphQL.
* Redux/global state libraries.
* New UI framework.

unless explicitly approved.

---

# 4. Setup and Commands

Before running commands, inspect:

* `composer.json`
* `package.json`
* README
* existing scripts

and prefer existing repository commands.

## Installation

Typical Laravel + React/Inertia installation:

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate

php artisan migrate
```

Run seeders only when required:

```bash
php artisan db:seed
```

Never assume seeding production data is safe.

---

## Development

Preferred if repository supports the standard Laravel development script:

```bash
composer run dev
```

Otherwise run required processes separately:

```bash
php artisan serve
npm run dev
```

If queue processing is needed:

```bash
php artisan queue:work
```

---

## Build

```bash
npm run build
```

Production PHP dependencies:

```bash
composer install --no-dev --optimize-autoloader
```

---

## Verification

Run commands supported by the repository.

Typical backend tests:

```bash
php artisan test
```

or:

```bash
./vendor/bin/pest
```

Frontend tests:

```bash
npm run test
```

Lint:

```bash
npm run lint
```

Format check:

```bash
npm run format:check
```

Type check:

```bash
npm run typecheck
```

Production build verification:

```bash
npm run build
```

If a command is not defined in `package.json` or `composer.json`, do not invent a fake project command.

Use the closest available verification and mention missing tooling in the final summary.

---

# 5. Environment Rules

* Copy `.env.example` to `.env`.
* Never commit `.env`.
* Never commit real secrets.
* Required local service: MySQL.
* Queue may use database driver for MVP.
* Redis is not required unless architecture is explicitly changed.
* Required environment variables must be represented in `.env.example`.
* Do not modify production credentials.
* Do not expose production secrets in code, test fixtures, logs, screenshots, or documentation.
* Automated tests must use test/fake/local resources.
* Never run tests against production data.
* Never execute destructive commands against a production database.

Potential destructive commands include:

```bash
php artisan migrate:fresh
php artisan migrate:reset
php artisan db:wipe
```

Do not execute them unless the environment is explicitly confirmed as disposable local/test data.

---

# 6. Architecture Rules

Follow `docs/ARCHITECTURE.md`.

Mahaputra Apps uses:

```text
React UI
    ↓
Laravel Controller / Form Request
    ↓
Action / Application Service
    ↓
Domain / Business Service
    ↓
Eloquent / Infrastructure
    ↓
MySQL / File Storage
```

## Controller rules

Controllers must remain thin.

Controllers may:

* receive requests,
* authorize,
* invoke Form Request validation,
* call Action/Service,
* return Inertia responses,
* redirect,
* return download responses.

Controllers must not contain:

* profit calculations,
* capital calculations,
* credit calculations,
* complex vehicle status logic,
* large reusable query logic.

---

## Business logic

Business rules belong in:

```text
app/Actions/
app/Services/
```

or another already-established domain pattern.

Examples:

```text
CreateVehicleAction
AddVehicleCostAction
CreateCashSaleAction
CreateCreditSaleAction
UpdateSaleAction

VehicleCapitalCalculator
VehicleFinalCostCalculator
SaleProfitCalculator
```

Do not duplicate the same formula across multiple classes.

---

## Server is source of truth

Laravel is authoritative for:

* Modal Awal.
* Modal Akhir.
* Total biaya kendaraan.
* Total transaksi kredit.
* Laba kendaraan.
* Vehicle status.
* Payment validation.
* Authorization.

React may display a preview calculation for better UX, but Laravel must recalculate and validate the result before saving.

---

## Architectural consistency

Before adding a new:

* Action.
* Service.
* Component pattern.
* Form abstraction.
* Query object.
* Repository layer.

inspect existing code and reuse its pattern where appropriate.

Do not introduce additional abstraction solely for stylistic preference.

---

# 7. Backend Rules

## Validation

Validate all external input on Laravel.

Use:

```text
Laravel Form Request
```

for non-trivial form validation.

Do not rely only on React validation.

---

## Authorization

Use:

* Laravel Middleware.
* Laravel Policies.
* Role checks where appropriate.

Frontend visibility is not authorization.

Example:

Owner may not see an Edit button, but backend must still reject an Owner attempting the edit route directly.

Default authorization principle:

```text
deny unless explicitly allowed
```

---

## Database transactions

Use:

```php
DB::transaction(...)
```

for multi-step writes that must succeed together.

Required examples:

### Create Sale

* validate vehicle availability,
* create/update customer,
* create sale,
* create payment data,
* capture financial snapshot,
* change vehicle status to SOLD.

If one operation fails, none of the above changes should remain committed.

---

## Money rules

All Rupiah values must be stored as integer values.

Example:

```text
Rp150.000.000
```

stored as:

```text
150000000
```

Recommended database type:

```text
BIGINT UNSIGNED
```

Do not use:

```text
FLOAT
DOUBLE
```

for financial calculations.

Do not convert money to float in PHP or JavaScript business logic.

---

## Financial calculation rules

Do not modify formulas unless `docs/PRD.md` has changed.

### UMUM

```text
Modal Awal =
Modal Showroom + Modal Kolaborator
```

A vehicle with type UMUM requires:

* one collaborator,
* showroom capital,
* collaborator capital.

MVP supports maximum one collaborator per vehicle.

---

### KHUSUS

```text
Modal Awal =
Modal Showroom
```

KHUSUS means 100% vehicle capital comes from showroom.

No collaborator capital is used.

---

### Modal Akhir

```text
Modal Akhir =
Modal Awal + Total Biaya Kendaraan
```

Vehicle costs may include:

* Pajak.
* Dico.
* Kelistrikan/Kaki-kaki.
* Other vehicle costs.

Dico is a vehicle repainting/body-color repair cost category.

---

### CASH

CASH must not contain:

* DP Terutang.
* Financing Provider.
* Financing Disbursement.
* Refund.

Formula:

```text
Laba Kendaraan =
Harga Terjual - Modal Akhir
```

---

### CREDIT

Credit payment may contain:

* DP.
* DP Terutang.
* Financing Provider.
* Financing Disbursement.
* Refund.

Formula:

```text
Total Nilai Penjualan Kredit =
DP
+ DP Terutang
+ Cair dari Pembiayaan
+ Refund
```

```text
Laba Kendaraan =
Total Nilai Penjualan Kredit
- Modal Akhir
```

Do not infer new accounting formulas.

---

## Financial snapshots

When a vehicle is sold, preserve the financial values needed for historical reporting.

Examples:

```text
modal_snapshot
vehicle_cost_snapshot
final_cost_snapshot
profit_snapshot
```

Historical reports must not change unintentionally because current vehicle/master data changes later.

Any recalculation of a finalized sale must happen through an explicit update use case.

---

## Query rules

* Avoid N+1 queries.
* Use eager loading intentionally.
* Select only required data for large reports where practical.
* Paginate large lists.
* Add database indexes only when justified by real query/filter usage.
* Do not optimize prematurely with unnecessary caching.

---

# 8. Frontend Rules

All new React frontend files should use **TypeScript**.

Use `.tsx` for React components.

---

## Component responsibility

Page components should focus on:

* composition,
* props from Inertia,
* user flow,
* invoking form submissions.

Do not put complex financial rules directly inside Pages.

---

## Component locations

Reusable shared components:

```text
resources/js/Components/
```

Feature-specific components:

```text
resources/js/Features/
```

Pages:

```text
resources/js/Pages/
```

Hooks:

```text
resources/js/Hooks/
```

or existing project equivalent.

Do not create duplicate components when a shared component already exists.

---

## Recommended shared components

Prefer/reuse components such as:

```text
Button
Input
CurrencyInput
Select
SearchableSelect
DateInput
Textarea
FileUpload
Badge
StatusBadge
Card
KpiCard
DataTable
Pagination
FilterBar
EmptyState
ErrorState
ConfirmDialog
Modal
Toast
PageHeader
FormSection
CurrencyDisplay
VehicleCard
```

Do not build the same button/input/modal separately inside individual pages.

---

## State management

Prefer, in order:

1. Local component state.
2. Inertia form state.
3. Server state.
4. Context only where multiple distant components genuinely require shared state.

Do not add Redux, Zustand, or another global state manager without explicit approval.

---

## Form behavior

All forms must:

* show validation errors,
* preserve user input after validation failure,
* prevent duplicate submit,
* show loading state,
* show disabled state,
* show success feedback,
* support server-side validation errors.

For long forms:

* divide fields into logical sections,
* scroll/focus to the first invalid field where practical,
* warn users about unsaved changes when appropriate.

---

## Conditional forms

Use progressive disclosure.

### Vehicle UMUM

Show:

* Collaborator.
* Modal Showroom.
* Modal Kolaborator.

### Vehicle KHUSUS

Hide collaborator-specific fields.

### CASH

Hide all credit-specific fields.

### CREDIT

Show:

* Financing Provider.
* DP.
* DP Terutang.
* Financing Disbursement.
* Refund.

Do not submit hidden irrelevant financial values.

---

## Currency display

Use a shared currency helper/component.

Example display:

```text
Rp 150.000.000
```

Do not manually format Rupiah differently on individual pages.

---

## Required UI states

Every data-driven page must consider:

* loading,
* empty,
* filtered empty,
* error,
* disabled,
* success,
* unauthorized.

Follow `docs/UI_SPEC.md`.

---

# 9. Database and Migration Rules

* Never edit migrations that may already have been deployed.
* Create a new migration for schema changes.
* Migrations should be reversible where feasible.
* Define foreign keys explicitly.
* Define delete/update behavior deliberately.
* Do not rely solely on frontend validation for uniqueness.
* Add database constraints for important domain invariants where practical.

Examples:

* unique vehicle plate where domain requires it,
* one final sale per vehicle,
* foreign key integrity.

---

## Master data

Master data that has been referenced by historical transactions should usually be:

```text
is_active = false
```

instead of hard-deleted.

Examples:

* Employee/PIC.
* Area.
* Vehicle Brand.
* Financing Provider.
* Expense Category.

Historical transactions must remain readable even when a master item is inactive.

---

## Soft delete

Do not add `SoftDeletes` automatically to every model.

Use it only where required by:

* product requirement,
* audit requirement,
* data retention behavior.

Financial transaction records should not be hard-deleted casually.

---

## Factory and seeder rules

When schema changes affect test fixtures:

* update factories,
* update seeders,
* update tests.

Seed data should be deterministic.

---

# 10. UI and Accessibility Rules

Follow `docs/UI_SPEC.md`.

## Brand

Mahaputra Apps visual identity:

* Black.
* Yellow.
* White/light-neutral workspace.

Primary brand tokens include:

```text
#111111
#EAB308
#FAFAFA
#FFFFFF
```

Do not overuse yellow.

Yellow is primarily for:

* Primary buttons.
* Active navigation.
* Selected state.
* Focus/highlight.
* Small brand accents.

Do not create a full yellow interface.

---

## Design tokens

Do not introduce arbitrary:

* colors,
* spacing,
* radius,
* shadows,

when existing tokens can be used.

Do not add a new UI library without approval.

---

## Responsive behavior

Verify critical pages at:

```text
360px
768px
1280px
1440px
```

Primary target is desktop/laptop.

Mobile support is still required for monitoring and basic workflows.

---

## Accessibility

Target:

```text
WCAG 2.2 AA
```

Minimum rules:

* Visible labels for form fields.
* Keyboard accessible actions.
* Visible focus state.
* Do not rely on color alone.
* Buttons have accessible names.
* Icon-only buttons have tooltips/accessible labels.
* Error text is associated with the relevant field.
* Meaningful images have alt text.

---

# 11. Testing Rules

Behavior changes require test changes when relevant.

Do not delete, skip, or weaken tests just to make the suite green.

---

## Highest priority unit tests

Financial calculations must have deterministic unit tests.

Required cases:

### UMUM capital

```text
Modal Showroom
+ Modal Kolaborator
= Modal Awal
```

### KHUSUS capital

```text
Modal Showroom
= Modal Awal
```

### Modal Akhir

```text
Modal Awal
+ Total Biaya Kendaraan
= Modal Akhir
```

### CASH profit

```text
Harga Terjual
- Modal Akhir
= Laba
```

### CREDIT profit

```text
DP
+ DP Terutang
+ Cair Pembiayaan
+ Refund
- Modal Akhir
= Laba
```

---

## Feature tests

Important cases include:

* Admin can create vehicle.
* Owner cannot create vehicle.
* UMUM requires collaborator.
* KHUSUS does not use collaborator capital.
* CASH rejects/ignores credit fields.
* CREDIT requires financing provider.
* Sold vehicle cannot be sold twice.
* Admin can edit permitted transactions.
* Owner cannot edit transactions.
* Unauthorized users cannot access private files.
* Transaction rolls back if one financial write fails.

---

## Invalid cases

Always consider:

* missing required fields,
* invalid IDs,
* negative financial value,
* duplicate vehicle,
* invalid status transition,
* duplicate submit,
* forbidden access.

---

## End-to-end critical flows

### Flow 1 — Cash

```text
Login Admin
→ Tambah Kendaraan
→ Tambah Biaya
→ Kendaraan Ready
→ Terjual CASH
→ Invoice
→ Rekap Penjualan
```

### Flow 2 — Credit

```text
Login Admin
→ Tambah Kendaraan UMUM
→ Input Kolaborator
→ Tambah Biaya
→ Terjual CREDIT
→ Hitung Laba
→ Laporan
```

### Flow 3 — Owner

```text
Login Owner
→ Dashboard
→ Lihat Laporan
→ Filter
→ Export
```

---

## Deterministic tests

Avoid tests that depend directly on current:

```text
now()
today()
```

without freezing time.

Use the framework's time-testing utility where time matters.

Do not depend on real:

* external APIs,
* production files,
* public internet.

---

# 12. Git and Change Scope

Before editing:

1. Inspect relevant implementation.
2. Inspect related tests.
3. Read relevant PRD requirement.
4. Read architecture/UI sections where applicable.

---

## Change scope

Keep each task focused.

Do not:

* reformat unrelated files,
* rename unrelated code,
* rewrite working modules for preference,
* change architecture while fixing a small bug.

Prefer the smallest coherent change.

---

## Branch convention

Recommended:

```text
feature/<short-description>
fix/<short-description>
refactor/<short-description>
docs/<short-description>
```

Examples:

```text
feature/vehicle-create
feature/credit-sale
fix/cash-profit-calculation
docs/update-vehicle-rules
```

If the repository already uses another convention, follow the existing convention.

---

## Commit convention

Recommended:

```text
feat: add vehicle creation flow
fix: prevent duplicate vehicle sale
refactor: extract sale profit calculator
test: add credit sale calculation tests
docs: update sales business rules
```

Do not mix unrelated feature, refactor, and formatting work into one task when avoidable.

---

## Before finalizing

Always inspect:

```bash
git status
git diff
```

Check for:

* accidental files,
* secrets,
* debug code,
* unrelated formatting,
* generated artifacts,
* temporary logs.

---

# 13. Dependency and Security Constraints

## Dependencies

Do not add a production dependency without clear justification.

Before adding a package:

1. Check whether Laravel/React already provides the capability.
2. Check whether an installed package already solves it.
3. Evaluate maintenance and security implications.
4. Explain why the dependency is needed.

Do not install overlapping UI/component libraries.

---

## Sensitive information

Sensitive data includes:

* Customer KTP.
* STNK.
* BPKB.
* Financial documents.
* Passwords.
* Session data.
* API keys.
* Environment secrets.

Never expose sensitive files through unrestricted public URLs.

---

## Logging

Never log:

* passwords,
* full credentials,
* session cookies,
* authentication tokens,
* raw KTP content,
* STNK/BPKB content,
* application secrets.

Use identifiers instead when debugging.

---

## Security protections

Do not disable:

* Authentication.
* Authorization.
* CSRF.
* Input validation.
* Secure cookie behavior.
* TLS/HTTPS checks in production.

Security-sensitive code changes must be explicitly mentioned in the final summary.

---

# 14. Working Process for Codex

Codex must follow this process for implementation tasks.

## Step 1 — Read context

Read:

```text
AGENTS.md
docs/PRD.md
docs/ARCHITECTURE.md
docs/UI_SPEC.md
```

Read only the relevant sections if the files are large, but ensure product/business rules affecting the task are understood.

---

## Step 2 — Inspect current implementation

Before modifying code:

* find the relevant module,
* inspect neighboring patterns,
* inspect models,
* inspect database relationships,
* inspect validation,
* inspect authorization,
* inspect relevant tests.

Do not code based only on file names.

---

## Step 3 — Determine change scope

For simple localized work, proceed with the smallest coherent implementation.

For complex work that:

* affects more than approximately 5 files,
* changes database schema,
* changes financial calculations,
* adds a new module,
* changes architecture,
* affects authorization,

first provide a short implementation plan.

The plan should identify:

* files/modules involved,
* migration needs,
* business rules,
* tests required,
* known risks.

---

## Step 4 — Do not guess product rules

If a required business rule is not defined in `docs/PRD.md`:

* do not invent it,
* do not infer a financial formula,
* do not silently choose a business outcome.

Flag the unresolved requirement.

Examples of currently unresolved areas may include business decisions explicitly marked as OPEN in the PRD.

---

## Step 5 — Implement smallest coherent change

Avoid speculative implementation.

Do not add future features unless necessary for the current requirement.

Examples:

If the requirement is:

```text
Add CASH sale
```

do not simultaneously implement:

```text
WhatsApp notification
Profit-sharing automation
Multi-collaborator
Area transfer history
```

unless explicitly requested.

---

## Step 6 — Verify continuously

During implementation, run targeted tests for the changed module.

Examples:

```bash
php artisan test --filter=CreateVehicle
php artisan test --filter=CashSale
```

Use actual repository-supported commands.

---

## Step 7 — Full relevant verification

Before completing work, run all practical checks relevant to changed code:

* backend tests,
* frontend tests,
* lint,
* typecheck,
* formatting check,
* production build.

Do not claim a check passed unless it was actually run.

---

## Step 8 — Review for regressions

Review:

* financial calculations,
* authorization,
* validation,
* status changes,
* file privacy,
* duplicate submission,
* database transaction boundaries.

---

## Step 9 — Update documentation

Update documentation when changing:

* business behavior,
* architecture,
* route/interface contracts,
* data model,
* authorization,
* UI rules.

Do not update documentation for insignificant internal refactors that do not affect documented contracts.

---

## Step 10 — Final summary

Final response must be concise but include:

### Changed

* Main files/modules modified.
* Behavior implemented.

### Verified

* Tests/checks actually run.
* Results.

### Remaining

* Known limitations.
* Risks.
* Unresolved business questions.

Do not say:

```text
Everything is done
```

if tests were not run or known issues remain.

---

# 15. Definition of Done

A task is complete only when all relevant conditions below are satisfied.

## Product

* [ ] Requested behavior is implemented.
* [ ] Relevant PRD acceptance criteria are satisfied.
* [ ] No undefined product rule was silently invented.

## Backend

* [ ] Server validation exists where required.
* [ ] Authorization is enforced.
* [ ] Business logic is not duplicated unnecessarily.
* [ ] Multi-write financial operations use transactions.
* [ ] Financial calculations follow PRD.
* [ ] Important database constraints are enforced.

## Frontend

* [ ] UI follows `docs/UI_SPEC.md`.
* [ ] Loading state is handled.
* [ ] Empty state is handled where relevant.
* [ ] Error state is handled.
* [ ] Disabled/loading submit states prevent duplicate submission.
* [ ] Success feedback exists.
* [ ] Responsive behavior is preserved.
* [ ] Accessibility basics are implemented.

## Database

* [ ] Schema changes use a new migration.
* [ ] Migration is reversible where feasible.
* [ ] Foreign key and uniqueness rules are defined.
* [ ] Factory/seeder changes are included when needed.

## Verification

* [ ] Relevant unit tests pass.
* [ ] Relevant feature tests pass.
* [ ] Frontend tests pass where relevant.
* [ ] Type checking passes.
* [ ] Lint/format checks pass where configured.
* [ ] Production build succeeds when frontend changes require it.

## Scope

* [ ] No unrelated files are modified.
* [ ] No debug code remains.
* [ ] No secret is added.
* [ ] `git diff` has been reviewed.

## Documentation

* [ ] Documentation is updated when product/architecture/contracts change.

## Final report

* [ ] Tests/checks actually run are listed.
* [ ] Remaining risks or unresolved items are listed.

---

# 16. Prohibited Actions

Codex must not:

* Rewrite a working module solely for stylistic preference.
* Introduce microservices without explicit architectural approval.
* Split React and Laravel into separate applications without approval.
* Add a public REST API solely because React is used.
* Add Redux/global state management without demonstrated need.
* Add a new UI library without approval.
* Put authoritative financial calculations only in React.
* Use floating-point storage for Rupiah.
* Change financial formulas without PRD confirmation.
* Guess profit-sharing rules.
* Guess unresolved area-transfer rules.
* Hard-delete historical financial data without explicit requirement.
* Expose KTP/STNK/BPKB through public storage.
* Bypass Laravel Policy because a frontend button is hidden.
* Disable CSRF/authentication/authorization to simplify implementation.
* Remove tests merely because they fail.
* Silence errors without understanding their cause.
* Edit deployed migrations.
* Run destructive database commands on non-test data.
* Commit `.env`.
* Commit secrets.
* Commit temporary debug logs.
* Modify unrelated files.
* Perform repo-wide formatting during a small feature task.
* Add speculative future functionality not requested by the task.
* Silently change a documented route, API/interface, database contract, or business behavior.

---

# 17. Domain-Specific Guardrails

The following rules are especially important for Mahaputra Apps.

## Vehicle sale

Before creating a sale:

```text
Vehicle must exist
AND
Vehicle must be authorized for current user
AND
Vehicle must not already have a final sale
AND
Vehicle status must allow sale
```

Never rely only on UI state.

---

## Vehicle status

Do not invent new statuses without updating:

```text
docs/PRD.md
docs/UI_SPEC.md
```

Current proposed lifecycle may include:

```text
PREPARATION
READY
BOOKING
SOLD
```

but statuses marked OPEN/PROPOSED in PRD must not be treated as final without confirmation.

---

## Customer privacy

Customer KTP is sensitive.

Do not:

* display it in list/table thumbnails,
* expose public URLs,
* log its path unnecessarily,
* return it to unauthorized users.

---

## Vehicle documents

STNK and BPKB are separate document types.

Do not merge them into one generic boolean field if the requirement needs:

* availability,
* file,
* note,

per document.

---

## Operational expenses

Operational expenses:

* affect company profitability,
* do not automatically become part of vehicle Modal Akhir.

Never mix operational company expenses with vehicle-specific costs unless a future PRD explicitly changes the rule.

---

## Owner role

Owner is primarily read-only.

Do not automatically grant Owner:

* create,
* edit,
* delete,

permissions merely because Owner has a higher business role.

Follow the authorization matrix in PRD.

---

# 18. Performance Guardrails

Do not prematurely optimize the application with distributed infrastructure.

Before adding:

* Redis,
* complex caching,
* queues everywhere,
* materialized aggregates,
* microservices,

first measure the actual bottleneck.

Prioritize:

1. Correct queries.
2. Eager loading.
3. Database indexes.
4. Pagination.
5. Query optimization.
6. Cache where justified.
7. Queue heavy exports/jobs.

Expected MVP concurrency is low.

Maintainability and correctness are more important than speculative scale.

---

# 19. Documentation Rules

When behavior changes, update the relevant source of truth.

### Update `docs/PRD.md` when:

* product behavior changes,
* business rule changes,
* role capability changes,
* scope changes.

### Update `docs/ARCHITECTURE.md` when:

* architecture changes,
* database strategy changes materially,
* dependency direction changes,
* authentication strategy changes,
* external integrations are introduced,
* new major infrastructure is introduced.

### Update `docs/UI_SPEC.md` when:

* design tokens change,
* navigation changes,
* important page structure changes,
* component behavior changes,
* responsive rules change.

### Add/update ADR when:

A technical decision has long-term architectural impact.

Example:

```text
docs/adr/010-add-redis-queue.md
```

---

# 20. Local Overrides

More specific `AGENTS.md` files may exist inside subdirectories.

Follow the closest applicable `AGENTS.md` for files being modified.

Order of precedence:

```text
Closest AGENTS.md
        ↓
Root AGENTS.md
        ↓
Architecture / PRD / UI specification
```

A local override may specialize implementation guidance but must not silently contradict product business rules.

If instructions conflict materially, flag the conflict before implementation.

---

# 21. Final Rule

Prefer:

```text
Correct
Simple
Secure
Tested
Documented
```

over:

```text
Complex
Clever
Speculative
Over-engineered
```

Mahaputra Apps is an internal operational and financial system.

Correctness of data, business rules, authorization, and financial calculations takes priority over architectural novelty.
