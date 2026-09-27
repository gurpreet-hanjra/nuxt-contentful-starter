<script setup lang="ts">
const { public: { siteName } } = useRuntimeConfig()
const isPreview = useIsPreview()
</script>

<template>
  <div class="layout">
    <div v-if="isPreview" class="preview-banner">Preview mode: showing draft content</div>
    <header class="header">
      <NuxtLink to="/" class="brand">{{ siteName }}</NuxtLink>
      <nav>
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/blog/hello-world">Blog</NuxtLink>
      </nav>
    </header>
    <main><slot /></main>
    <footer class="footer">Built with Nuxt + Contentful</footer>
  </div>
</template>
