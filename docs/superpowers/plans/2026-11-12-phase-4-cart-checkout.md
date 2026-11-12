# ShopSphere Phase 4 Cart & Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement persistent customer carts, an address book, and a secure checkout that creates validated orders.

**Architecture:** Add focused protected Express modules for cart, addresses, and checkout. Reuse the existing Mongoose models and response/error/auth middleware. The client uses React Query for server state, existing form primitives for address validation, and dedicated pages connected through the current layout and router.

**Tech Stack:** Express 5, TypeScript, Mongoose, Zod, Vitest/Supertest; React 19, React Query, React Hook Form, Tailwind 4, Radix UI, Vitest/RTL.

**Spec:** `docs/superpowers/specs/2026-11-12-phase-4-cart-checkout.md`

## Global Constraints

- Backend owns prices, product availability, stock validation, totals, and order creation.
- All customer data routes require the existing cookie authentication and are scoped to `req.user._id`.
- Preserve completed auth, catalog, and profile behavior; do not add wishlist, reviews, payment capture, or unrelated features.
- Use the established design tokens, semantic HTML, keyboard-accessible controls, and responsive layouts.
- Add meaningful backend and frontend tests; run tests, type checks, lint, and builds before committing.

## Review Focus

- A client sends a manipulated price or total: checkout ignores it and persists product-derived totals.
- A cart product changes price or becomes unavailable after it was added: checkout fails without creating an order or clearing the cart.
- Multiple cart items cannot be fulfilled: checkout rolls back earlier stock decrements and retains the cart.
- A customer attempts to read or modify another customer's address: all routes return a non-disclosing not-found response.
- Product stock above the user-facing limit: cart quantity still never exceeds the policy limit of 10.

### Task 1: Complete and expose cart operations

**Files:**
- Modify: `server/src/models/Cart.ts`, `server/src/modules/cart/cart.service.ts`, `server/src/app.ts`
- Create: `server/src/modules/cart/cart.controller.ts`, `server/src/modules/cart/cart.routes.ts`
- Test: `server/src/__tests__/phase4.test.ts`

**Interfaces:**
- Produces: `GET /api/v1/cart`, `POST /api/v1/cart/items`, `PATCH /api/v1/cart/items/:itemId`, `DELETE /api/v1/cart/items/:itemId`, each protected and returning a cart with calculated `subtotal`, `total`, and `itemCount`.

- [ ] Write failing API tests for unauthorized access, add/persist/update/remove behavior, max quantity, and stock rejection.
- [ ] Run the focused test and confirm the routes are initially unavailable.
- [ ] Implement the protected controller/routes, cart view mapping, and server-side quantity/stock checks.
- [ ] Run focused cart tests and server typecheck.

### Task 2: Add customer address CRUD

**Files:**
- Create: `server/src/modules/addresses/addresses.validators.ts`, `server/src/modules/addresses/addresses.service.ts`, `server/src/modules/addresses/addresses.controller.ts`, `server/src/modules/addresses/addresses.routes.ts`
- Modify: `server/src/app.ts`
- Test: `server/src/__tests__/phase4.test.ts`

**Interfaces:**
- Produces: `GET/POST /api/v1/addresses`, `PUT/DELETE /api/v1/addresses/:addressId`; address input is validated by Zod and ownership is enforced in the service.

- [ ] Write failing tests for protected routes, CRUD, field validation, defaults, and cross-customer access.
- [ ] Run focused address tests and confirm they fail before route implementation.
- [ ] Implement customer-scoped address API and default-address consistency.
- [ ] Run focused address tests and server typecheck.

### Task 3: Add transactional checkout and persisted orders

**Files:**
- Modify: `server/src/models/Order.ts`, `server/src/modules/cart/cart.service.ts`, `server/src/app.ts`
- Create: `server/src/modules/checkout/checkout.validators.ts`, `server/src/modules/checkout/checkout.service.ts`, `server/src/modules/checkout/checkout.controller.ts`, `server/src/modules/checkout/checkout.routes.ts`
- Test: `server/src/__tests__/phase4.test.ts`

**Interfaces:**
- Produces: `POST /api/v1/checkout` accepting `{ addressId }` and returning the server-created order; it rejects empty carts, foreign addresses, stale stock, and changed/unavailable products.

- [ ] Write failing tests for unauthorized checkout, client price/total rejection-by-ignorance, stale price order calculation, unavailable stock, and successful order/cart-clear flow.
- [ ] Run focused checkout tests and confirm they fail before implementation.
- [ ] Implement checkout service with server-calculated snapshots and safe stock decrement semantics.
- [ ] Run focused checkout tests and server typecheck.

### Task 4: Integrate the React cart and checkout experience

**Files:**
- Create: `client/src/services/cart.ts`, `client/src/services/addresses.ts`, `client/src/services/checkout.ts`, `client/src/hooks/useCart.ts`, `client/src/hooks/useAddresses.ts`, `client/src/components/cart/*`, `client/src/components/address/*`, `client/src/pages/Cart.tsx`, `client/src/pages/Checkout.tsx`
- Modify: `client/src/types/index.ts`, `client/src/components/product/ProductInfo.tsx`, `client/src/components/layout/Header.tsx`, `client/src/router.tsx`, `client/src/pages/Profile.tsx`
- Test: `client/src/components/cart/*.test.tsx`, `client/src/components/address/*.test.tsx`, `client/src/pages/*.test.tsx`

**Interfaces:**
- Consumes: cart, address, and checkout APIs from Tasks 1–3.
- Produces: protected `/cart` and `/checkout` routes, a dynamic cart count, product add-to-cart integration, and address management in Profile and checkout.

- [ ] Write failing component tests for add-to-cart feedback, cart quantity/removal states, and address form validation.
- [ ] Run focused client tests and confirm failures before the components exist/change.
- [ ] Implement focused services/hooks/components/pages with design-system primitives and accessible loading, error, empty, and confirmation states.
- [ ] Run the client test suite, lint, and build.

### Task 5: Whole-phase validation and review

**Files:**
- Modify only if an issue is identified by tests or review.

- [ ] Review the diff across correctness, readability, architecture, security, and performance.
- [ ] Run server tests/build and client tests/lint/build after the final code change.
- [ ] Check browser rendering and console output if a local runtime can be started.
- [ ] Commit only after every required verification succeeds.
