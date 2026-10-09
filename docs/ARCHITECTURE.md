# Architecture

One backend serves both clients. A user can register or log in on the web or on Android, and sees the same data on both.

## 1. System architecture

```mermaid
flowchart LR
    subgraph Clients
        W["Web app<br/>React + Vite + Tailwind<br/>hosted on Vercel<br/>token in localStorage"]
        M["Android app<br/>React Native + Expo<br/>installed from APK<br/>token in Keystore via SecureStore"]
    end

    subgraph API["Backend API on Render - Node.js + Express + TypeScript"]
        MW["Middleware<br/>helmet, request logging, CORS, JSON parser"]
        RL["Rate limiter<br/>register and login only"]
        AUTH["JWT auth middleware<br/>sets req.userId"]
        ROUTES["Routes<br/>auth, projects, tasks, dashboard"]
        VAL["Zod validation<br/>body, query, params"]
        ORM["Prisma ORM<br/>parameterized queries"]
        ERR["Central error handler<br/>consistent JSON errors"]
    end

    DB[("PostgreSQL on Neon<br/>users, projects, tasks")]

    W -->|"HTTPS + JSON<br/>Bearer token"| MW
    M -->|"HTTPS + JSON<br/>Bearer token"| MW
    MW --> RL
    MW --> AUTH
    RL --> ROUTES
    AUTH --> ROUTES
    ROUTES --> VAL
    ROUTES --> ORM
    ORM --> DB
    ROUTES -.->|"on any error"| ERR
```

| Layer | Technology | Responsibility |
|---|---|---|
| Web client | React, Vite, Tailwind, React Router | Screens, forms, calls the API through one client |
| Mobile client | React Native, Expo, React Navigation | Same features on a phone, secure token storage, offline banner |
| API | Express 5, TypeScript | Authentication, authorization, validation, business rules |
| Data access | Prisma | Typed, parameterized queries and migrations |
| Database | PostgreSQL (Neon) | Stores users, projects, tasks with foreign keys |
| Hosting | Vercel, Render, Neon, GitHub | Web, API, database, source code |

## 2. What a user can do(Process Diagram)

```mermaid
flowchart TD
    A(["Open the app"]) --> B{"Valid token saved?"}
    B -->|"No"| C["Login or Register screen"]
    B -->|"Yes"| I

    C --> D["Register: name, email, password"]
    C --> E["Login: email, password"]
    D --> F["Server validates input,<br/>hashes password with bcrypt,<br/>saves the user"]
    E --> G["Server checks the password<br/>and signs a JWT valid for 7 days"]
    F --> G
    G --> H["Token saved on the device"]
    H --> I["Dashboard<br/>total projects, total tasks,<br/>completed, pending, projects in progress"]

    I --> J["Projects list<br/>search by name, filter by status"]
    J --> K["Project details"]
    J --> N["Create, edit, delete projects<br/>web app"]
    K --> L["Tasks in the project<br/>create, edit, delete, mark completed<br/>search, filter by status and priority"]
    L --> O["Refresh on the other device<br/>shows the same changes"]

    I --> P["Log out"]
    P --> Q["Token deleted from the device"]
    Q --> C

    L --> R{"Token expired?"}
    R -->|"Yes"| S["Session cleared,<br/>login screen with a message"]
    S --> C
```

Project create, edit and delete are available on the web app. The Android app shows projects and covers all task actions, as the brief requires.

## 3. Request flow: register, use the app, token expiry

```mermaid
sequenceDiagram
    actor U as User
    participant C as Web or Mobile app
    participant A as Express API
    participant D as PostgreSQL

    U->>C: Fill in the register form
    C->>C: Validate the fields
    C->>A: POST /api/auth/register
    A->>A: Rate limit and Zod validation
    A->>D: Check the email is unused
    A->>A: Hash the password with bcrypt
    A->>D: Insert the user
    A-->>C: 201 with user and JWT
    C->>C: Save the token

    U->>C: Create a task
    C->>A: POST /api/tasks with Bearer token
    A->>A: Verify the JWT and validate the body
    A->>D: Check the project belongs to this user
    A->>D: Insert the task
    A-->>C: 201 with the task
    C-->>U: Task appears in the list

    U->>C: Open the app on the other device
    C->>A: GET /api/tasks for the project
    A->>D: Select tasks owned by this user
    A-->>C: 200 with the tasks
    C-->>U: Same task is visible

    Note over C,A: After 7 days the token expires
    C->>A: Any request with the old token
    A-->>C: 401 TOKEN_EXPIRED
    C->>C: Clear the token
    C-->>U: Login screen with the session expired message
```

## 4. Security layers

| Layer | Protection |
|---|---|
| Transport | HTTPS everywhere (Vercel, Render, Neon with SSL) |
| Edge | helmet headers, CORS allow-list, rate limit on register and login |
| Authentication | bcrypt password hashes, JWT checked on every protected route |
| Authorization | Every query is scoped to the signed-in user. Tasks are checked through their project's owner. Other users' data returns 404 |
| Input | Zod validates every body, query and URL parameter before it reaches the database |
| Database | Prisma parameterized queries, foreign keys, unique email, cascade deletes |
| Secrets | Environment variables only. `.env` is never committed |
| Mobile storage | Token in Android Keystore (iOS Keychain) through expo-secure-store |
