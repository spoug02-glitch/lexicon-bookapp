# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Lexicon — a Next.js 16 (App Router) book search & review service. Users search books (via
Aladin API), see library availability (via 도서관정보나루/data4library.kr), and write reviews with
a reading channel (paper/ebook/audiobook), free-text "discovery story", tags, and public/private
visibility. Public reviews are shareable via a login-free `/share/[reviewId]` link.

Demo/seed data is fictional and always labeled `[예시]` in user-facing text — don't remove that
labeling convention when touching seed.ts or UI copy.

## Commands

```bash
npm run dev              # dev server (localhost:3000)
npm run build             # production build (also type-checks — `next build` fails on TS errors)
npm test                  # vitest run (all tests)
npx vitest run <path>     # single test file
npm run lint               # eslint

npx prisma migrate dev --name <name>   # after editing prisma/schema.prisma
npm run db:seed                         # reseed demo data (prisma/seed.ts)
npm run notion:setup -- <notionPageId>  # (re)create the Notion sync database from .env.local
```

Test environment is `node` (not jsdom) by default (`vitest.config.ts`); component tests that need
a DOM add `// @vitest-environment jsdom` at the top of the file. `server-only` is aliased to a
no-op stub in tests (`test/stubs/server-only.ts`) since it throws outside webpack bundling.

## Architecture

### Service layer sits between Server Components and external APIs

`src/lib/services/*.ts` (e.g. `books.ts`, `library.ts`) is the single place that combines
DB-backed caching (`src/lib/cache.ts` — `ApiCache` table, TTL per data type), quota enforcement
(`src/lib/quota.ts`), and the raw external API clients (`src/lib/external/aladin.ts`,
`library.ts`). Server Components and Route Handlers both call the service layer directly —
never have a Server Component `fetch()` its own Route Handler (classic Next.js anti-pattern this
codebase deliberately avoids).

Quota (`withQuota`) groups Aladin's three endpoints (search/lookup/used) under one shared daily
counter (4,800/day safety margin under the real 5,000 limit) because they share one TTBKey. It
increments atomically first, then checks the group total and rolls back on overflow, to avoid a
check-then-record TOCTOU race under concurrent requests. `data4library` calls are cached but not
quota-gated (no published limit). Callers get `{ items, stale, quotaExceeded }`-shaped results and
render a `QuotaBanner` rather than erroring — a single Aladin outage should never crash a page.

### Review data model: channel + tags + excerpts, not "acquisition route"

`Review` (see `prisma/schema.prisma`) intentionally does **not** track where a book was
bought/borrowed. Instead: `channel` (PAPER/EBOOK/AUDIOBOOK, optional), `originStory` (free-text
discovery narrative), `shortReview` + `body` (short/long review text), `visibility`
(PUBLIC/PRIVATE, default PUBLIC), and many-to-many `tags` via `ReviewTag`/`Tag` (label-based
upsert with `usageCount` for autocomplete ranking). A public review's `body` cannot be empty —
enforced by a Zod `.refine()` in `src/lib/validation/review.ts`, not the DB.

`Excerpt` (one-to-many from `Review`) holds block-style quote captures: `quote`, `pageLabel`
(free text — "p.12", "35%", "위치 1200", not a number, since ebook/audiobook progress markers
vary), `comment`, `order`. Saves use an **id-based diff** (`syncReviewExcerpts` in
`src/app/actions/reviews.ts`), not delete-and-recreate: client-supplied ids that already exist in
the DB get `update`d in place, missing ids get deleted, new ids get `create`d with a fresh cuid.
This keeps excerpt ids stable across edits, unlike `syncReviewTags` (same file), which does
delete-all-then-recreate every save since tags have no per-row identity worth preserving.

`ReviewCard` shows at most 2 excerpts as a preview (`ExcerptPreview`, gated on
`visibility === "PUBLIC"` before linking to `/share/[reviewId]`, — a PRIVATE review must never
expose a working share link even as a "N more" pointer). `ShareReviewCard`
(`src/components/review/`) is the full, share-page-only render and is a pure presentational
component (no `"use client"`, no hooks) so it can later be reused for OG-image generation without
rework.

### Auth is edge/proxy-safe by construction

`src/lib/auth.config.ts` (Edge-compatible: no Prisma adapter, no bcrypt) vs `src/lib/auth.ts`
(full config with `@auth/prisma-adapter`) are split because `src/proxy.ts` (Next.js 16's
middleware, renamed from `middleware.ts`) runs on the Edge runtime and can't load Prisma. The
`config.matcher` in `proxy.ts` lists which route prefixes require auth
(`/reviews`, `/books/*/review/*`, `/history`); everything else — search, book detail, `/share/*`
— is intentionally login-free.

### API response caching and quota tracking live in the DB, not memory

`ApiCache` (keyed by `provider` + `cacheKey`, JSON payload, `expiresAt`) and `ApiQuotaUsage`
(per-provider daily counters, KST-day-boundaried) are both Prisma models, not an in-memory or
Redis cache — this is a single-instance dev/demo deployment, so DB-backed caching is simpler than
adding infra. `getOrSetCache` returns `{ data, stale }`; a stale-but-present cache entry is served
(with `stale: true` surfaced to the UI) rather than blocking on a failed re-fetch.

### Notion sync is bidirectional and property-schema-driven

`src/lib/notion-schema.ts` centralizes the Notion database property names and the
channel/visibility label mappings shared by `scripts/notion-setup.ts` (creates the DB) and
`src/lib/services/notion.ts` (export/import). Exported reviews carry a `LexiconReviewId` rich-text
property used to match existing Notion pages on re-export (idempotent) and to skip
already-synced rows on import. Changing the property schema requires re-running
`npm run notion:setup` and updating `NOTION_DATABASE_ID` — the old database's columns won't match.

## Windows-specific gotcha

`DATABASE_URL="file:./prisma/dev.db"` in `.env`/`.env.local` resolves relative to
`prisma/schema.prisma`'s location, not the repo root — so it actually points at
`prisma/prisma/dev.db` (a nested directory), not `prisma/dev.db`. Both paths are gitignored, but
if `prisma migrate dev` complains about non-interactive environments or unexpected existing data,
check `prisma/prisma/dev.db` for a stray file before assuming migration state is corrupted.
