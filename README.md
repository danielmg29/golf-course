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

## Pages

| Route | What's on it | Roadmap features |
| --- | --- | --- |
| `/` | The blueprint's eight chapters: the ball's drive from the hero, the land, the full-screen 3D course, the club's day, people, stays, booking, contact | 3D virtual drone map |
| `/about` | The club's story, a heritage timeline that runs on to Membership, what it looks after, who you'll meet | |
| `/course` | 3D course map, a 2D plan of all eighteen routes linked to the scorecard, notes. The only page that reads the database, along with the figures on `/` | 3D virtual drone map |
| `/amenities` | A grounds map branching from the clubhouse to every facility, day passes, bay booking | Guest day passes, simulator and Toptracer booking |
| `/events` | The calendar as a timeline, live leaderboard, golf day builder | Live leaderboards, corporate event builder |
| `/membership` | Tiers beside a connection network, business directory, four-balls, application with a progress line | Member directory, find a four-ball |
| `/stay-and-play` | Sample trips, a week as a route, and a trip builder | Stay & Play packager |
| `/book` | Tee sheet with a progress line and M-Pesa checkout | Tee time engine, M-Pesa |
| `/contact` | Who to talk to (five channels converging on the club mark), quick answers, hours, address | WhatsApp (also the floating "Ask the caddie" button) |

The tools are demonstrations that run in the browser on sample data. Nothing is booked, charged, sent or stored, and each one says so on screen. Only the holes come from the database. To make a tool real, give it a model in `prisma/schema.prisma` and connect its provider, such as Daraja for M-Pesa.

**Still placeholder:** the club's name (set `NEXT_PUBLIC_APP_NAME`), address and WhatsApp number (`lib/site.ts`), every photo (`lib/photos.ts`, stock from Unsplash), and all prices, people, scores and dates (`features/*/data.ts` and the tools themselves).

**Brand:** every page follows the owner's blueprint, "Beyond the 18th" (see below). The colours, type sizes and text styles are in `app/globals.css`. The older token names (`reserve`, `alabaster`, `gold`, `charcoal`) now carry the blueprint's values, so the tools written for them follow along. On light bands, `.band-light` and `.band-paper` re-ink those names for ivory and off-white, and `Section` takes a `tone`.

**Around every page:**
- **The header** (`components/layout/SiteHeader.tsx`): on wide screens, a 72px "flagstick rail" down the left edge, with the page's progress as the fairway line, a ball riding it, and the current section's name (anything marked `data-running-head`). A top bar holds the wordmark, the main pages, Apply and Book. The menu is a full-screen sheet with every page, today's hours and quick bookings. Because of the rail, `frame` keeps a 112px left margin on wide screens.
- **The footer** (`SiteFooter.tsx`): the day's last line and its actions, a club notes sign-up (a demo), four columns, and the club's name set across the full width.
- **Header tone** (`lib/use-ground-tone.ts`): the header and floating buttons turn dark over light bands, and the floating buttons step aside over `data-floating="hide"` and the footer.
- **The loading putt** (`components/feedback/Loader.tsx`, `puttScene.ts`): on a visit's first page only, with motion allowed, a ball is putted towards you through the grass while the page loads and drops into the cup as it finishes. It is capped near two seconds and can be skipped. A script in `<head>` decides before the first paint, and CSS takes it down after about three seconds if nothing else does.
- **Error pages** (`app/not-found.tsx`, `app/error.tsx`, `app/(marketing)/error.tsx`, `app/global-error.tsx`): "Lipped out" for 404, "That one found the water" for errors, and "Play is suspended" when the root layout fails. They are animated in SVG with no script, and show a still frame with reduced motion.

## Layout

| Path | Holds |
| --- | --- |
| `app/` | Routing and layouts only. The site lives in the `(marketing)` route group. |
| `prisma/` | The schema, migrations and seed data. |
| `backend/` | The database client, the repository and the contract generator. |
| `components/dynamic/` | The contract-driven kernel, including the field registry in `fields/`. |
| `components/layout/` | The site shell and page patterns: header and menu, footer, floating actions, `Page`, `PageHero`, `Editorial`. |
| `components/ui/` | Small shared pieces: icons, `Photo`, `SectionRule` (the fairway line over a section; its name feeds the rail), `Section`, `ProgressLine`, `Wordmark`, `Crest`, `MpesaCheckout`. |
| `components/feedback/` | The loading putt and the error pages. |
| `components/three/` | `SceneCanvas`, which runs a self-contained Three.js scene (the course map). |
| `components/world/`, `lib/world/` | The world: the site's one shared WebGL canvas, and the acts pages show in it. |
| `features/` | One flat folder per model or tool. |
| `lib/site.ts`, `lib/photos.ts` | The club's details and page list, and every photo on the site. |
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

**GSAP:** import from `lib/motion.ts`, not from `gsap` directly, and use `useGSAP` in components. Put decorative tweens inside `gsap.matchMedia().add(MOTION_OK, ...)` so reduced-motion users see the finished state. ScrollTrigger lives in `lib/motion-scroll.ts`.

For scroll reveals, put `data-lines`, `data-fade`, `data-clip`, `data-zoom` or `data-parallax` on an element and `components/layout/Page.tsx` does the rest, so sections can stay Server Components. Don't use them inside `<Suspense>`, because changing streamed HTML before React hydrates it causes a hydration mismatch. Don't use `once: true` on a ScrollTrigger either: when a page loads part-way down, it crashes GSAP (see the comment in `Page.tsx`).

