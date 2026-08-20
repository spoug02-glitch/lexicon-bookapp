# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**책결** (Chaekgyeol, formerly "Lexicon" during early development — the deployed Vercel project/
domain is still named `lexicon-bookapp`/`lexicon-bookapp.vercel.app`; renaming that is a live
infra change, not just a code edit, so it hasn't happened yet) is a Next.js 16 (App Router) book
search & review service. Users search books
(via Aladin API), see library availability (via 도서관정보나루/data4library.kr), and write reviews
with a reading channel (paper/ebook/audiobook), free-text "discovery story", tags, and public/
private visibility. Public reviews are shareable via a login-free `/share/[reviewId]` link, and
individual excerpts can be shared as branded PNG cards or copied as formatted text.

The same web app also ships as an Android APK: `android/` is a Capacitor project whose webview
loads the **deployed** production URL directly (`capacitor.config.ts` → `server.url`), not a local
bundle. There is no separate mobile codebase to keep in sync — every web change ships to the app
automatically once deployed.

Demo/seed data is fictional and always labeled `[예시]` in user-facing text — don't remove that
labeling convention when touching seed.ts or UI copy.

## Commands

```bash
npm run dev              # dev server (localhost:3000)
npm run build             # production build (also type-checks — `next build` fails on TS errors)
npm test                  # vitest run (all tests)
npx vitest run <path>     # single test file
npm run lint               # eslint

npx prisma migrate dev --name <name>   # local dev only (SQLite) — see "Two databases" below
npm run db:seed                         # reseed demo data (prisma/seed.ts)
npm run notion:setup -- <notionPageId>  # (re)create the Notion sync database from .env.local
```

Test environment is `node` (not jsdom) by default (`vitest.config.ts`); component tests that need
a DOM add `// @vitest-environment jsdom` at the top of the file. `server-only` is aliased to a
no-op stub in tests (`test/stubs/server-only.ts`) since it throws outside webpack bundling.

### Android build

