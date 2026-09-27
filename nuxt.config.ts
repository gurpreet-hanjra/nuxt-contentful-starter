// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },

  css: ['~/assets/main.css'],

  // Secrets live in runtimeConfig (server-only). Only non-secret values go in `public`.
  // Override via env: NUXT_CONTENTFUL_SPACE_ID, NUXT_CONTENTFUL_DELIVERY_TOKEN, ...
  runtimeConfig: {
    contentfulSpaceId: '',
    contentfulDeliveryToken: '',
    contentfulPreviewToken: '',
    contentfulEnvironment: 'master',
    previewSecret: 'change-me',
    public: {
      siteName: 'Nuxt + Contentful Starter',
    },
  },

  // Hybrid rendering: pick a strategy per route.
  routeRules: {
    '/': { prerender: true },            // static at build time
    '/blog/**': { swr: 3600 },           // cached SSR, revalidated hourly (like ISR in Next.js)
    '/api/**': { cors: false },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
})
