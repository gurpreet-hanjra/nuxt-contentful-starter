import type { Page } from '#shared/types/content'

// Fetches a page via our own server API (tokens stay server-side).
// useFetch runs on the server during SSR and the result is serialised into the
// payload, so the client does NOT refetch on hydration.
export function usePage(slug: MaybeRefOrGetter<string>) {
  const route = useRoute()
  const key = computed(() => `page:${toValue(slug)}`)

  return useFetch<Page>(() => `/api/pages/${toValue(slug)}`, {
    key,
    query: { preview: route.query.preview },
  })
}
