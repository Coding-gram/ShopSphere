# New Arrivals Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 10 seeded products and make New Arrivals return only the explicitly flagged collection while Shop continues to show the full catalog.

**Architecture:** Add an optional `isNewArrival` product field with a default of `false`. Extend the existing public product-list query with `newArrivals=true`, filter server-side, and pass that flag from the New Arrivals links through the existing client query service. Seed additions remain idempotent by SKU.

**Tech Stack:** TypeScript, Express, Zod, Mongoose, React, React Router, TanStack Query, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-14-new-arrivals-catalog-design.md`

## Global Constraints

- Existing product listing contracts remain backward compatible.
- Seed scripts remain safe to rerun without duplicate SKUs.
- The new query parameter is validated server-side.
- Existing products remain available in Shop and are not silently reclassified.
- Do not change checkout, inventory, product administration workflows, or visual design.

## Review Focus

- Missing `newArrivals` query: preserve the existing full active catalog.
- Invalid `newArrivals` values: reject them through the existing Zod validation path.
- Seed reruns: update existing SKUs without duplicating products.
- Product combinations: apply New Arrivals together with search/category/price/pagination filters.
- Client cache separation: include the flag in the serialized request and React Query key.

---

### Task 1: Add server-side New Arrivals filtering

**Files:**
- Modify: `server/src/models/Product.ts`
- Modify: `server/src/modules/products/products.service.ts`
- Modify: `server/src/modules/products/products.validators.ts`
- Test: `server/src/__tests__/phase2.test.ts` or the existing product-list test file

**Interfaces:**
- Consumes: existing `listProducts(query)` public listing flow.
- Produces: optional `newArrivals?: boolean` query support; products without the flag continue to behave as before.

- [ ] **Step 1: Write failing tests**

Add focused tests asserting:
- `newArrivals=true` adds `isNewArrival: true` to the product filter.
- An omitted flag does not restrict results to New Arrivals.
- The query validator accepts `true`/`false` and rejects invalid values through the existing validation response.

- [ ] **Step 2: Run the focused server tests**

Run from `server`:

```powershell
npm exec vitest run src/__tests__/phase2.test.ts
```

Expected: the new assertions fail before implementation.

- [ ] **Step 3: Implement the contract**

Add `isNewArrival` to the product interface/schema with a default of `false`, add `newArrivals?: boolean` to `ProductQuery`, validate it with `z.coerce.boolean().optional()`, and apply `filter.isNewArrival = true` only when the query flag is true.

- [ ] **Step 4: Run the focused server tests again**

Expected: all selected product-list tests pass.

- [ ] **Step 5: Commit the server contract**

```powershell
git add server/src/models/Product.ts server/src/modules/products/products.service.ts server/src/modules/products/products.validators.ts server/src/__tests__/phase2.test.ts
git commit -m "feat: support curated new arrivals"
```

### Task 2: Add ten idempotent New Arrivals products

**Files:**
- Modify: `server/src/scripts/catalogAdditions.ts`
- Modify: `server/src/scripts/seed.ts`
- Test: existing seed/catalog test coverage if present; otherwise verify with the seed script and database query

**Interfaces:**
- Consumes: `CatalogAddition` and the existing SKU-based `seedCatalogAdditions` upsert.
- Produces: exactly 10 new catalog entries with unique SKUs and `isNewArrival: true`.

- [ ] **Step 1: Extend the catalog addition type and add ten products**

Add `isNewArrival: boolean` to `CatalogAddition`. Mark existing additions false and add ten new products across the existing categories with unique `SS-*` SKUs, valid image URLs, descriptions, prices, stock, tags, ratings, and `isNewArrival: true`.

- [ ] **Step 2: Preserve idempotent upsert behavior**

Ensure `seedCatalogAdditions.ts` includes `isNewArrival` in `$setOnInsert` and does not change existing products’ collection membership on rerun.

- [ ] **Step 3: Keep the full reset seed consistent**

Include the same ten product definitions in the full seed path, or refactor the shared seed data so a fresh database and an additions-only run produce the same New Arrivals collection without duplicated definitions.

- [ ] **Step 4: Verify seed data**

Run the existing seed/additions command against the configured local database, then query active products and verify:
- 10 products have `isNewArrival: true`.
- Existing products remain present.
- Rerunning the additions command reports existing matches and does not increase the count.

### Task 3: Connect client navigation and product queries

**Files:**
- Modify: `client/src/services/products.ts`
- Modify: `client/src/pages/Products.tsx`
- Modify: `client/src/components/layout/Header.tsx`
- Modify: `client/src/router.tsx`
- Modify: `client/src/types/index.ts`
- Test: `client/src/components/layout/Header.test.tsx`
- Test: `client/src/pages/Products.test.tsx`

**Interfaces:**
- Consumes: server query parameter `newArrivals=true`.
- Produces: New Arrivals links using `/products?newArrivals=true&sort=createdAt:desc`; Shop remains the complete catalog view.

- [ ] **Step 1: Write failing client tests**

Add assertions that:
- Header and mobile/redirect navigation use `newArrivals=true` for New Arrivals.
- Products parses the flag and passes `newArrivals: true` to `useProducts`.
- Product service serializes the flag as `newArrivals=true`.

- [ ] **Step 2: Run focused client tests**

Run from `client`:

```powershell
npm exec vitest run src/components/layout/Header.test.tsx src/pages/Products.test.tsx
```

Expected: the new assertions fail before implementation.

- [ ] **Step 3: Implement client query propagation**

Add `newArrivals?: boolean` to `ProductFilters`, serialize it when true, parse the URL flag in `Products.tsx`, include it in the API filter object, and update the New Arrivals navigation/redirect URLs. Keep the existing Shop alphabetical URL and all other filters unchanged.

- [ ] **Step 4: Run focused client tests again**

Expected: all selected tests pass.

- [ ] **Step 5: Commit the client contract**

```powershell
git add client/src/services/products.ts client/src/pages/Products.tsx client/src/components/layout/Header.tsx client/src/router.tsx client/src/types/index.ts client/src/components/layout/Header.test.tsx client/src/pages/Products.test.tsx
git commit -m "feat: show curated new arrivals"
```

### Task 4: Run regression and browser verification

**Files:**
- Verify only; update `docs/ui-ux-review.md` only if the behavior documentation needs the new collection semantics.

- [ ] **Step 1: Run complete backend tests**

From `server`:

```powershell
npm exec vitest run
npm run build
```

Expected: zero test failures and successful TypeScript/build output.

- [ ] **Step 2: Run complete frontend checks**

From `client`:

```powershell
npm exec vitest run
npm run lint
npm run build
```

Expected: all tests pass, lint exits successfully with only documented baseline warnings, and the production build succeeds.

- [ ] **Step 3: Browser-check the catalog**

Verify `/products` shows the full active catalog and `/products?newArrivals=true&sort=createdAt:desc` shows exactly the 10 flagged products. Confirm search, category, pagination, and refresh do not remove the flag.

- [ ] **Step 4: Review the final diff**

Run:

```powershell
git --no-pager diff --check
git status --short
```

Confirm only intentional source, test, seed, and design/plan files changed; preserve unrelated worktree changes and keep `AGENTS.md` untracked.
