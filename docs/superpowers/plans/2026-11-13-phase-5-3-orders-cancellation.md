# Phase 5.3 Orders and Cancellation Implementation Plan

> **For agentic workers:** Execute inline with test-driven development and a final whole-change review.

**Goal:** Let authenticated customers view their orders and safely cancel eligible orders while restoring stock exactly once.

**Architecture:** Extend the existing order module with customer-scoped read routes and a cancellation transaction. The transaction uses the canonical state machine, persisted cancellation idempotency metadata, atomic order predicates, product stock increments, and immutable audit events. The React client consumes the new contract through React Query services/hooks and protected list/detail pages.

**Tech Stack:** Express, Mongoose transactions, Zod, React, TanStack Query, React Router, Tailwind, Radix Dialog.

**Spec:** User-provided ShopSphere Phase 5.3 requirements (2026-11-13).

## Global Constraints

- Preserve checkout/payment snapshots and never accept client prices or stock.
- Restrict all customer resources by authenticated ownership.
- Cancellation only permits `placed` and `paid` orders; it does not issue a real or simulated refund.
- Keep reasons bounded and server-validated; audit events are server-generated.
- No admin UI or unrelated refactors.

## Review Focus

- A customer must never list, view, or cancel another customer's order.
- A retry or concurrent cancellation must restore each ordered quantity once only.
- A cancellation after packed, shipped, delivered, or cancelled must conflict without stock change.
- Reusing a cancellation key with a different request must conflict rather than replay a wrong result.
- The UI must communicate loading, empty, error, and cancellation outcomes accessibly on narrow and wide screens.

---

### Task 1: Customer order read contract

**Files:** Create `server/src/modules/orders/orders.{service,controller,routes,validators}.ts`; modify `server/src/app.ts`; test `server/src/__tests__/phase5_3.test.ts`.

- [x] Write API tests for newest-first pagination, ownership, and unauthenticated access.
- [x] Implement `GET /api/v1/orders` and `GET /api/v1/orders/:orderId` with strict Zod pagination and owner-scoped queries.
- [x] Run the focused server tests and confirm the new read contract passes.

### Task 2: Transactional idempotent cancellation

**Files:** Modify `server/src/models/Order.ts` and the order module; test `server/src/__tests__/phase5_3.test.ts`; update `docs/architecture.md`.

- [x] Write failing tests for eligible cancellation, audit data, duplicate/concurrent requests, stock restoration, invalid states, and reason validation.
- [x] Persist cancellation key/fingerprint metadata and implement `POST /api/v1/orders/:orderId/cancel` using a transaction, canonical transition validation, and an atomic status predicate.
- [x] Document that cancellation preserves a successful simulated payment record and has no refund integration.
- [x] Run the focused server tests and confirm both restoration and idempotency behavior pass.

### Task 3: Customer order experience

**Files:** Create order service/hooks/pages/components/tests; modify `client/src/router.tsx`, `client/src/components/layout/Header.tsx`, and client order types.

- [x] Write failing component/service tests for history states, order details, cancellation confirmation, and query invalidation.
- [x] Implement protected Orders and order detail routes, status/total/address/tracking presentation, and an accessible cancellation confirmation with a bounded reason.
- [x] Reuse existing EmptyState, ErrorDisplay, Pagination, Dialog, tokens, and navigation patterns.
- [x] Run focused client tests, then the whole client suite.

### Task 4: Final verification and review

**Files:** All files above.

- [x] Run all server/client tests, server and client production builds, and client lint.
- [x] Check the staged diff for whitespace, secrets, scope, ownership, and transaction regressions.
- [x] Commit only after the verification commands pass.
