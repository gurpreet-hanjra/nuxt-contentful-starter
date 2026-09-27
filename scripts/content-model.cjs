// Creates the content model in your Contentful space.
// Run:  npx contentful-cli login
//       npx contentful-cli space migration --space-id <SPACE_ID> scripts/content-model.cjs
module.exports = function (migration) {
  const feature = migration.createContentType('feature').name('Feature').displayField('title')
  feature.createField('title').name('Title').type('Symbol').required(true)
  feature.createField('text').name('Text').type('Text')

  const hero = migration.createContentType('hero').name('Hero').displayField('headline')
  hero.createField('headline').name('Headline').type('Symbol').required(true)
  hero.createField('subline').name('Subline').type('Text')
  hero.createField('ctaLabel').name('CTA label').type('Symbol')
  hero.createField('ctaHref').name('CTA link').type('Symbol')
  hero.createField('image').name('Image').type('Link').linkType('Asset')

  const grid = migration.createContentType('featureGrid').name('Feature grid').displayField('title')
  grid.createField('title').name('Title').type('Symbol')
  grid.createField('features').name('Features').type('Array')
    .items({ type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['feature'] }] })

  const teaser = migration.createContentType('teaser').name('Teaser').displayField('title')
  teaser.createField('title').name('Title').type('Symbol').required(true)
  teaser.createField('text').name('Text').type('Text')
  teaser.createField('href').name('Link').type('Symbol').required(true)

  const page = migration.createContentType('page').name('Page').displayField('title')
  page.createField('title').name('Title').type('Symbol').required(true)
  page.createField('slug').name('Slug').type('Symbol').required(true)
    .validations([{ unique: true }])
  page.createField('seoDescription').name('SEO description').type('Text')
  page.createField('blocks').name('Blocks').type('Array')
    .items({ type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['hero', 'featureGrid', 'teaser'] }] })
}
