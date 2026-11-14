# ShopSphere submission preparation

## Technical report structure

1. **Problem and scope**
   - Curated e-commerce storefront with customer purchasing and protected administration.
   - Phase scope: catalog, authentication, cart/checkout, simulated payments, orders/cancellation, inventory, admin workflows, and responsive UI.
2. **Architecture**
   - React/Vite client and Express/Mongoose modular monolith.
   - Request flow, route modules, services, Mongoose models, and MongoDB.
3. **Data model**
   - Users, categories, products, carts, addresses, orders, payment attempts, audit events, and inventory adjustments.
   - See [ER diagram](./erd.md).
4. **Security and validation**
   - HTTP-only JWT cookie, bcrypt password hashing, role checks, active-admin recheck, Helmet, CORS, rate limits, and Zod route validation.
5. **Business workflows**
   - Server-owned pricing and stock reservation.
   - Order state machine, cancellation stock restoration, immutable history, and idempotency.
6. **Testing**
   - Vitest/Testing Library client tests, Supertest server tests, and replica-set-backed transaction tests.
   - Report the exact fresh counts from the verification run used for submission.
7. **Limitations and future work**
   - Simulated payments, reserved but unused external-service variables, no deployment manifests, and production replica-set/HTTPS requirements.

## Three-to-five-minute walkthrough

### 0:00–0:30 — Start and orientation

- Show the repository structure and the local commands in the README.
- Open the storefront and explain the customer/admin separation.

### 0:30–1:30 — Customer storefront

- Browse products, search/filter, open a product, and add it to the cart.
- Show the responsive layout at a narrow viewport.

### 1:30–2:30 — Checkout and order lifecycle

- Sign in as the seeded customer.
- Create/select an address, place an order, and explain server-calculated totals and stock validation.
- Open the order detail, run simulated payment success or failure, then show cancellation for an eligible order.

### 2:30–3:30 — Admin operations

- Sign in as the seeded admin and open `/admin`.
- Show dashboard metrics, product/category management, inventory adjustment, customer status, and order transition controls.
- Open the audit trail to show immutable workflow history.

### 3:30–4:30 — Engineering evidence

- Show the architecture document, ER diagram, OpenAPI file, tests, and build commands.
- State the known limitations: simulated payment only, no production deployment manifest, and MongoDB transaction topology requirement.

## AI attribution and disclosure guidance

If the assignment requires AI disclosure, include a short factual note in the submission report:

> AI assistance was used for repository inspection, documentation drafting, test-oriented debugging, and UI/documentation review. All generated content was checked against the repository implementation, edited by the project author, and validated with the project’s tests/build commands. No credentials or private environment files were shared.

Adjust the wording to the assignment’s required format. Do not claim that AI authored or verified behavior that was not reviewed and tested by the project team.
