# ShopSphere

A premium, production-quality, full-stack e-commerce platform built with React, Express, MongoDB, and TypeScript.

## Tech Stack

### Frontend
- **React** + **Vite** + **TypeScript**
- **Tailwind CSS** with custom design tokens
- **shadcn/ui** components (customized editorial theme)
- **React Router** for client routing
- **TanStack Query** for server state management
- **React Hook Form** + **Zod** for form validation
- **Framer Motion** for animations
- **Lucide** icons

### Backend
- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose** ODM
- **Zod** request validation
- **JWT** authentication with HTTP-only secure cookies
- **bcrypt** password hashing

### External Services
- **Razorpay** (Test Mode) for payment processing
- **Cloudinary** for image uploads (optional)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd ecommerce-platform
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example server/.env
   ```
   Edit `server/.env` with your MongoDB URI and JWT secret.

3. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client && npm install

   # Install server dependencies
   cd ../server && npm install
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 — Backend (from /server)
   npm run dev

   # Terminal 2 — Frontend (from /client)
   npm run dev
   ```

5. **Open the app**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - API: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

## Project Structure

```
ecommerce-platform/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── common/         # Loader, ErrorDisplay, EmptyState
│   │   │   └── layout/         # Header, Footer, MobileNav
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Page layouts (Store, Admin, Auth)
│   │   ├── lib/                # Utilities (cn, api, formatPrice)
│   │   ├── pages/              # Route-level components
│   │   ├── providers/          # Context providers
│   │   ├── services/           # API service functions
│   │   └── types/              # TypeScript interfaces
│   └── ...
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # Database, environment
│   │   ├── middleware/         # Auth, validation, errors
│   │   ├── models/             # Mongoose schemas (Phase 2+)
│   │   ├── modules/            # Feature modules (Phase 2+)
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # ApiError, ApiResponse, asyncHandler
│   └── ...
├── docs/                       # Documentation
├── .env.example                # Environment template
└── README.md
```

## Design System

ShopSphere uses an **editorial luxury** design direction:

- **Typography:** Cormorant (headings) + Montserrat (body)
- **Palette:** Warm neutrals with gold accent (#A16207)
- **Primary:** #1C1917 (near-black)
- **Background:** #FAFAF9 (warm off-white)
- **Style:** Minimal, editorial, refined

## Development Phases

1. ✅ **Foundation** — Project scaffold, design system, layouts
2. ⬜ **Core Backend** — Auth, products, categories
3. ⬜ **Storefront** — Homepage, catalog, product detail
4. ⬜ **Shopping** — Cart, wishlist, checkout
5. ⬜ **Payments & Orders** — Razorpay, order management
6. ⬜ **Admin** — Dashboard, product/order management
7. ⬜ **Polish & Deploy** — Testing, security, deployment

## License

Private — Academic project.

