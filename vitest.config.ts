import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      // Pure functions (mappers): plain Node, no Nuxt boot, fast.
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      // Components: a real Nuxt runtime (auto-imports, NuxtLink, #shared alias) in happy-dom.
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.test.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
