# 🚜 Agripool — Agricultural Transport Marketplace

A full-stack platform that connects **farmers** with **transporters** to efficiently move agricultural produce from farm to market. Built with **Laravel 11** (backend API) and **React + Vite** (frontend SPA).

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Frontend Pages](#-frontend-pages)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Development Servers](#-development-servers)
- [Features Implemented](#-features-implemented)
- [Role-Based Access Control](#-role-based-access-control)

---

## 🌾 Project Overview

Agripool solves a critical last-mile logistics problem in agriculture: **farmers struggle to find affordable, reliable transport for their produce**, while **transporters often run trucks at partial capacity**. Agripool acts as the intermediary marketplace:

1. **Farmers** post transport requests (cargo weight, destination, required date).
2. **Transporters** register their vehicles and schedule available routes.
3. The **Matching Engine** automatically surfaces the best available vehicles sorted by geographic proximity.
4. **Farmers** book directly, with the system guaranteeing capacity via database-level row locking.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Laravel 11 |
| Authentication | Laravel Sanctum (Token-based) |
| Database | MySQL (`agripool_db`) |
| Frontend | React 18 + Vite |
| HTTP Client | Axios |
| Routing | React Router v6 |

---

## 🏗 Architecture

```
Sharing_Transportation/
├── agripool/          # Laravel 11 Backend (API Server)
│   ├── app/
│   │   ├── Exceptions/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/
│   │   │   │   ├── Admin/
│   │   │   │   ├── Farmer/
│   │   │   │   ├── Transporter/
│   │   │   │   └── Shared/
│   │   │   ├── Middleware/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/migrations/
│   └── routes/api.php
│
└── frontend/          # React + Vite Frontend (SPA)
    └── src/
        ├── api.js
        ├── contexts/
        ├── components/
        └── pages/
            ├── farmer/
            └── transporter/
```

---

## 🗄 Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| name | string | |
| email | string | unique |
| phone | string | nullable |
| role | enum | `farmer`, `transporter` |
| password | string | bcrypt hashed |
| timestamps | | |

### `vehicles`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| user_id | FK → users | Owner (transporter) |
| registration_no | string | unique |
| vehicle_type | enum | `truck`, `mini-truck`, `pickup` |
| total_capacity_kg | float | |
| remaining_capacity_kg | float | Auto-managed |
| model | string | |
| is_available | boolean | default `true` |

### `vehicle_routes`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| vehicle_id | FK → vehicles | |
| origin | string | |
| destination | string | |
| origin_lat / origin_lng | decimal(10,7) | Used in distance calc |
| dest_lat / dest_lng | decimal(10,7) | |
| departure_date | date | |
| departure_time | time | |
| price_per_kg | decimal(8,2) | |

### `transport_requests`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| farmer_id | FK → users | |
| pickup_location | string | |
| destination | string | |
| pickup_lat / pickup_lng | decimal(10,7) | Used in matching |
| cargo_weight_kg | float | |
| produce_type | string | |
| required_date | date | Must be future |
| status | enum | `open`, `matched`, `booked`, `cancelled` |

### `bookings`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| farmer_id | FK → users | |
| vehicle_id | FK → vehicles | |
| request_id | FK → transport_requests | |
| booked_weight_kg | float | |
| total_cost | decimal(10,2) | Auto-calculated |
| status | enum | `pending`, `confirmed`, `in_transit`, `delivered`, `cancelled` |
| cancellation_reason | string | nullable |

### `tracking_updates`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| booking_id | FK → bookings | |
| status | string | |
| description | string | |
| updated_by | FK → users | |

### `notifications`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| user_id | FK → users | |
| booking_id | FK → bookings | |
| message | string | |
| is_read | boolean | |

---

## 🔌 API Reference

All API routes are prefixed with `/api/v1`. Protected routes require an `Authorization: Bearer {token}` header.

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/register` | Register (name, email, phone, password, password_confirmation, role) |
| `POST` | `/api/v1/login` | Login — returns `access_token` + user object |

### Authentication (Protected — `auth:sanctum`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/logout` | Revoke current Sanctum token |
| `GET` | `/api/v1/me` | Get authenticated user profile |

### Farmer Routes (`role:farmer`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/requests` | List my transport requests (paginated, newest first) |
| `POST` | `/api/v1/requests` | Create a new transport request |
| `GET` | `/api/v1/requests/{id}` | View a single transport request |
| `DELETE` | `/api/v1/requests/{id}` | Cancel an open request |
| `GET` | `/api/v1/matches?request_id={id}` | Get matching vehicle routes for a request |
| `GET` | `/api/v1/farmer/bookings` | List my bookings (paginated) |
| `POST` | `/api/v1/farmer/bookings` | Create a booking (vehicle_id, request_id, route_id) |
| `GET` | `/api/v1/farmer/bookings/{id}` | Booking detail with tracking updates |
| `POST` | `/api/v1/farmer/bookings/{id}/cancel` | Cancel a pending/confirmed booking |

### Transporter Routes (`role:transporter`, prefix `/transporter`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/transporter/vehicles` | List my fleet |
| `POST` | `/api/v1/transporter/vehicles` | Register a new vehicle |
| `PUT` | `/api/v1/transporter/vehicles/{id}` | Update vehicle details |
| `DELETE` | `/api/v1/transporter/vehicles/{id}` | Delete vehicle (no active bookings check) |
| `GET` | `/api/v1/transporter/vehicles/{vehicle}/routes` | List routes for a vehicle |
| `POST` | `/api/v1/transporter/vehicles/{vehicle}/routes` | Schedule a new route |
| `PUT` | `/api/v1/transporter/routes/{id}` | Edit a route |
| `GET` | `/api/v1/transporter/bookings/incoming` | Incoming bookings (filterable by `?status=`) |
| `PATCH` | `/api/v1/transporter/bookings/{booking}/status` | Accept or reject a booking |

---

## 🖥 Frontend Pages

### Public Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `LoginPage` | Email + password login form |
| `/register` | `RegisterPage` | Registration form with role selection (farmer/transporter) |

### Protected Pages (all require login)
| Route | Component | Role | Description |
|-------|-----------|------|-------------|
| `/` | `Dashboard` | Any | Post-login landing page |
| `/farmer/requests` | `MyRequestsPage` | Farmer | Paginated list of transport requests with status badges |
| `/farmer/requests/new` | `NewRequestPage` | Farmer | Form to create a new transport request |
| `/farmer/requests/:id` | `RequestDetailPage` | Farmer | Full request details + cancel button + View Matches link |
| `/farmer/requests/:id/matches` | `MatchResultsPage` | Farmer | Matched transporters sorted by proximity, with Book button |
| `/farmer/bookings/:id` | `BookingDetailPage` | Farmer | Booking details + vertical tracking timeline + cancel |
| `/transporter/fleet` | `MyFleetPage` | Transporter | All owned vehicles with capacity indicators |
| `/transporter/fleet/new` | `AddVehiclePage` | Transporter | Add a new vehicle to the fleet |
| `/transporter/fleet/:vehicleId/routes/new` | `ScheduleRoutePage` | Transporter | Schedule a route for a specific vehicle |
| `/transporter/bookings` | `IncomingBookingsPage` | Transporter | Live feed of incoming booking requests with Accept/Reject |

---

## ⚙️ Setup & Installation

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm
- MySQL 8+

### 1. Clone the repository
```bash
git clone <repo-url>
cd Sharing_Transportation
```

### 2. Backend Setup
```bash
cd agripool
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your database credentials (see [Environment Variables](#-environment-variables)).

```bash
php artisan migrate
php artisan sanctum:install  # if not already done
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🔐 Environment Variables

Create `agripool/.env` with the following:

```env
APP_NAME=Agripool
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=agripool_db
DB_USERNAME=root
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 🚀 Development Servers

Run both servers simultaneously in two terminal tabs:

**Terminal 1 — Laravel API:**
```bash
cd agripool
php artisan serve
# Runs at: http://localhost:8000
```

**Terminal 2 — React Frontend:**
```bash
cd frontend
npm run dev
# Runs at: http://localhost:5173
```

---

## ✅ Features Implemented

### Step 1 — Project Setup
- Laravel 11 backend scaffolded with Sanctum
- React + Vite frontend initialized
- MySQL database configured
- CORS configured for `http://localhost:5173`
- Folder structure: `Controllers/Auth`, `Controllers/Farmer`, `Controllers/Transporter`, `Controllers/Shared`, `Services/`

### Step 2 — Authentication System
- `AuthController` with `register`, `login`, `logout`, `me`
- `role` enum column on `users` table (`farmer`, `transporter`)
- `RoleMiddleware` registered as `role` in the kernel
- React `AuthContext` with `AuthProvider` and `ProtectedRoute`
- Token stored in `localStorage`, user object in memory
- Password confirmation enforced on registration

### Step 3 — Database Migrations
- `vehicles` — fleet with capacity tracking
- `vehicle_routes` — scheduled routes with geo-coordinates
- `transport_requests` — farmer cargo requests
- `bookings` — booked rides with cost and status tracking
- `tracking_updates` — live status log per booking
- `notifications` — user notification records

### Step 4 — Farmer Module
- `RequestController` with full CRUD (no update)
- `StoreTransportRequest` Form Request (validates future dates)
- Ownership enforcement on show/destroy
- Pages: `NewRequestPage`, `MyRequestsPage`, `RequestDetailPage`

### Step 5 — Transporter Module
- `VehicleController` — fleet management with active-booking deletion guard
- `RouteController` — route scheduling with ownership and date validation
- `BookingController` (Transporter) — incoming booking feed with Accept/Reject
- Capacity automatically restored on rejection
- Pages: `MyFleetPage`, `AddVehiclePage`, `ScheduleRoutePage`, `IncomingBookingsPage`

### Step 6 — Matching System
- `MatchingService` with Manhattan distance geographic sorting
- `MatchingController` with request ownership validation
- `GET /api/v1/matches?request_id=X` endpoint
- `MatchResultsPage` showing vehicle cards with pricing and transporter info
- "View Matches" button wired in `RequestDetailPage`

### Step 7 — Booking System
- `BookingService` with `DB::transaction` + `lockForUpdate()` to prevent race conditions
- `InsufficientCapacityException` for clean 422 error handling
- `BookingController` (Farmer) — create, list, show, cancel
- Cancellation restores vehicle capacity and resets request to 'open'
- `BookingDetailPage` with vertical tracking timeline and cancel confirmation dialog

---

## 🔒 Role-Based Access Control

| Middleware | Applies To | Enforces |
|-----------|-----------|---------|
| `auth:sanctum` | All protected routes | Valid Bearer token |
| `role:farmer` | `/requests`, `/matches`, `/farmer/bookings` | User `role === 'farmer'` |
| `role:transporter` | `/transporter/*` | User `role === 'transporter'` |

Returns `403 Forbidden` if the role doesn't match.

---

## 📝 Next Steps (Upcoming)

- **Tracking Module**: Transporters update real-time status of in-transit bookings
- **Notification System**: Push alerts to farmers/transporters on booking state changes
- **Geolocation**: Leaflet.js map integration for pickup/destination coordinates
- **Admin Panel**: System-wide oversight and reporting dashboard
