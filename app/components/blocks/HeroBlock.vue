<script setup lang="ts">
import type { HeroBlock } from '#shared/types/content'
defineProps<{ block: HeroBlock }>()
</script>

<template>
  <section class="hero">
    <img v-if="block.imageUrl" :src="`${block.imageUrl}?w=1200&fm=webp`" alt="" class="hero__img" loading="eager">
    <h1>{{ block.headline }}</h1>
    <p v-if="block.subline" class="hero__sub">{{ block.subline }}</p>
    <NuxtLink v-if="block.ctaHref" :to="block.ctaHref" class="btn">{{ block.ctaLabel ?? 'Learn more' }}</NuxtLink>
  </section>
</template>
