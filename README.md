# Project Management System (Web + Mobile)

A project and task manager with a React web app and an Android (Expo) mobile app. Both talk to **one** Express backend and one PostgreSQL database, so one account works on both and changes show up on either after a refresh.

## Live links

| Item        | Link                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------- |
| Web app     | https://project-management-system-theta-topaz.vercel.app                                        |
| Backend API | https://project-management-system-rh3t.onrender.com                                             |
| Android APK | https://expo.dev/accounts/nisshanth/projects/mobile/builds/211df835-1e99-45e0-b1c2-06a9005054cb |
| Demo video  | https://drive.google.com/drive/folders/1kKpBFLYMiK11e9x7A1TxE_49QR759QWe?usp=sharing            |

> The backend runs on a free Render plan and sleeps when idle. The first request after a pause can take 30 to 60 seconds.

## Tech stack

- **Backend:** Node.js, Express 5, TypeScript, Prisma ORM, PostgreSQL (Neon), JWT, bcryptjs, Zod, helmet, express-rate-limit, pino
- **Web:** React 18 (Vite), React Router, Tailwind CSS
- **Mobile:** React Native (Expo), React Navigation, expo-secure-store, NetInfo

## Repository structure

```
backend/   Express API + Prisma schema and migrations
web/       React web app
mobile/    Expo (React Native) app
docs/      API.md and ER-diagram.md
```

## Features

- Register, log in, log out (same account on web and mobile)
- Projects: create, view, edit, delete (web); view with tasks (mobile)
- Tasks: create, edit, delete, mark completed, change status and priority (web and mobile)
- Dashboard: total projects, total tasks, completed tasks, pending tasks, projects in progress
- Search projects and tasks by name; filter projects by status; filter tasks by status and priority
- Mobile: secure token storage, pull-to-refresh, clear message on expired login, clear message when offline

## Setup

Prerequisites: Node.js 20+, a PostgreSQL database (a free Neon project works).

### 1. Database

1. Create a PostgreSQL database and copy its connection string.
2. Tables are created by Prisma migrations (see backend setup, step 3). The schema is in `backend/prisma/schema.prisma` and the diagram is in [docs/ER-diagram.md](docs/ER-diagram.md).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in the values below
npx prisma migrate dev    # creates the tables
npm run dev               # http://localhost:4000  (health check: /health)
```

| Variable         | Description                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string                                                                                                              |
| `JWT_SECRET`     | Secret used to sign tokens (16+ characters). Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime, default `7d`                                                                                                              |
| `CORS_ORIGINS`   | Comma-separated list of allowed web origins, e.g. `http://localhost:5173,https://your-app.vercel.app`                                     |
| `PORT`           | Server port, default `4000`                                                                                                               |

**Deploying (Render):** root directory `backend`, build command `npm install --include=dev && npm run build`, start command `npm start` (runs `prisma migrate deploy`, then the server). Set the variables above in Render's Environment tab.

### 3. Web app

```bash
cd web
npm install
cp .env.example .env      # set VITE_API_URL
npm run dev               # http://localhost:5173
```

| Variable       | Description                                                     |
| -------------- | --------------------------------------------------------------- |
| `VITE_API_URL` | Backend URL, no trailing slash (local: `http://localhost:4000`) |

**Deploying (Vercel):** root directory `web`, framework preset Vite, set `VITE_API_URL`. Add the Vercel URL to `CORS_ORIGINS` on the backend.

### 4. Mobile app

```bash
cd mobile
npm install
npx expo start            # scan the QR code with Expo Go
```

By default the app talks to the **deployed backend** (`https://project-management-system-rh3t.onrender.com`). To use a different backend, create `mobile/.env`:

```
EXPO_PUBLIC_API_URL=https://your-backend-url
```

The phone must be able to reach that URL, so use a deployed or tunnelled URL, not `localhost`.

**Building the Android APK:**

```bash
npm install -g eas-cli
eas login
cd mobile
eas build -p android --profile preview
```

The `preview` profile in `mobile/eas.json` produces an installable `.apk`.

## API documentation

See [docs/API.md](docs/API.md).

## Security

- Passwords hashed with bcrypt (cost 12); never returned in any response
- JWT authentication middleware on every route except register and login
- Authorization: every query is scoped to the signed-in user. Other users' projects and tasks return `404`
- All request bodies, query strings and URL parameters validated with Zod (required fields, email format, date values, empty strings, enums, end date not before start date)
- Prisma ORM (parameterized queries), so no raw SQL and no SQL injection
- Rate limiting on register and login (10 attempts per 15 minutes per IP)
- helmet security headers; CORS limited to the configured web origins
- Mobile token stored in Keystore (Android) / Keychain (iOS) via expo-secure-store
- Expired or invalid tokens: web and mobile clear the session and show the login screen with a message

## Design decisions

- **One backend, one API contract.** Web and mobile call the same endpoints and use the same enum values and error format.
- **Task ownership through the project.** A task has no owner column. It belongs to the user who owns its project, so access checks join through the project and can't drift out of sync.
- **404 instead of 403** for other users' data, so the API doesn't reveal what exists.
- **Stateless JWT.** Logout discards the token on the client; the logout endpoint exists so both apps follow one flow.
- **Pending Tasks** on the dashboard counts tasks with status `PENDING`; tasks `IN_PROGRESS` are returned separately as `inProgressTasks`.

## Test data

Use only test data. No real personal data is stored.
