# MGCA Social Network — Backend Architecture

> **Version:** 1.0.0  
> **Last updated:** 2026-06-18  
> **Maintainer:** MGCA Engineering Team  
> **Status:** Production-ready core; frontend pending

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [Architecture Decision Records](#3-architecture-decision-records)
4. [Folder Structure](#4-folder-structure)
5. [Domain Model](#5-domain-model)
6. [Database Collections and Indexes](#6-database-collections-and-indexes)
7. [API Endpoint Reference](#7-api-endpoint-reference)
8. [Authentication and Authorization Flow](#8-authentication-and-authorization-flow)
9. [Error Response Format](#9-error-response-format)
10. [Pagination Format](#10-pagination-format)
11. [Environment Variables](#11-environment-variables)
12. [Local Development Setup](#12-local-development-setup)
13. [Testing Instructions](#13-testing-instructions)
14. [Integration Notes](#14-integration-notes)
15. [Frontend Handoff](#15-frontend-handoff)
16. [Known Limitations and Next Steps](#16-known-limitations-and-next-steps)

---

## 1. Project Overview

### What is MGCA Social Network?

An **internal corporate social network** built for **Mendonça Galvão Contadores Associados (MGCA)**, an accounting firm headquartered in Petrolina, Pernambuco, Brazil.

### Purpose

| Goal | Description |
|------|-------------|
| **Collaboration** | Enable employees across departments (Contabilidade, Fiscal, Pessoal, TI) to share knowledge and collaborate on projects |
| **Knowledge Sharing** | Create a searchable repository of professional insights, regulatory updates, and best practices |
| **Internal Communication** | Replace fragmented WhatsApp groups and email chains with a structured, auditable communication platform |
| **Professional Visibility** | Allow team members to showcase their expertise and contributions within the firm |

### Design Philosophy

> **This is NOT a public social media platform.**

Key constraints that shape every design decision:

- ❌ **No followers** — there is no follow/unfollow mechanic
- ❌ **No popularity rankings** — no trending posts, no "most liked" leaderboards
- ❌ **No algorithmic feed** — the feed is strictly chronological
- ✅ **Equal visibility** — every employee's voice has the same weight
- ✅ **Corporate governance** — admin moderation and full audit trail
- ✅ **Department-aware** — content can be scoped to specific departments

---

## 2. Architecture Summary

### High-Level Architecture

The system follows a **monorepo, dual-runtime** architecture:

```mermaid
graph TB
    subgraph "Client Layer"
        REACT["React SPA<br/>(future)"]
    end

    subgraph "API Gateway Layer"
        GW["Node.js Express + TypeScript<br/>API Gateway / BFF<br/>Port 3000"]
    end

    subgraph "Core Domain Layer"
        SPRING["Java Spring Boot 3.5.x<br/>Domain API<br/>Port 8080"]
    end

    subgraph "Data Layer"
        MONGO[("MongoDB 7.x<br/>Primary Database")]
    end

    REACT -->|"HTTP/REST"| GW
    GW -->|"HTTP/REST<br/>Proxy writes"| SPRING
    GW -->|"Read-only<br/>via Prisma"| MONGO
    SPRING -->|"Read + Write<br/>via Spring Data MongoDB"| MONGO

    style SPRING fill:#6db33f,color:#fff
    style GW fill:#68a063,color:#fff
    style MONGO fill:#4db33d,color:#fff
    style REACT fill:#61dafb,color:#000
```

### Runtime Responsibilities

| Layer | Technology | Responsibility |
|-------|-----------|---------------|
| **Core Domain API** | Java 21 + Spring Boot 3.5.x | All **write operations**, business logic, authentication, authorization, validation. Single writer to MongoDB. |
| **API Gateway / BFF** | Node.js 20 + Express + TypeScript | **Read-only** queries via Prisma, request routing, rate limiting, response shaping, CORS. Proxies all write requests to Spring Boot. |
| **Database** | MongoDB 7.x | Document store. Single database `mgca_social_network`. Collections for users, posts, comments, likes, audit_logs. |
| **Frontend** | React (future) | SPA consuming the gateway. Not yet implemented. |

### Why Two Runtimes?

- **Java** is the team's strongest backend language and provides robust type safety for business-critical write paths
- **Node.js** excels at lightweight read proxying, is the natural choice for a BFF serving a React frontend, and Prisma provides excellent MongoDB read ergonomics
- **Single-writer pattern** prevents data consistency issues — only Spring Boot writes to MongoDB

---

## 3. Architecture Decision Records

### ADR-001: Java + Node.js + MongoDB + Prisma Boundaries

| | |
|---|---|
| **Status** | Accepted |
| **Context** | We need a backend that the team can maintain long-term (Java expertise), but also want a modern BFF for the future React frontend (Node.js). |
| **Decision** | Java Spring Boot owns all **write** operations and is the single writer to MongoDB. Node.js Express + Prisma handles **read-only** queries and acts as API gateway. |
| **Consequences** | Clear separation of concerns. No write conflicts. Slight latency on writes (gateway → Spring Boot → MongoDB), acceptable for an internal tool. |

### ADR-002: Stateless JWT Authentication with BCrypt

| | |
|---|---|
| **Status** | Accepted |
| **Context** | Internal application needs simple, stateless auth without external providers (no OAuth/SAML needed for an intranet tool). |
| **Decision** | JWT tokens issued by Spring Boot, validated by both runtimes. Passwords hashed with BCrypt (strength 10). No session storage. |
| **Consequences** | Tokens are self-contained — no session lookup needed. Token revocation requires a blacklist (not yet implemented). Refresh tokens are a future enhancement. |

### ADR-003: No Followers, No Rankings

| | |
|---|---|
| **Status** | Accepted |
| **Context** | The firm's partners explicitly requested a collaborative tool, not a competitive social media platform. Popularity mechanics create unhealthy dynamics in small corporate teams. |
| **Decision** | No follower system. No trending/popular posts. Feed is strictly reverse-chronological. Like counts are visible but not used for ranking. |
| **Consequences** | Simpler data model. Simpler feed logic. Equal visibility for all employees. May need recommendation engine later if content volume grows. |

---

## 4. Folder Structure

```
RS_RH/
├── backend/                                    # Java Spring Boot application
│   ├── pom.xml                                 # Maven build configuration
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/mgca/socialnetwork/
│   │   │   │   ├── MgcaSocialNetworkApplication.java
│   │   │   │   ├── config/
│   │   │   │   │   ├── SecurityConfig.java          # Spring Security 6.x config
│   │   │   │   │   ├── CorsConfig.java               # CORS configuration
│   │   │   │   │   └── OpenApiConfig.java             # Swagger/OpenAPI config
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── UserController.java
│   │   │   │   │   ├── PostController.java
│   │   │   │   │   ├── CommentController.java
│   │   │   │   │   ├── LikeController.java
│   │   │   │   │   ├── FeedController.java
│   │   │   │   │   └── AdminController.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   ├── AuthResponse.java
│   │   │   │   │   ├── UserResponse.java
│   │   │   │   │   ├── UpdateProfileRequest.java
│   │   │   │   │   ├── CreatePostRequest.java
│   │   │   │   │   ├── UpdatePostRequest.java
│   │   │   │   │   ├── PostResponse.java
│   │   │   │   │   ├── CreateCommentRequest.java
│   │   │   │   │   ├── UpdateCommentRequest.java
│   │   │   │   │   ├── CommentResponse.java
│   │   │   │   │   ├── LikeResponse.java
│   │   │   │   │   ├── ModerationRequest.java
│   │   │   │   │   ├── AdminUserUpdateRequest.java
│   │   │   │   │   ├── PageResponse.java
│   │   │   │   │   └── ErrorResponse.java
│   │   │   │   ├── exception/
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   ├── DuplicateResourceException.java
│   │   │   │   │   ├── ForbiddenException.java
│   │   │   │   │   ├── BadRequestException.java
│   │   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Post.java
│   │   │   │   │   ├── Comment.java
│   │   │   │   │   ├── Like.java
│   │   │   │   │   ├── AuditLog.java
│   │   │   │   │   └── enums/
│   │   │   │   │       ├── Role.java
│   │   │   │   │       ├── Visibility.java
│   │   │   │   │       └── ModerationStatus.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   ├── PostRepository.java
│   │   │   │   │   ├── CommentRepository.java
│   │   │   │   │   ├── LikeRepository.java
│   │   │   │   │   └── AuditLogRepository.java
│   │   │   │   ├── security/
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   ├── UserPrincipal.java
│   │   │   │   │   └── CustomUserDetailsService.java
│   │   │   │   └── service/
│   │   │   │       ├── AuthService.java
│   │   │   │       ├── UserService.java
│   │   │   │       ├── PostService.java
│   │   │   │       ├── CommentService.java
│   │   │   │       ├── LikeService.java
│   │   │   │       ├── FeedService.java
│   │   │   │       ├── AdminService.java
│   │   │   │       └── AuditService.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── application-test.yml
│   │   └── test/
│   │       └── java/com/mgca/socialnetwork/
│   │           ├── MgcaSocialNetworkApplicationTests.java
│   │           ├── security/
│   │           │   ├── JwtTokenProviderTest.java
│   │           │   └── AuthServiceTest.java
│   │           ├── user/
│   │           │   └── UserServiceTest.java
│   │           ├── post/
│   │           │   └── PostServiceTest.java
│   │           ├── like/
│   │           │   └── LikeServiceTest.java
│   │           ├── comment/
│   │           │   └── CommentServiceTest.java
│   │           └── admin/
│   │               └── AdminServiceTest.java
├── gateway/                                    # Node.js API Gateway (future)
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.ts
│       ├── routes/
│       ├── middleware/
│       └── services/
├── docs/
│   └── backend-architecture.md                 # This document
└── docker-compose.yml                          # Container orchestration
```

---

## 5. Domain Model

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ POST : "authors"
    USER ||--o{ COMMENT : "authors"
    USER ||--o{ LIKE : "gives"
    POST ||--o{ COMMENT : "has"
    POST ||--o{ LIKE : "receives"
    USER ||--o{ AUDIT_LOG : "triggers"

    USER {
        string id PK
        string fullName
        string email UK
        string passwordHash
        string department
        string jobTitle
        string bio
        string avatarUrl
        Role role
        boolean active
        Instant createdAt
        Instant updatedAt
    }

    POST {
        string id PK
        string authorId FK
        string content
        Visibility visibility
        ModerationStatus moderationStatus
        string[] tags
        string[] mediaUrls
        int likeCount
        int commentCount
        boolean deleted
        Instant createdAt
        Instant updatedAt
    }

    COMMENT {
        string id PK
        string postId FK
        string authorId FK
        string content
        ModerationStatus moderationStatus
        boolean deleted
        Instant createdAt
        Instant updatedAt
    }

    LIKE {
        string id PK
        string postId FK
        string userId FK
        Instant createdAt
    }

    AUDIT_LOG {
        string id PK
        string actorId FK
        string action
        string targetId
        string details
        Instant createdAt
    }
```

### Entities

#### User
The central identity entity. Every employee has exactly one user account.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | MongoDB ObjectId, auto-generated |
| `fullName` | `String` | Employee's full name (required) |
| `email` | `String` | Corporate email, unique index (required) |
| `passwordHash` | `String` | BCrypt-hashed password (never exposed in responses) |
| `department` | `String` | Department name: Contabilidade, Fiscal, Pessoal, TI, etc. |
| `jobTitle` | `String` | Job title within the firm |
| `bio` | `String` | Optional short biography |
| `avatarUrl` | `String` | URL to profile picture |
| `role` | `Role` | `USER`, `MODERATOR`, or `ADMIN` |
| `active` | `boolean` | Soft-delete flag; inactive users cannot login |
| `createdAt` | `Instant` | Account creation timestamp |
| `updatedAt` | `Instant` | Last profile update timestamp |

#### Post
The primary content unit. Posts are authored by users and can be liked and commented on.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | MongoDB ObjectId |
| `authorId` | `String` | Reference to the User who created the post |
| `content` | `String` | Post body text (required, 1–5000 chars) |
| `visibility` | `Visibility` | `PUBLIC`, `DEPARTMENT`, or `DRAFT` |
| `moderationStatus` | `ModerationStatus` | `APPROVED`, `FLAGGED`, or `REMOVED` |
| `tags` | `List<String>` | Categorization tags |
| `mediaUrls` | `List<String>` | References to attached media (placeholder) |
| `likeCount` | `int` | Denormalized like count for read performance |
| `commentCount` | `int` | Denormalized comment count for read performance |
| `deleted` | `boolean` | Soft-delete flag |
| `createdAt` | `Instant` | Post creation timestamp |
| `updatedAt` | `Instant` | Last edit timestamp |

#### Comment
User responses to posts. Comments are flat (no threading/nesting).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | MongoDB ObjectId |
| `postId` | `String` | Reference to the parent Post |
| `authorId` | `String` | Reference to the commenting User |
| `content` | `String` | Comment text (required, 1–2000 chars) |
| `moderationStatus` | `ModerationStatus` | `APPROVED`, `FLAGGED`, or `REMOVED` |
| `deleted` | `boolean` | Soft-delete flag |
| `createdAt` | `Instant` | Comment creation timestamp |
| `updatedAt` | `Instant` | Last edit timestamp |

#### Like
A user's endorsement of a post. One like per user per post (unique constraint).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | MongoDB ObjectId |
| `postId` | `String` | Reference to the liked Post |
| `userId` | `String` | Reference to the User who liked |
| `createdAt` | `Instant` | Timestamp of the like |

#### AuditLog
Immutable record of administrative actions for compliance and accountability.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | MongoDB ObjectId |
| `actorId` | `String` | Reference to the admin/moderator who performed the action |
| `action` | `String` | Action type: `MODERATE_POST`, `MODERATE_COMMENT`, `UPDATE_USER`, etc. |
| `targetId` | `String` | ID of the affected entity |
| `details` | `String` | Human-readable description of the action and reason |
| `createdAt` | `Instant` | Timestamp of the action |

### Enums

| Enum | Values | Description |
|------|--------|-------------|
| `Role` | `USER`, `MODERATOR`, `ADMIN` | Authorization level. All new registrations default to `USER`. |
| `Visibility` | `PUBLIC`, `DEPARTMENT`, `DRAFT` | Content visibility scope. `DEPARTMENT` restricts to same department. `DRAFT` is only visible to the author. |
| `ModerationStatus` | `APPROVED`, `FLAGGED`, `REMOVED` | Content moderation state. New content defaults to `APPROVED`. Moderators/admins can flag or remove. |

---

## 6. Database Collections and Indexes

All collections live in the `mgca_social_network` database.

### Collection: `users`

| Field | BSON Type | Required | Indexed | Notes |
|-------|-----------|----------|---------|-------|
| `_id` | `ObjectId` | ✅ | ✅ (PK) | Auto-generated |
| `fullName` | `String` | ✅ | ❌ | |
| `email` | `String` | ✅ | ✅ (unique) | Corporate email |
| `passwordHash` | `String` | ✅ | ❌ | BCrypt hash |
| `department` | `String` | ❌ | ✅ | For department-based queries |
| `jobTitle` | `String` | ❌ | ❌ | |
| `bio` | `String` | ❌ | ❌ | |
| `avatarUrl` | `String` | ❌ | ❌ | |
| `role` | `String` | ✅ | ❌ | Enum: USER, MODERATOR, ADMIN |
| `active` | `Boolean` | ✅ | ✅ | For filtering inactive users |
| `createdAt` | `Date` | ✅ | ❌ | |
| `updatedAt` | `Date` | ✅ | ❌ | |

**Indexes:**
```javascript
db.users.createIndex({ "email": 1 }, { unique: true })          // Login lookups
db.users.createIndex({ "department": 1, "active": 1 })          // Department listing
db.users.createIndex({ "active": 1 })                           // Active user queries
```

### Collection: `posts`

| Field | BSON Type | Required | Indexed | Notes |
|-------|-----------|----------|---------|-------|
| `_id` | `ObjectId` | ✅ | ✅ (PK) | |
| `authorId` | `String` | ✅ | ✅ | Reference to users._id |
| `content` | `String` | ✅ | ❌ | 1–5000 chars |
| `visibility` | `String` | ✅ | ✅ | Enum |
| `moderationStatus` | `String` | ✅ | ✅ | Enum |
| `tags` | `Array<String>` | ❌ | ✅ (multikey) | |
| `mediaUrls` | `Array<String>` | ❌ | ❌ | Placeholder |
| `likeCount` | `Int32` | ✅ | ❌ | Denormalized |
| `commentCount` | `Int32` | ✅ | ❌ | Denormalized |
| `deleted` | `Boolean` | ✅ | ✅ | Soft-delete |
| `createdAt` | `Date` | ✅ | ✅ | Feed ordering |
| `updatedAt` | `Date` | ✅ | ❌ | |

**Indexes (following ESR — Equality, Sort, Range):**
```javascript
// Primary feed query: non-deleted, approved, public, sorted by newest
// E: deleted=false, moderationStatus=APPROVED, visibility=PUBLIC
// S: createdAt DESC
db.posts.createIndex(
    { "deleted": 1, "moderationStatus": 1, "visibility": 1, "createdAt": -1 },
    { name: "feed_query" }
)

// Author's posts
db.posts.createIndex({ "authorId": 1, "deleted": 1, "createdAt": -1 })

// Tag-based queries
db.posts.createIndex({ "tags": 1, "deleted": 1, "createdAt": -1 })

// Department feed (when visibility = DEPARTMENT)
db.posts.createIndex({ "visibility": 1, "deleted": 1, "createdAt": -1 })
```

> **ESR Rule Explanation:** MongoDB compound indexes are most efficient when fields are ordered as **Equality** (exact match fields first), then **Sort** (order-by fields), then **Range** (inequality/range filters last). Our `feed_query` index places the three equality filters (`deleted`, `moderationStatus`, `visibility`) before the sort field (`createdAt`).

### Collection: `comments`

| Field | BSON Type | Required | Indexed | Notes |
|-------|-----------|----------|---------|-------|
| `_id` | `ObjectId` | ✅ | ✅ (PK) | |
| `postId` | `String` | ✅ | ✅ | Reference to posts._id |
| `authorId` | `String` | ✅ | ✅ | Reference to users._id |
| `content` | `String` | ✅ | ❌ | 1–2000 chars |
| `moderationStatus` | `String` | ✅ | ❌ | Enum |
| `deleted` | `Boolean` | ✅ | ✅ | Soft-delete |
| `createdAt` | `Date` | ✅ | ✅ | |
| `updatedAt` | `Date` | ✅ | ❌ | |

**Indexes:**
```javascript
// Comments for a post, sorted chronologically
db.comments.createIndex({ "postId": 1, "deleted": 1, "createdAt": 1 })

// User's comments
db.comments.createIndex({ "authorId": 1, "deleted": 1, "createdAt": -1 })
```

### Collection: `likes`

| Field | BSON Type | Required | Indexed | Notes |
|-------|-----------|----------|---------|-------|
| `_id` | `ObjectId` | ✅ | ✅ (PK) | |
| `postId` | `String` | ✅ | ✅ | Reference to posts._id |
| `userId` | `String` | ✅ | ✅ | Reference to users._id |
| `createdAt` | `Date` | ✅ | ❌ | |

**Indexes:**
```javascript
// Unique constraint: one like per user per post
db.likes.createIndex({ "postId": 1, "userId": 1 }, { unique: true })

// Check if user liked a post
db.likes.createIndex({ "userId": 1, "postId": 1 })
```

### Collection: `audit_logs`

| Field | BSON Type | Required | Indexed | Notes |
|-------|-----------|----------|---------|-------|
| `_id` | `ObjectId` | ✅ | ✅ (PK) | |
| `actorId` | `String` | ✅ | ✅ | Who performed the action |
| `action` | `String` | ✅ | ✅ | What was done |
| `targetId` | `String` | ✅ | ✅ | What was affected |
| `details` | `String` | ❌ | ❌ | Human-readable description |
| `createdAt` | `Date` | ✅ | ✅ | When it happened |

**Indexes:**
```javascript
db.audit_logs.createIndex({ "actorId": 1, "createdAt": -1 })
db.audit_logs.createIndex({ "action": 1, "createdAt": -1 })
db.audit_logs.createIndex({ "targetId": 1 })
```

---

## 7. API Endpoint Reference

All endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| `POST` | `/api/v1/auth/register` | Register a new user account | ❌ | — |
| `POST` | `/api/v1/auth/login` | Authenticate and get JWT token | ❌ | — |

### Users

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| `GET` | `/api/v1/users/me` | Get current user's profile | ✅ | Any |
| `PATCH` | `/api/v1/users/me` | Update current user's profile | ✅ | Any |
| `GET` | `/api/v1/users/{id}` | Get a user's public profile | ✅ | Any |
| `GET` | `/api/v1/users` | List all active users (paginated) | ✅ | Any |

### Posts

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| `POST` | `/api/v1/posts` | Create a new post | ✅ | Any |
| `GET` | `/api/v1/posts/{id}` | Get a post by ID | ✅ | Any |
| `PATCH` | `/api/v1/posts/{id}` | Update a post (owner only) | ✅ | Owner |
| `DELETE` | `/api/v1/posts/{id}` | Soft-delete a post (owner only) | ✅ | Owner |

### Likes

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| `POST` | `/api/v1/posts/{postId}/likes` | Like a post | ✅ | Any |
| `DELETE` | `/api/v1/posts/{postId}/likes` | Unlike a post | ✅ | Any |
| `GET` | `/api/v1/posts/{postId}/likes` | List users who liked a post | ✅ | Any |

### Comments

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| `POST` | `/api/v1/posts/{postId}/comments` | Add a comment to a post | ✅ | Any |
| `GET` | `/api/v1/posts/{postId}/comments` | List comments on a post (paginated) | ✅ | Any |
| `PATCH` | `/api/v1/comments/{id}` | Update a comment (owner only) | ✅ | Owner |
| `DELETE` | `/api/v1/comments/{id}` | Soft-delete a comment (owner only) | ✅ | Owner |

### Feed

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| `GET` | `/api/v1/feed` | Get chronological feed (paginated) | ✅ | Any |
| `GET` | `/api/v1/feed/department` | Get department-specific feed | ✅ | Any |

### Admin / Moderation

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| `PATCH` | `/api/v1/admin/posts/{id}/moderate` | Moderate a post (flag/remove/approve) | ✅ | `MODERATOR`, `ADMIN` |
| `PATCH` | `/api/v1/admin/comments/{id}/moderate` | Moderate a comment | ✅ | `MODERATOR`, `ADMIN` |
| `PATCH` | `/api/v1/admin/users/{id}` | Update user role or active status | ✅ | `ADMIN` |
| `GET` | `/api/v1/admin/users` | List all users (including inactive) | ✅ | `ADMIN` |
| `GET` | `/api/v1/admin/audit-logs` | View audit trail (paginated) | ✅ | `ADMIN` |

---

## 8. Authentication and Authorization Flow

### Overview

The system uses **stateless JWT authentication** with **BCrypt password hashing**.

```mermaid
sequenceDiagram
    participant Client
    participant Filter as JwtAuthenticationFilter
    participant Security as SecurityContext
    participant Controller
    participant Service

    Note over Client: Registration Flow
    Client->>Controller: POST /api/v1/auth/register<br/>{fullName, email, password, ...}
    Controller->>Service: authService.register(request)
    Service->>Service: Validate email uniqueness
    Service->>Service: BCrypt.encode(password)
    Service->>Service: Save user to MongoDB
    Service->>Service: jwtTokenProvider.generateToken(userId)
    Service-->>Client: 201 { token, userId, email, role }

    Note over Client: Login Flow
    Client->>Controller: POST /api/v1/auth/login<br/>{email, password}
    Controller->>Service: authService.login(request)
    Service->>Service: AuthenticationManager.authenticate()
    Service->>Service: jwtTokenProvider.generateToken(userId)
    Service-->>Client: 200 { token, userId, email, role }

    Note over Client: Authenticated Request Flow
    Client->>Filter: GET /api/v1/feed<br/>Authorization: Bearer <token>
    Filter->>Filter: Extract token from header
    Filter->>Filter: jwtTokenProvider.validateToken(token)
    Filter->>Filter: jwtTokenProvider.getUserIdFromToken(token)
    Filter->>Filter: Load UserPrincipal
    Filter->>Security: Set Authentication in SecurityContext
    Security->>Controller: Request proceeds
    Controller->>Controller: @PreAuthorize checks role
    Controller->>Service: Execute business logic
    Service-->>Client: 200 { response data }
```

### Step-by-Step

1. **Register:** Client sends `POST /api/v1/auth/register` with `fullName`, `email`, `password`, `department`, and `jobTitle`. The service validates email uniqueness, hashes the password with BCrypt, saves the user with role `USER`, and returns a JWT token.

2. **Login:** Client sends `POST /api/v1/auth/login` with `email` and `password`. Spring Security's `AuthenticationManager` validates credentials via `CustomUserDetailsService`. On success, a JWT token is generated and returned.

3. **Send JWT:** For all subsequent requests, the client includes the JWT in the `Authorization` header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
   ```

4. **JWT Filter Validates:** The `JwtAuthenticationFilter` (a `OncePerRequestFilter`) intercepts every request, extracts the token, validates its signature and expiry, extracts the `userId` from the token subject, and loads the user's authorities.

5. **SecurityContext Populated:** A `UsernamePasswordAuthenticationToken` is set in Spring's `SecurityContextHolder`, making the authenticated user available to all downstream components.

6. **Role Checks:** Controllers use `@PreAuthorize` annotations to enforce role-based access:
   ```java
   @PreAuthorize("hasRole('ADMIN')")
   public ResponseEntity<?> updateUser(...) { ... }
   
   @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
   public ResponseEntity<?> moderatePost(...) { ... }
   ```

### Role Hierarchy

```
ADMIN
  └── MODERATOR
       └── USER
```

| Role | Capabilities |
|------|-------------|
| `USER` | Create/edit/delete own posts and comments, like posts, view feed, update own profile |
| `MODERATOR` | Everything `USER` can do + moderate (flag/remove/approve) any post or comment |
| `ADMIN` | Everything `MODERATOR` can do + manage users (change roles, deactivate accounts), view audit logs |

### Token Structure

The JWT payload contains:

```json
{
  "sub": "665a1b2c3d4e5f6a7b8c9d0e",   // userId
  "iat": 1718700000,                      // issued at
  "exp": 1718786400                       // expiration
}
```

---

## 9. Error Response Format

All errors return a consistent JSON structure:

```json
{
  "timestamp": "2025-06-15T14:30:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "Post not found with id: 665b2c3d4e5f6a7b8c9d1a2b",
  "path": "/api/v1/posts/665b2c3d4e5f6a7b8c9d1a2b"
}
```

### Status Codes Used

| Code | Name | When Used |
|------|------|-----------|
| `200` | OK | Successful GET, PATCH |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation failures, malformed JSON, missing required fields |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Valid token but insufficient permissions (wrong role, not owner) |
| `404` | Not Found | Resource does not exist or has been soft-deleted |
| `409` | Conflict | Duplicate resource (e.g., registering with an existing email, liking a post twice) |
| `500` | Internal Server Error | Unexpected server errors (should be rare; always logged) |

### Exception Mapping

| Exception Class | HTTP Status | Typical Scenario |
|----------------|-------------|-----------------|
| `ResourceNotFoundException` | 404 | Entity not found by ID |
| `DuplicateResourceException` | 409 | Email already registered, duplicate like |
| `ForbiddenException` | 403 | Non-owner trying to edit/delete |
| `BadRequestException` | 400 | Invalid input that isn't covered by Jakarta validation |
| `MethodArgumentNotValidException` | 400 | Jakarta `@Valid` annotation failures |
| `AuthenticationException` | 401 | Invalid credentials |
| `AccessDeniedException` | 403 | `@PreAuthorize` check failed |

---

## 10. Pagination Format

### Request Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | `int` | `0` | — | Zero-indexed page number |
| `size` | `int` | `20` | `50` | Number of items per page |

**Example:**
```
GET /api/v1/feed?page=0&size=20
GET /api/v1/posts/665b.../comments?page=1&size=10
```

### Response Format

All paginated endpoints return a `PageResponse<T>`:

```json
{
  "content": [
    {
      "id": "665b2c3d4e5f6a7b8c9d1a2b",
      "authorId": "665a1b2c3d4e5f6a7b8c9d0e",
      "authorName": "João Pereira",
      "authorDepartment": "Contabilidade",
      "content": "Post about tax reform...",
      "visibility": "PUBLIC",
      "tags": ["tributário"],
      "likeCount": 12,
      "commentCount": 3,
      "likedByCurrentUser": true,
      "createdAt": "2025-06-15T14:30:00Z",
      "updatedAt": "2025-06-15T14:30:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 47,
  "totalPages": 3,
  "last": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `content` | `T[]` | Array of items for the current page |
| `page` | `int` | Current page number (zero-indexed) |
| `size` | `int` | Requested page size |
| `totalElements` | `long` | Total number of items across all pages |
| `totalPages` | `int` | Total number of pages |
| `last` | `boolean` | `true` if this is the last page |

---

## 11. Environment Variables

### Spring Boot (`backend/src/main/resources/application.yml`)

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `SPRING_DATA_MONGODB_URI` | `mongodb://localhost:27017/mgca_social_network` | ✅ | MongoDB connection string |
| `SPRING_DATA_MONGODB_DATABASE` | `mgca_social_network` | ✅ | Database name |
| `JWT_SECRET` | *(none — must be set)* | ✅ | Base64-encoded secret key for JWT signing (min 512 bits for HS512) |
| `JWT_EXPIRATION_MS` | `86400000` | ❌ | Token validity in milliseconds (default: 24 hours) |
| `SERVER_PORT` | `8080` | ❌ | Spring Boot server port |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | ❌ | Comma-separated list of allowed CORS origins |
| `SPRING_PROFILES_ACTIVE` | `dev` | ❌ | Active Spring profile |
| `LOGGING_LEVEL_COM_MGCA` | `INFO` | ❌ | Log level for application packages |

### Node.js Gateway (`gateway/.env`)

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3000` | ❌ | Gateway server port |
| `DATABASE_URL` | `mongodb://localhost:27017/mgca_social_network` | ✅ | Prisma MongoDB connection |
| `SPRING_BOOT_URL` | `http://localhost:8080` | ✅ | URL to proxy write requests |
| `JWT_SECRET` | *(same as backend)* | ✅ | Must match the Spring Boot JWT secret |
| `RATE_LIMIT_WINDOW_MS` | `900000` | ❌ | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | ❌ | Max requests per window |
| `NODE_ENV` | `development` | ❌ | Environment mode |

---

## 12. Local Development Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Java JDK** | 21+ | Spring Boot runtime |
| **Maven** | 3.9+ | Java build tool |
| **Node.js** | 20+ LTS | Gateway runtime |
| **npm** | 10+ | Node package manager |
| **MongoDB** | 7.x | Database (local or Docker) |
| **Docker** (optional) | Latest | Containerized setup |

### Option A: Manual Setup

#### Step 1: Start MongoDB

```bash
# If MongoDB is installed locally:
mongod --dbpath /data/db

# Or with Docker:
docker run -d --name mgca-mongo -p 27017:27017 mongo:7
```

#### Step 2: Start the Java Backend

```bash
cd backend

# Set environment variables (PowerShell)
$env:JWT_SECRET = "dGhpc0lzQVZlcnlMb25nU2VjcmV0S2V5Rm9yVGVzdGluZ1B1cnBvc2VzT25seURvTm90VXNlSW5Qcm9kdWN0aW9uMTIzNDU2Nzg5MA=="
$env:SPRING_DATA_MONGODB_URI = "mongodb://localhost:27017/mgca_social_network"

# Build and run
mvn clean install -DskipTests
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

#### Step 3: Start the Node.js Gateway (Optional)

```bash
cd gateway

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create .env file
echo "DATABASE_URL=mongodb://localhost:27017/mgca_social_network" > .env
echo "SPRING_BOOT_URL=http://localhost:8080" >> .env
echo "JWT_SECRET=dGhpc0lzQVZlcnlMb25nU2VjcmV0S2V5Rm9yVGVzdGluZ1B1cnBvc2VzT25seURvTm90VXNlSW5Qcm9kdWN0aW9uMTIzNDU2Nzg5MA==" >> .env

# Start
npm run dev
```

The gateway will be available at `http://localhost:3000`.

### Option B: Docker Compose

```bash
# From the project root
docker-compose up -d
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATA_MONGODB_URI: mongodb://mongodb:27017/mgca_social_network
      JWT_SECRET: dGhpc0lzQVZlcnlMb25nU2VjcmV0S2V5Rm9yVGVzdGluZ1B1cnBvc2VzT25seURvTm90VXNlSW5Qcm9kdWN0aW9uMTIzNDU2Nzg5MA==
      JWT_EXPIRATION_MS: 86400000
    depends_on:
      - mongodb

  gateway:
    build: ./gateway
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mongodb://mongodb:27017/mgca_social_network
      SPRING_BOOT_URL: http://backend:8080
      JWT_SECRET: dGhpc0lzQVZlcnlMb25nU2VjcmV0S2V5Rm9yVGVzdGluZ1B1cnBvc2VzT25seURvTm90VXNlSW5Qcm9kdWN0aW9uMTIzNDU2Nzg5MA==
    depends_on:
      - backend

volumes:
  mongo_data:
```

### Verify Installation

```bash
# Health check (backend)
curl http://localhost:8080/actuator/health

# Register a test user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@mgca.com.br",
    "password": "Test@1234",
    "department": "TI",
    "jobTitle": "Developer"
  }'
```

---

## 13. Testing Instructions

### Java Backend Tests

```bash
cd backend

# Run all tests
mvn test

# Run a specific test class
mvn test -Dtest=JwtTokenProviderTest

# Run tests with verbose output
mvn test -Dsurefire.useFile=false
```

### Test Coverage Summary

| Test File | What It Covers |
|-----------|---------------|
| `MgcaSocialNetworkApplicationTests` | Spring context loads without errors — smoke test |
| `JwtTokenProviderTest` | Token generation, userId extraction, validation (valid/invalid/expired/tampered) |
| `AuthServiceTest` | Registration (new email, duplicate email), login with valid credentials |
| `UserServiceTest` | Get user by ID (found/not found), profile updates (partial/non-null), user listing with pagination |
| `PostServiceTest` | Create post, get post (existing/deleted), update (owner/non-owner), soft-delete |
| `LikeServiceTest` | Like (first time/duplicate), unlike (existing/non-existing) |
| `CommentServiceTest` | Add comment (with count increment), update (owner/non-owner), soft-delete (with count decrement) |
| `AdminServiceTest` | Moderate post, moderate comment, update user role — all with audit logging verification |

### Test Architecture

- **Unit tests** use `@ExtendWith(MockitoExtension.class)` with `@Mock` and `@InjectMocks`
- **Integration tests** use `@SpringBootTest` with `@ActiveProfiles("test")`
- All tests use **AssertJ** for fluent assertions
- Tests follow **Arrange-Act-Assert** pattern
- Test names follow `methodName_scenario_expectedBehavior` convention

### Node.js Gateway Tests (Future)

```bash
cd gateway
npm test
```

---

## 14. Integration Notes

### API Versioning

All endpoints are versioned under `/api/v1/`. Future breaking changes will be released under `/api/v2/` while maintaining backward compatibility.

### Content Type

All requests and responses use `application/json`:

```
Content-Type: application/json
Accept: application/json
```

### Stable DTOs

The API uses well-defined DTOs (Data Transfer Objects) that are **decoupled from internal models**:

- Request DTOs: `RegisterRequest`, `LoginRequest`, `CreatePostRequest`, etc.
- Response DTOs: `AuthResponse`, `UserResponse`, `PostResponse`, etc.
- Internal model fields like `passwordHash` are never exposed in responses.

### OpenAPI / Swagger

When the backend is running, the full API specification is available:

| Resource | URL |
|----------|-----|
| OpenAPI JSON spec | `http://localhost:8080/v3/api-docs` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |

The Swagger UI provides an interactive interface to explore and test all endpoints.

### Integration with External Systems

For external systems that need to interact with the MGCA Social Network API:

1. **Obtain a JWT token** by calling `POST /api/v1/auth/login` with valid credentials
2. **Include the token** in all subsequent requests via the `Authorization: Bearer <token>` header
3. **Parse paginated responses** — all list endpoints return `PageResponse<T>` format
4. **Handle errors** — all errors follow the standard `ErrorResponse` format with appropriate HTTP status codes
5. **Respect rate limits** — when using the gateway, 100 requests per 15-minute window

---

## 15. Frontend Handoff

> **This section is written for the future React developer** who will build the SPA frontend.

### Base URLs

| Environment | Direct API | Via Gateway |
|------------|-----------|-------------|
| Local Development | `http://localhost:8080` | `http://localhost:3000` |
| Production | Configured via env vars | Configured via env vars |

**Recommendation:** Use the gateway (`localhost:3000`) for reads, and it will automatically proxy writes to Spring Boot.

### CORS

CORS is pre-configured for the following origins:
- `http://localhost:3000` (Gateway / production frontend)
- `http://localhost:5173` (Vite dev server)

No additional CORS configuration is needed for local development.

### Authentication Flow

#### Register a New User

```javascript
const response = await fetch('http://localhost:8080/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Maria Silva',
    email: 'maria.silva@mgca.com.br',
    password: 'Secure@Pass123',
    department: 'Contabilidade',
    jobTitle: 'Contadora'
  })
});

const data = await response.json();
// data = { token: "eyJ...", userId: "665a...", email: "maria...", role: "USER" }

// Store the token
localStorage.setItem('token', data.token);
```

#### Login

```javascript
const response = await fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'maria.silva@mgca.com.br',
    password: 'Secure@Pass123'
  })
});

const data = await response.json();
localStorage.setItem('token', data.token);
```

#### Authenticated Requests

```javascript
// Helper function for all authenticated API calls
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired — redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  if (response.status === 204) return null; // No content (DELETE responses)
  return response.json();
}
```

### Common Operations

#### Fetch the Feed

```javascript
// Get the first page of the chronological feed
const feed = await apiRequest('http://localhost:8080/api/v1/feed?page=0&size=20');

// feed.content = array of PostResponse objects
// feed.totalPages = total number of pages
// feed.last = true if this is the last page

// Load next page
if (!feed.last) {
  const nextPage = await apiRequest(`http://localhost:8080/api/v1/feed?page=${feed.page + 1}&size=20`);
}
```

#### Create a Post

```javascript
const newPost = await apiRequest('http://localhost:8080/api/v1/posts', {
  method: 'POST',
  body: JSON.stringify({
    content: 'Compartilhando novidades sobre a reforma tributária!',
    visibility: 'PUBLIC',       // or 'DEPARTMENT' or 'DRAFT'
    tags: ['tributário', 'reforma']
  })
});
```

#### Like / Unlike a Post

```javascript
// Like
await apiRequest(`http://localhost:8080/api/v1/posts/${postId}/likes`, {
  method: 'POST'
});

// Unlike
await apiRequest(`http://localhost:8080/api/v1/posts/${postId}/likes`, {
  method: 'DELETE'
});
```

#### Add a Comment

```javascript
const comment = await apiRequest(`http://localhost:8080/api/v1/posts/${postId}/comments`, {
  method: 'POST',
  body: JSON.stringify({
    content: 'Ótima análise! Concordo plenamente.'
  })
});
```

#### Get Comments for a Post

```javascript
const comments = await apiRequest(
  `http://localhost:8080/api/v1/posts/${postId}/comments?page=0&size=20`
);
```

#### Update Profile

```javascript
// PATCH — only send the fields you want to update
const updated = await apiRequest('http://localhost:8080/api/v1/users/me', {
  method: 'PATCH',
  body: JSON.stringify({
    bio: 'Especialista em contabilidade empresarial',
    jobTitle: 'Contadora Sênior'
    // fullName, department, avatarUrl — only if changed
  })
});
```

### Pagination Handling (React Example)

```javascript
import { useState, useEffect, useCallback } from 'react';

function usePagination(baseUrl, pageSize = 20) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  const loadPage = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const result = await apiRequest(`${baseUrl}?page=${pageNum}&size=${pageSize}`);
      if (pageNum === 0) {
        setData(result.content);
      } else {
        setData(prev => [...prev, ...result.content]);
      }
      setHasMore(!result.last);
      setTotalElements(result.totalElements);
      setPage(pageNum);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, pageSize]);

  useEffect(() => { loadPage(0); }, [loadPage]);

  const loadMore = () => {
    if (!loading && hasMore) loadPage(page + 1);
  };

  return { data, loading, hasMore, totalElements, loadMore, refresh: () => loadPage(0) };
}

// Usage:
function FeedPage() {
  const { data: posts, loading, hasMore, loadMore } = usePagination(
    'http://localhost:8080/api/v1/feed'
  );

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      {hasMore && <button onClick={loadMore} disabled={loading}>Load More</button>}
    </div>
  );
}
```

### Error Handling

```javascript
// All API errors follow this structure:
// { timestamp, status, error, message, path }

try {
  await apiRequest('http://localhost:8080/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify({ content: '' }) // Invalid — content is required
  });
} catch (error) {
  // error.message = "Content must not be blank"
  // Show this to the user in a toast/alert
  showToast({ type: 'error', message: error.message });
}
```

### Swagger UI

For full API exploration during development, open in your browser:

```
http://localhost:8080/swagger-ui.html
```

This provides an interactive interface to test all endpoints, view request/response schemas, and understand validation rules.

---

## 16. Known Limitations and Next Steps

### Current Limitations

| Area | Limitation | Impact |
|------|-----------|--------|
| **File Upload** | `mediaUrls` field exists but file upload is not implemented. URLs are treated as external references only. | Users cannot upload images/documents directly. |
| **Real-time** | No WebSocket or SSE support. The feed does not update in real time. | Users must refresh to see new posts. |
| **Email Verification** | No email verification on registration. Any email format is accepted. | Potential for fake/mistyped email registrations. |
| **Password Reset** | No "forgot password" flow. Passwords can only be reset by an admin. | Admin burden if users forget passwords. |
| **Feed Algorithm** | Feed is strictly chronological. No recommendations, no relevance scoring. | May not scale well if content volume grows significantly. |
| **Full-text Search** | No search functionality. Posts cannot be searched by content or tags. | Users must scroll through the feed to find content. |
| **Rate Limiting** | Rate limiting is only implemented in the Node.js gateway. Direct calls to Spring Boot are not rate-limited. | Potential for abuse if Spring Boot is accessed directly. |
| **CI/CD** | No continuous integration or deployment pipeline configured. | Manual build and deploy process. |
| **Token Revocation** | JWT tokens cannot be revoked before expiry. No blacklist mechanism. | If a token is compromised, it remains valid until expiry. |
| **Refresh Tokens** | No refresh token flow. Users must re-login when the token expires (24h). | Minor UX inconvenience. |

### Planned Next Steps

| Priority | Feature | Description |
|----------|---------|-------------|
| 🔴 High | **React Frontend** | Build the SPA frontend using React + TypeScript + Vite. See [Frontend Handoff](#15-frontend-handoff) for complete integration guide. |
| 🔴 High | **File Upload** | Implement multipart file upload with storage (local filesystem or S3). Update `mediaUrls` to reference uploaded files. |
| 🟡 Medium | **Real-time Notifications** | Add WebSocket support (Spring WebSocket + STOMP) for live feed updates and notification badges. |
| 🟡 Medium | **Full-text Search** | Implement MongoDB Atlas Search or Elasticsearch for content search across posts, comments, and user profiles. |
| 🟡 Medium | **Email Verification** | Send verification emails on registration. Require email confirmation before allowing login. |
| 🟡 Medium | **Password Reset** | Implement "forgot password" flow with time-limited reset tokens sent via email. |
| 🟢 Low | **Refresh Tokens** | Implement JWT refresh token flow for seamless session extension. |
| 🟢 Low | **CI/CD Pipeline** | Set up GitHub Actions for automated testing, building, and deployment. |
| 🟢 Low | **Rate Limiting (Backend)** | Add rate limiting directly to Spring Boot using Bucket4j or similar. |
| 🟢 Low | **Feed Recommendations** | Implement basic relevance scoring based on department, tags, and recency. |
| 🟢 Low | **Audit Dashboard** | Build admin UI for viewing audit logs, moderation queues, and user management. |

---

> **Document maintained by the MGCA Engineering Team.**  
> For questions or clarifications, contact the backend lead or open an issue in the project repository.
