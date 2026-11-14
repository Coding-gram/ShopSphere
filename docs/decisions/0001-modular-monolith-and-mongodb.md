# ADR-0001: Use a modular monolith with MongoDB

## Status

Accepted

## Date

2026-11-14

## Context

ShopSphere needs a browser storefront and an administrative API for catalog, cart, order, payment-attempt, inventory, and audit workflows. The domain contains both references between resources and immutable snapshots: products are referenced by carts and inventory records, while orders preserve item prices, names, images, and shipping details as they were at checkout.

The application also needs transaction-backed state changes and idempotent retries for checkout, payment attempts, cancellation, and admin operations.

## Decision

Use a TypeScript modular monolith:

- React/Vite for the browser client.
- Express for the HTTP API.
- Feature modules with routes, validators, controllers, and services.
- Mongoose models backed by MongoDB.
- HTTP-only JWT cookies for authentication.

Keep the API and client in one repository and deploy them as separate processes when needed.

## Alternatives considered

### Separate frontend and backend repositories

- Pros: independent release and ownership boundaries.
- Rejected for this project: the current academic scope benefits from one repository with shared documentation, scripts, and test fixtures.

### Relational database

- Pros: strong relational constraints and familiar transaction semantics.
- Rejected for the current implementation: the existing order and cart design intentionally uses document snapshots, and the implemented Mongoose models, indexes, and services already provide the required references and transaction boundaries.

### GraphQL

- Pros: client-selected response shapes.
- Rejected: the current UI uses stable REST resources and the existing Express route modules already define the public contract.

## Consequences

- Feature code remains separated inside one deployable backend.
- MongoDB transactions require a replica set or mongos in production.
- Order, payment, audit, and inventory documents can preserve immutable history and snapshots.
- A future service split would need explicit contracts and ownership boundaries; it is not part of the current repository.
