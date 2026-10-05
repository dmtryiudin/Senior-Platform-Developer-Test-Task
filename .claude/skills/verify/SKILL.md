---
name: verify
description: Verify that a code change actually works in the running project — lint, typecheck, format, the Docker stack, API via curl, UI via Playwright MCP, DB via psql. The project has no tests, so this is the verification step. Use after any change to backend/, frontend/ or the Docker setup, before reporting the work as done.
---

# Verify a change

Run the checks that match what changed. Report what was checked and the results; if something fails, say so and include the output. Don't claim a change works without having run these.

## 1. Static checks (always)

```bash
npm run lint
npm run typecheck
npx prettier --check .
```

`npm run typecheck` is the only type check for the frontend: `next dev` doesn't check types.

## 2. Stack is up

```bash
docker compose ps
```

If the services aren't running, start the stack in the background with `npm run dev:docker`, then wait until both respond:

```bash
curl -sf localhost:3001/api/health   # expect "status":"ok" and "database":{"status":"up"}
curl -sf localhost:3000 -o /dev/null -w '%{http_code}\n'   # expect 200
```

After dependency changes (`package.json` / `package-lock.json`), Compose Watch rebuilds the image and recreates the containers. Wait for that to finish before checking.

## 3. Backend changes

- `curl` every affected endpoint: the happy path plus at least one invalid input (expect a 400 from the global `ValidationPipe`, not a 500).
- Every endpoint except `@Public()` ones needs a token. Log in as a seed user (credentials in `backend/src/seed/seed-users.ts`) and pass the `accessToken`; also check that the endpoint answers 401 without it:

  ```bash
  curl -sf localhost:3001/api/auth/login -H 'content-type: application/json' \
    -d '{"email":"iris.novak@example.com","password":"VWYo-LW67-y5DM"}'
  curl -sf localhost:3001/api/auth/me -H 'Authorization: Bearer <accessToken>'
  ```

- If the backend doesn't start after an env change, check the logs for `Invalid environment variables`.
- Check `docker compose logs backend --tail 50` for errors.

## 4. Frontend changes

- Use the Playwright MCP: open the affected page at `http://localhost:3000`, walk through the user flow (click, fill in forms, submit), and confirm the result is visible on the page. Every page except `/login` requires a session, so log in through the form with a seed user first.
- Check the browser console messages for errors.
- Check `docker compose logs frontend --tail 50` for server-side errors.

## 5. Database changes

Inspect the schema or data directly:

```bash
docker compose exec -T postgres psql -U app -d app -c '\dt'
docker compose exec -T postgres psql -U app -d app -c 'SELECT * FROM <table> LIMIT 5'
```

Tables are plural (`users`); never query `user`, which is a reserved word in Postgres and returns the DB role.

## 6. Clean up

Leave the stack in the state you found it: if you started it, stop it with `docker compose down`. Never use `-v`, which wipes the DB, unless asked. Revert any temporary code you added for checking.
