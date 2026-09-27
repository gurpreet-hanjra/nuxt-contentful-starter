# Nuxt + Contentful Starter

A small headless CMS site: editors compose pages from blocks in Contentful, and Nuxt renders them with hybrid rendering (a prerendered home page, cached SSR for blog pages).

**Stack:** Nuxt 4, Vue 3 (Composition API, `<script setup>`), TypeScript, Contentful Delivery/Preview API, Nitro server routes.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000 (uses mock content, no keys needed)
npm run typecheck
npm run build && node .output/server/index.mjs
```

### Connect Contentful

1. Create a free space at contentful.com.
2. Create the content model:
   ```bash
   npx contentful-cli login
   npx contentful-cli space migration --space-id <SPACE_ID> scripts/content-model.cjs
   ```
3. In Contentful, create a `page` with slug `home` and add a few Hero, Feature grid and Teaser entries to its blocks.
4. Copy `.env.example` to `.env` and add the Space ID, Delivery token and Preview token (Settings → API keys).
5. Drafts: open `/?preview=<NUXT_PREVIEW_SECRET>`.

## Architecture

```
Contentful ──(Delivery / Preview API)──► server/api/pages/[...slug]   (tokens stay server-side)
                                              │  mapPage(): raw entry → normalised Page
                                              ▼
app/pages/[...slug].vue ── usePage() / useFetch ──► BlockRenderer ──► HeroBlock | FeatureGridBlock | TeaserBlock
```

| Decision | Why |
|---|---|
| Fetch through a Nitro server route, not directly from the browser | CMS tokens are never shipped to the client. It's also one place to cache and handle errors. |
| Normalise entries in `mapBlock` / `mapPage` | Components depend on `shared/types/content.ts`, not on Contentful's shape. Switching to Storyblok means rewriting only the mapper. |
| Block registry typed as `Record<Block['type'], Component>` | TypeScript fails the build if a new CMS block type has no component. |
| `routeRules`: `/` prerendered, `/blog/**` with `swr: 3600` | Hybrid rendering per route, like ISR in Next.js. |
| `include: 3` in `getEntries` | Resolves linked blocks and their children in one request (no N+1). |
| Preview through a secret query parameter plus `Cache-Control: no-store` | Editors can see drafts, and drafts are never cached. |
| `server/api/revalidate.post.ts` | Target for a Contentful publish webhook, for purging a CDN or triggering a rebuild. |

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
| `generateMetadata` | `useSeoMeta()` |
| API routes | `server/api/*` (Nitro) |
| JSX | SFC templates: `v-if`, `v-for` + `:key`, `:prop`, `@event`, slots instead of `children` |

## Next steps (do these yourself or with Claude Code)

- [ ] Connect your own Contentful space and deploy to Vercel (set the env vars there).
- [ ] Add Storybook: `npx storybook@latest init`, then write a story for `HeroBlock`.
- [ ] Add a new block type yourself, for example `quote`: migration → type → mapper → component → registry.
- [ ] Use Contentful's image API for responsive `srcset` in `HeroBlock`.
- [ ] Add a unit test for `mapBlock` with Vitest.

## Interview talking points

- **Why headless?** Content and presentation are separate, so editors ship content without a deploy, and the same content can feed web and app.
- **Rendering strategy:** decided per route with `routeRules`. Pages that are marketing-static get prerendered, and frequently edited content uses SWR caching.
- **Security:** tokens stay server-side, preview is protected by a secret, and drafts are never cached.
- **Performance:** one CMS request per page (`include`), a small JS payload, no hydration refetch, and WebP images from Contentful's image API.
- **Scaling the team:** a typed block registry and normalised types let people add blocks independently, and the CMS vendor stays swappable.
