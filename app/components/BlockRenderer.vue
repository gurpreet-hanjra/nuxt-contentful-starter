<script setup lang="ts">
import type { Component } from 'vue'
import type { Block } from '#shared/types/content'
import HeroBlock from './blocks/HeroBlock.vue'
import FeatureGridBlock from './blocks/FeatureGridBlock.vue'
import TeaserBlock from './blocks/TeaserBlock.vue'

defineProps<{ blocks: Block[] }>()

// CMS content type -> Vue component. Adding a block = new component + one line here.
// Typed as Record<Block['type'], Component>: TS errors if a new block type has no component.
const registry: Record<Block['type'], Component> = {
  hero: HeroBlock,
  featureGrid: FeatureGridBlock,
  teaser: TeaserBlock,
}
</script>

<template>
  <template v-for="block in blocks" :key="block.id">
    <component :is="registry[block.type]" v-if="registry[block.type]" :block="block" />
  </template>
</template>
