# API documentation

Base URL: `https://project-management-system-rh3t.onrender.com` (local: `http://localhost:4000`)

All endpoints except register and login need the header `Authorization: Bearer <token>`.
Request and response bodies are JSON.

## Conventions

**Errors** always have this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [{ "field": "name", "message": "Project name cannot be empty" }]
  }
}
```

`details` is only present for validation errors.

| Status | Code                                                                    | When                                               |
| ------ | ----------------------------------------------------------------------- | -------------------------------------------------- |
| 400    | `VALIDATION_ERROR`, `BAD_JSON`                                          | Invalid input                                      |
| 401    | `UNAUTHORIZED`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `INVALID_CREDENTIALS` | Missing, bad or expired token; wrong login         |
| 404    | `NOT_FOUND`                                                             | Missing resource, or it belongs to another user    |
| 409    | `EMAIL_TAKEN`, `CONFLICT`                                               | Duplicate email                                    |
| 429    | `RATE_LIMITED`                                                          | Too many login or register attempts                |
| 500    | `INTERNAL_ERROR`                                                        | Unexpected error (details are only in server logs) |

**Enums:** project status `NOT_STARTED | IN_PROGRESS | COMPLETED`; task status `PENDING | IN_PROGRESS | COMPLETED`; priority `LOW | MEDIUM | HIGH`.

**Dates:** send `YYYY-MM-DD` or an ISO 8601 string; responses use ISO 8601.

**Lists** return `{ "data": [...], "meta": { "page", "limit", "total", "totalPages" } }`. Query params `page` (default 1) and `limit` (default 20, max 100).

---

## Authentication

### POST /api/auth/register

Rate limited (10 per 15 min per IP).

Body:

```json
{ "fullName": "Test User", "email": "test@example.com", "password": "Test1234" }
```

Rules: `fullName` required (max 100); valid unique `email`; `password` 8 to 72 characters with at least one letter and one number.

`201`:

```json
{
  "user": {
    "id": "uuid",
    "fullName": "Test User",
    "email": "test@example.com",
    "createdAt": "2026-10-07T10:00:00.000Z"
  },
  "token": "<jwt>"
}
```

### POST /api/auth/login

Rate limited. Body: `{ "email": "...", "password": "..." }`. `200` returns the same shape as register. Wrong email or password returns `401 INVALID_CREDENTIALS` (same message for both).

### POST /api/auth/logout

Requires auth. Returns `204`. Tokens are stateless, so the client discards its token.

### GET /api/auth/me

Requires auth. `200`: `{ "user": { "id", "fullName", "email", "createdAt" } }`

---

## Projects

A user can only see and change their own projects.

### GET /api/projects

Query: `search` (name contains, case-insensitive), `status`, `page`, `limit`.
Each project includes `_count.tasks`.

### GET /api/projects/:id

`200`: `{ "data": { ...project, "_count": { "tasks": 3 } } }`

### POST /api/projects

```json
{
  "name": "Website Redesign",
  "description": "Optional",
  "status": "IN_PROGRESS",
  "startDate": "2026-10-01",
  "endDate": "2026-12-01"
}
```

`name` required (max 200). `status` defaults to `NOT_STARTED`. `endDate` can't be before `startDate`. `201`: `{ "data": { ...project } }`

### PUT /api/projects/:id

Same fields as create, all optional. `200`: `{ "data": { ...project } }`

### DELETE /api/projects/:id

Deletes the project and its tasks. `204`.

Project fields: `id`, `name`, `description`, `status`, `startDate`, `endDate`, `createdAt`, `userId`.

---

## Tasks

A task belongs to the user who owns its project.

### GET /api/tasks

Query: `projectId`, `search` (name contains), `status`, `priority`, `page`, `limit`.

### GET /api/tasks/:id

### POST /api/tasks

```json
{
  "projectId": "uuid",
  "name": "Design homepage",
  "description": "Optional",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-10-20"
}
```

`projectId` and `name` required. `priority` defaults to `MEDIUM`, `status` to `PENDING`. The project must belong to the user, otherwise `404`. `201`: `{ "data": { ...task } }`

### PUT /api/tasks/:id

Any of `name`, `description`, `priority`, `status`, `dueDate`. Mark a task completed with `{ "status": "COMPLETED" }`. `200`: `{ "data": { ...task } }`

### DELETE /api/tasks/:id

`204`.

Task fields: `id`, `projectId`, `name`, `description`, `priority`, `status`, `dueDate`, `createdAt`.

---

## Dashboard

### GET /api/dashboard

Counts for the signed-in user only.

```json
{
  "data": {
    "totalProjects": 2,
    "totalTasks": 5,
    "completedTasks": 1,
    "pendingTasks": 3,
    "inProgressTasks": 1,
    "projectsInProgress": 2
  }
}
```

## Health

`GET /health` returns `{ "status": "ok" }` (no auth).
