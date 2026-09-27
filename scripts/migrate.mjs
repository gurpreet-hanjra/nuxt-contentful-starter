// Runs a Contentful migration file against the space in .env.
// Usage: npm run cms:migrate -- scripts/content-model.cjs
import { runMigration } from 'contentful-migration'
import { resolve } from 'node:path'

const file = process.argv[2]
if (!file) {
  console.error('Usage: npm run cms:migrate -- <migration-file.cjs>')
  process.exit(1)
}

await runMigration({
  filePath: resolve(file),
  spaceId: process.env.NUXT_CONTENTFUL_SPACE_ID,
  environmentId: process.env.NUXT_CONTENTFUL_ENVIRONMENT || 'master',
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  yes: true,
})
