# Prebite — Canteen Pre-Order System

Prebite is a full-stack canteen pre-order web application that allows students to browse the menu, place orders in advance, and track them in real time. Admins can manage the menu and update order statuses from a dedicated dashboard.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Zustand, Axios    |
| Backend   | Node.js, Express, Prisma ORM, SQLite / PostgreSQL |
| Real-time | Socket.io                                       |
| Auth      | JSON Web Tokens (JWT) — access + refresh tokens |

---

## Features

- 🍽️ Browse categorised canteen menu with search & filter
- 🛒 Cart management with quantity controls
- 📦 Place pre-orders and receive a confirmation QR code
- 📡 Real-time order status updates via WebSocket
- 🔐 JWT-based authentication (access + refresh tokens)
- 👤 Role-based access control (admin / student)
- 📊 Admin analytics dashboard
- 🛡️ Security hardened with Helmet, CORS restrictions, and rate limiting

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

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env if your API runs on a different URL
```

> ⚠️ **JWT_SECRET** and **JWT_REFRESH_SECRET** are **required**. The server will refuse to start without them.

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
