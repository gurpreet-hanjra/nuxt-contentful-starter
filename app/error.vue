<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError }>()
</script>

<template>
  <div class="section">
    <h1>{{ error.statusCode === 404 ? 'Page not found' : 'Something went wrong' }}</h1>
    <button class="btn" @click="clearError({ redirect: '/' })">Back home</button>
  </div>
</template>
