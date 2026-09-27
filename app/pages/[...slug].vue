<script setup lang="ts">
// Catch-all route: "/" -> home, "/blog/hello-world" -> blog/hello-world.
// Same idea as app/[[...slug]]/page.tsx in Next.js.
const route = useRoute()
const slug = computed(() => {
  const parts = route.params.slug as string[] | undefined
  return parts?.length ? parts.join('/') : 'home'
})

const { data: page, error } = await usePage(slug)

if (error.value) {
  throw createError({ statusCode: error.value.statusCode ?? 500, statusMessage: error.value.statusMessage, fatal: true })
}

usePageSeo(page)
</script>

<template>
  <BlockRenderer v-if="page" :blocks="page.blocks" />
</template>
