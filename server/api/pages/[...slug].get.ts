import type { Page } from '#shared/types/content'

// GET /api/pages/<slug>?preview=<secret>
// Runs on the server only, so CMS tokens never reach the browser.
export default defineEventHandler(async (event): Promise<Page> => {
  const slug = getRouterParam(event, 'slug') || 'home'
  const { preview } = getQuery(event)
  const config = useRuntimeConfig(event)
  // The default secret is public (it's in the repo), so it never unlocks drafts.
  const isPreview = config.previewSecret !== 'change-me' && preview === config.previewSecret

  const client = getContentfulClient(isPreview)

  if (!client) {
    const page = mockPages[slug]
    if (!page) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
    return page
  }

  const res = await client.getEntries({
    content_type: 'page',
    'fields.slug': slug,
    include: 3, // resolve linked blocks (and their children) in one request
    limit: 1,
  } as any)

  const entry = res.items[0]
  if (!entry) throw createError({ statusCode: 404, statusMessage: 'Page not found' })

  // Never cache drafts, and tell the client it really got them (drives the preview banner).
  if (isPreview) {
    setHeader(event, 'Cache-Control', 'no-store')
    setHeader(event, 'X-Preview', '1')
  }
  return mapPage(entry)
})
