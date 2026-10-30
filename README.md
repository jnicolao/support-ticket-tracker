# Mini Ticket Tracker

[![CI](https://github.com/jnicolao/support-ticket-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/jnicolao/support-ticket-tracker/actions/workflows/ci.yml)

A small ticket tracker: an Express + PostgreSQL REST API and a single-page Next.js UI for creating tickets, listing them, and changing their status.

## Layout

```
api/   Express + TypeScript API: src/ (app), db/migrations/ (numbered SQL), tests/ (integration tests)
web/   Next.js + Tailwind UI
db/    Compose init script that creates the test database
```

The API and the UI are two independent npm packages with no workspace or shared package between them.

## Prerequisites

- Node.js 22 or newer
- Docker with Compose, for PostgreSQL

## Run it

Start PostgreSQL. The first start of the volume also creates the `tickets` and `tickets_test` databases.

```bash
docker compose up -d --wait
```

Start the API on http://localhost:3001. The env file holds `DATABASE_URL` and `PORT`. The migrate script applies the numbered SQL files in `api/db/migrations` that are not yet recorded in the `schema_migrations` table, each in its own transaction, so it is safe to run again at any time.

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

The UI calls the API at `http://localhost:3001`. Set `NEXT_PUBLIC_API_URL` to change that (see `web/.env.example`). To start from an empty database, run `docker compose down -v` and the steps above again.

## What the UI does

- A form with title, description and priority creates a ticket. Validation errors come from the API and are shown next to the field they belong to. After a successful create the list returns to page 1 so the new ticket is visible.
- A table lists tickets newest first with title, status, priority and creation time, 10 per page, with Prev and Next buttons driven by the API's pagination block.
- Each row has a status select that saves on change and then refetches the current page. There are no optimistic updates.
- Priority is chosen when a ticket is created. The UI does not edit it afterwards: the assignment asked for a way to change status, and priority changes go through the API's PATCH endpoint. A priority select per row would work exactly like the status select.
- The status filter and the stats endpoint are API-only. The UI has no filter or stats display because the assignment did not ask for them.

## Run the tests

The tests are integration tests: Supertest drives the Express app against the real `tickets_test` database, which is truncated before every test. PostgreSQL must be running. The setup refuses to run against any database whose name does not end in `_test`, and `TEST_DATABASE_URL` overrides the default connection string.

```bash
cd api
npm test
```

The 22 tests cover:

- `create.test.ts`: defaults applied and row persisted, description and priority stored, and five invalid bodies (missing, blank and overlong title, bad priority, unknown field) rejected with the error shape
- `list.test.ts`: status filter, page size, total, newest-first order, a page past the end, the unfiltered defaults, and five invalid query values rejected
- `update.test.ts`: status and priority updated independently and persisted, four invalid inputs rejected, unknown id returns 404
- `stats.test.ts`: every status present with zeros, counts reflect a PATCH, values are numbers
- `errors.test.ts`: malformed JSON returns 400 in the standard shape
- `migrations.test.ts`: every migration file is recorded exactly once and a second run applies nothing

The UI has no automated tests; `npm run lint` in `web/` runs ESLint with the Next.js and React Hooks rules.

## API

| Method | Path | Description |
|---|---|---|
| POST | `/tickets` | Create a ticket. Body: `title` (required, trimmed, max 200 chars), `description` (optional, blank stored as null), `priority` (`low`, `medium`, `high`; default `medium`). Status cannot be set; new tickets start `open`. Returns 201 with the ticket. |
| GET | `/tickets` | List tickets ordered by `created_at` then `id`, newest first. Query: `status`, `page` (integer, default 1), `limit` (integer 1 to 100, default 20). Returns `{ data, pagination: { page, limit, total, totalPages } }`. A page past the end returns an empty `data` with 200; `totalPages` is 0 when there are no tickets. |
| PATCH | `/tickets/:id` | Update `status` (`open`, `in_progress`, `closed`) and/or `priority`. The body must contain at least one of them and nothing else. Returns 200 with the updated ticket, 400 for a non-integer id, 404 for an unknown id. |
| GET | `/tickets/stats` | Count of tickets per status as numbers, always including all three statuses. |

These are the only endpoints. There is no `GET /tickets/:id` or `DELETE` because the assignment did not ask for them.

Every error has the same shape: `{ "error": { "message": "...", "details": [...] } }`. `details` lists each invalid field with a `path` and a `message` when validation fails. Unknown body fields are rejected with 400; unknown query parameters are ignored. Malformed JSON and unknown routes use the same shape, and unexpected errors return a generic 500 message with no stack trace.

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

I used plain parameterized SQL through `pg` instead of an ORM because four queries do not justify the abstraction, and the SQL stays readable and easy to reason about. Status and priority are text columns with CHECK constraints rather than Postgres enums, since adding a value is a one-line constraint change instead of an enum migration, and the allowed values live in one array that validation and the tests share, with the UI keeping its own copy rather than adding monorepo tooling. Validation is zod with strict objects, so unknown fields and bad query values get a 400 instead of being silently dropped or clamped. Schema changes are numbered SQL files applied in order by a thirty-line script that records each one in a `schema_migrations` table, which covers this project's needs without a migration library. Pagination is offset-based because it is simple and the UI needs page numbers; cursor pagination would be the upgrade for large tables or for stable pages while tickets are being created. PATCH is one UPDATE with COALESCE and RETURNING, so concurrent updates are serialized by the row lock and the last write wins per field, with no read-then-write race. The tests run against a real test database and the files run one at a time because they share it. The UI refetches after every mutation instead of updating optimistically, which keeps the state logic small at the cost of a round trip. CI runs the API tests against a Postgres service and lints, typechecks and builds the UI on every pull request. With more time I would add auth, an `updated_at` column and a status history, and a browser-level end-to-end test for the create and status-change flow.

## Assumptions

- Any status can move to any other status; there is no workflow enforcement.
- Status cannot be set on create; every ticket starts open.
- Priority is set at creation and changed only through the API; the UI changes status only.
- Title and description are trimmed, and a blank description is stored as null.
- The UI shows 10 tickets per page while the API defaults to 20, so pagination is reachable with a handful of tickets.
- Ticket ids are integers; a non-integer or out-of-range id is a 400 and an unknown id is a 404.
- The list's count and page queries are not wrapped in a transaction, so `total` can be off by one if a ticket is created between them. The next refetch corrects it.
- The API allows any origin and has no auth, which is only acceptable for local use.
- Timestamps are returned as UTC ISO 8601 strings; the UI shows them in the browser's local time.
