# TaskFlow

A full-stack task management system where users can register, log in, create projects, add tasks, and assign them. Features a Kanban board with drag-and-drop, dark mode, and paginated project listing.

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/shubham-ram/taskflow-shubham-ram && cd taskflow-shubham-ram

# 2. Copy environment variables
cp .env.example .env

# 3. Start everything
docker compose up --build
```

Open **http://localhost:3000** in your browser.

### Seed Credentials

| Email            | Password    |
| ---------------- | ----------- |
| test@example.com | password123 |

The seed also creates 1 project with 3 tasks across different statuses.

---

## Tech Stack

| Layer       | Technology                       | Rationale                                                                                                    |
| ----------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Frontend    | React 19, TypeScript, Vite       | Type safety required by spec. Vite for fast builds.                                                          |
| UI          | shadcn/ui (Radix + Tailwind CSS) | Accessible, customizable components that live in the repo.                                                   |
| Backend     | Node.js, Express, TypeScript     | Familiar stack, strong ecosystem for rapid development.                                                      |
| ORM         | Prisma                           | Type-safe queries, SQL migration generation, seed support.                                                   |
| Database    | PostgreSQL 16                    | Required by spec. Robust relational DB.                                                                      |
| Auth        | JWT + bcryptjs                   | Required by spec. 24h expiry, bcrypt cost factor 12. Token stored in localStorage (see security note below). |
| Validation  | Zod                              | Shared schema validation for both request bodies and forms.                                                  |
| Logging     | Pino                             | Structured JSON logging as required. Fast, low-overhead.                                                     |
| Forms       | react-hook-form + zod resolver   | Performant forms with schema-based validation.                                                               |
| Drag & Drop | @dnd-kit                         | Modern, accessible React DnD library for Kanban board.                                                       |
| Dark Mode   | next-themes                      | Integrates with Tailwind + shadcn, persists to localStorage.                                                 |
| HTTP Client | Axios                            | Request interceptor injects `Authorization: Bearer` header. Response interceptor handles 401s.               |

---

## Architecture

### Project Structure

```
taskflow-shubham-ram/
├── docker-compose.yml          # 3 services: db, backend, frontend
├── .env.example                # Environment variables template
├── backend/
│   ├── Dockerfile              # Multi-stage: build TS → slim Node runtime
│   ├── entrypoint.sh           # Runs migrations + seed on container start
│   ├── prisma/
│   │   ├── schema.prisma       # Data model (User, Project, Task)
│   │   ├── migrations/         # SQL migration files
│   │   └── seed.ts             # Seed data script
│   └── src/
│       ├── index.ts            # Express server, CORS, logging, graceful shutdown
│       ├── config.ts           # Environment variable validation
│       ├── lib/                # Prisma client, JWT helpers, logger
│       ├── middleware/         # Auth, validation, error handling
│       ├── routes/             # auth, projects, tasks
│       └── schemas/            # Zod validation schemas
└── frontend/
    ├── Dockerfile              # Multi-stage: Vite build → nginx
    ├── nginx.conf              # API proxy (/api → backend), SPA fallback
    └── src/
        ├── lib/                # Axios client, auth context, utils
        ├── hooks/              # useProjects, useTasks
        ├── components/
        │   ├── ui/             # shadcn/ui primitives
        │   ├── layout/         # Navbar, ProtectedRoute
        │   ├── projects/       # ProjectCard, CreateProjectDialog
        │   └── tasks/          # TaskBoard, TaskColumn, TaskCard, TaskFormDialog
        ├── pages/              # Login, Register, Projects, ProjectDetail
        └── types/              # Shared TypeScript interfaces
