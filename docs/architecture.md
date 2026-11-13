# ShopSphere — Architecture

## Overview

ShopSphere follows a **modular monolith** architecture with clear separation between:

- **Client** (React SPA) — handles UI, routing, and presentation
- **Server** (Express API) — handles business logic, data access, and security

## Backend Architecture

```
Request → Route → Middleware (auth, validate) → Controller → Service → Model → Database
                                                    ↓
                                              ApiResponse / ApiError
```

### Layers

| Layer | Responsibility |
|-------|----------------|
| **Routes** | Map HTTP methods/paths to controllers |
| **Middleware** | Cross-cutting: auth, validation, rate limiting, error handling |
| **Controllers** | Parse request, call service, send response |
| **Services** | Business logic, data orchestration |
| **Models** | Data schema, indexes, hooks |
| **Utils** | Shared helpers (ApiError, ApiResponse, asyncHandler) |

### Module Structure

Each backend module (auth, products, cart, etc.) follows:
```
modules/<name>/
├── <name>.routes.ts
├── <name>.controller.ts
├── <name>.service.ts
└── <name>.validators.ts
```

## Frontend Architecture

```
Router → Layout → Page → Components → Hooks → API Services → TanStack Query
```

### State Management

- **Server state**: TanStack Query (products, orders, user data)
- **Client state**: React hooks and context (auth, UI state)
- **Form state**: React Hook Form + Zod validation

## Security

- JWT stored in HTTP-only secure cookies (not localStorage)
- Server-side role-based access control
- All prices calculated server-side
- Payment processing is not active yet; a future provider integration must verify callbacks server-side.
- Input validated with Zod on both client and server

## Order State Foundation

- Order status is canonical and server-owned: `placed → paid → packed → shipped → delivered`, with cancellation permitted only from `placed` or `paid`.
- The shared order-state machine rejects every other transition with a conflict error. Customer history and detail routes are ownership-scoped and paginated. Cancellation is a transactional `placed|paid → cancelled` transition that restores each snapshotted item quantity exactly once and records an immutable customer audit event.
- Checkout continues to reserve stock and create the `placed` order transactionally. It also creates an immutable system audit event; customers have no audit-event write route.
- `PaymentAttempt` records deterministic simulated payment outcomes. Attempts are immutable in their order, amount, provider, and idempotency key, with a unique `(order, idempotencyKey)` index.
- A cancellation does not delete an order or alter its payment snapshot. A successful simulated payment remains marked `paid`; refunds are deliberately out of scope until a real payment/refund integration is added.
- To migrate old statuses, run `cd server; npm run migrate:order-statuses`. The script validates every legacy value before writing, conditionally updates each order atomically, preserves `paymentStatus`, and can be rerun safely. It maps ambiguous unpaid `confirmed` and `processing` statuses to `placed` rather than falsely marking them paid.

