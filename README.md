# Golf Course

A show-and-tell site for a golf course, and a practice project for the Adaptive Convergence v2 UI (manual chapter 6). The home page is a placeholder that proves the stack works end to end. The kernel components and real site content don't exist yet.

## Getting started

You need a [Neon](https://neon.com) project and Node.js 22.18+ or 24.11+.

1. Copy `.env.example` to `.env.local` and fill in both connection strings from Neon's Connect dialog.
2. Install, create the tables and add the sample data:

   ```bash
   npm install
   npm run db:deploy
   npm run db:seed
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

## Commands

```bash
npm run dev         # regenerate the contract, then start the dev server
npm run build       # regenerate the contract, then build (needs the database)
npm run lint        # ESLint
npm run schema      # regenerate the Prisma client and the contract
npm run verify      # fail on a stale contract, then typecheck and test
npm run db:migrate  # create and apply a migration after a schema change
npm run db:deploy   # apply committed migrations
npm run db:seed     # add or update the sample data
```

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma 7, Neon PostgreSQL, Zod, TanStack Query, Jotai, Three.js and GSAP.

Styling is Tailwind only, with no component library. CVA, `clsx` and `tailwind-merge` stay because they only compose Tailwind classes.

All Prisma packages are pinned to the same exact version, 7.10.1, because they have to match. npm's `latest` tag for `prisma` currently points at an 8.0 release candidate, so ignore the CLI's update banner until 8.0 is stable.

## Layout

| Path | Holds |
| --- | --- |
| `app/` | Routing and layouts only. The site lives in the `(marketing)` route group. |
| `prisma/` | The schema, migrations and seed data. |
| `backend/` | The database client, the repository and the contract generator. |
| `components/dynamic/` | The contract-driven kernel, including the field registry in `fields/`. |
| `components/layout/` | Layout primitives. |
| `components/three/` | `SceneCanvas`, which runs Three.js scenes. |
| `features/` | One flat folder per model. |
| `lib/generated/schema.ts` | The generated contract. Never edit it by hand. |
| `lib/contract.ts` | The hand-written types the generated contract is checked against. |
| `lib/server-queries.ts` | How Server Components read data. |
| `lib/motion.ts`, `lib/three.ts` | GSAP and Three.js configuration. |
| `store/` | Jotai atoms for per-row and per-cell state. |

## The backend

`prisma/schema.prisma` is the single source of truth, in the role the manual gives to Django models.

| Manual (Django) | Here |
| --- | --- |
| `models.py` | `prisma/schema.prisma` |
| The `Adaptive` class | `///` annotations in the schema (`@adaptive` and `@field`) |
| `manage.py export_schema` | `npm run schema`, through `backend/generate-contract.mts` |
| Migrations | `prisma/migrations/` |
| The dynamic endpoint | `GET /api/<model>` and `GET /api/<model>/<id>` |

Lists accept `sort` (`-` for descending), `q`, `page`, `size` and `f.<field>`, for example `/api/hole?f.par=3&sort=-yards`. Errors come back as `{ code, detail }` with a 400, 404 or 503 status.

The API is read-only. There is no authentication yet, so don't add write routes without it. All 18 holes are invented sample data in `prisma/seed-data.ts`.

**To change the data model:**

1. Edit `prisma/schema.prisma`.
2. Run `npm run db:migrate -- --name describe-the-change`, which also regenerates the contract.
3. Fix whatever the compiler names, then commit the schema, the migration and `lib/generated/schema.ts` together.

`npm run verify` fails if the contract is out of date, and the tests fail if the schema has changed without a migration. Renaming a field produces a compile error everywhere the old name is used.

**Connections:** the app uses Neon's pooled connection (`DATABASE_URL`) through `@prisma/adapter-neon`, and the Prisma CLI uses the direct one (`DATABASE_URL_UNPOOLED`).

**Caching:** Server Components read through `getModelPage`, which caches results for up to an hour, so a change made directly in the database can take that long to appear. `next build` runs these queries to prerender pages, so it needs `DATABASE_URL` and a reachable database.

**Tests** need no database. They run the committed migrations against a real Postgres in memory (PGlite).

## Three.js and GSAP

**GSAP:** import from `lib/motion.ts`, not from `gsap` directly, and use `useGSAP` in components. Put decorative tweens inside `gsap.matchMedia().add(MOTION_OK, ...)` so reduced-motion users see the finished state. ScrollTrigger lives in `lib/motion-scroll.ts`, so only routes that use it pay for it.

**Three.js:** a scene is a module that imports from `three` and default-exports a `SceneSetup`. Render it with `<SceneCanvas load={loadScene} label="..." />`, where `loadScene` is a module-level `() => import("./myScene")`. `SceneCanvas` and `lib/three.ts` handle lazy loading, container-based sizing, rendering on GSAP's ticker, pausing off-screen, teardown and the no-WebGL fallback. See `features/hole/CoursePreview.tsx` and `coursePreviewScene.ts`.

## Bundle size

First-load JavaScript on `/` is 160 KB gzipped: 133 KB for Next.js, React and the page, plus 27 KB for GSAP. Three.js adds 131 KB, loaded after the page is interactive. The manual's 140 KB budget is written for console routes, and GSAP puts this route 20 KB over it.

## Where this departs from manual section 6.3

| Manual | Here | Why |
| --- | --- | --- |
| Django backend | TypeScript, Prisma and Neon | The project's chosen stack. |
| `frontend/` beside `backend/` | `prisma/` and `backend/` inside the project root | The backend ships with the app. |
| Backend commit in the generated header | Left out | It would make `verify` fail after every commit. |
| shadcn/ui primitives in `components/ui/` | None | Tailwind only, so controls are built on native elements or by hand. |
| `(console)/[org]/[model]` routes | Not created | This is a public site with no tenants. |
| `unstable_cache` in `server-queries.ts` | `"use cache"` with `cacheLife` and `cacheTag` | The current Next.js equivalent. |
| `API_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_WS_URL` | `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `NEXT_PUBLIC_APP_NAME` | Nothing uses the others, and required variables would fail the build. |
| Bare HSL channel tokens | Complete `oklch()` values | Tailwind v4 applies opacity with `color-mix()`, so `bg-primary/10` works on complete colours. |
| Dark tokens only under `prefers-color-scheme` | One `@variant dark` block | The manual's `[data-theme="dark"]` rule is empty, so pinning dark would not work. |

## Manual code that no longer matches the installed versions

- **Jotai 3 has no `atomFamily`.** The manual imports it from `jotai/utils` (sections 3.2 and 6.8), which will not compile. The separate `jotai-family` package supports Jotai 3 and is the place to look when `store/atoms.ts` gets written.
- **Next.js 14 samples.** This project is on 16.4 with `cacheComponents` on, so check `node_modules/next/dist/docs/` before copying the manual's data-fetching samples.
- **Tailwind v3 syntax.** `rounded-[--radius]` is written `rounded-(--radius)` in v4.
- **Zod 3 syntax.** `z.string().email()` and similar are deprecated in Zod 4. The generator emits `z.email()`, `z.url()`, `z.iso.date()` and `z.iso.datetime()`.

## Troubleshooting

- **`npm run typecheck` reports a missing route under `.next/dev/types`** after you delete a route: delete `.next` and run it again.
- **`npm run schema` says `spawn node backend/generate-contract.mts ENOENT` on Windows:** that message means the generator crashed before it could report an error. Run `node backend/generate-contract.mts` directly to see the real one.
