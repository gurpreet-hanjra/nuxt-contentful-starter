import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Block } from '#shared/types/content'
import BlockRenderer from '~/components/BlockRenderer.vue'
import HeroBlock from '~/components/blocks/HeroBlock.vue'
import FeatureGridBlock from '~/components/blocks/FeatureGridBlock.vue'
import TeaserBlock from '~/components/blocks/TeaserBlock.vue'
import QuoteBlock from '~/components/blocks/QuoteBlock.vue'

// Mapped type: one fixture per block type. A new block type without a fixture fails typecheck.
const fixtures: { [K in Block['type']]: Extract<Block, { type: K }> } = {
  hero: { type: 'hero', id: 'h1', headline: 'Energy that fits your life' },
  featureGrid: { type: 'featureGrid', id: 'g1', title: 'Why', features: [{ title: 'Fast', text: 'Prerendered' }] },
  teaser: { type: 'teaser', id: 't1', title: 'Hello world', text: 'First post', href: '/blog/hello-world' },
  quote: { type: 'quote', id: 'q1', quote: 'Content is a contract.', author: 'Ada', role: 'Editor' },
}

const components = {
  hero: HeroBlock,
  featureGrid: FeatureGridBlock,
  teaser: TeaserBlock,
  quote: QuoteBlock,
} as const

describe('BlockRenderer', () => {
  it.each(Object.keys(fixtures) as Block['type'][])('renders %s with the matching component', async (type) => {
    const block = fixtures[type]
    const wrapper = await mountSuspended(BlockRenderer, { props: { blocks: [block] } })

    const rendered = wrapper.findComponent(components[type])
    expect(rendered.exists()).toBe(true)
    expect(rendered.props('block')).toEqual(block)

    // ...and none of the others.
    for (const [otherType, other] of Object.entries(components)) {
      if (otherType !== type) expect(wrapper.findComponent(other).exists()).toBe(false)
    }
  })

  it('renders blocks in the order given', async () => {
    const { hero, featureGrid, teaser, quote } = fixtures
    const wrapper = await mountSuspended(BlockRenderer, { props: { blocks: [quote, hero, teaser, featureGrid] } })

    const text = wrapper.text()
    const positions = [quote.quote, hero.headline, teaser.title, featureGrid.title!].map((s) => text.indexOf(s))
    expect(positions.every((p) => p >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })
})
