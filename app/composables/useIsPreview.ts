// useState = Nuxt's SSR-safe shared state: set on the server, hydrated on the client.
// (In React/Next you'd reach for context or a store; here it's built in.)
export function useIsPreview() {
  const route = useRoute()
  return useState<boolean>('preview', () => Boolean(route.query.preview))
}
