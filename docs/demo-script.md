# ShopSphere Demo Script

This walkthrough is designed for a 3–5 minute assessment demonstration.

## 0:00–0:30 — Overview and architecture

- Start MongoDB, the server, and the client using the commands in [README.md](../README.md).
- Open `http://localhost:5173`.
- Explain that ShopSphere is a React/Vite frontend with an Express/Mongoose modular-monolith backend and MongoDB persistence.
- Point out the request flow: router, validation/auth middleware, controller, service, and model.

## 0:30–1:15 — Customer account and catalog

- Open `/login` and sign in with the seeded customer account:
  - Email: `customer@shopsphere.com`
  - Password: `Customer@123`
- Browse the catalog.
- Demonstrate product search, category/price filters, sorting, pagination, and a product detail page.
- Add a product to the cart and show the cart quantity and server-backed total.
- Briefly resize the browser to demonstrate the responsive storefront layout.

## 1:15–2:15 — Checkout, payment, and orders

- Open the cart and continue to checkout.
- Select or create a delivery address.
- Explain that checkout recalculates prices and validates stock on the server.
- Place the order with an idempotency key.
- Use the simulated payment flow with `success` to transition the order to `paid`.
- Optionally repeat with `failure` to show a failed payment attempt that leaves the order eligible for retry.
- Open order history and the order detail page.
- If the order is still eligible, demonstrate cancellation and explain that stock is restored once and the order history is preserved.

## 2:15–3:30 — Admin operations

- Sign out, then sign in with:
  - Email: `admin@shopsphere.com`
  - Password: `Admin@123456`
- Confirm that the admin is routed to `/admin`, not the customer storefront.
- Show the dashboard metrics and recent orders.
- Visit product/category management, inventory adjustments, customers, and orders.
- Demonstrate an order lifecycle transition and open the audit trail to show the immutable event.
- Resize to a 320px viewport and show that the admin dashboard remains within the viewport.

## 3:30–4:30 — Engineering evidence and limitations

- Open [architecture.md](./architecture.md), [erd.md](./erd.md), and [api/openapi.yaml](./api/openapi.yaml).
- Mention idempotency protections, server-calculated totals, stock predicates, order snapshots, and active-admin checks.
- Show the test/build commands in [README.md](../README.md).
- State the limitations clearly:
  - Payments are simulated; no real charge, webhook, refund, or active Razorpay flow exists.
  - Transaction-backed production workflows require MongoDB replica set or mongos topology.
  - The repository has no Docker, CI, or hosting manifest.

## If time is short

Prioritize the customer catalog/cart flow, one checkout/payment result, the admin redirect/dashboard, and the audit trail. Use the documentation and test commands as the final evidence rather than navigating every admin page.
