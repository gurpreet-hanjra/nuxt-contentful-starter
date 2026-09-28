// Seeds the Contentful space with demo pages, using the Content Management API (CMA).
// Run after scripts/content-model.cjs:  npm run cms:seed
//
// Idempotent: every entry has a fixed ID and is created-or-updated, so you can re-run it.
// The CMA token is only read here, never by the Nuxt app.
import { createClient } from 'contentful-management'
import type { AssetProps, EntryProps, KeyValueMap } from 'contentful-management'

const { CONTENTFUL_MANAGEMENT_TOKEN, NUXT_CONTENTFUL_SPACE_ID, NUXT_CONTENTFUL_ENVIRONMENT } = process.env
if (!CONTENTFUL_MANAGEMENT_TOKEN || !NUXT_CONTENTFUL_SPACE_ID) {
  console.error('Missing CONTENTFUL_MANAGEMENT_TOKEN or NUXT_CONTENTFUL_SPACE_ID (see .env.example).')
  process.exit(1)
}

const LOCALE = 'en-US'
const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=2000&fm=jpg&q=80'

const client = createClient(
  { accessToken: CONTENTFUL_MANAGEMENT_TOKEN },
  { type: 'plain', defaults: { spaceId: NUXT_CONTENTFUL_SPACE_ID, environmentId: NUXT_CONTENTFUL_ENVIRONMENT || 'master' } },
)

// CMA fields are keyed by locale: { headline: { 'en-US': '...' } }
function localize(fields: Record<string, unknown>): KeyValueMap {
  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined).map(([k, v]) => [k, { [LOCALE]: v }]),
  )
}

// CMA errors carry the HTTP status as JSON inside `message`.
function isNotFound(e: any): boolean {
  if (e?.name === 'NotFound') return true
  try { return JSON.parse(e?.message).status === 404 } catch { return false }
}

const link = (id: string, linkType: 'Entry' | 'Asset' = 'Entry') => ({ sys: { type: 'Link', linkType, id } })

async function upsertEntry(id: string, contentType: string, fields: Record<string, unknown>, publish = true): Promise<EntryProps> {
  let entry: EntryProps
  try {
    const existing = await client.entry.get({ entryId: id })
    entry = await client.entry.update({ entryId: id }, { ...existing, fields: localize(fields) })
  } catch (e: any) {
    if (!isNotFound(e)) throw e
    entry = await client.entry.createWithId({ entryId: id, contentTypeId: contentType }, { fields: localize(fields) })
  }
  if (publish) entry = await client.entry.publish({ entryId: id }, entry)
  console.log(`  ${publish ? 'published' : 'draft    '} ${contentType.padEnd(12)} ${id}`)
  return entry
}

async function upsertHeroImage(id: string): Promise<AssetProps> {
  try {
    const existing = await client.asset.get({ assetId: id })
    if (existing.fields.file?.[LOCALE]?.url) {
      console.log(`  exists    asset        ${id}`)
      return existing.sys.publishedVersion ? existing : client.asset.publish({ assetId: id }, existing)
    }
  } catch (e: any) {
    if (!isNotFound(e)) throw e
  }

  // Download first (follows redirects), then upload the bytes to Contentful.
  const res = await fetch(HERO_IMAGE_URL)
  if (!res.ok) throw new Error(`Image download failed: ${res.status}`)
  const upload = await client.upload.create({}, { file: await res.arrayBuffer() })

  const draft = await client.asset.createWithId({ assetId: id }, {
    fields: {
      title: { [LOCALE]: 'Hero image' },
      description: { [LOCALE]: 'Solar panels in sunlight' },
      file: {
        [LOCALE]: {
          contentType: 'image/jpeg',
          fileName: 'hero.jpg',
          uploadFrom: { sys: { type: 'Link', linkType: 'Upload', id: upload.sys.id } },
        },
      },
    },
  } as any)
  const processed = await client.asset.processForAllLocales({}, draft)
  const asset = await client.asset.publish({ assetId: id }, processed)
  console.log(`  published asset        ${id}`)
  return asset
}

async function main() {
  console.log(`Seeding space ${NUXT_CONTENTFUL_SPACE_ID}`)

  await upsertHeroImage('heroImageHome')

  // --- Home page -----------------------------------------------------------
  const homeHero = {
    headline: 'Energy that fits your life',
    subline: 'A headless CMS demo built with Nuxt and Contentful.',
    ctaLabel: 'Read the blog',
    ctaHref: '/blog/hello-world',
    image: link('heroImageHome', 'Asset'),
  }
  await upsertEntry('heroHome', 'hero', homeHero)

  await upsertEntry('featureEditors', 'feature', { title: 'Editors own content', text: 'Pages are composed from blocks in the CMS, no deploy needed.' })
  await upsertEntry('featureFast', 'feature', { title: 'Fast by default', text: 'Prerendered home, cached SSR for blog pages.' })
  await upsertEntry('featureAgnostic', 'feature', { title: 'CMS-agnostic UI', text: 'Components receive normalised data, not raw CMS entries.' })
  await upsertEntry('featureGridHome', 'featureGrid', {
    title: 'Why this architecture',
    features: [link('featureEditors'), link('featureFast'), link('featureAgnostic')],
  })

  await upsertEntry('quoteHome', 'quote', {
    quote: 'Editors publish on their schedule, developers ship on theirs. The content model is the contract between them.',
    author: 'Demo editor',
    role: 'Content team',
  })

  await upsertEntry('teaserHelloWorld', 'teaser', {
    title: 'Hello world',
    text: 'The first blog post, served with stale-while-revalidate caching.',
    href: '/blog/hello-world',
  })
  await upsertEntry('teaserContentfulDocs', 'teaser', {
    title: 'How the content model works',
    text: 'Pages link to blocks; blocks are resolved in one request with include depth.',
    href: 'https://www.contentful.com/developers/docs/concepts/data-model/',
  })

  await upsertEntry('pageHome', 'page', {
    title: 'Home',
    slug: 'home',
    seoDescription: 'A headless CMS demo built with Nuxt and Contentful.',
    blocks: [link('heroHome'), link('featureGridHome'), link('quoteHome'), link('teaserHelloWorld'), link('teaserContentfulDocs')],
  })

  // --- Blog post -----------------------------------------------------------
  await upsertEntry('heroHelloWorld', 'hero', {
    headline: 'Hello world',
    subline: 'Rendered from Contentful via the catch-all route, cached with SWR.',
  })
  await upsertEntry('teaserBackHome', 'teaser', {
    title: 'Back to the home page',
    text: 'See how the home page is composed from hero, feature grid and teaser blocks.',
    href: '/',
  })
  await upsertEntry('pageHelloWorld', 'page', {
    title: 'Hello world',
    slug: 'blog/hello-world',
    seoDescription: 'The first blog post of the Nuxt + Contentful starter.',
    blocks: [link('heroHelloWorld'), link('teaserBackHome')],
  })

  // --- Draft for preview mode ----------------------------------------------
  // Saved but NOT published: the Delivery API still returns the old headline,
  // the Preview API returns this one.
  await upsertEntry('heroHome', 'hero', { ...homeHero, headline: 'Draft: energy that fits your life (preview only)' }, false)

  console.log('Done.')
}

main().catch((e) => {
  console.error(e?.message ?? e)
  process.exit(1)
})
