import { createClient, type Entry } from 'contentful'
import type { Block, Page } from '#shared/types/content'

// One client per mode. Preview uses the Preview API (returns drafts).
export function getContentfulClient(preview = false) {
  const config = useRuntimeConfig()
  if (!config.contentfulSpaceId || !config.contentfulDeliveryToken) return null

  return createClient({
    space: config.contentfulSpaceId,
    environment: config.contentfulEnvironment,
    accessToken: preview ? config.contentfulPreviewToken : config.contentfulDeliveryToken,
    host: preview ? 'preview.contentful.com' : 'cdn.contentful.com',
  })
}

function assetUrl(asset: any): string | undefined {
  const url = asset?.fields?.file?.url
  return url ? `https:${url}` : undefined
}

// Mapper: Contentful entry -> normalised Block. Unknown types are dropped, not crashed on.
export function mapBlock(entry: Entry<any>): Block | null {
  const f: any = entry.fields
  const id = entry.sys.id
  switch (entry.sys.contentType.sys.id) {
    case 'hero':
      return {
        type: 'hero', id,
        headline: f.headline, subline: f.subline,
        ctaLabel: f.ctaLabel, ctaHref: f.ctaHref,
        imageUrl: assetUrl(f.image),
      }
    case 'featureGrid':
      return {
        type: 'featureGrid', id,
        title: f.title,
        features: (f.features ?? []).map((x: any) => ({ title: x.fields.title, text: x.fields.text })),
      }
    case 'teaser':
      return { type: 'teaser', id, title: f.title, text: f.text, href: f.href }
    case 'quote':
      return { type: 'quote', id, quote: f.quote, author: f.author, role: f.role }
    default:
      return null
  }
}

export function mapPage(entry: Entry<any>): Page {
  const f: any = entry.fields
  return {
    slug: f.slug,
    title: f.title,
    seoDescription: f.seoDescription,
    blocks: (f.blocks ?? []).map(mapBlock).filter(Boolean) as Block[],
  }
}
