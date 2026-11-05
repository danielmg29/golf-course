# Golf Course

A show-and-tell site for a golf course, and a practice project for the Adaptive Convergence v2 UI (manual chapter 6). The home page is a placeholder that proves the stack works end to end. The kernel components and real site content don't exist yet.

## Commands

```bash
npm run dev      # regenerate the contract, then start the dev server
npm run build    # regenerate the contract, then build for production
npm run lint     # ESLint
npm run schema   # regenerate the contract from the JSON models
npm run verify   # fail on a stale contract, then typecheck and test
```

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Zod, TanStack Query, Jotai, Three.js and GSAP.

Styling is Tailwind only, with no component library. CVA, `clsx` and `tailwind-merge` stay because they only compose Tailwind classes.

## Layout

| Path | Holds |
| --- | --- |
| `app/` | Routing and layouts only. The site lives in the `(marketing)` route group. |
| `backend/` | The simulated backend: JSON models, JSON rows and the contract generator. |
| `components/dynamic/` | The contract-driven kernel, including the field registry in `fields/`. |
| `components/layout/` | Layout primitives. |
| `components/three/` | `SceneCanvas`, which runs Three.js scenes. |
| `features/` | One flat folder per model. |
| `lib/generated/schema.ts` | The generated contract. Never edit it by hand. |
| `lib/contract.ts` | The hand-written types the generated contract is checked against. |
| `lib/server-queries.ts` | How Server Components read data. |
| `lib/motion.ts`, `lib/three.ts` | GSAP and Three.js configuration. |
| `store/` | Jotai atoms for per-row and per-cell state. |

## The simulated backend

JSON stands in for Django, using the same field classes and option names so the two stay easy to compare.

| Django | Here |
| --- | --- |
| `models.py` and the `Adaptive` class | `backend/models/<model>.json` |
| Database tables | `backend/fixtures/<model>.json` |
| `manage.py export_schema` | `npm run schema` |
| The dynamic endpoint | `GET /api/<model>` and `GET /api/<model>/<id>` |

Lists accept `sort` (`-` for descending), `q`, `page`, `size` and `f.<field>`, for example `/api/hole?f.par=3&sort=-yards`. Errors come back as `{ code, detail }` with a 400 or 404 status.

It's read-only for now. There is no write path. All 18 holes are invented sample data.

**To add a model:**

1. Add `backend/models/<model>.json` and `backend/fixtures/<model>.json`, with the same file name.
2. Run `npm run schema`.
3. Commit the JSON together with the regenerated `lib/generated/schema.ts` and `backend/tables.generated.ts`.

`npm run verify` fails if the generated files are out of date, and a fixture row that breaks the contract fails the tests and the build. Renaming a field produces a compile error everywhere the old name is used.

Server Components read through `getModelPage` in `lib/server-queries.ts`. It's the only frontend file that knows the backend runs in-process, so pointing it at a real API later changes nothing above it.

## Three.js and GSAP

**GSAP:** import from `lib/motion.ts`, not from `gsap` directly, and use `useGSAP` in components. Put decorative tweens inside `gsap.matchMedia().add(MOTION_OK, ...)` so reduced-motion users see the finished state. ScrollTrigger lives in `lib/motion-scroll.ts`, so only routes that use it pay for it.

**Three.js:** a scene is a module that imports from `three` and default-exports a `SceneSetup`. Render it with `<SceneCanvas load={loadScene} label="..." />`, where `loadScene` is a module-level `() => import("./myScene")`. `SceneCanvas` and `lib/three.ts` handle lazy loading, container-based sizing, rendering on GSAP's ticker, pausing off-screen, teardown and the no-WebGL fallback. See `features/hole/CoursePreview.tsx` and `coursePreviewScene.ts`.

## Bundle size

First-load JavaScript on `/` is 160 KB gzipped: 133 KB for Next.js, React and the page, plus 27 KB for GSAP. Three.js adds 131 KB, loaded after the page is interactive. The manual's 140 KB budget is written for console routes, and GSAP puts this route 20 KB over it.

## Where this departs from manual section 6.3

| Manual | Here | Why |
| --- | --- | --- |
| Django backend | JSON in `backend/` | There is no real backend in this project. |
| `frontend/` beside `backend/` | `backend/` inside the project root | The simulated backend ships with the app. |
| Backend commit in the generated header | Left out | It would make `verify` fail after every commit. |
| shadcn/ui primitives in `components/ui/` | None | Tailwind only, so controls are built on native elements or by hand. |
| `(console)/[org]/[model]` routes | Not created | This is a public site with no tenants. |
| `unstable_cache` in `server-queries.ts` | No caching | The JSON is already in memory. Revisit with a real API. |
| `API_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_WS_URL` | Only `NEXT_PUBLIC_APP_NAME` | Nothing uses the others, and required variables would fail the build. |
| Bare HSL channel tokens | Complete `oklch()` values | Tailwind v4 applies opacity with `color-mix()`, so `bg-primary/10` works on complete colours. |
| Dark tokens only under `prefers-color-scheme` | One `@variant dark` block | The manual's `[data-theme="dark"]` rule is empty, so pinning dark would not work. |

## Manual code that no longer matches the installed versions

- **Jotai 3 has no `atomFamily`.** The manual imports it from `jotai/utils` (sections 3.2 and 6.8), which will not compile. The separate `jotai-family` package supports Jotai 3 and is the place to look when `store/atoms.ts` gets written.
- **Next.js 14 samples.** This project is on 16.4 with `cacheComponents` on, so check `node_modules/next/dist/docs/` before copying the manual's data-fetching samples.
- **Tailwind v3 syntax.** `rounded-[--radius]` is written `rounded-(--radius)` in v4.
- **Zod 3 syntax.** `z.string().email()` and similar are deprecated in Zod 4. The generator emits `z.email()`, `z.url()`, `z.iso.date()` and `z.iso.datetime()`.

## Troubleshooting

If `npm run typecheck` reports a missing route under `.next/dev/types` after you delete a route, delete `.next` and run it again.
