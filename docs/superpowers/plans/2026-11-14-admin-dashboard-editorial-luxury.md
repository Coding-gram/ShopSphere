# Admin Dashboard Editorial Luxury Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the ShopSphere admin dashboard a more elegant editorial-luxury presentation without changing its data, permissions, or routes.

**Architecture:** Keep `AdminDashboard` as the page-level composition and reuse the existing dashboard hook, status badge, formatting helpers, and design tokens. Limit the implementation to presentational changes and focused component tests.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide React, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-14-admin-dashboard-editorial-luxury-design.md`

## Global Constraints

- Preserve all current data, routes, permissions, loading, error, and empty states.
- Do not add API, database, authentication, or dependency changes.
- Use existing Tailwind classes, Lucide icons, ShopSphere color tokens, and typography.
- Keep the dashboard responsive at mobile, tablet, and desktop widths.

## Review Focus

- Loading state: the redesigned shell must still expose `aria-busy="true"` and `aria-label="Loading dashboard"` — covered by the existing loading-state test.
- Empty recent orders: the new panel must still show `No orders yet` — covered by the existing empty-state test.
- Recent order navigation: the refined row/action must preserve the order detail href and accessible name — covered by the existing metrics/orders test.
- Long order/customer values: the table must remain usable through its existing horizontal overflow wrapper — verify in browser at desktop and mobile widths.
- Keyboard focus: new links/buttons must retain visible focus styles — verify with the existing focus classes and browser inspection.

---

### Task 1: Refine Admin Dashboard Presentation

**Files:**
- Modify: `client/src/pages/admin/AdminDashboard.tsx`
- Test: `client/src/pages/admin/AdminDashboard.test.tsx`

**Interfaces:**
- Consumes: `useAdminDashboard()` result, `OrderStatusBadge`, `formatPrice`, and the existing `AdminDashboard` route contract.
- Produces: The same accessible dashboard content and links with improved editorial-luxury hierarchy and responsive presentation.

- [ ] **Step 1: Extend the dashboard test assertions**

Add focused assertions for the new visible presentation landmarks, such as the operational context label and the status/recent-orders panel headings, while retaining the existing metric, loading, empty, and order-link assertions.

- [ ] **Step 2: Run the focused dashboard test**

Run: `cd client && npm test -- --run src/pages/admin/AdminDashboard.test.tsx`

Expected: Existing assertions pass; any new landmark assertion fails before the presentation is implemented.

- [ ] **Step 3: Implement the editorial-luxury layout**

Update `AdminDashboard.tsx` only:

- strengthen the header hierarchy with a compact operational context treatment;
- give the four metrics differentiated but restrained icon containers and clearer value/detail hierarchy;
- refine the order-status panel into a balanced responsive grid without changing status values;
- refine the recent-orders panel, row hover/focus treatment, and manage-orders action;
- preserve `aria-label`, `aria-labelledby`, table caption, empty state, and focus-visible styles;
- use mobile-first responsive classes and keep the existing horizontal table overflow.

- [ ] **Step 4: Run focused tests and client build**

Run: `cd client && npm test -- --run src/pages/admin/AdminDashboard.test.tsx`

Expected: All dashboard tests pass.

Run: `npm run build:client`

Expected: Vite production build completes successfully.

- [ ] **Step 5: Verify the rendered dashboard**

Open `/admin` in the browser at 320px, 768px, 1024px, and 1440px widths. Confirm the dashboard remains readable, cards do not overflow, the recent-orders table scrolls rather than breaking the page, and focus states remain visible.

- [ ] **Step 6: Review the final diff**

Confirm only the dashboard page, its focused test, and the approved design/plan documents are part of this task. Do not modify unrelated existing work.
