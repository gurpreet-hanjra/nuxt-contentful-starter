// Normalised content types. The UI never sees raw Contentful entries,
// so we could swap CMS (Storyblok, Sanity...) by changing only the mapper.

export interface ImageAsset {
  url: string
  // Intrinsic size: lets the browser reserve space before the image loads (no layout shift).
  width?: number
  height?: number
  alt: string
}

export interface HeroBlock {
  type: 'hero'
  id: string
  headline: string
  subline?: string
  ctaLabel?: string
  ctaHref?: string
  image?: ImageAsset
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
