# New Arrivals Catalog Design

## Intent

Add 10 distinct catalog products and make the New Arrivals navigation show only
those products instead of showing the entire catalog sorted by creation date.

## Goals

- Add exactly 10 idempotent products to the existing catalog seed additions.
- Mark those products with an explicit `isNewArrival` flag.
- Keep Shop showing the complete active catalog.
- Make New Arrivals query only flagged products.
- Preserve existing filtering, sorting, pagination, authentication, and checkout
  behavior.

## Non-goals

- No changes to checkout, inventory, product administration workflows, or visual
  design.
- No date-based automatic expiration of New Arrivals.
- No new dependency or separate database collection.

## Constraints

- Existing product listing contracts must remain backward compatible.
- Seed scripts must remain safe to rerun without duplicate SKUs.
- The new query parameter must be validated server-side.
- Existing products remain available in Shop and are not silently reclassified.

## Approaches

1. **Explicit `isNewArrival` flag — selected.** Store collection membership on
   each product and filter with `newArrivals=true`. This is deterministic,
   demo-friendly, and keeps collection ownership in the product model.
2. **Date window.** Infer New Arrivals from `createdAt`. This avoids a schema
   field but makes the collection change over time and is difficult to control
   reliably in seeded environments.

The explicit flag is selected because the requested behavior is a curated set
of 10 products, not merely a different ordering of all products.

## Implementation outline

- Add `isNewArrival` to the product schema, TypeScript interfaces, and product
  create/update validation.
- Extend public product filters with `newArrivals`, validate it, and apply it
  server-side.
- Add `newArrivals=true` to the New Arrivals links and preserve the existing
  sort as newest-first within the collection.
- Add 10 catalog additions with unique SKUs, imagery, categories, and
  `isNewArrival: true`; existing additions remain false by default.
- Add regression tests proving the client sends the flag and the server filters
  by it.

## Verification

- Run focused client/server regression tests.
- Run the complete frontend and backend test suites.
- Run client lint and production build.
- Browser-check that Shop shows the full catalog and New Arrivals shows a
  distinct 10-product collection.
