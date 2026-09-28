<script setup lang="ts">
import type { HeroBlock } from '#shared/types/content'
const props = defineProps<{ block: HeroBlock }>()

// Contentful's Images API resizes and converts on the fly via query params.
const WIDTHS = [640, 1024, 1600]
const imageSrc = (url: string, w: number) => `${url}?w=${w}&fm=webp&q=75`

const img = computed(() => {
  const image = props.block.image
  if (!image) return null
  return {
    ...image,
    src: imageSrc(image.url, 1024),
    srcset: WIDTHS.map((w) => `${imageSrc(image.url, w)} ${w}w`).join(', '),
  }
})

// Rendered width: full width minus the 16px gutters, capped by the 1040px layout.
const SIZES = '(min-width: 1040px) 1008px, calc(100vw - 32px)'
</script>

<template>
  <section class="hero">
    <!-- The hero is the LCP element: load it eagerly and at high priority. -->
    <img
      v-if="img"
      :src="img.src"
      :srcset="img.srcset"
      :sizes="SIZES"
      :width="img.width"
      :height="img.height"
      :alt="img.alt"
      class="hero__img"
      loading="eager"
      fetchpriority="high"
    >
    <h1>{{ block.headline }}</h1>
    <p v-if="block.subline" class="hero__sub">{{ block.subline }}</p>
    <NuxtLink v-if="block.ctaHref" :to="block.ctaHref" class="btn">{{ block.ctaLabel ?? 'Learn more' }}</NuxtLink>
  </section>
</template>