```

### Data Model

- **User** — id (uuid), name, email (unique), password (bcrypt hashed)
- **Project** — id (uuid), name, description, ownerId → User
- **Task** — id (uuid), title, description, status (todo/in_progress/done), priority (low/medium/high), projectId → Project, assigneeId → User (nullable), createdBy → User, dueDate (optional)

### API Endpoints (11 total)

| Method | Endpoint            | Auth | Description                                      |
| ------ | ------------------- | ---- | ------------------------------------------------ |
| POST   | /auth/register      | No   | Register with name, email, password              |
| POST   | /auth/login         | No   | Returns JWT token + user                         |
| GET    | /projects           | Yes  | List projects (owned or has tasks in), paginated |
| POST   | /projects           | Yes  | Create project                                   |
| GET    | /projects/:id       | Yes  | Project details + tasks                          |
| PATCH  | /projects/:id       | Yes  | Update project (owner only)                      |
| DELETE | /projects/:id       | Yes  | Delete project + tasks (owner only)              |
| GET    | /projects/:id/tasks | Yes  | List tasks, filter by status/assignee            |
| POST   | /projects/:id/tasks | Yes  | Create task in project                           |
| PATCH  | /tasks/:id          | Yes  | Update any task field                            |
| DELETE | /tasks/:id          | Yes  | Delete task (creator or project owner)           |

Error responses follow a consistent structure: `{ "error": "message", "fields": { ... } }` with proper HTTP status codes (400, 401, 403, 404).

---

## Key Design Decisions

### Why Express over Go?

The spec suggested Go but allowed alternatives. I chose Express + TypeScript because:

- Stronger personal proficiency means faster, higher-quality delivery within the 72-hour window
- TypeScript provides type safety across the full stack
- Prisma's TypeScript integration is excellent (type-safe queries, generated types)

### Why Prisma over raw SQL?

- Generates proper SQL migration files (not auto-migrate), satisfying the migration requirement
- Type-safe client means fewer runtime errors
- Seed support built in
- Trade-off: slightly heavier Docker image, but worth it for developer experience and safety

### Why shadcn/ui?

- Components live in the repo (not a dependency), so they're fully customizable
- Built on Radix UI primitives — accessible by default
- Pairs naturally with Tailwind CSS
- Consistent dark mode support through CSS variables

### State Management Approach

- **Auth state**: React Context + localStorage. Simple and sufficient for JWT-based auth within this scope.
- **Data fetching**: Custom hooks (useProjects, useTasks) with loading/error states. No external state library needed for this scope.
- **Optimistic updates**: Task status changes via drag-and-drop update the UI immediately and revert on API failure. This makes the Kanban board feel responsive.

### Token Storage: Security Note

The JWT is stored in `localStorage` and sent as an `Authorization: Bearer <token>` header, as required by the spec.

**Known vulnerability:** `localStorage` is accessible to any JavaScript running on the page. If an XSS vulnerability exists, an attacker could read and exfiltrate the token.

**The production-grade alternative** is to store the token in an `HttpOnly` cookie (inaccessible to JS) with `SameSite=Strict` and `Secure` flags. Combined with a reverse proxy serving both frontend and API from the same origin (which this project already does via nginx), this eliminates the XSS token-theft vector entirely — with no need for CSRF protection due to `SameSite=Strict`.

For a production deployment, the recommended upgrade path is:

1. Have the server set the token via `Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict`
2. Remove the `Authorization` header logic from the frontend entirely
3. The browser handles attaching the cookie automatically on every request

### Docker Strategy

- **Multi-stage builds** for both services keep images small
- **Backend entrypoint script** runs `prisma migrate deploy` + seed on every container start (seed is idempotent — checks before inserting)
- **nginx** serves the frontend and proxies `/api` to the backend, avoiding CORS issues in production
- **Health check** on PostgreSQL ensures the backend doesn't start until the database is ready

---

## API Reference

All endpoints are prefixed with `/api` when accessed through the frontend (nginx proxy). Base URL for direct backend access: `http://localhost:4000`.

Protected endpoints require the header:

```
Authorization: Bearer <token>
```

---

### Auth

#### `POST /auth/register`

```json
// Request
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}

// Response 201
{
  "token": "<jwt>",
  "user": {
    "id": "a1b2c3d4-...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

#### `POST /auth/login`

```json
// Request
{
  "email": "jane@example.com",
  "password": "secret123"
}

