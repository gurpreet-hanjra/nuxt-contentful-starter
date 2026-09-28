// useState = Nuxt's SSR-safe shared state, keyed by name and shared across components.
// (In React/Next you'd reach for context or a store; here it's built in.)
//
// Only usePage() sets this to true, and only when the API confirmed it served drafts
// (X-Preview header). So `?preview=wrong` never shows the banner, and the app itself
// never needs to know the secret.
export function useIsPreview() {
  return useState<boolean>('preview', () => false)
}
