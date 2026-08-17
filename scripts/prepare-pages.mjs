import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const distPath = fileURLToPath(new URL('../dist/', import.meta.url))
const indexPath = fileURLToPath(new URL('../dist/index.html', import.meta.url))
const serviceSlugs = [
  'objektpflege',
  'wartung-instandhaltung',
  'gebaeudereinigung',
  'gartenpflege',
  'winterdienst',
  'wohnungswechsel',
]

await copyFile(indexPath, `${distPath}404.html`)
await writeFile(`${distPath}.nojekyll`, '')

await Promise.all(serviceSlugs.map(async (slug) => {
  const servicePath = `${distPath}leistungen/${slug}/`
  await mkdir(servicePath, { recursive: true })
  await copyFile(indexPath, `${servicePath}index.html`)
}))
