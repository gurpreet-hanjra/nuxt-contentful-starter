<script setup lang="ts">
import type { TeaserBlock } from '#shared/types/content'
const props = defineProps<{ block: TeaserBlock }>()

// Small example of reactivity: computed derives state, like useMemo without deps arrays.
const isExternal = computed(() => props.block.href.startsWith('http'))
</script>

<template>
  <section class="section">
    <NuxtLink :to="block.href" :external="isExternal" class="card teaser">
      <h3>{{ block.title }}</h3>
      <p>{{ block.text }}</p>
      <span class="teaser__more">Read more →</span>
    </NuxtLink>
  </section>
</template>
