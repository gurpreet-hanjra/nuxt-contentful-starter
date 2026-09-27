// useState = Nuxt's SSR-safe shared state: set on the server, hydrated on the client.
// (In React/Next you'd reach for context or a store; here it's built in.)
//
// The secret check runs on the server only: private runtimeConfig (previewSecret) exists
// there, and only the resulting boolean is sent to the client in the payload.
// Same check as server/api/pages, so `?preview=wrong` never shows the banner.
export function useIsPreview() {
  const route = useRoute()
  return useState<boolean>('preview', () => {
    if (import.meta.client) return false
    const { previewSecret } = useRuntimeConfig()
    return Boolean(route.query.preview) && route.query.preview === previewSecret
  })
}
