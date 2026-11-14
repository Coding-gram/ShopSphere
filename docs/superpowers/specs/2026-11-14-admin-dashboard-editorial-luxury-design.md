# Admin Dashboard Editorial Luxury Design

## Intent

Make the admin dashboard feel like a polished ShopSphere operations workspace rather than a collection of basic panels, while preserving all current data, routes, permissions, and responsive behavior.

## Goals

- Establish a clear editorial hierarchy with a stronger page header and purposeful section grouping.
- Refine metric cards with restrained warmth, clearer emphasis, and subtle interaction states.
- Make order status and recent orders easier to scan without adding unsupported metrics.
- Keep the dashboard usable at mobile, tablet, and desktop widths.
- Preserve accessible labels, keyboard focus, loading, error, and empty states.

## Non-goals

- No API, database, authentication, or admin-control changes.
- No new charts or metrics that are not already returned by the dashboard endpoint.
- No redesign of the other admin pages in this change.

## Approach

The approved approach is **editorial luxury**: use the existing ShopSphere tokens and typography, add a restrained warm accent treatment to the overview header and metric cards, improve card hierarchy and spacing, and give the status/recent-order sections clearer grouping. The existing data structures remain the source of truth; the implementation is limited to `AdminDashboard.tsx` and focused dashboard tests.

Modern operations was not selected because it would introduce a colder visual language that does not match the storefront. Minimal refinement was not selected because it would not address the dashboard's lack of visual hierarchy.

## Design

- Header: compact eyebrow, stronger title, supporting copy, and a small operational context label.
- Metrics: four responsive cards with differentiated icon containers, prominent values, and consistent supporting descriptions.
- Status: a visually balanced status grid with status badges and count emphasis.
- Orders: a refined table container with clearer row hover/focus treatment and a stronger "Manage orders" action.
- Responsive behavior: one-column mobile layout, two-column tablet metrics, and four-column desktop metrics; tables remain horizontally scrollable.

## Constraints

Use the existing Tailwind classes, Lucide icons, ShopSphere color tokens, and current testing stack. Do not add dependencies or alter server contracts.
