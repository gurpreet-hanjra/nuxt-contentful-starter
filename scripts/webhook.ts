// Creates (or updates) the Contentful webhook that calls /api/revalidate on publish/unpublish.
// Run:  npm run cms:webhook -- https://<your-domain>
//
// The x-webhook-secret header carries NUXT_PREVIEW_SECRET, which revalidate.post.ts checks.
// It is stored as a secret header, so Contentful hides it after saving.
import { createClient } from 'contentful-management'

const { CONTENTFUL_MANAGEMENT_TOKEN, NUXT_CONTENTFUL_SPACE_ID, NUXT_PREVIEW_SECRET } = process.env
const domain = process.argv[2]?.replace(/\/$/, '')
if (!CONTENTFUL_MANAGEMENT_TOKEN || !NUXT_CONTENTFUL_SPACE_ID || !NUXT_PREVIEW_SECRET || !domain) {
  console.error('Usage: npm run cms:webhook -- https://<your-domain>  (needs CONTENTFUL_MANAGEMENT_TOKEN, NUXT_CONTENTFUL_SPACE_ID, NUXT_PREVIEW_SECRET)')
  process.exit(1)
}

const NAME = 'Revalidate site on publish'
const client = createClient({ accessToken: CONTENTFUL_MANAGEMENT_TOKEN }, { type: 'plain', defaults: { spaceId: NUXT_CONTENTFUL_SPACE_ID } })

const definition = {
  name: NAME,
  url: `${domain}/api/revalidate`,
  topics: ['Entry.publish', 'Entry.unpublish'],
  headers: [{ key: 'x-webhook-secret', value: NUXT_PREVIEW_SECRET, secret: true }],
  filters: [],
}

async function main() {
  const { items } = await client.webhook.getMany({})
  const existing = items.find((w) => w.name === NAME)
  const webhook = existing
    ? await client.webhook.update({ webhookDefinitionId: existing.sys.id }, { ...existing, ...definition } as any)
    : await client.webhook.create({}, definition as any)
  console.log(`${existing ? 'Updated' : 'Created'} webhook ${webhook.sys.id} -> ${webhook.url} [${webhook.topics.join(', ')}]`)
}

main().catch((e) => {
  console.error(e?.message ?? e)
  process.exit(1)
})
