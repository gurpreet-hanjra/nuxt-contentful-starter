import type { Page } from '#shared/types/content'

export function usePageSeo(page: Ref<Page | null | undefined>) {
  const { public: { siteName } } = useRuntimeConfig()
  useSeoMeta({
    title: () => (page.value ? `${page.value.title} | ${siteName}` : siteName),
    description: () => page.value?.seoDescription,
    ogTitle: () => page.value?.title,
    ogDescription: () => page.value?.seoDescription,
  })
}