// Response 200
{
  "token": "<jwt>",
  "user": {
    "id": "a1b2c3d4-...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

---

### Projects

#### `GET /projects` — requires auth

Query params: `?page=1&limit=10`

```json
// Response 200
{
  "data": [
    {
      "id": "a1b2c3d4-...",
      "name": "Website Redesign",
      "description": "Q2 initiative",
      "ownerId": "u1u2u3-...",
      "createdAt": "2026-04-01T10:00:00.000Z",
      "owner": {
        "id": "u1u2u3-...",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "_count": { "tasks": 5 }
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

#### `POST /projects` — requires auth

```json
// Request
{
  "name": "Website Redesign",
  "description": "Q2 initiative"   // optional
}

// Response 201
{
  "id": "a1b2c3d4-...",
  "name": "Website Redesign",
  "description": "Q2 initiative",
  "ownerId": "u1u2u3-...",
  "createdAt": "2026-04-01T10:00:00.000Z",
  "owner": { "id": "u1u2u3-...", "name": "Jane Doe", "email": "jane@example.com" }
}
```

#### `GET /projects/:id` — requires auth

```json
// Response 200
{
  "id": "a1b2c3d4-...",
  "name": "Website Redesign",
  "description": "Q2 initiative",
  "ownerId": "u1u2u3-...",
  "createdAt": "2026-04-01T10:00:00.000Z",
  "owner": {
    "id": "u1u2u3-...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "tasks": [
    {
      "id": "t1t2t3-...",
      "title": "Design homepage",
      "description": "Figma mockups first",
      "status": "in_progress",
      "priority": "high",
      "projectId": "a1b2c3d4-...",
      "assigneeId": "u1u2u3-...",
      "createdBy": "u1u2u3-...",
      "dueDate": "2026-04-15T00:00:00.000Z",
      "createdAt": "2026-04-01T10:00:00.000Z",
      "updatedAt": "2026-04-02T10:00:00.000Z",
      "assignee": {
        "id": "u1u2u3-...",
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  ]
}
```

#### `PATCH /projects/:id` — requires auth, owner only

```json
// Request — all fields optional
{
  "name": "Updated Name",
  "description": "Updated description"
}

// Response 200 — returns updated project object (same shape as POST /projects response)
```

#### `DELETE /projects/:id` — requires auth, owner only

```
// Response 204 No Content
```

---

### Tasks

#### `GET /projects/:id/tasks` — requires auth

Query params: `?status=todo|in_progress|done`, `?assignee=<uuid>`, `?page=1&limit=10`

```json
// Response 200
{
  "data": [
    {
      "id": "t1t2t3-...",
      "title": "Design homepage",
      "description": "Figma mockups first",
      "status": "in_progress",
      "priority": "high",
      "projectId": "a1b2c3d4-...",
      "assigneeId": "u1u2u3-...",
      "createdBy": "u1u2u3-...",
      "dueDate": "2026-04-15T00:00:00.000Z",
      "createdAt": "2026-04-01T10:00:00.000Z",
      "updatedAt": "2026-04-02T10:00:00.000Z",
      "assignee": {
        "id": "u1u2u3-...",
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

#### `POST /projects/:id/tasks` — requires auth

```json
// Request
{
  "title": "Design homepage", // required
  "description": "Figma mockups first", // optional
  "status": "todo", // optional, default: todo
  "priority": "high", // optional, default: medium
  "assigneeId": "u1u2u3-...", // optional
  "dueDate": "2026-04-15" // optional, ISO date string
}

// Response 201 — returns created task object (same shape as tasks in GET /projects/:id/tasks)
```

#### `PATCH /tasks/:id` — requires auth

```json
// Request — all fields optional
{
  "title": "Updated title",
  "description": "New description",
  "status": "done",
  "priority": "low",
  "assigneeId": "u1u2u3-...",
  "dueDate": "2026-04-20"
}

// Response 200 — returns updated task object
```

#### `DELETE /tasks/:id` — requires auth, task creator or project owner only

```
// Response 204 No Content
```

---

### Error Responses

```json
// 400 Validation error
{ "error": "validation failed", "fields": { "email": "Required", "name": "Required" } }

// 401 Unauthenticated
{ "error": "unauthorized" }

// 403 Forbidden
{ "error": "forbidden" }

// 404 Not found
{ "error": "not found" }
```

---

## Bonus Features

1. **Pagination** — The project list endpoint supports `?page=` and `?limit=` query parameters with prev/next navigation controls on the frontend. The task list endpoint also supports pagination on the backend, but tasks are loaded in full alongside the project detail (single request) — paginating a Kanban board would fragment the columns and hurt usability.

2. **Dark Mode** — Toggle in the navbar, powered by next-themes. Persists across sessions via localStorage. All components use CSS variables that switch between light/dark palettes.

3. **Drag-and-Drop Kanban** — Built with @dnd-kit. Tasks can be dragged between Todo, In Progress, and Done columns. Status changes are optimistic (instant UI feedback, automatic revert on error).

---

## Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or use Docker)
- pnpm (frontend), npm (backend)

### Local Development (without Docker)

```bash
# Backend
cd backend
npm install
cp ../.env.example ../.env
# Update DATABASE_URL to point to your local PostgreSQL
npx prisma migrate deploy
npm run seed
npm run dev            # http://localhost:4000

# Frontend (separate terminal)
cd frontend
pnpm install
pnpm dev               # http://localhost:5173 (proxies /api to :4000)
```

### Environment Variables

| Variable          | Required | Description                           |
| ----------------- | -------- | ------------------------------------- |
| DATABASE_URL      | Yes      | PostgreSQL connection string          |
| JWT_SECRET        | Yes      | Secret for signing JWTs (min 8 chars) |
| JWT_EXPIRY        | No       | Token expiry (default: 24h)           |
| BCRYPT_ROUNDS     | No       | bcrypt cost factor (default: 12)      |
| PORT              | No       | Backend port (default: 4000)          |
| POSTGRES_USER     | Yes      | PostgreSQL username                   |
| POSTGRES_PASSWORD | Yes      | PostgreSQL password                   |
| POSTGRES_DB       | Yes      | PostgreSQL database name              |

---

## Reflection

### What went well

- The Docker setup works reliably with a single `docker compose up` — migrations and seeding are automatic
- Prisma's type safety caught several bugs at compile time that would have been runtime errors with raw SQL
- shadcn/ui + Tailwind made building a polished, responsive UI fast
- The optimistic UI pattern for drag-and-drop makes the Kanban board feel snappy

### What I'd improve with more time

- Add unit and integration tests (Jest for backend, Vitest for frontend)
- Implement proper token refresh instead of redirecting to login on 401
- Add WebSocket support for real-time task updates across multiple users
- Add search functionality across projects and tasks
- Implement proper role-based access control beyond owner/creator checks
