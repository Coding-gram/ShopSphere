# ShopSphere Phase 4 Design

## Goal

Give authenticated customers a persistent cart, private address book, and a checkout that creates a real order only after the server revalidates each product's current price and stock.

## Decisions

- One `Cart` document belongs to each user. Cart item prices are snapshots for the cart display only; all add/update operations refresh them from `Product`.
- Checkout accepts only an address identifier. It never accepts client totals, product prices, or stock quantities.
- Checkout reads the customer's cart and address, conditionally decrements each active product's stock, creates an `Order` with immutable item/address snapshots, and clears the cart. A MongoDB transaction makes this all-or-nothing when transactions are available.
- Shipping and tax are intentionally zero because the phase has no shipping/tax pricing policy. Totals are strictly the server-calculated subtotal.
- The customer UI has dedicated Cart and Checkout pages. Address management is available in checkout and Profile, using the established React Query, React Hook Form, shadcn primitives, Tailwind tokens, and Sonner patterns.

## Acceptance criteria

- Protected cart APIs support fetching, add, quantity update, removal, and persisted state with server-side stock validation.
- Protected address APIs support customer-scoped list/create/update/delete and default delivery-address management.
- Protected checkout API validates the selected address, current active products, quantities, stock, and current prices before an order is created; it does not trust client totals.
- The UI handles loading, empty, error, invalid-stock/price, and order-confirmation states accessibly and responsively.
- Tests cover authorization, cart persistence and bounds, address ownership and CRUD, stale price/stock checkout rejection, successful placement, and key client interactions.
