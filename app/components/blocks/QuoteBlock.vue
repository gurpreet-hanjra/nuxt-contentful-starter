<script setup lang="ts">
import type { QuoteBlock } from '#shared/types/content'
defineProps<{ block: QuoteBlock }>()
</script>

<template>
  <section class="section">
    <figure class="quote">
      <blockquote>
        <p>{{ block.quote }}</p>
      </blockquote>
      <figcaption>
        <strong>{{ block.author }}</strong>
        <span v-if="block.role">, {{ block.role }}</span>
      </figcaption>
    </figure>
  </section>
</template>

<!-- scoped: Vue rewrites these selectors so they only match this component (like CSS Modules). -->
<style scoped>
.quote {
  margin: 0;
  padding: 24px 28px;
  border-left: 4px solid var(--accent);
  background: var(--card);
  border-radius: 0 12px 12px 0;
}
blockquote {
  margin: 0 0 12px;
  font-size: 1.25rem;
  font-style: italic;
}
blockquote p {
  margin: 0;
}
figcaption {
  color: var(--muted);
}
</style>
