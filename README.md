# Nuxt + Contentful Starter

[![CI](https://github.com/gurpreet-hanjra/nuxt-contentful-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/gurpreet-hanjra/nuxt-contentful-starter/actions/workflows/ci.yml)

**Live:** https://nuxt-contentful-starter-delta.vercel.app · Lighthouse mobile performance **98**

A small headless CMS site: editors compose pages from blocks in Contentful, and Nuxt renders them with hybrid rendering (a prerendered home page, cached SSR for blog pages) plus a secure draft preview.

**Stack:** Nuxt 4, Vue 3 (Composition API, `<script setup>`), TypeScript, Contentful Delivery/Preview API, Nitro server routes, Vitest, Vercel.

![Home page rendered from Contentful](docs/screenshot.jpg)

## Run it

```bash
npm install
npm run dev          # http://localhost:3000 (uses mock content, no keys needed)
npm run typecheck
npm test
npm run build && node .output/server/index.mjs
```

| Script | What it does |
|---|---|
| `npm test` | Vitest: mapper unit tests (Node) and component tests (Nuxt runtime + happy-dom) |
| `npm run cms:migrate -- <file>` | Runs a Contentful migration against the space in `.env` |
| `npm run cms:seed` | Creates and publishes the demo pages (idempotent) |
| `npm run cms:webhook -- <url>` | Creates or updates the publish/unpublish webhook to `<url>/api/revalidate` |

### Connect Contentful

1. Create a free space at contentful.com.
2. Copy `.env.example` to `.env` and add the Space ID, Delivery token and Preview token (Settings → API keys), a CMA token (Settings → CMA tokens) and a random `NUXT_PREVIEW_SECRET`.
3. Create the content model and seed demo content:
   ```bash
   npm run cms:migrate -- scripts/content-model.cjs
   npm run cms:migrate -- scripts/add-quote.cjs
   npm run cms:seed     # idempotent: safe to re-run
   ```
   The seed publishes a `home` page and a `blog/hello-world` page, and leaves one **unpublished draft** on the home hero headline.
4. Drafts: open `/?preview=<NUXT_PREVIEW_SECRET>` to see the draft headline and the preview banner.

> In dev, `/blog/**` is cached by the `swr` route rule in `.nuxt/cache/nitro`. After changing content, delete that folder (or wait an hour) to see it.

### Deploy to Vercel

1. `npx vercel link`, then add `NUXT_CONTENTFUL_SPACE_ID`, `NUXT_CONTENTFUL_DELIVERY_TOKEN`, `NUXT_CONTENTFUL_PREVIEW_TOKEN`, `NUXT_CONTENTFUL_ENVIRONMENT` and `NUXT_PREVIEW_SECRET` for Production and Preview (`vercel env add <NAME> production,preview`). The CMA token stays local.
2. `npx vercel deploy --prod`. Nitro detects Vercel: `/` becomes a static file and `/blog/**` an ISR function.
3. `npm run cms:webhook -- https://<your-domain>` so Contentful calls `/api/revalidate` on publish.

## Architecture

```
Contentful ──(Delivery / Preview API)──► server/api/pages/[...slug]   (tokens stay server-side)
                                              │  mapPage(): raw entry → normalised Page
                                              ▼
app/pages/[...slug].vue ── usePage() / useFetch ──► BlockRenderer ──► HeroBlock | FeatureGridBlock | TeaserBlock | QuoteBlock
```

| Decision | Why |
|---|---|
| Fetch through a Nitro server route, not directly from the browser | CMS tokens are never shipped to the client. It's also one place to cache and handle errors. |
| Normalise entries in `mapBlock` / `mapPage` | Components depend on `shared/types/content.ts`, not on Contentful's shape. Switching to Storyblok means rewriting only the mapper. Unknown types and unresolved links (an unpublished block on a published page) are dropped instead of crashing the page. |
| Block registry typed as `Record<Block['type'], Component>` | TypeScript fails the build if a new CMS block type has no component. The component test's fixtures use the same trick, so a new block also needs a test. |
| `routeRules`: `/` prerendered, `/blog/**` with `swr: 3600` | Hybrid rendering per route, like ISR in Next.js. On Vercel, Nitro turns these into a static file and an ISR function. |
| `include: 3` in `getEntries` | Resolves linked blocks and their children in one request (no N+1). |
| Drafts fetched only in the browser, after mount, with a secret | Server-rendered, prerendered and CDN-cached HTML is always the published page, so no cache can ever hold a draft. The API marks real preview responses with `X-Preview: 1` and `Cache-Control: no-store`; that header drives the banner, so the app never needs the secret. |
| Hero `srcset` from Contentful's Images API, with `width`/`height` from the asset | The browser downloads one right-sized WebP, and space is reserved before it loads (CLS 0). `fetchpriority="high"` because the hero is the LCP element. |
| `server/api/revalidate.post.ts` + Contentful webhook | Called on publish/unpublish with a secret header. It logs today; the next step is purging the Vercel cache or triggering a redeploy. |

## Coming from React / Next.js

| Next.js / React | Nuxt / Vue |
|---|---|
| `app/[[...slug]]/page.tsx` | `app/pages/[...slug].vue` |
| `fetch` in a Server Component / `getServerSideProps` | `useFetch` / `useAsyncData` (runs on the server, sent to the client in the payload, no refetch on hydration) |
| `useState` | `ref()` (primitives) / `reactive()` (objects) |
| `useMemo` | `computed()`, with automatic dependency tracking and no dependency array |
| `useEffect` | `watch` / `watchEffect` / `onMounted` |
| Context / Zustand | `useState()` (Nuxt's SSR-safe shared state) or Pinia |
| `revalidate` / ISR | `routeRules: { swr / isr / prerender }` |
| Draft Mode (`draftMode()`) | Secret query param → Preview API, fetched client-side |
| `next/image` `sizes` / `priority` | Hand-written `srcset` + `sizes` + `fetchpriority="high"` |
| `generateMetadata` | `useSeoMeta()` |
| API routes | `server/api/*` (Nitro) |
| JSX | SFC templates: `v-if`, `v-for` + `:key`, `:prop`, `@event`, slots instead of `children` |
| CSS Modules | `<style scoped>` |
| React Testing Library `render()` | `mountSuspended()` from `@nuxt/test-utils` |

## What I built & learned coming from React

<!-- DRAFT: rewrite these in your own words before sharing. -->

- **Reactivity without dependency arrays.** `setup` runs once, not on every render. `computed` and `watch` track what they read, so there's no `useMemo`/`useEffect` dependency list to get wrong. The trade-off is remembering `.value` in script and knowing when something is reactive.
- **Data fetching that survives hydration.** `useFetch` runs on the server and ships its result in the payload, so the client doesn't fetch again. Keys matter: they're how Nuxt matches server data to the client.
- **Caching is a design decision, not a flag.** `routeRules` picks prerender or SWR per route, and Nitro maps that to Vercel's CDN. Preview mode taught me why: a draft rendered on the server can end up in a shared cache, so drafts are fetched in the browser only, and a prerendered page hydrates with its payload path before the real URL (query included) is available.
- **Types as guardrails for a CMS.** A typed block registry and mapped-type test fixtures mean a new block type can't ship without a component, a mapper case and a test. The mapper keeps Contentful's shape out of components, and the tests caught a real crash on unresolved links.
- **Single-file components.** Templates with `v-if`/`v-for`, `defineProps` for typed props and scoped styles felt familiar quickly; slots map to `children`, and `provide`/`inject` to context.
- **What leaves your machine.** Deploying surfaced a private registry in the lockfile, a work email in commits and a `.env` the Vercel CLI would have uploaded. Worth checking before the first push.

## Next steps

- [x] Connect Contentful: content model as code (`cms:migrate`) and an idempotent seed (`cms:seed`)
- [x] Deploy to Vercel with preview mode and a publish/unpublish webhook
- [x] Add a Quote block end to end: migration → type → mapper → component → registry
- [x] Responsive hero `srcset` from Contentful's Images API (Lighthouse mobile 84 → 93 locally, 98 live)
- [x] Vitest unit tests for the mappers and a component test for `BlockRenderer`
- [x] GitHub Actions: typecheck, test and build on every push
- [ ] Storybook stories for `HeroBlock`, `FeatureGridBlock` and `QuoteBlock` (skipped for time)
- [ ] Make `/api/revalidate` purge the Vercel cache or trigger a redeploy, instead of only logging
- [ ] Add an ~800w step to the hero `srcset` (mobile at 1.75× needs ~665px)
- [ ] Typecheck `test/unit/**` in CI (Nuxt's typecheck only covers `test/nuxt/**`)
- [ ] Connect the GitHub repo in Vercel for deploy-on-push

## Interview talking points

- **Why headless?** Content and presentation are separate, so editors ship content without a deploy, and the same content can feed web and app.
- **Rendering strategy:** decided per route with `routeRules`. Pages that are marketing-static get prerendered, and frequently edited content uses SWR caching.
- **Security:** tokens stay server-side, preview is protected by a secret, drafts are never server-rendered or cached, and the public default secret never unlocks drafts.
- **Performance:** one CMS request per page (`include`), a small JS payload, no hydration refetch, and right-sized WebP images from Contentful's Images API. Lighthouse mobile 98 on the live site.
- **Scaling the team:** a typed block registry and normalised types let people add blocks independently, and the CMS vendor stays swappable.
