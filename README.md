# Senior-Platform-Developer-Test-Task

Monorepo with a NestJS backend (`backend/`) and a Next.js frontend (`frontend/`).

## Run

Requires Docker and npm.

```bash
npm run dev:docker
```

Without Node/npm, run the same command directly: `docker compose up --build --watch`.

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/health
- PostgreSQL: `localhost:5432` (user/password/db: `app`)

Changes to source files, configs and dependencies are picked up automatically (hot reload, restart or rebuild as needed).

### Log in

There's no sign-up. On first start, an empty database is seeded with three users. Their emails and passwords are in [`backend/src/seed/seed-users.ts`](backend/src/seed/seed-users.ts). To reset the database and re-seed, run `docker compose down -v`.

## Tooling

Requires Node 24 (`nvm use`).

```bash
npm install       # once, for lint/typecheck/format/IDE support
npm run lint
npm run typecheck
npm run format
```

Optional: copy `.env.example` to `.env` to override settings: ports and URLs, the JWT secret and token lifetime, and the Postgres credentials.
