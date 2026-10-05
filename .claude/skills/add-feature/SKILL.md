---
name: add-feature
description: Implement a new feature end to end in this project — NestJS module, entity and endpoints plus a Next.js page or form — following the project's conventions. Use when adding a feature (e.g. from spec.md), a new backend endpoint, or a new page or form.
---

# Add a feature

Follow the pattern of the login feature, the project's first feature. The files named below are the reference implementation: read them before writing similar code.

## 0. Before writing code

- Read `CLAUDE.md` (conventions) and `frontend/AGENTS.md`.
- Check APIs with Context7: NestJS 12, TypeORM 1, Next.js 16, shadcn and Tailwind v4 are newer than training data.
- If the requirement is ambiguous, ask before building.

## 1. Backend (`backend/src/<feature>/`)

Reference: `src/users/` (entity, service, module) and `src/auth/` (controller, DTO, guard, decorators).

- One module per feature, imported in `src/app.module.ts`.
- Entity: plural table name (`@Entity('orders')`), `@PrimaryGeneratedColumn('uuid')`, snake_case columns via `name:`, `timestamptz` for dates, sensitive columns `select: false` (select them explicitly where needed). Register it with `TypeOrmModule.forFeature([...])`; `synchronize` creates the table.
- DTOs: `class-validator` decorators on every field; normalize input with `@Transform` (see `auth/dto/login.dto.ts`). The global `ValidationPipe` rejects unknown fields.
- Auth: every route requires a token by default. Add `@Public()` only to genuinely public routes; get the user with `@CurrentUser()` (`{ sub, email }`).
- Errors: throw Nest exceptions from the service. A duplicate is a `ConflictException` checked in the business logic (there's no global DB-error filter); a missing record is a `NotFoundException`. Never return password hashes or other internals.
- New env vars: declare and validate them in `src/config/env.validation.ts`, add them to `docker-compose.yml` and `.env.example`, and read them via `ConfigService`, never `process.env`.
- If the database should start with data for the feature, extend `src/seed/` (it only runs on an empty database).
- Don't add tests or rate limiting.

## 2. Frontend (`frontend/src/`)

Reference: `app/page.tsx` (protected page), `lib/dal.ts` (DAL), `app/actions/auth.ts` (Server Action), `components/login-form.tsx` (form) and `lib/definitions.ts` (zod schema and form state).

- Pages are protected by `proxy.ts` (cookie check) and the DAL. Fetch protected data in Server Components with `getCurrentUser()` / `authFetch<T>()`. Client components can only call public endpoints with `apiFetch`.
- Mutations: a Server Action (`'use server'`) validates the `FormData` with a zod schema from `lib/definitions.ts`, calls the backend with `authFetch`, and returns `{ errors, message, ...values }` for the form. Keep `redirect()` outside try/catch.
- Forms: a client component with `useActionState`; shadcn `FieldGroup` / `Field` / `FieldLabel` / `FieldError`, `data-invalid` on the `Field` and `aria-invalid` on the control, form-level errors in an `Alert`, the submit button `disabled={pending}`, inputs `required`.
- UI is built from shadcn components with default styling (the `shadcn` skill has the composition rules). Add components with `npx shadcn@latest add <name> -c frontend`, answer "no" if it asks to overwrite an existing component, then run `npm run format` (the format hook doesn't cover files written by the CLI).
- Response types are duplicated by hand on the frontend (e.g. `LoginResponse`); keep them in sync with the backend.

## 3. Known pitfalls (hit during the first feature)

- Base UI inputs warn when `defaultValue` changes after mount: give the input a `key` that changes with the value (see the email input in `login-form.tsx`).
- `apiFetch` always parses JSON, so a `204 No Content` response throws. When the first endpoint returns 204 (e.g. a DELETE), make `apiFetch` return `undefined` for an empty body.
- Playwright: don't modify the DOM before hydration finishes (`await page.waitForLoadState('networkidle')`), or you'll get a hydration-mismatch warning caused by the test itself.
- An env change reaches the backend only when its container is recreated: `docker compose up -d --no-deps backend`. Delete any temporary `.env` created for testing.
- Don't stage or commit anything (no `git mv` either): the user commits.

## 4. Finish

- Run the `verify` skill: backend endpoints with curl (happy path, 400 on invalid input, 401 without a token), the UI flow in Playwright after logging in as a seed user, and the data via psql.
- Update `CLAUDE.md` if you introduced a new convention, and `README.md` if user-facing behavior changed.
