# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

The requirements live in `spec.md`.

## Ground rules

- **The project runs only via `npm run dev:docker`.**
- **No tests.**
- **One root `eslint.config.mjs`.** Type-aware (`recommendedTypeChecked`, e.g. `no-floating-promises`). React/Next rules are scoped to `frontend/**`.
- **One root `.prettierrc`.** It also sorts Tailwind classes (`prettier-plugin-tailwindcss`, including inside `cn()`/`cva()`). A Claude Code hook (`.claude/hooks/format.mjs`) formats every file Claude edits.
- **Minimal monorepo tooling:** plain npm workspaces.
- **UI: simple and usable, no custom design.** Build it from shadcn components with default styling. Don't spend effort on visual design.
- **No rate limiting.** It isn't needed in this project; don't add it.

## Layout

- `backend/`: NestJS 12, TypeScript, **ESM** (relative imports need a `.js` suffix, e.g. `./app.module.js`). Port **3001**, global route prefix `/api`. One module per feature (e.g. `src/health/`).
  - Config: `@nestjs/config`. Every env var is declared and validated in `src/config/env.validation.ts`, and the app refuses to start if one is invalid. Read config via `ConfigService<EnvironmentVariables, true>` (`get('X', { infer: true })`), never `process.env`. New env vars go into that class, `docker-compose.yml` and `.env.example`.
  - Input validation: a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`). Request bodies and queries are DTO classes with `class-validator` decorators.
  - Health: `HealthModule` (`@nestjs/terminus`), `GET /api/health` returns 200 `{"status":"ok",...}`, or 503 `{"status":"error",...}` when the DB is down.
  - CORS allows only `FRONTEND_ORIGIN` (default `http://localhost:3000`).
  - Auth (`src/auth/`): the classic `@nestjs/jwt` approach, not `@nestjs/authentication` (0.0.1, always issues refresh tokens, needs session/token stores). One access token (`JWT_EXPIRES_IN_SECONDS`, default 1h) and no refresh token: when it expires, the user logs in again. A global `AuthGuard` (`APP_GUARD`) requires a `Bearer` token on every route. Mark open routes with `@Public()`, and read the token payload (`{ sub, email }`) with `@CurrentUser()`. `POST /api/auth/login` returns `{ accessToken, expiresIn }`, `GET /api/auth/me` returns `{ id, email }`. Passwords are hashed with argon2; `password_hash` is `select: false`.
  - DB: PostgreSQL 18 via TypeORM (`TypeOrmModule.forRootAsync` in `app.module.ts`, connects with `DATABASE_URL`). `autoLoadEntities` + `synchronize: true`: register entities with `TypeOrmModule.forFeature([...])` in their feature module and the schema syncs automatically, with no migrations. Table names are plural (`users`), because `user` is a reserved word in Postgres.
  - Seed (`src/seed/`): on startup, if every table is empty, it creates the users from `seed-users.ts`, which also holds their dev credentials. There's no sign-up. To re-seed, run `docker compose down -v`.
- `frontend/`: Next.js 16, App Router, TypeScript, `src/` dir. Port **3000**. `apiFetch<T>(path)` from `src/lib/api.ts` calls the backend: it checks the status and throws `ApiError` (`status` plus the Nest error message) on non-2xx responses. Its base URL `API_URL` uses `NEXT_PUBLIC_API_URL` in the browser and `API_INTERNAL_URL` (`http://backend:3001`, the Docker network) in server-side code, where `localhost` is the frontend container itself. This Next version has breaking changes compared with older training data, so read `frontend/AGENTS.md` and the docs in `node_modules/next/dist/docs/` before writing frontend code.
  - Auth (per the Next authentication guide): the session is the backend's access token in an httpOnly `session` cookie (`src/lib/session.ts`) that expires together with the token. The `login` Server Action (`src/app/actions/auth.ts`, validated with zod) sets it. `src/proxy.ts` only checks that the cookie exists and redirects to `/login` if not. The real check is the DAL (`src/lib/dal.ts`): `getCurrentUser()` and `authFetch<T>()` call the backend with the token, and a 401 redirects to `/logout`, which deletes the cookie. Fetch protected data only on the server (Server Components, Server Actions) via `authFetch`; client components can only call public endpoints with `apiFetch`. Never wrap `redirect()` in try/catch.
  - UI: shadcn (`base-nova` style, built on Base UI, not Radix) + Tailwind v4 (no `tailwind.config`; theme lives in `src/app/globals.css`). Run the shadcn CLI from the root with `-c frontend` (e.g. `npx shadcn@latest add <name> -c frontend`); without it, the CLI fails with a `monorepo_root` error. Components land in `src/components/ui/`.

## Commands

Run from the repo root:

- `npm run dev:docker`: runs the whole project (`docker compose up --build --watch`) with hot reload. Needs Docker and npm on the host; without npm, run `docker compose up --build --watch` directly (same command).
- `npm run lint`: ESLint over the whole repo. `npm run format`: Prettier over the whole repo.
- `npm run typecheck`: `tsc --noEmit` for both apps (the frontend runs `next typegen` first). This is the only type check for the frontend, because `next dev` doesn't check types.
- `npm install`: installs deps on the host (needed for lint, format and IDE support). Always run it at the root and never create per-app lockfiles. `npm install <pkg> -w backend|frontend` adds a dependency to one app. Root tooling (ESLint, Prettier) lives in the root `devDependencies`.

## Docker and hot reload

Services: `postgres` (data in the `postgres-data` volume, port 5432 exposed to the host), plus `backend` and `frontend` built from one shared image (`Dockerfile`). The `src/` dirs are bind-mounted for hot reload. Config and dependency changes are handled by Compose Watch (`develop.watch`), which restarts the service or rebuilds the image.

- New services go into `docker-compose.yml`.
- Reset the DB: `docker compose down -v`.
- When adding a file the app reads at runtime outside `src/` (e.g. a new config), add it to that service's `develop.watch`, otherwise changes to it won't be picked up.

## MCP servers (`.mcp.json`)

- **context7**: up-to-date library docs. Use it before writing code against Next 16, NestJS 12, TypeORM 1, shadcn or Tailwind v4, since these are newer than training data.
- **playwright**: drives a real browser (Playwright's Chromium). Use it to check UI changes at `http://localhost:3000` while `npm run dev:docker` is running. The `@playwright/mcp` version is pinned to match the installed Chromium; after bumping it, run `npx playwright@<its playwright version> install chromium`.

## Skills (`.claude/skills/`)

- **verify** (ours): run it before reporting a change as done. It's the project's substitute for tests. The commands it uses are pre-allowed in `.claude/settings.json` (shared, also holds the format hook). Personal settings go in `.claude/settings.local.json` (gitignored).
- **shadcn**, **vercel-react-best-practices** (third-party, installed with `npx skills`, tracked in `skills-lock.json`): don't edit them by hand; update with `npx skills update`. Install new third-party skills with `-a claude-code --copy` and add their folders to `.prettierignore`.
- **add-feature** (ours): the step-by-step pattern for a new feature (backend module and entity, then frontend page or form), with the login feature as the reference implementation and the pitfalls it hit.
- **review-ready** (ours): the reviewer's-eye check before handing in: a cold build from a clean copy, git hygiene, README accuracy and `spec.md` coverage.
- When a workflow repeats, propose turning it into a skill.

## Environment

Env vars: see `.env.example` (read by docker compose).
