# MGCA Social Network — Rede Social Corporativa Interna

> Internal corporate social network for **Mendonça Galvão Contadores Associados**.

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend   │────▶│  Node.js Gateway │────▶│  Spring Boot API │
│  (Vite/React)│     │  (BFF / Proxy)   │     │  (Business Logic)│
└─────────────┘     └──────────────────┘     └──────────────────┘
                            │                         │
                            │    ┌────────────┐       │
                            └───▶│  MongoDB   │◀──────┘
                                 └────────────┘
```

The system follows a **BFF (Backend-for-Frontend)** pattern:

- **Spring Boot API** — Core business logic, authentication (JWT), CRUD operations, moderation.
- **Node.js Gateway** — Lightweight proxy/BFF layer that forwards requests to Spring Boot, handles rate limiting, CORS, and provides direct read access to MongoDB via Prisma for optimized queries.
- **MongoDB** — Single shared database accessed by both services.

---

## Tech Stack

| Layer        | Technology                                        |
| ------------ | ------------------------------------------------- |
| Backend API  | Java 21, Spring Boot 3.5.x, Spring Security, JWT |
| Gateway/BFF  | Node.js 20+, Express, TypeScript, Prisma 6.19    |
| Database     | MongoDB 7+                                        |
| Build        | Maven 3.9+, npm                                   |
| Containers   | Docker, Docker Compose                            |

---

## Prerequisites

| Requirement   | Version |
| ------------- | ------- |
| Java (JDK)   | 21+     |
| Node.js       | 20+     |
| MongoDB       | 7.0+    |
| Maven         | 3.9+    |
| Docker *(opt)*| 24+     |

---

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd RS_RH
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env and set your JWT_SECRET and other values
```

### 3. Start MongoDB

**Option A — Local MongoDB:**

```bash
mongod --replSet rs0 --bind_ip_all
mongosh --eval "rs.initiate()"
```

**Option B — Docker:**

```bash
docker-compose up mongodb mongo-init-replica -d
```

### 4. Start the Spring Boot backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 5. Start the Node.js Gateway

```bash
cd gateway
npm install
npm run prisma:generate
npm run dev
```

The gateway will be available at `http://localhost:3000`.

---

## Docker (Full Stack)

To start all services with Docker Compose:

```bash
docker-compose up --build
```

| Service    | URL                          |
| ---------- | ---------------------------- |
| Gateway    | http://localhost:3000         |
| Backend    | http://localhost:8080         |
| MongoDB    | mongodb://localhost:27017     |

---

## API Documentation

Once the backend is running, Swagger UI is available at:

👉 **http://localhost:8080/swagger-ui.html**

---

## Project Structure

```
RS_RH/
├── backend/                    # Spring Boot API (Java 21)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/...        # Java source code
│   │   │   └── resources/      # application.yml, etc.
│   │   └── test/               # Unit & integration tests
│   ├── pom.xml
│   └── Dockerfile
├── gateway/                    # Node.js BFF/Gateway (TypeScript)
│   ├── src/
│   │   ├── config/             # Configuration loader
│   │   ├── middleware/         # Auth, error handling, rate limiting
│   │   ├── routes/             # Health checks, proxy routes
│   │   └── index.ts            # Entry point
│   ├── prisma/
│   │   └── schema.prisma       # MongoDB schema (read-only mirror)
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── docs/                       # Documentation
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## License

**Proprietary / Internal Use Only**

This software is the property of Mendonça Galvão Contadores Associados (MGCA).
Unauthorized copying, distribution, or modification is strictly prohibited.

© 2026 Mendonça Galvão Contadores Associados. All rights reserved.
