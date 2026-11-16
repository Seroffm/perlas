import { writeFile } from 'node:fs/promises'

const filename = new URL('../.env.development.local', import.meta.url)
const configuration = `# Local development only. Production builds use .env.production.
# No connection to the live form API or analytics.
VITE_PERLAS_API_URL=
# Only the quote form supports this explicitly labelled demo mode.
VITE_PERLAS_DEMO_FORM_SUCCESS=true
VITE_PERLAS_GA_MEASUREMENT_ID=
PERLAS_SITE_URL=http://127.0.0.1:5173/
PERLAS_INDEX_SITE=false
`

try {
  await writeFile(filename, configuration, { flag: 'wx', mode: 0o600 })
  console.log('Created .env.development.local for isolated local development.')
} catch (error) {
  if (error.code !== 'EEXIST') throw error
  console.log('Kept existing .env.development.local unchanged.')
}

console.log('Next: npm ci, npm run doctor, npm run dev:local. See docs/DEVELOPMENT.md.')
