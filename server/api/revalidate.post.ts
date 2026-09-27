// Target for a Contentful webhook (on publish). With swr routeRules the cache
// refreshes on its own; this endpoint shows where you would purge a CDN / trigger a rebuild.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  if (getHeader(event, 'x-webhook-secret') !== config.previewSecret) {
    throw createError({ statusCode: 401 })
  }
  const body = await readBody(event)
  console.info('[revalidate] content changed:', body?.sys?.id)
  return { ok: true }
})
