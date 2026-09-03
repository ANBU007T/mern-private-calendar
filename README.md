# Private Calendar — Secure Invitation-Only Scheduling Platform (MERN)

A closed-membership calendar, task, and team-coordination app. There is
**no public sign-up anywhere in this codebase** — the only way an account
comes into existence is an admin creating it (or the one-time bootstrap
admin created automatically on first server start).

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Frontend:** React 18 + Vite, React Router, Axios

Same API contract, same UI, as the original Spring Boot version — just a
different stack under the hood.

---

## 1. Prerequisites

- Node.js 18+
- MongoDB 6+ running locally, or a free MongoDB Atlas cluster

---

## 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/private_calendar
JWT_SECRET=<a long random string, 32+ chars>
JWT_EXPIRES_IN=8h
ADMIN_CODENAME=EAGLE
ADMIN_PASSWORD=ChangeMeImmediately123!
CORS_ORIGINS=http://localhost:5173
```

`ADMIN_CODENAME` / `ADMIN_PASSWORD` are only used the very first time the
server starts (when the `users` collection is empty) to create your first
administrator. Generate a strong `JWT_SECRET` with e.g. `openssl rand -base64 48`.

No database migration step is needed — Mongoose creates collections and
indexes automatically the first time each model is used.

## 3. Start the backend

```bash
cd backend
npm install
npm run dev      # nodemon, auto-restarts on changes
# or: npm start
```

The API listens on `http://localhost:8080`. Watch the startup log — on
first run it prints the code name of the admin account it just created.

## 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api` to the backend
(see `vite.config.js`), so no CORS setup is needed in development.

## 5. Log in as the initial admin

Use the `ADMIN_CODENAME` / `ADMIN_PASSWORD` from your `.env`. Log in, then
go to **Manage Members → Reset Password** on your own account to set a
permanent password.

## 6. Create members

As an admin: **Manage Members → + Add Member**. Give each person a unique
code name and a temporary password out-of-band — there's no email/invite
flow yet, by design (see §8 below).

## 7. Create calendar events & assign tasks

- **Calendar → + New Event** — title, time range, category, reminder lead
  time, and (as admin) whether it's group-wide or personal.
- **Assign Tasks → + New Task** (admin) — assign a task with a due date and
  priority to any member; they'll see it under **My Tasks**.

## 8. What's intentionally not built yet

The data model leaves room for these without schema changes:

- Email/push delivery for reminders (`Notification.deliveryChannel` already
  distinguishes `IN_APP` from future `EMAIL` / `PUSH`)
- Multiple private groups / invitation codes
- Google Calendar sync, file attachments, chat, audit logs, 2FA

---

## Project structure

```
backend/
  server.js              Express app entrypoint, mounts routes, connects to Mongo
  config/db.js            Mongoose connection
  models/                 User, Event, Task, Category, Notification schemas
  controllers/             Route handlers / business logic
  routes/                  Express routers per resource
  middleware/
    auth.js                JWT verification (protect) + admin-only guard
    errorHandler.js         Centralized error responses
  scripts/bootstrapAdmin.js  Creates first admin + default categories on empty DB
  utils/
    AppError.js             Typed HTTP error class
    toJSON.js                Mongoose plugin: _id -> id, hides passwordHash
frontend/
  src/
    pages/          Login, Dashboard, Calendar, Tasks, Members, Profile, Admin*
    components/     Layout, ProtectedRoute, EventModal
    context/        AuthContext (JWT storage, current user)
    services/       axios client with auth interceptor
```

## Key REST endpoints

| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/login` | public |
| GET/POST | `/api/users` | admin |
| PUT/DELETE | `/api/users/:id` | admin |
| POST | `/api/users/:id/reset-password` | admin |
| GET/POST | `/api/events`, `/api/events/upcoming` | authenticated |
| PUT/DELETE | `/api/events/:id` | owner or admin |
| GET/POST | `/api/tasks` | authenticated (`?all=true` for admin view of every task) |
| PUT | `/api/tasks/:id/status` | assignee or admin |
| GET | `/api/categories` | authenticated |
| GET | `/api/notifications`, `/api/notifications/due` | authenticated |

All endpoints except `/api/auth/login` and `GET /api/health` require an
`Authorization: Bearer <jwt>` header. Passwords are hashed with bcrypt and
the schema-level `select: false` + `toJSON` transform ensure the hash is
never serialized in any API response. `protect` middleware re-fetches the
user on every request, so disabling an account takes effect immediately
instead of waiting for the token to expire.

## Notes on IDs

MongoDB documents use string ObjectIds (e.g. `"66f1a2b3c4d5e6f7a8b9c0d1"`)
rather than incrementing integers. The frontend already treats all `id`
fields as opaque strings, so this required no UI changes versus the SQL
version — just one spot (`AdminTasks.jsx`) that used to coerce an id to a
number, which has been removed.
