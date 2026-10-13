# Mini Ticket Tracker

A small ticket tracker: an Express + PostgreSQL REST API and a single-page Next.js UI for creating tickets, listing them, and changing their status.

## Layout

```
api/   Express + TypeScript API: src/ (app), db/ (schema), tests/ (integration tests)
web/   Next.js + Tailwind UI
db/    Compose init script that creates the test database
```

## Prerequisites

- Node.js 22 or newer
- Docker with Compose, for PostgreSQL

## Run it

Start PostgreSQL. The first start also creates the `tickets` and `tickets_test` databases.

```bash
docker compose up -d --wait
```

Start the API on http://localhost:3001:

```bash
cd api
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

In a second terminal, start the UI on http://localhost:3000:

```bash
cd web
npm install
npm run dev
```

The UI calls the API at `http://localhost:3001`. Set `NEXT_PUBLIC_API_URL` to change that (see `web/.env.example`).

## Run the tests

The tests are integration tests: Supertest drives the Express app against the real `tickets_test` database, which is truncated before every test. PostgreSQL must be running.

```bash
cd api
npm test
```

## API

| Method | Path | Description |
|---|---|---|
| POST | `/tickets` | Create a ticket. Body: `title` (required, max 200 chars), `description` (optional), `priority` (`low`, `medium`, `high`; default `medium`). New tickets start `open`. Returns 201. |
| GET | `/tickets` | List tickets, newest first. Query: `status`, `page` (default 1), `limit` (default 20, max 100). Returns `{ data, pagination }`. |
| PATCH | `/tickets/:id` | Update `status` (`open`, `in_progress`, `closed`) and/or `priority`. Returns the updated ticket, or 404. |
| GET | `/tickets/stats` | Count of tickets per status, always including all three statuses. |

Every error has the same shape: `{ "error": { "message": "...", "details": [...] } }`. `details` lists each invalid field when there is one. Unknown fields and invalid query values are rejected with 400 rather than ignored.

Create a ticket:

```bash
curl -X POST localhost:3001/tickets -H 'Content-Type: application/json' -d '{"title":"Printer jammed","priority":"high"}'
```

Response: `201 {"id":1,"title":"Printer jammed","description":null,"status":"open","priority":"high","created_at":"2026-10-13T08:00:00.000Z"}`

List open tickets, five per page:

```bash
curl 'localhost:3001/tickets?status=open&page=1&limit=5'
```

Response: `200 {"data":[...],"pagination":{"page":1,"limit":5,"total":1,"totalPages":1}}`

Close it:

```bash
curl -X PATCH localhost:3001/tickets/1 -H 'Content-Type: application/json' -d '{"status":"closed"}'
```

Send something invalid:

```bash
curl -X POST localhost:3001/tickets -H 'Content-Type: application/json' -d '{"title":""}'
```

Response: `400 {"error":{"message":"Validation failed","details":[{"path":"title","message":"Title is required"}]}}`

## Decisions and tradeoffs

I used plain parameterized SQL through `pg` instead of an ORM because four queries do not justify the abstraction, and the SQL stays readable and easy to reason about. Status and priority are text columns with CHECK constraints rather than Postgres enums, since adding a value is a one-line constraint change instead of an enum migration, and the allowed values live in one array that validation and the tests share, with the UI keeping its own copy rather than adding monorepo tooling. Validation is zod with strict objects, so unknown fields and bad query values get a 400 instead of being silently dropped or clamped. The schema is a single idempotent SQL file applied by a script; numbered migrations with a tracking table are the next step once the schema changes more than once. Pagination is offset-based because it is simple and the UI needs page numbers; cursor pagination would be the upgrade for large tables or for stable pages while tickets are being created. PATCH is one UPDATE with COALESCE and RETURNING, so concurrent updates are serialized by the row lock and the last write wins per field, with no read-then-write race. The tests run against a real test database and the files run one at a time because they share it. The UI refetches after every mutation instead of updating optimistically, which keeps the state logic small at the cost of a round trip. With more time I would add auth, an `updated_at` column and a status history, CI that runs the tests against a Postgres service, and a browser-level end-to-end test for the create and status-change flow.

## Assumptions

- Any status can move to any other status; there is no workflow enforcement.
- Status cannot be set on create; every ticket starts open.
- Title and description are trimmed, and a blank description is stored as null.
- The API allows any origin and has no auth, which is only acceptable for local use.
- Timestamps are returned as UTC ISO 8601 strings; the UI shows them in the browser's local time.
