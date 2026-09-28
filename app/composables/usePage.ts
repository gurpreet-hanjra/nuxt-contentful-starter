import type { Page } from '#shared/types/content'

// Fetches a page via our own server API (tokens stay server-side).
// useFetch runs on the server during SSR and the result is serialised into the
// payload, so the client does NOT refetch on hydration.
//
// Drafts are fetched only in the browser, after mount. The server-rendered HTML is
// always the published page, so prerendered `/` and the CDN-cached `/blog/**` can
// never contain draft content, whatever the cache does with query strings.
export function usePage(slug: MaybeRefOrGetter<string>) {
  const route = useRoute()
  const isPreview = useIsPreview()
  const key = computed(() => `page:${toValue(slug)}`)

  const result = useFetch<Page>(() => `/api/pages/${toValue(slug)}`, { key })

  // Watch the query after mount rather than reading it during setup: on a prerendered page,
  // Nuxt hydrates with the payload's path (no query) and only then switches to the real URL.
  if (import.meta.client) {
    onMounted(() => {
      watch(() => route.query.preview, async (secret) => {
        if (typeof secret !== 'string') return
        const res = await $fetch.raw<Page>(`/api/pages/${toValue(slug)}`, { query: { preview: secret } })
        if (res.headers.get('x-preview') === '1' && res._data) {
          result.data.value = res._data
          isPreview.value = true
        }
      }, { immediate: true })
    })
  }

  return result
}