```bash
npx cap sync android      # after changing capacitor.config.ts or installing a Capacitor plugin
cd android && ./gradlew.bat assembleDebug   # requires JAVA_HOME pointed at a JDK 17-21 (Gradle
                                             # doesn't yet support JDK 25 — Android Studio's bundled
                                             # JBR at "Android Studio/jbr" works)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

`npx tsx scripts/generate-app-icons.tsx` regenerates `resources/icon*.png` from the brand mark
(`src/components/brand/logo-paths.ts`) via `next/og`'s `ImageResponse`; run
`npx capacitor-assets generate --android` afterward to re-derive the mipmap sizes, then rebuild.

## Architecture

### Two databases: Postgres in production, SQLite for local dev

`prisma/schema.prisma`'s datasource is `postgresql` (Neon, provisioned through the Vercel
Marketplace integration on the `lexicon-bookapp` project). Production never runs `prisma migrate`
— there is no `prisma/migrations/` directory. The `vercel-build` script
(`prisma generate && prisma db push --accept-data-loss && next build`) applies the schema with
`db push` on every deploy, which is safe only because this is a demo-scale app with no
production data to lose.

Local `.env`/`.env.local` still point `DATABASE_URL` at `file:./prisma/dev.db` (SQLite) — the
generated Prisma Client's query engine matches whatever `provider` is in schema.prisma at
generate time, so **local dev is currently running a Postgres-generated client against a SQLite
file**, which works for basic CRUD but will not surface Postgres-only behavior differences. If
`prisma migrate dev` complains, that's expected — the migrate workflow was retired in favor of
`db push` when the datasource moved to Postgres; don't try to resurrect `prisma/migrations/`.

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
`visibility === "PUBLIC"` before linking to `/share/[reviewId]` — a PRIVATE review must never
expose a working share link even as a "N more" pointer). `ShareReviewCard`
(`src/components/review/`) is the full, share-page-only render and is a pure presentational
component (no `"use client"`, no hooks).

### One render function produces both the excerpt share card and the OG image

`src/lib/share-card/render.tsx` builds a satori-compatible JSX tree (`buildExcerptCardElement`)
and rasterizes it with `next/og`'s `ImageResponse`. Two callers share it:
`src/app/api/share-card/excerpt/[excerptId]/route.tsx` (PNG the client fetches for the
save/native-share bottom sheet, `ExcerptShareSheet.tsx`) and
`src/app/share/[reviewId]/opengraph-image.tsx` (the link-preview image). Both independently
enforce `visibility === "PUBLIC"` — the OG route falls back to a content-free brand image rather
than 404ing, since Next always calls the special file regardless of the page's own guard.

`next/og` (satori) only supports `ttf`/`otf`/`woff` font embedding, not `woff2` — the UI's
variable Pretendard font (`src/fonts/PretendardVariable.woff2`, loaded via `next/font/local` in
`src/app/layout.tsx`) can't be reused here, so `render.tsx` loads separate static
`Pretendard-{SemiBold,Bold}.otf` files via `fs.readFileSync` with **literal** path strings
(required for Next's output file tracing to bundle them into the serverless function — a
templated/variable filename silently breaks this in production). `next.config.ts`'s
`outputFileTracingIncludes` is a second, explicit safety net for the same reason. Card PNGs set
`Cache-Control: public, max-age=0, s-maxage=300, must-revalidate` to override `ImageResponse`'s
default one-year-immutable cache, since edited excerpts must not keep serving stale images.

### Auth is edge/proxy-safe by construction

`src/lib/auth.config.ts` (Edge-compatible: no Prisma adapter, no bcrypt) vs `src/lib/auth.ts`
(full config with `@auth/prisma-adapter`) are split because `src/proxy.ts` (Next.js 16's
middleware, renamed from `middleware.ts`) runs on the Edge runtime and can't load Prisma. The
`config.matcher` in `proxy.ts` lists which route prefixes require auth
(`/reviews`, `/books/*/review/*`, `/history`); everything else — search, book detail, `/share/*`
— is intentionally login-free.

The Google OAuth client must be a **Web application** type (not Android) even though the app also
ships as an APK — the Capacitor webview runs the same server-side auth flow as a browser. Its
authorized redirect URIs need both `http://localhost:3000/api/auth/callback/google` and the
production callback URL.

### API response caching and quota tracking live in the DB, not memory

`ApiCache` (keyed by `provider` + `cacheKey`, JSON payload, `expiresAt`) and `ApiQuotaUsage`
(per-provider daily counters, KST-day-boundaried) are both Prisma models, not an in-memory or
Redis cache. `getOrSetCache` returns `{ data, stale }`; a stale-but-present cache entry is served
(with `stale: true` surfaced to the UI) rather than blocking on a failed re-fetch.

### Notion sync is bidirectional and property-schema-driven

`src/lib/notion-schema.ts` centralizes the Notion database property names and the
channel/visibility label mappings shared by `scripts/notion-setup.ts` (creates the DB) and
`src/lib/services/notion.ts` (export/import). Exported reviews carry a `LexiconReviewId` rich-text
property used to match existing Notion pages on re-export (idempotent) and to skip
already-synced rows on import. Changing the property schema requires re-running
`npm run notion:setup` and updating `NOTION_DATABASE_ID` — the old database's columns won't match.

### Brand assets are defined once and consumed by both React and satori

`src/components/brand/logo-paths.ts` exports the raw SVG path data for the "p." mark. Both
`Logo.tsx`/`LogoMark.tsx` (real DOM `<svg>`, styled with CSS custom properties like
`var(--color-brand-sage)`) and `share-card/render.tsx`'s `PageLogo` (satori — which cannot
resolve CSS variables, so it takes resolved hex colors as props) import from this one file rather
than duplicating path strings.

### Native error/analytics reporting is Firebase, not a Capacitor plugin

`android/app/google-services.json` + the `com.google.gms.google-services` and
`com.google.firebase.crashlytics` Gradle plugins (`android/build.gradle`,
`android/app/build.gradle`) wire in Firebase Analytics (GA4) and Crashlytics natively. This is
deliberate: Crashlytics only exists for native platforms, and the thing worth catching here is the
**webview process itself crashing**, not in-page JS errors (which never reach native crash
reporting through a Capacitor `server.url` webview). There is no corresponding web-side analytics
SDK — the web app itself doesn't send GA4 events; only the Android shell does.

## Windows-specific gotcha

`DATABASE_URL="file:./prisma/dev.db"` in `.env`/`.env.local` resolves relative to
`prisma/schema.prisma`'s location, not the repo root — so it actually points at
`prisma/prisma/dev.db` (a nested directory), not `prisma/dev.db`. Both paths are gitignored.

Gradle (bundled via `gradlew.bat`) fails with `Unsupported class file major version 69` under the
system JDK if it's newer than what Gradle supports (e.g. JDK 25) — build with
`JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"` (bundled JDK 21) instead of relying on
`java` on PATH.
