# ShopSphere architecture

## System shape

ShopSphere is a modular monolith with a React single-page application and an Express/Mongoose API:

```text
React SPA
  ├─ StoreLayout / AdminLayout / AuthLayout
  ├─ pages and components
  ├─ hooks using TanStack Query
  └─ services using Axios
              │ HTTP-only cookie + JSON
              ▼
Express API
  ├─ Helmet, CORS, cookie parsing, JSON parsing
  ├─ route modules
  ├─ protect / requireAdmin / requireActiveAdmin
  ├─ Zod validation
  ├─ controllers
  ├─ services
  └─ Mongoose models
              ▼
           MongoDB
```

The request path is:

```text
request → route → validation/auth middleware → controller → service → model → response
```

All successful API responses use `{ success, statusCode, message, data }`; paginated list endpoints also include `pagination`. Validation errors use HTTP 400 with `message: "Validation failed"` and an `errors` array containing `field` and `message`.

## Frontend

- `client/src/router.tsx` defines public store routes, protected customer routes, and the `/admin` route tree.
- `StoreLayout` serves storefront navigation and footer content.
- `AdminLayout` provides the protected admin navigation and responsive mobile navigation.
- TanStack Query hooks own server state and call feature-specific service modules.
- React Hook Form and Zod manage form state and client-side validation; the server remains authoritative.

## Authentication and authorization

`POST /api/v1/auth/login` signs a JWT and sets it in an HTTP-only cookie named `token`. The `protect` middleware verifies the cookie, loads the current user, and rejects missing, invalid, inactive, or unavailable accounts. Passwords are hashed with bcryptjs.

`requireAdmin` checks the JWT-derived role. Sensitive admin mutations additionally use `requireActiveAdmin`, which rechecks the persisted user role and `isActive` flag immediately before the mutation. Customer resources are scoped by the authenticated user ID in their services.

## Catalog and inventory

Products reference a category and expose images, optional variants, stock, price, tags, active/featured flags, and rating summaries. Categories may reference a parent category. Public catalog reads are paginated and support filtering; admin catalog reads include inactive and low-stock filtering.

Inventory changes are admin-only, require a non-zero bounded delta and reason, atomically update stock, and write an immutable `InventoryAdjustment`. Product deletion is implemented as an inactive state by the product service rather than physical removal.

## Cart, address, and checkout

Each user has one cart. Cart items keep a price snapshot for display, but checkout ignores client totals and reads current product prices from the database. Addresses are customer-owned and default-address consistency is maintained by the address service.

Checkout:

1. Validates the address ID and `Idempotency-Key`.
2. Replays an existing order when the same user/key/fingerprint is reused.
3. Reads the customer cart and owned address.
4. Atomically decrements active product stock with a stock predicate.
5. Creates a `placed` order with immutable item and shipping-address snapshots.
6. Creates a system `order_placed` audit event.
7. Clears the cart.

On replica-set MongoDB, this sequence runs in `withTransaction`. The current checkout service detects the standalone-server transaction error and runs a guarded non-transactional path with stock compensation if the order cannot be completed. Other transaction-backed workflows should still use a replica set in deployment.

The checkout idempotency key and SHA-256 request fingerprint are stored on the order with a unique per-user index. Reusing the key with a different address returns a conflict rather than silently replaying the wrong order.

## Orders, cancellation, and payments

Order statuses are:

```text
placed → paid → packed → shipped → delivered
   └──────────────→ cancelled
```

Cancellation is allowed only from `placed` or `paid`. It is transaction-backed, restores each snapshotted product quantity once, records a customer audit event, and stores its idempotency key/fingerprint on the order. Cancellation does not delete the order or change its payment snapshot.

Payment processing currently uses `simulatedPaymentGateway`. The customer submits `outcome: "success"` or `"failure"` with an idempotency key. A success transitions `placed → paid`; a failure leaves the order `placed` with `paymentStatus: failed`. Each attempt is immutable and uniquely indexed by `(order, idempotencyKey)`, and payment audit events are recorded. No external gateway, webhook, refund, or real-money charge is active.

## Admin workflows

Admins can:

- view dashboard metrics and recent orders;
- list/create/update/delete products and categories;
- adjust inventory;
- list customers, inspect a customer, and activate/deactivate customer accounts;
- list and inspect orders with status, payment, date, and search filters;
- transition orders only through the supported lifecycle states;
- query immutable order audit events.

Admin order transitions recheck active admin state in the database, use an atomic current-status predicate, and append an immutable `order_status_changed` event.

## Data model

See [erd.md](./erd.md) for the model relationships and indexes, and [api/openapi.yaml](./api/openapi.yaml) for the HTTP contract.

## Operational decisions and limitations

- MongoDB/Mongoose is the persistence layer because the existing domain uses document snapshots for carts and orders while still needing indexed references and transactions.
- JWTs are stored in HTTP-only cookies rather than local storage.
- Server-side Zod validation is applied at route boundaries.
- Order, payment-attempt, audit-event, and inventory-adjustment records preserve history rather than being freely mutable.
- The repository has no Docker, CI, or hosting manifest. Production deployment must supply MongoDB, HTTPS, secrets, process supervision, and a replica-set topology.
