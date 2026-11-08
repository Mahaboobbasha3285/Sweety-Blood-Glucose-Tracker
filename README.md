# Sweety | Blood Glucose Tracker

A full-stack blood glucose journal built for the Kenpath Junior Full Stack Developer assignment. Users can create an account, securely record up to four readings per day, manage their entries, and review daily, month-to-date, and previous-month summaries.

> **Health note:** Sweety is a personal tracking application, not a medical device. It does not diagnose, recommend treatment, or replace advice from a qualified healthcare professional.

## Features

### Required assignment features
- User registration, login, logout, and session restoration.
- Password hashing with bcrypt (12 salt rounds).
- HTTP-only, SameSite=Lax authentication cookie.
- User-scoped reading queries and ownership checks on update/delete.
- Create, list, update, and delete glucose readings.
- Four supported daily slots: Morning (fasting), After breakfast, After lunch, and After dinner.
- Whole-number glucose values from 40 through 600 mg/dl.
- No future dates, duplicate user/date/slot combinations, or more than four readings per day.
- Daily, month-to-date, and previous-calendar-month reports.
- Highest, lowest, average (one decimal place), and reading count for each report.
- Friendly empty states and daily reading detail.

### Additional features
- Pagination on `GET /api/readings` (`page`, `limit`, maximum limit 100).
- Responsive dashboard and reading management UI.
- Daily line chart using Recharts.
- Docker Compose setup for PostgreSQL, API, and frontend.
- Backend API/unit tests and frontend utility/component tests.
- PostgreSQL migration and demo seed script.

## Technology

| Area | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Recharts, Lucide |
| Backend | Node.js 22+, Express 4 |
| Database | PostgreSQL 16+ |
| ORM / migrations | Prisma 6 |
| Validation | Zod |
| Authentication | bcryptjs, JSON Web Token, HTTP-only cookie |
| Backend tests | Node test runner, Supertest |
| Frontend tests | Vitest, React Testing Library |

## Architecture

The React client calls a REST API hosted by Express. Express validates request data with Zod, checks the signed JWT stored in an HTTP-only cookie, and delegates business rules to service modules. Prisma accesses PostgreSQL. Every reading query is scoped by the authenticated user's UUID. The database also enforces uniqueness for `(user_id, reading_date, time_slot)` so duplicate slots cannot be stored even if requests race.

## Folder structure

```text
sweety/
├── client/
│   ├── src/
│   │   ├── components/       # Layout, forms, stat cards, empty states
│   │   ├── context/          # Authentication context
│   │   ├── pages/            # Login, register, dashboard, readings, reports
│   │   ├── services/         # API client
│   │   ├── test/             # Test setup
│   │   └── utils/            # Date and reading helpers
│   ├── Dockerfile
│   └── package.json
├── server/
│   ├── prisma/               # Prisma schema, migration, seed script
│   ├── src/
│   │   ├── config/           # Environment and Prisma client
│   │   ├── controllers/      # HTTP handlers
│   │   ├── middleware/       # Authentication and error handling
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Date and error helpers
│   │   └── validators/       # Zod schemas
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── .env.example
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 22 or newer and npm 10 or newer.
- PostgreSQL 16 or newer, or Docker Desktop with Docker Compose.
- Git (for source control and submission).

## Local installation

1. Extract the project and open a terminal in the `sweety` directory.
2. Install workspace dependencies:

   ```bash
   npm install
   ```

3. Create a root `.env` file by copying `.env.example` and update `DATABASE_URL` and `JWT_SECRET`. Use a unique random JWT secret of at least 32 characters. Never commit `.env`.

   ```bash
   cp .env.example .env
   cp .env server/.env
   ```

   The server workspace runs with `server/` as its working directory, so the second copy makes the same settings available to the API, Prisma CLI, and seed script. Both files are ignored by Git. If you override `VITE_API_URL`, place that Vite variable in `client/.env`.

4. Create a PostgreSQL database named `sweety` (or update the database name in `DATABASE_URL`).
5. Generate Prisma Client and apply migrations:

   ```bash
   npm run db:generate
   npm run db:migrate --workspace server
   ```

6. (Optional) Seed the demo user and four sample readings:

   ```bash
   npm run db:seed
   ```

   Demo email: `demo@sweety.local`. The password is the value configured in `SEED_DEMO_PASSWORD` in `.env`. Change it before sharing a demo environment.

7. Start both applications:

   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - API: http://localhost:5000
   - Health check: http://localhost:5000/api/health

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection URL |
| `PORT` | No | API port; defaults to `5000` |
| `NODE_ENV` | No | `development`, `test`, or `production` |
| `CLIENT_ORIGIN` | No | Exact frontend origin allowed by CORS |
| `JWT_SECRET` | Yes | Random signing secret, minimum 32 characters |
| `JWT_EXPIRES_IN` | No | JWT lifetime; defaults to `1d` |
| `COOKIE_NAME` | No | Authentication cookie name |
| `APP_TIMEZONE` | No | Timezone used for future-date validation; defaults to `Asia/Kolkata` |
| `SEED_DEMO_PASSWORD` | Seed only | Password used for the seeded demo account, minimum 8 characters |
| `VITE_API_URL` | No | Optional client API base URL; defaults to `http://localhost:5000/api` |

