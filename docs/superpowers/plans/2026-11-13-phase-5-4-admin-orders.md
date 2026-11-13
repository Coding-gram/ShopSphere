# Phase 5.4 Admin Order Management Implementation Plan

> **For agentic workers:** Execute inline using test-driven development and a final whole-change review.

**Goal:** Give active administrators a safe, responsive interface and API to inspect orders and advance the canonical fulfilment lifecycle.

**Architecture:** Keep customer order endpoints unchanged. Add an admin-only route group inside the existing order module; it uses the canonical state machine, immutable audit-event model, atomic status predicates, and a database-backed active-admin check for mutations. The client gets a protected admin route, query-backed table/detail views, and confirmation-gated transitions.

**Tech Stack:** Express, Mongoose, Zod, React, TanStack Query, React Router, Tailwind, Radix Dialog.

**Spec:** User-provided ShopSphere Phase 5.4 requirements (2026-11-13).

## Global Constraints

- Preserve all Phase 4 and 5 customer checkout, payment, cancellation, and snapshot behavior.
- Do not accept client totals, stock, status histories, or audit fields.
- Customer access to admin data and mutations must receive authorization errors.
- Lifecycle mutations require a fresh active-admin database check, canonical state validation, an atomic predicate, and a server-generated audit event.
- No refunds, payment-gateway integration, or unrelated refactors.

## Review Focus

- A stale admin token must not advance an order after the account has been deactivated.
- A customer must not list, view, or transition any admin order.
- Concurrent status changes must create one audit event and leave the order at one valid next state.
- Search, status/payment, date, and pagination filters must compose without returning unbounded records.
- Admin UI transitions must refresh both list and detail caches and expose loading/error/empty states.

### Task 1: Admin order API and lifecycle transition

**Files:** Create admin order route/controller/service/validator files in `server/src/modules/orders`; modify `server/src/app.ts`, `server/src/middleware/auth.ts`, `server/src/models/Order.ts`; test `server/src/__tests__/phase5_4.test.ts`.

- [x] Write failing API tests for admin authorization, filters, details, active-account rejection, valid/invalid/concurrent transitions, audit events, and customer regressions.
- [x] Implement paginated `GET /api/v1/admin/orders`, `GET /api/v1/admin/orders/:orderId`, and `PATCH /api/v1/admin/orders/:orderId/status` contracts with strict boundary validation.
- [x] Reuse `assertOrderTransition` and `OrderAuditEvent`; only permit `paid → packed → shipped → delivered` through the admin route.
- [x] Run the focused server test and verify it passes.

### Task 2: Admin order management UI

**Files:** Create admin services, hooks, pages, components, and tests; modify `client/src/router.tsx`, `client/src/layouts/AdminLayout.tsx`, `client/src/providers/AuthProvider.tsx`, and client types.

- [x] Write failing tests for table loading/error/filter states and confirmation-gated lifecycle actions.
- [x] Implement protected `/admin/orders` and `/admin/orders/:orderId` pages with URL-backed filters, responsive table, details, status history, and query invalidation after transitions.
- [x] Reuse badges, pagination, empty/error states, dialog, and design tokens; render only allowlisted customer/payment fields.
- [x] Run focused client tests and then the full client suite.

### Task 3: Final verification and review

**Files:** All files above plus `docs/architecture.md`.

- [x] Run all server/client tests, TypeScript checks, production builds, lint, dependency audits, and whitespace checks.
- [x] Review the final diff for ownership, stale-admin protection, atomicity, input bounds, pagination, PII exposure, and dead code.
- [x] Commit only after verification passes.
