# Prebite — Canteen Pre-Order System

Prebite is a premium, full-stack canteen pre-order web application designed to eliminate long queues. It features a modern, high-conversion "Full-Page Scroll" landing page, real-time order tracking, and a secure payment gateway integration.

---

## What's New in v2.0 🚀

- **✨ Full-Page Scroll UI**: A premium, "Apple-style" landing page experience where sections snap vertically for high impact.
- **🛡️ Socket.io Hardening**: Secure WebSocket connections using JWT handshake authentication.
- **🔐 Enhanced Token Safety**: Migrated JWT storage to `sessionStorage` to mitigate persistent XSS risks.
- **📱 Optimized Aesthetic**: Compact, canteen-themed design with floating food elements and refined typography.
- **💳 Fully Integrated Razorpay**: Seamless checkout flow with localized timezone handling for pickup.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Zustand, Lucide Icons |
| Backend   | Node.js, Express, Prisma ORM, SQLite / PostgreSQL |
| Real-time | Socket.io (Auth-protected)                      |
| Auth      | JWT (Access + Refresh) / Session Management     |
| Payment   | Razorpay SDK                                    |

---

## Features

- 🥡 **Full-Page Snap Scroll**: Engaging landing page sections (Hero, How It Works, Features, Testimonials).
- 🍽️ **Smart Menu**: Categorised menu with real-time availability.
- 🛒 **Intuitive Cart**: Quantity controls and special instruction notes.
- 📦 **QR Code Pickups**: Secure token generation and QR code confirmation for staff verification.
- 📡 **Live Updates**: Real-time status tracking (Preparing → Ready → Collected).
- 🔐 **Secure Auth**: Role-based access (Admin / Student) with hardened session security.
- 📊 **Admin Power**: Comprehensive dashboard for menu management and order analytics.
- 🛡️ **Cyber Shield**: Hardened with Helmet, Rate Limiting, and Handshake Verification.

---

## Prerequisites

- Node.js **18+** and npm
- Git

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Pranavyadav9519/Prebite.git
cd Prebite
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET and JWT_REFRESH_SECRET to strong random strings
# Add Razorpay test/live credentials before using the payment flow:
# RAZORPAY_KEY_ID=rzp_test_xxxxx
# RAZORPAY_KEY_SECRET=xxxxx

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env if your API runs on a different URL
```

> ⚠️ **JWT_SECRET** and **JWT_REFRESH_SECRET** are **required**. The server will refuse to start without them.
>
> ⚠️ **RAZORPAY_KEY_ID** and **RAZORPAY_KEY_SECRET** are required for the hosted checkout flow. Without them, `/api/v1/orders/checkout` returns `503` by design.

### 4. Set up the database

```bash
cd backend
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 5. Run the application

```bash
# Backend (from /backend)
npm run dev

# Frontend (from /frontend, in a separate terminal)
npm run dev
```

The API will be available at `http://localhost:4000` and the frontend at `http://localhost:5173`.

---

## Folder Structure

```
Prebite/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Seed data
│   ├── src/
│   │   ├── config/            # Prisma client
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, error handling
│   │   ├── routes/            # Express routers
│   │   └── utils/             # Helpers
│   ├── server.js              # HTTP + Socket.io server
│   └── src/app.js             # Express app
└── frontend/
    └── src/
        ├── api/               # Axios API clients
        ├── components/        # Reusable UI components
        ├── pages/             # Route-level pages
        └── store/             # Zustand state stores
```

---

## API Endpoints

| Method | Path                        | Auth     | Description              |
|--------|-----------------------------|----------|--------------------------|
| POST   | /api/v1/auth/register       | Public   | Register a new user      |
| POST   | /api/v1/auth/login          | Public   | Login and receive tokens |
| POST   | /api/v1/auth/refresh        | Public   | Refresh access token     |
| GET    | /api/v1/auth/me             | Required | Get current user         |
| GET    | /api/v1/menu                | Public   | List menu items          |
| POST   | /api/v1/menu                | Admin    | Create menu item         |
| PUT    | /api/v1/menu/:id            | Admin    | Update menu item         |
| DELETE | /api/v1/menu/:id            | Admin    | Delete menu item         |
| GET    | /api/v1/orders              | Required | List user's orders       |
| POST   | /api/v1/orders              | Required | Place a new order        |
| GET    | /api/v1/orders/:id          | Required | Get order details        |
| PATCH  | /api/v1/orders/:id/status   | Admin    | Update order status      |
| GET    | /api/v1/analytics           | Admin    | Get analytics data       |
| GET    | /api/v1/health              | Public   | Health check             |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Required | Description                                    |
|-----------------|----------|------------------------------------------------|
| `DATABASE_URL`  | Yes      | Prisma database URL (e.g. `file:./dev.db`)    |
| `JWT_SECRET`    | Yes      | Secret for signing access tokens              |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens            |
| `PORT`          | No       | Server port (default: 4000)                   |
| `NODE_ENV`      | No       | `development` or `production`                 |
| `CORS_ORIGINS`  | No       | Comma-separated allowed origins               |

### Frontend (`frontend/.env`)

| Variable        | Required | Description                    |
|-----------------|----------|--------------------------------|
| `VITE_API_URL`  | No       | Backend API base URL           |

---

## License

[MIT](LICENSE)
