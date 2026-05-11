# MunchGo

> 发现美味，轻松下单 — Discover delicious food, order with ease.

MunchGo is a full-stack food delivery and restaurant management platform built with React and Spring Boot. It connects customers with local restaurants, enables merchants to manage their menus and orders, and provides riders with a streamlined delivery workflow — all under one unified system.

---

## Features

### For Customers
- Browse and search restaurants by name or cuisine
- View menus, ratings, and delivery details
- Add items to cart and checkout
- Manage delivery addresses
- Track order status in real time
- Leave reviews and ratings
- Save favorite restaurants

### For Merchants
- Restaurant profile management
- Full menu management (categories, items, pricing)
- Order management with status updates
- Revenue analytics and statistics

### For Riders
- Available order pool
- Accept and deliver orders
- Delivery history

### For Admins
- Platform-wide user management
- Restaurant and content moderation
- System-wide analytics and reporting

---

## Tech Stack

### Backend
- **Java 21** + **Spring Boot 4**
- **Spring Security** + **JWT** authentication
- **Spring Data JPA** (Hibernate) + **PostgreSQL**
- **SpringDoc OpenAPI** (Swagger UI)
- **MapStruct** for DTO mapping
- **Lombok**

### Frontend
- **React 19** + **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **TanStack Query** for server state
- **React Hook Form** + **Zod** for form validation
- **Axios** for HTTP requests
- **Lucide React** for icons

---

## Project Structure

```
MunchGo/
├── docker-compose.yml           # Docker orchestration
├── init.sql                    # Database schema
├── sample-data.sql             # Sample test data
├── munchgo-backend/            # Spring Boot API
│   └── src/main/java/com/cwj/munchgobackend/
│       ├── controller/         # REST controllers
│       ├── service/            # Business logic
│       ├── model/              # Entities, DTOs, Enums
│       ├── repository/         # JPA repositories
│       ├── security/           # JWT, Security config
│       └── exception/          # Error handling
└── munchgo-frontend/           # React application
    └── src/
        ├── pages/              # Route pages by role
        ├── components/         # Reusable UI components
        ├── api/                # Axios API clients
        ├── stores/             # Zustand state stores
        └── types/              # TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- **Docker** and **Docker Compose**
- **Java 21** (for local backend development)
- **Node.js 20+** (for local frontend development)

### Quick Start with Docker

```bash
# Start all services (database + backend + frontend)
docker-compose --profile full up -d

# Or start database only
docker-compose up -d
```

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:5173         |
| Backend   | http://localhost:8080         |
| Swagger   | http://localhost:8080/swagger-ui.html |

### Local Development

**1. Database**

Start a PostgreSQL instance (or use the Docker service):

```bash
docker-compose up -d munchgo-postgres
```

**2. Backend**

```bash
cd munchgo-backend
./gradlew bootRun
```

**3. Frontend**

```bash
cd munchgo-frontend
npm install
npm run dev
```

---

## Sample Accounts

| Username  | Email                    | Password     | Role     |
|-----------|--------------------------|--------------|----------|
| admin     | admin@munchgo.com        | admin123     | ADMIN    |
| merchant  | merchant@munchgo.com     | merchant123  | MERCHANT |
| rider     | rider@munchgo.com        | rider123     | RIDER    |
| customer  | customer@munchgo.com      | customer123  | CUSTOMER |

---

## API Overview

| Endpoint Prefix     | Description                          |
|---------------------|--------------------------------------|
| `/api/auth`         | Login, registration, token refresh   |
| `/api/users`        | User profile management              |
| `/api/restaurants`  | Restaurant CRUD                      |
| `/api/menu-items`   | Menu item management                 |
| `/api/categories`   | Category management                  |
| `/api/cart`         | Shopping cart operations             |
| `/api/orders`       | Order creation and management        |
| `/api/reviews`      | Reviews and ratings                  |
| `/api/favorites`    | Favorite restaurants                 |
| `/api/addresses`    | Delivery address management          |
| `/api/notifications`| In-app notifications                 |

---

## Order Lifecycle

```
PENDING → CONFIRMED → PREPARING → READY → DELIVERING → COMPLETED
                                     ↘ (or) CANCELLED
```

---

## License

This project is for educational and demonstration purposes.
