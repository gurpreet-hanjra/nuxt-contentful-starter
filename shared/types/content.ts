// Normalised content types. The UI never sees raw Contentful entries,
// so we could swap CMS (Storyblok, Sanity...) by changing only the mapper.

export interface HeroBlock {
  type: 'hero'
  id: string
  headline: string
  subline?: string
  ctaLabel?: string
  ctaHref?: string
  imageUrl?: string
}

export interface FeatureGridBlock {
  type: 'featureGrid'
  id: string
  title?: string
  features: { title: string; text: string }[]
}

export interface TeaserBlock {
  type: 'teaser'
  id: string
  title: string
  text: string
  href: string
}

export interface QuoteBlock {
  type: 'quote'
  id: string
  quote: string
  author: string
  role?: string
}

export type Block = HeroBlock | FeatureGridBlock | TeaserBlock | QuoteBlock

export interface Page {
  slug: string
  title: string
  seoDescription?: string
  blocks: Block[]
}