**Three.js:** a scene is a module that imports from `three` and default-exports a `SceneSetup`. Render it with `<SceneCanvas load={loadScene} label="..." />`, where `loadScene` is a module-level `() => import("./myScene")`. `SceneCanvas` and `lib/three.ts` handle lazy loading, container-based sizing, rendering on GSAP's ticker, pausing off-screen, teardown and the no-WebGL fallback. See `features/hole/CourseExplorer.tsx` and `courseMapScene.ts`.

**The world:** the homepage's 3D story runs in one WebGL canvas that `components/world/World.tsx` keeps fixed behind every page. It lives in `app/(marketing)/layout.tsx`, so it survives client navigation. The plan it is building towards is `docs/next-move-roadmap.md`.

- **Showing an act.** Wrap the section that owns it in `<WorldAct id="story">`. The act is claimed while the page is on screen and released when Next hides the page. The world fades out as that section scrolls away.
- **Writing an act.** An act is a module in `features/` that default-exports an `Act` (see `lib/world/runtime.ts`). It adds its objects to the shared scene, returns `update`, `resize` and `dispose`, and must free everything it allocated in `dispose` (use `disposeObject`), because the renderer outlives it. Add its loader to the `acts` map in `World.tsx`.
- **Pages never import Three.js.** They write plain values into `world` in `lib/world/store.ts`, and the render loop reads them.
- **Tiers** (`lib/world/tier.ts`). Desktops get `high`. Phones and devices with 4 GB of memory or less get `mid`, which has a lower pixel ratio and fewer lines. Reduced motion, data saver and devices with 2 GB of memory or less get `poster`, meaning no WebGL. A device that runs below 25 fps steps down one tier once.
- **Posters.** Anything marked `data-world-poster` is shown until the world draws its first frame, then fades out. On the `poster` tier it is all the visitor sees, so it must stand on its own.
- **Rendering.** Nothing is drawn on pages without an act, or once the act's section has scrolled away. Three.js downloads only after a page claims the world and the browser is idle.

**The homepage** follows the owner's design blueprint, "Beyond the 18th: The Course Is a Story You Enter", set in a Swiss-style layout. The rules of the build are in `.impeccable/surfaces/app-marketing-page-tsx.md`.

- **Chapters.** There are eight, in `features/home/Chapters.tsx`, from "01 — The invitation" to "08 — The day continues". Dark forest scenes alternate with calm ivory ones.
- **The grid and tokens** are the blueprint's, in `globals.css`:
  - `grid-swiss` (12/6/4 columns with 24/20/16px gutters) and `frame` (20 to 64px margins);
  - `frame-rail` for full-bleed strips;
  - `type-meta` for labels;
  - the colours `forest`, `club`, `antique`, `ivory`, `coal`, `sage`, `paper` and `stone`;
  - the type scale `text-display-xl`, `text-display-lg`, `text-h1`, `text-h2`, `text-h3` and `text-lead`.
- **Type.** Cormorant Garamond for display, Manrope (`font-ui`) for everything functional.
- **The fairway line** is the one gold motif:
  - In the hero there is no drawn line: a photoreal 3D ball sits on its tee and is driven along the line's path as you scroll (`BallFlight.tsx`, `flightAct.ts`). It drops into chapter 02's photograph, lands on the horizon line and rolls off the picture's end, its shadow and colour matched to each photograph.
  - It is each chapter's rule; its gold length is the story's progress, an eighth per chapter.
  - It follows the horizon in 02 and threads the day in 04.
  - It branches in 05, becomes a route in 06 and a stepper in 07.
  - It resolves into the club mark in 08.
- **Motion** is `features/home/HomeMotion.tsx`, the page's `<main>`. It reads `data-hero-image`, `data-draw`, `data-rule`, `data-rise` and `data-mask`, with durations from `lib/motion-tokens.ts`. The hero's text animates in CSS, so it shows before any script runs. Don't use these attributes inside `<Suspense>`.
- **Chapter 04's strip** (`DayStrip.tsx`) is the page's one horizontal story. It pins and scrolls sideways on desktop, and is a swipe rail on phones and with reduced motion. Arrows, a progress bar and the keyboard all move it.
- **Chapter 03 is the one 3D moment** (`CourseStage.tsx`): the course fills the screen and holds while you scroll. The same ball drops onto hole 1's green and rolls up by the pin; then the camera rises to the whole course, and it becomes the hole explorer. The scene (`features/hole/courseMapScene.ts`) is photoreal but cheap: one ground mesh shaded from painted distance masks and a small tiling noise texture, a sky, instanced trees and flags, and it draws only when something moves (`lib/three.ts`). `SceneCanvas` loads Three.js only when the canvas comes within a screen of view.
- **Copy** beyond the blueprint's own lines is a draft for the owner to approve. Samples are labelled as samples.

Two earlier homepages are no longer rendered: the Continuous Putt Journey (`features/journey/`) and "The architecture of the next move" (`features/story/`). Their code is still in the repo. The world canvas they used (`components/world/`) stays mounted but idle.

## Bundle size

First-load JavaScript is 205 to 209 KB gzipped per page, of which about 50 KB is GSAP with ScrollTrigger and SplitText. The world's shell adds about 1 KB to every page. Three.js (about 131 KB) loads on a visit's first page for the loading putt, and otherwise only on `/course` and the homepage, after the page is interactive (on the homepage, only when the browser is idle and the device isn't on the `poster` tier). The manual's 140 KB budget is written for console routes, and this site is 67 KB over it, mostly because of the motion libraries.

Don't import `lib/env.ts` from a client component. It brings in Zod, which adds about 30 KB to every page.

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
