# ShopSphere

ShopSphere is a full-stack e-commerce application for a curated product catalog. Customers can browse products, manage a cart and delivery addresses, place orders, run deterministic simulated payments, view order history, and cancel eligible orders. Administrators have protected catalog, inventory, customer, order, audit, and dashboard controls.

## Features

- Product catalog with search, filtering, sorting, categories, featured products, and pagination.
- Customer registration, login, profile updates, password changes, cart, addresses, checkout, orders, cancellation, and payment simulation.
- Server-calculated order totals, stock checks, immutable order snapshots, and idempotent checkout/payment/cancellation requests.
- Admin dashboard, product/category management, inventory adjustments, customer status management, order lifecycle management, and audit-event search.
- Responsive React storefront and admin interface with accessible loading, error, empty, and permission states.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, TypeScript, React Router, TanStack Query, Tailwind CSS, Radix UI, React Hook Form, Zod, Lucide |
| Backend | Node.js, Express 5, TypeScript, Mongoose |
| Database | MongoDB |
| Security | JWT in HTTP-only cookies, bcryptjs, Helmet, CORS, Express rate limiting, Zod |
| Testing | Vitest, React Testing Library, Supertest, MongoDB Memory Server replica set |

## Architecture

The application is a modular monolith:

```text
Browser → React Router → pages/components → TanStack Query → Express API
                                                        ↓
                                      routes → middleware → controllers
                                                        ↓
                                                services → Mongoose
                                                        ↓
                                                      MongoDB
```

- `client/` contains the React SPA, layouts, pages, hooks, API services, and UI components.
- `server/` contains Express routes, validation middleware, authentication, feature modules, services, Mongoose models, and scripts.
- `docs/architecture.md` describes the implemented workflows and design decisions.
- `docs/api/openapi.yaml` documents the REST API.
- `docs/erd.md` contains the Mermaid entity-relationship diagram.

## Prerequisites

- Node.js 18 or newer.
- npm.
- MongoDB 6+ locally or a MongoDB Atlas deployment.
- A MongoDB replica set or mongos is recommended for transactional checkout, payment, cancellation, inventory, and admin mutations. Development checkout and simulated payment have guarded standalone-MongoDB fallbacks; replica-set deployment is still the safer configuration.

## Local setup

From the repository root:

```powershell
npm install
Set-Location client
npm install
Set-Location ..\server
npm install
```

Copy the environment template:

```powershell
Copy-Item .env.example server\.env
```

Edit `server\.env` and set at least `MONGODB_URI` and `JWT_SECRET`. Do not commit `server\.env`.

Start both applications from the repository root:

```powershell
npm run dev
```

Or start them separately:

```powershell
npm run dev:server
npm run dev:client
```

- Frontend: <http://localhost:5173>
- API health check: <http://localhost:5000/api/v1/health>

## Environment variables

The complete non-secret template is [`.env.example`](./.env.example). The server validates configuration at startup.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | Express listening port |
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret; use a strong private value |
| `JWT_EXPIRES_IN` | No | `7d` | JWT lifetime |
| `COOKIE_DOMAIN` | No | — | Optional cookie domain |
| `CLIENT_URL` | No | `http://localhost:5173` | CORS origin |
| `RAZORPAY_KEY_ID` | No | — | Reserved optional configuration; current payments use the simulated gateway |
| `RAZORPAY_KEY_SECRET` | No | — | Reserved optional configuration; current payments use the simulated gateway |
| `CLOUDINARY_CLOUD_NAME` | No | — | Reserved optional image-upload configuration |
| `CLOUDINARY_API_KEY` | No | — | Reserved optional image-upload configuration |
| `CLOUDINARY_API_SECRET` | No | — | Reserved optional image-upload configuration |

## Database seed and migrations

Run commands from `server/` after configuring `server/.env`:

```powershell
Set-Location server
npm run seed
npm run seed:catalog
npm run migrate:order-statuses
```

- `npm run seed` clears the `User`, `Category`, and `Product` collections, then creates the demo users, categories, and base catalog. Review the script before using it against shared data.
- `npm run seed:catalog` upserts the additional catalog products and refreshes their image URLs.
- `npm run migrate:order-statuses` safely maps legacy order statuses and preserves payment status.
- Image repair scripts are available after building the server: `npm run repair:candle-image` and `npm run repair:product-images`.

### Verified demo credentials

These credentials are defined by `server/src/scripts/seed.ts`:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@shopsphere.com` | `Admin@123456` |
| Customer | `customer@shopsphere.com` | `Customer@123` |

Use the admin account at `/login`; successful admin login currently redirects to `/admin`.

## Testing and builds

Server commands:

```powershell
Set-Location server
npm test
npm run build
```

Client commands (the client package has no `test` script):

```powershell
Set-Location client
npx vitest run
npm run build
```

Equivalent root build commands are:

```powershell
npm run build:server
npm run build:client
```

For a focused test:

```powershell
Set-Location client
npx vitest run src/pages/admin/AdminDashboard.test.tsx
```

The server test setup uses `mongodb-memory-server` with a one-node replica set so transaction behavior is covered without requiring a local MongoDB instance.

## Demo and screenshots

1. Start the server and client.
2. Open <http://localhost:5173>.
3. Use the customer credentials to browse, add an item, create an address, check out, and exercise simulated payment success/failure.
4. Sign out and use the admin credentials.
5. Open `/admin` and visit products, categories, inventory, customers, orders, audit trail, and dashboard pages.
6. Capture screenshots at desktop and mobile widths. The dashboard and storefront are designed for 320px, 768px, 1024px, and 1440px viewports.

## Known limitations and deployment caveats

- Payments are deterministic and local (`success` or `failure`) through `simulatedPaymentGateway`; no real charge is made.
- Razorpay variables are present as reserved configuration, but there is no active Razorpay request, webhook, signature verification, or refund workflow.
- Cloudinary variables are present as reserved configuration, but current catalog images use stored URLs.
- MongoDB transactions require a replica set or mongos. Checkout and simulated payment have limited standalone fallbacks for local development, but production should use a replica set because other transaction-backed mutations do not provide that fallback.
- There is no Dockerfile, compose file, CI workflow, hosting manifest, or production process manager configuration in this repository.
- The seed script is a development/demo reset for selected collections, not a production migration.
- The API uses HTTP-only cookies and a configured CORS origin; production deployment must use HTTPS and a strong secret.

## Submission documents

- [Architecture](./docs/architecture.md)
- [OpenAPI API reference](./docs/api/openapi.yaml)
- [Entity-relationship diagram](./docs/erd.md)
- [Technical report and walkthrough outline](./docs/submission.md)

## License

Private academic project.
