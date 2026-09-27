<script setup lang="ts">
import type { FeatureGridBlock } from '#shared/types/content'
defineProps<{ block: FeatureGridBlock }>()
</script>

<template>
  <section class="section">
    <h2 v-if="block.title">{{ block.title }}</h2>
    <ul class="grid">
      <li v-for="f in block.features" :key="f.title" class="card">
        <h3>{{ f.title }}</h3>
        <p>{{ f.text }}</p>
      </li>
    </ul>
  </section>
</template>
