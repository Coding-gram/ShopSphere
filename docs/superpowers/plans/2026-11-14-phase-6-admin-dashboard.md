# Phase 6 Admin Dashboard Implementation Plan

> **For agentic workers:** Execute inline, one task at a time, with a failing test before each new server behavior.

**Goal:** Deliver the missing administrator dashboard, catalog, inventory, customer, and audit capabilities without duplicating the completed Phase 5 order module.

**Architecture:** Reuse the existing Express modules and React Query admin workspace. New admin-only read/write endpoints live beside their owning domain; dashboard reporting uses server-side Order aggregates and inventory changes use a dedicated atomic service with immutable events. The existing order views, state machine, and OrderAuditEvent model remain the source of truth for Phase 5 order behavior.

**Tech stack:** Express 5, Mongoose transactions, Zod, React 19, React Query, React Hook Form, Tailwind/Radix components, Vitest/Supertest.

## Global constraints

- All values that affect inventory, reporting, and access control are computed and validated on the server.
- Sensitive admin writes require `protect`, `requireAdmin`, and a persisted active-admin check.
- Never expose password hashes or payment-attempt gateway data.
- No real payments, refunds, or rewrite of customer checkout/order flows.
- Retain the existing responsive, accessible admin design language and explicit loading/error/empty states.

## Review focus

- Concurrent inventory reductions must never produce negative stock or duplicate an adjustment event.
- Dashboard revenue must use persisted order snapshots and exclude non-earned statuses by an explicitly documented policy.
- Customer account controls must not allow self-deactivation or role changes.
- Catalog/category changes must not leave a product pointing at an invalid category.
- Audit queries must not expose customer data beyond the minimum needed by an administrator.

### Task 1: Dashboard reporting vertical slice

**Files:** new admin dashboard module/service/validators and page/service/hook tests; modify server app, router, AdminLayout.

- [ ] Add failing API and page tests for real metrics, recent orders, no-data states, and customer denial.
- [ ] Add admin-only summary endpoint with bounded date range, Order aggregate metrics, status breakdown, and recent serialized orders.
- [ ] Build the dashboard page and dashboard navigation using React Query, accessible summary cards, and recent-order states.
- [ ] Run focused server/client tests and their type/build checks; commit `feat: add admin sales dashboard`.

### Task 2: Product management vertical slice

**Files:** extend product service/routes/validators and client admin product services, hooks, pages, form/table tests.

- [ ] Add failing tests for admin listing of inactive catalog entries, write authorization, validation, and product form states.
- [ ] Reuse product CRUD while adding an admin list/query contract and active-admin protection to catalog writes.
- [ ] Build list, filter, pagination, create/edit, image URL, and soft-delete interfaces.
- [ ] Run focused checks and commit `feat: add admin product management`.

### Task 3: Category management vertical slice

**Files:** extend category routes/service/validators and client admin category service/hook/page tests.

- [ ] Add failing tests for category writes, parent validation, invalid deletion, and form error/empty states.
- [ ] Add active-admin-protected category mutation paths and safe administrative reads without changing customer category visibility.
- [ ] Build category list/create/edit/delete UI, including a confirmation for irreversible deletion.
- [ ] Run focused checks and commit `feat: add admin category management`.

### Task 4: Inventory vertical slice

**Files:** new inventory adjustment model/module/tests; Product route contract; client inventory service/hook/page tests.

- [ ] Add failing tests for atomic adjustments, negative-stock rejection, stale/concurrent writes, authorization, and immutable audit attributes.
- [ ] Add a transaction-backed adjustment endpoint using a bounded delta, reason, atomic stock predicate, active-admin recheck, and immutable event document.
- [ ] Build the stock-management list and adjustment dialog; refetch catalog/dashboard data after a mutation.
- [ ] Run focused checks and commit `feat: add auditable inventory management`.

### Task 5: Customer management vertical slice

**Files:** new admin customers module/tests; client service/hook/pages/tests; AdminLayout/router.

- [ ] Add failing tests for pagination/search, PII allowlisting, details/order summary, customer denial, and self-deactivation/role-change prevention.
- [ ] Add admin customer list/detail/status endpoints, selecting only safe user fields and using transaction-safe status updates.
- [ ] Build customer list/detail and explicit activation/deactivation confirmation states.
- [ ] Run focused checks and commit `feat: add admin customer management`.

### Task 6: Audit trail vertical slice

**Files:** extend admin order module/view/validators/tests; client audit service/hook/page/tests; AdminLayout/router.

- [ ] Add failing tests for actor/event/date/order filters, immutable order event projection, access control, and audit page states.
- [ ] Add an admin-only, paginated OrderAuditEvent reader with bounded validated filters and a minimum-data order/customer projection.
- [ ] Build audit list/filter UI and link order entities to the existing order detail page.
- [ ] Run focused checks and commit `feat: add admin audit trail`.
