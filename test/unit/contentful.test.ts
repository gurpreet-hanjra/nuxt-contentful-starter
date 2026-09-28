import { describe, expect, it } from 'vitest'
import { mapBlock, mapPage } from '../../server/utils/contentful'

// Minimal stand-ins for what the Contentful Delivery API returns.
function entry(contentType: string, fields: Record<string, unknown>, id = `${contentType}-1`): any {
  return { sys: { id, type: 'Entry', contentType: { sys: { id: contentType } } }, fields }
}

function asset(fields: Record<string, unknown>): any {
  return { sys: { id: 'asset-1', type: 'Asset' }, fields }
}

// What the API leaves behind when a linked entry is unpublished or deleted.
function unresolvedLink(id: string): any {
  return { sys: { id, type: 'Link', linkType: 'Entry' } }
}

const heroImage = asset({
  title: 'Hero image',
  description: 'Solar panels in sunlight',
  file: {
    url: '//images.ctfassets.net/space/asset/hash/hero.jpg',
    details: { image: { width: 2000, height: 1331 } },
  },
})

describe('mapBlock', () => {
  it('maps a hero with every field', () => {
    const block = mapBlock(entry('hero', {
      headline: 'Energy that fits your life',
      subline: 'A demo',
      ctaLabel: 'Read the blog',
      ctaHref: '/blog/hello-world',
      image: heroImage,
    }))

    expect(block).toEqual({
      type: 'hero',
      id: 'hero-1',
      headline: 'Energy that fits your life',
      subline: 'A demo',
      ctaLabel: 'Read the blog',
      ctaHref: '/blog/hello-world',
      image: {
        url: 'https://images.ctfassets.net/space/asset/hash/hero.jpg',
        width: 2000,
        height: 1331,
        alt: 'Solar panels in sunlight',
      },
    })
  })

  it('prefixes protocol-relative asset URLs with https:', () => {
    const block = mapBlock(entry('hero', { headline: 'x', image: heroImage }))
    expect(block?.type === 'hero' && block.image?.url).toBe('https://images.ctfassets.net/space/asset/hash/hero.jpg')
  })

  it('handles a hero with only the required headline', () => {
    expect(mapBlock(entry('hero', { headline: 'Just a headline' }))).toEqual({
      type: 'hero',
      id: 'hero-1',
      headline: 'Just a headline',
      subline: undefined,
      ctaLabel: undefined,
      ctaHref: undefined,
      image: undefined,
    })
  })

  it('handles an image without description or size metadata', () => {
    const block = mapBlock(entry('hero', {
      headline: 'x',
      image: asset({ file: { url: '//images.ctfassets.net/a.jpg' } }),
    }))
    expect(block?.type === 'hero' && block.image).toEqual({
      url: 'https://images.ctfassets.net/a.jpg',
      width: undefined,
      height: undefined,
      alt: '',
    })
  })

  it('drops an image whose asset link is unresolved', () => {
    const block = mapBlock(entry('hero', { headline: 'x', image: { sys: { id: 'a', type: 'Link', linkType: 'Asset' } } }))
    expect(block?.type === 'hero' && block.image).toBeUndefined()
  })

  it('maps a feature grid and its linked features', () => {
    const block = mapBlock(entry('featureGrid', {
      title: 'Why this architecture',
      features: [
        entry('feature', { title: 'Fast', text: 'Prerendered' }, 'f1'),
        entry('feature', { title: 'Agnostic', text: 'Normalised data' }, 'f2'),
      ],
    }))

    expect(block).toEqual({
      type: 'featureGrid',
      id: 'featureGrid-1',
      title: 'Why this architecture',
      features: [
        { title: 'Fast', text: 'Prerendered' },
        { title: 'Agnostic', text: 'Normalised data' },
      ],
    })
  })

  it('handles a feature grid with no title and no features', () => {
    expect(mapBlock(entry('featureGrid', {}))).toEqual({
      type: 'featureGrid',
      id: 'featureGrid-1',
      title: undefined,
      features: [],
    })
  })

  it('skips unresolved feature links instead of crashing', () => {
    const block = mapBlock(entry('featureGrid', {
      features: [entry('feature', { title: 'Kept', text: 't' }), unresolvedLink('draft-feature')],
    }))
    expect(block?.type === 'featureGrid' && block.features).toEqual([{ title: 'Kept', text: 't' }])
  })

  it('maps a teaser', () => {
    expect(mapBlock(entry('teaser', { title: 'Hello', text: 'First post', href: '/blog/hello-world' }))).toEqual({
      type: 'teaser',
      id: 'teaser-1',
      title: 'Hello',
      text: 'First post',
      href: '/blog/hello-world',
    })
  })

  it('maps a quote', () => {
    expect(mapBlock(entry('quote', { quote: 'Content is a contract.', author: 'Ada', role: 'Editor' }))).toEqual({
      type: 'quote',
      id: 'quote-1',
      quote: 'Content is a contract.',
      author: 'Ada',
      role: 'Editor',
    })
  })

  it('handles a quote without the optional role', () => {
    const block = mapBlock(entry('quote', { quote: 'q', author: 'a' }))
    expect(block?.type === 'quote' && block.role).toBeUndefined()
  })

  it('returns null for an unknown content type', () => {
    expect(mapBlock(entry('videoEmbed', { url: 'https://example.com' }))).toBeNull()
  })

  it('returns null for an unresolved link', () => {
    expect(mapBlock(unresolvedLink('unpublished-block'))).toBeNull()
  })
})

describe('mapPage', () => {
  it('maps page fields and blocks in order', () => {
    const page = mapPage(entry('page', {
      title: 'Home',
      slug: 'home',
      seoDescription: 'Demo',
      blocks: [
        entry('hero', { headline: 'Hi' }, 'h'),
        entry('teaser', { title: 't', text: 'x', href: '/' }, 't'),
      ],
    }))

    expect(page.slug).toBe('home')
    expect(page.title).toBe('Home')
    expect(page.seoDescription).toBe('Demo')
    expect(page.blocks.map((b) => `${b.type}:${b.id}`)).toEqual(['hero:h', 'teaser:t'])
  })

  it('drops unknown and unresolved blocks but keeps the rest', () => {
    const page = mapPage(entry('page', {
      title: 'Home',
      slug: 'home',
      blocks: [
        entry('hero', { headline: 'Hi' }, 'h'),
        entry('videoEmbed', {}, 'v'),
        unresolvedLink('draft-block'),
        entry('quote', { quote: 'q', author: 'a' }, 'q'),
      ],
    }))

    expect(page.blocks.map((b) => b.id)).toEqual(['h', 'q'])
  })

  it('handles a page with no blocks and no SEO description', () => {
    const page = mapPage(entry('page', { title: 'Empty', slug: 'empty' }))
    expect(page).toEqual({ slug: 'empty', title: 'Empty', seoDescription: undefined, blocks: [] })
  })
})
