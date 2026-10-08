# Project Management API

Node.js + Express + TypeScript + Prisma + PostgreSQL. One API for the web and mobile apps.

## Setup
1. `npm install`
2. `cp .env.example .env` and fill in `DATABASE_URL` and `JWT_SECRET`
3. `npx prisma migrate dev --name init` (creates tables)
4. `npm run dev` (http://localhost:4000, health check at `/health`)

## Environment variables
| Name | Description |
|---|---|
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Secret for signing JWTs (16+ chars) |
| JWT_EXPIRES_IN | Token lifetime, default `7d` |
| CORS_ORIGINS | Comma-separated allowed web origins |
| PORT | Default 4000 |

## Deploy (Render)
- Build command: `npm install && npm run build`
- Start command: `npm start` (runs `prisma migrate deploy` then the server)
- Set the env vars above; set `CORS_ORIGINS` to your deployed web URL.

## API
All routes except register/login need `Authorization: Bearer <token>`.
Errors: `{ "error": { "code", "message", "details?" } }`.

| Method | Path | Notes |
|---|---|---|
| POST | /api/auth/register | `{fullName,email,password}` returns `{user,token}` |
| POST | /api/auth/login | `{email,password}` returns `{user,token}` |
| POST | /api/auth/logout | 204 (client discards token) |
| GET | /api/auth/me | current user |
| GET | /api/projects | query: `search,status,page,limit` |
| GET/PUT/DELETE | /api/projects/:id | owner only |
| POST | /api/projects | `{name,description?,status?,startDate?,endDate?}` |
| GET | /api/tasks | query: `search,status,priority,projectId,page,limit` |
| GET/PUT/DELETE | /api/tasks/:id | owner only |
| POST | /api/tasks | `{projectId,name,description?,priority?,status?,dueDate?}` |
| GET | /api/dashboard | counts for the signed-in user |

Enums: project status `NOT_STARTED|IN_PROGRESS|COMPLETED`; task status `PENDING|IN_PROGRESS|COMPLETED`; priority `LOW|MEDIUM|HIGH`.
