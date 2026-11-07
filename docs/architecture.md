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
- Payment signatures verified server-side
- Input validated with Zod on both client and server

