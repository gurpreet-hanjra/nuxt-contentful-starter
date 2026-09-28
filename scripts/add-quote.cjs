// Adds the Quote block and allows it in page.blocks.
// Run:  npm run cms:migrate -- scripts/add-quote.cjs
module.exports = function (migration) {
  const quote = migration.createContentType('quote').name('Quote').displayField('author')
  quote.createField('quote').name('Quote').type('Text').required(true)
  quote.createField('author').name('Author').type('Symbol').required(true)
  quote.createField('role').name('Role').type('Symbol')

  // Link validations are replaced, not merged, so list every allowed block type.
  migration.editContentType('page').editField('blocks')
    .items({ type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['hero', 'featureGrid', 'teaser', 'quote'] }] })
}
