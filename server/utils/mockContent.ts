import type { Page } from '#shared/types/content'

// Used when no Contentful credentials are configured, so the app runs out of the box.
export const mockPages: Record<string, Page> = {
  home: {
    slug: 'home',
    title: 'Home',
    seoDescription: 'Demo page rendered from mock CMS content',
    blocks: [
      {
        type: 'hero',
        id: 'hero-1',
        headline: 'Energy that fits your life',
        subline: 'A headless CMS demo built with Nuxt and Contentful.',
        ctaLabel: 'Read the blog',
        ctaHref: '/blog/hello-world',
      },
      {
        type: 'featureGrid',
        id: 'grid-1',
        title: 'Why this architecture',
        features: [
          { title: 'Editors own content', text: 'Pages are composed from blocks in the CMS, no deploy needed.' },
          { title: 'Fast by default', text: 'Prerendered home, cached SSR for blog pages.' },
          { title: 'CMS-agnostic UI', text: 'Components receive normalised data, not raw CMS entries.' },
        ],
      },
      {
        type: 'quote',
        id: 'quote-1',
        quote: 'Editors publish on their schedule, developers ship on theirs. The content model is the contract between them.',
        author: 'Demo editor',
        role: 'Content team',
      },
      {
        type: 'teaser',
        id: 'teaser-1',
        title: 'Hello world',
        text: 'The first blog post, served with stale-while-revalidate caching.',
        href: '/blog/hello-world',
      },
    ],
  },
  'blog/hello-world': {
    slug: 'blog/hello-world',
    title: 'Hello world',
    blocks: [
      { type: 'hero', id: 'hero-2', headline: 'Hello world', subline: 'Rendered via the catch-all route.' },
    ],
  },
}