The client can use `VITE_API_URL` as a build-time variable in `client/.env`. For a local Vite run, the default is suitable. If hosting frontend and API on different sites, configure cookie and CORS settings for that deployment and review cross-site CSRF protections before launch.

## Docker Compose

1. Create `.env` from `.env.example` and set a strong `JWT_SECRET`.
2. Start the stack:

   ```bash
   docker compose up --build
   ```

3. Open http://localhost:8080. The API is at http://localhost:5000.
4. Stop the stack with `docker compose down`. Add `-v` only if you intentionally want to delete the persisted database volume.

The API container applies committed Prisma migrations on startup. The Compose database uses local development credentials and must not be exposed as a production database.

## API documentation

All request and response bodies are JSON. Authenticated routes use the HTTP-only cookie set by `POST /api/auth/login`. Send requests with credentials enabled from the browser.

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account: `{ "name", "email", "password" }` |
| POST | `/api/auth/login` | Public | Sign in: `{ "email", "password" }` |
| GET | `/api/auth/me` | Authenticated | Return current user |
| POST | `/api/auth/logout` | Authenticated | Clear session cookie |

Registration returns `201` and `{ "user": { "id", "name", "email", "createdAt" } }`. Login returns the same public user shape and sets the session cookie. Password hashes and JWTs are never returned in JSON.

### Readings

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/readings?page=1&limit=20` | Authenticated | List the current user's readings, newest date first |
| GET | `/api/readings?date=2026-10-15` | Authenticated | Filter by date |
| POST | `/api/readings` | Authenticated | Create a reading |
| PUT | `/api/readings/:id` | Authenticated | Update an owned reading |
| DELETE | `/api/readings/:id` | Authenticated | Delete an owned reading |

Create/update body:

```json
{
  "date": "2026-10-15",
  "timeSlot": "AFTER_LUNCH",
  "value": 128
}
```

Allowed `timeSlot` values: `MORNING_FASTING`, `AFTER_BREAKFAST`, `AFTER_LUNCH`, `AFTER_DINNER`. The value must be an integer from 40 to 600 inclusive. A date must be a real `YYYY-MM-DD` date and cannot be after today's date in `APP_TIMEZONE`.

List response shape:

```json
{
  "readings": [],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

### Reports

`GET /api/reports?date=2026-10-15` returns `daily`, `monthToDate`, and `previousMonth`. Each contains `range`, `highest`, `lowest`, `average`, and `count`. The daily report additionally contains `readings`. Empty periods return `null` for highest, lowest, and average, and `0` for count.

### Error response

Errors use a consistent shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Value must be between 40 and 600 mg/dl."
  }
}
```

Common status codes: `400` invalid input, `401` unauthenticated/invalid credentials, `404` missing resource, `409` duplicate/conflict, and `500` unexpected server error.

## Testing and quality checks

Run from the project root:

```bash
npm test
npm run lint
npm run build
```

Backend tests use Node's built-in test runner and Supertest. Frontend tests use Vitest and React Testing Library. The backend health, anonymous access guard, missing route, request validation, date helpers, and reading validation are covered without requiring a live database. Database-backed CRUD, cookie login against PostgreSQL, and browser-based end-to-end flows require a configured PostgreSQL instance and should be exercised before deployment.

## Notes and assumptions

- The assignment title says “MERN + PostgreSQL”, but its explicit implementation requirements call for PostgreSQL. This project uses PostgreSQL as the only database; MongoDB is not added.
- A reading date is stored as a PostgreSQL `DATE`, not a timestamp. The configured `APP_TIMEZONE` (default `Asia/Kolkata`) defines “today” for future-date validation. Date-only values are transferred as `YYYY-MM-DD` strings.
- A user can have one reading in each of the four defined slots on a date. This inherently caps a day at four readings; a unique database constraint protects slot uniqueness.
- The previous-month report always means the entire previous calendar month, regardless of the selected day.
- The average is the arithmetic mean of all readings in the report period, rounded to one decimal place.
- Authentication uses a signed JWT in an HTTP-only, SameSite=Lax cookie. For production deployments, serve over HTTPS, use a strong secret, configure exact origins, and review CSRF protections for the hosting topology.
- No clinical interpretation or target ranges are presented because these depend on an individual's care plan.
- With more time: add full PostgreSQL-backed integration tests, Playwright end-to-end coverage, accessibility automation, stronger cross-site CSRF strategy for multi-domain hosting, structured logging/monitoring, and CI checks.

## Submission checklist

- [ ] Push the source to a public GitHub repository using small, meaningful commits.
- [ ] Run the project and capture genuine screenshots or a 2–3 minute screen recording.
- [ ] Confirm the public repository contains no `.env`, credentials, or generated dependencies.
- [ ] Verify the README setup steps on a clean machine or container.
- [ ] Reply to Kenpath's assignment email with the repository link and screenshots/recording.
