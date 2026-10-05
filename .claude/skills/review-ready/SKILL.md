---
name: review-ready
description: Pre-submission check that sees the project the way a reviewer will — a cold Docker build from a clean copy, seed login, git hygiene, README accuracy and spec.md coverage. Use before handing the project in, or when asked whether it's ready for review.
---

# Review-ready check

Simulate the reviewer's first run and check everything they'll look at. Don't change the project while checking: report the findings and fix them only after the user agrees.

## 1. Static checks

```bash
npm run lint
npm run typecheck
npx prettier --check .
```

## 2. Cold start from a clean copy

The reviewer gets only the committed files: no `node_modules`, no `.env`, no Docker cache. The copy below takes everything that isn't gitignored, i.e. what a full commit would contain.

The main project uses the same ports: if it's running, stop it first with `docker compose down` (never `-v`).

```bash
D=$(mktemp -d)   # any scratch dir; prefer the session's scratchpad if one is provided
git ls-files --cached --others --exclude-standard -z | xargs -0 -I{} cp --parents {} "$D"/
cd "$D"
export COMPOSE_PROJECT_NAME=review-check
docker compose build --no-cache
docker compose up -d
```

Then check:

- `curl -sf localhost:3001/api/health` returns `"status":"ok"` with the database up.
- `http://localhost:3000/` redirects to `/login`; logging in through the form with a seed user (`backend/src/seed/seed-users.ts`) works (Playwright MCP).
- The main flow of every feature from `spec.md` works in the browser, and the browser console has no errors.
- `docker compose logs` shows no errors (the backend log should include `Seeded 3 users`).

Tear down: `docker compose down -v --rmi local`, then delete `$D`. Restart the main project only if it was running before.

## 3. Git hygiene

- `git status`: everything that belongs to the project is committed (or the user knows what isn't).
- Nothing generated or personal is tracked: `node_modules`, `.next`, `dist`, `.playwright-mcp`, `.env`, `.claude/settings.local.json`.
- No secrets beyond the documented dev defaults (the `JWT_SECRET` default in `docker-compose.yml`, Postgres `app`/`app`).

## 4. README matches reality

The run command, the URLs, how to log in (seed users) and how to override env vars are all still accurate.

## 5. `spec.md` coverage

For every requirement in `spec.md`: where it's implemented and how it was verified. List anything missing or partial. If `spec.md` is empty, say so.

## 6. Report

A table of check → result, with blockers separated from nice-to-haves.
