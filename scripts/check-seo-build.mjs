// Read-only checks for the published static output, independent of JavaScript rendering.
import { readFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'
import { loadEnv } from 'vite'

const workspace = fileURLToPath(new URL('../', import.meta.url))
const dist = path.join(workspace, 'dist')
const env = loadEnv('production', workspace, '')
const site = new URL(env.PERLAS_SITE_URL ?? 'https://seroffm.github.io/perlas/')
if (!site.pathname.endsWith('/')) site.pathname += '/'
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8')
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]))
const sitemapIndex = await readFile(path.join(dist, 'sitemap_index.xml'), 'utf8')
assert(sitemapIndex.includes('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Valid compatibility sitemap index required')
assert.deepEqual([...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]), [new URL('sitemap.xml', site).href], 'Sitemap index must point only to the current canonical sitemap')
// This change improves existing pages only. Keep this independent of the source
// collections so accidentally adding a service or city page fails the check.
const existingPaths = [
  '',
  'facility-management/',
  'facility-management/hausverwaltungen/',
  'facility-management/wohnanlagen/',
  'facility-management/gewerbeimmobilien/',
  'facility-management/institutionelle-gebaeude/',
  'leistungen/',
  'ueber-uns/',
  'blog/',
  'blog/winterdienst-richtig-planen/',
  'blog/objektkontrollen-richtig-dokumentieren/',
  'blog/gebaeudereinigung-im-laufenden-betrieb/',
  'karriere/',
  'kontakt/',
  'impressum/',
  'datenschutz/',
  'leistungen/objektpflege/',
  'leistungen/wartung-instandhaltung/',
  'leistungen/gebaeudereinigung/',
  'leistungen/gartenpflege/',
  'leistungen/winterdienst/',
  'leistungen/tiefgaragenreinigung/',
  'leistungen/muellmanagement/',
  'leistungen/einzelauftrag/',
  'leistungen/baumpflege-baumfaellung/',
  'leistungen/spielplatzkontrolle-spielgeraetewartung/',
  'leistungen/buero-einrichtungsservice/',
]
const expectedUrls = existingPaths.map((relative) => new URL(relative, site).href).sort()
assert.deepEqual(urls.map((url) => url.href).sort(), expectedUrls, 'The existing 27 canonical routes must remain unchanged')
const pages = new Map()
const titles = new Set()
const descriptions = new Set()
const decodeEntities = (value) => value.replace(/&(#(?:x[\da-f]+|\d+)|amp|lt|gt|quot|apos);/gi, (entity, code) => {
  if (code.startsWith('#')) {
    const hex = code[1].toLowerCase() === 'x'
    const point = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10)
    return point <= 0x10ffff ? String.fromCodePoint(point) : entity
  }
  return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[code.toLowerCase()]
})
const visibleText = (html) => decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)=["']([^"']*)["']/g)].map((match) => [match[1], match[2]]))
const markup = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map((match) => attributes(match[0]))
const fileForUrl = (url) => {
  const relative = decodeURIComponent(url.pathname.slice(site.pathname.length))
  return path.join(dist, relative, relative.endsWith('/') || !relative ? 'index.html' : '')
}
const schemaTypes = (entry) => Array.isArray(entry['@type']) ? entry['@type'] : [entry['@type']]
const businessId = `${site.href}#business`
const regionalPaths = new Set(existingPaths.filter((relative) =>
  !relative || relative === 'kontakt/' || relative.startsWith('leistungen/') || relative.startsWith('facility-management/')))
let sharedBusiness

function checkStructuredData(html, url) {
  const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  assert(scripts.length > 0, `Structured data absent: ${url}`)
  const entries = scripts.flatMap((match) => {
    const data = JSON.parse(match[1])
    assert.equal(data['@context'], 'https://schema.org', `Schema context: ${url}`)
    return data['@graph'] ?? [data]
  })
  const businesses = entries.filter((entry) => entry['@id'] === businessId)
  assert.equal(businesses.length, 1, `One stable business identity required: ${url}`)
  const business = businesses[0]
  assert(schemaTypes(business).some((type) => ['LocalBusiness', 'HomeAndConstructionBusiness'].includes(type)), `LocalBusiness type required: ${url}`)
  assert.equal(business.url, site.href, `Business URL: ${url}`)
  assert.equal(business.logo, new URL('assets/perlas-logo.svg', site).href, `Business logo: ${url}`)
  assert.equal(business.address?.['@type'], 'PostalAddress', `Business address type: ${url}`)
  assert.equal(business.address?.addressLocality, 'Sulzbach (Taunus)', `Business location: ${url}`)
  assert.equal(business.address?.postalCode, '65843', `Business postal code: ${url}`)
  assert.equal(business.address?.addressCountry, 'DE', `Business country: ${url}`)
  assert(!Object.hasOwn(business, 'aggregateRating'), `Do not add self-serving LocalBusiness review markup: ${url}`)
  assert(Array.isArray(business.areaServed) && business.areaServed.length > 0, `Service area absent: ${url}`)
  if (sharedBusiness) assert.deepEqual(business, sharedBusiness, `Business data differs between pages: ${url}`)
  else sharedBusiness = business

  for (const entry of entries) {
    assert(!schemaTypes(entry).includes('CleaningService'), `CleaningService is not a Schema.org type: ${url}`)
    if (entry.url) assert(expectedUrls.includes(entry.url), `Structured URL is not canonical: ${url} -> ${entry.url}`)
    if (schemaTypes(entry).includes('Service')) {
      assert.equal(entry['@id'], `${url.href}#service`, `Stable Service identity: ${url}`)
      assert.equal(entry.url, url.href, `Service canonical URL: ${url}`)
      assert.equal(entry.provider?.['@id'], businessId, `Service provider: ${url}`)
    }
    if (schemaTypes(entry).includes('BreadcrumbList')) {
      assert(entry.itemListElement?.length > 1, `Breadcrumb items absent: ${url}`)
      entry.itemListElement.forEach((item, index) => {
        assert.equal(item.position, index + 1, `Breadcrumb position: ${url}`)
        assert(expectedUrls.includes(item.item), `Breadcrumb URL is not canonical: ${url} -> ${item.item}`)
      })
      assert.equal(entry.itemListElement.at(-1).item, url.href, `Breadcrumb current page: ${url}`)
    }
  }
}

for (const url of urls) {
  assert.equal(url.origin, site.origin, `Sitemap origin: ${url}`)
  const html = await readFile(fileForUrl(url), 'utf8')
  const titleMarkup = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]
  const descriptionMarkup = markup(html, 'meta').find((meta) => meta.name === 'description')?.content
  const title = titleMarkup && decodeEntities(titleMarkup)
  const description = descriptionMarkup && decodeEntities(descriptionMarkup)
  const canonical = markup(html, 'link').filter((link) => link.rel === 'canonical')
  assert(title && !titles.has(title), `Missing or duplicated title: ${url}`)
  assert(description && !descriptions.has(description), `Missing or duplicated description: ${url}`)
  assert([...title].length <= 60, `Title exceeds the agreed 60-character copy limit: ${url}`)
  assert([...description].length <= 155, `Description exceeds the agreed 155-character copy limit: ${url}`)
  titles.add(title)
  descriptions.add(description)
  assert.equal(canonical.length, 1, `One canonical required: ${url}`)
  assert.equal(canonical[0].href, url.href, `Canonical differs from sitemap: ${url}`)
  assert.equal(markup(html, 'meta').find((meta) => meta.property === 'og:url')?.content, url.href)
  assert.equal(decodeEntities(markup(html, 'meta').find((meta) => meta.property === 'og:title')?.content ?? ''), title, `Open Graph title differs: ${url}`)
  assert.equal(decodeEntities(markup(html, 'meta').find((meta) => meta.property === 'og:description')?.content ?? ''), description, `Open Graph description differs: ${url}`)
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `One H1 required: ${url}`)
  assert(html.includes('class="seo-static-footer"'), `Static footer absent: ${url}`)
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? ''
  const mainText = visibleText(main)
  assert(mainText.length > 300, `Empty initial page: ${url}`)
  assert(!/Zertifiziert|Zertifizierte Fachleistung|Zertifizierte Zusatzleistungen/.test(mainText), `Unverified certification claim: ${url}`)
  const relativePath = url.pathname.slice(site.pathname.length)
  if (regionalPaths.has(relativePath)) {
    assert(mainText.includes('Sulzbach'), `Local content absent from the initial main HTML: ${url}`)
    assert(mainText.includes('Rhein-Main'), `Regional content absent from the initial main HTML: ${url}`)
  }
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]))
  checkStructuredData(html, url)
  const links = markup(html, 'a').map((link) => link.href).filter(Boolean)
  assert(links.includes(`${site.pathname}impressum/`), `Impressum link absent: ${url}`)
  assert(links.includes(`${site.pathname}datenschutz/`), `Privacy link absent: ${url}`)
  pages.set(url.href, { html, ids, links })
  for (const image of markup(html, 'img')) {
    if (image.src?.includes('/optimized/')) {
      assert(image.width && image.height && image.srcset && image.sizes, `Responsive attributes absent: ${url}`)
      assert(['lazy', 'eager'].includes(image.loading), `Image loading mode absent: ${url}`)
      for (const candidate of [image.src, ...image.srcset.split(', ').map((entry) => entry.split(' ')[0])]) {
        const imageUrl = new URL(candidate, url)
        assert.equal(imageUrl.origin, site.origin)
        await access(path.join(dist, decodeURIComponent(imageUrl.pathname.slice(site.pathname.length))))
      }
    }
  }
}

const incomingLinks = new Set()
for (const [pageUrl, page] of pages) {
  for (const href of page.links) {
    const target = new URL(href, pageUrl)
    if (target.origin !== site.origin || !target.pathname.startsWith(site.pathname)) continue
    const hash = decodeURIComponent(target.hash.slice(1))
    target.hash = ''
    target.search = ''
    if (pages.has(target.href)) {
      if (hash) assert(pages.get(target.href).ids.has(hash), `Broken fragment: ${pageUrl} -> ${href}`)
      if (target.href !== pageUrl) incomingLinks.add(target.href)
    } else {
      await access(fileForUrl(target)).catch(() => { throw new Error(`Broken internal link: ${pageUrl} -> ${href}`) })
    }
  }
}
for (const url of urls) assert(incomingLinks.has(url.href), `Canonical page has no crawlable internal incoming link: ${url}`)

const home = pages.get(site.href).html
assert(!/<iframe\b[^>]*src=["'][^"']*youtube/i.test(home), 'YouTube must not load before consent')
assert(/fetchpriority="high"/.test(home), 'The first hero image needs priority')
assert(!/<img\b[^>]*src=["'][^"']*kundenbilder\//.test(home), 'Home photos must use optimized variants')
const notFound = await readFile(path.join(dist, '404.html'), 'utf8')
assert(markup(notFound, 'meta').some((meta) => meta.name === 'robots' && meta.content.includes('noindex')))
assert(!markup(notFound, 'link').some((link) => link.rel === 'canonical'))
console.log(`SEO build checks passed: the existing ${urls.length} canonical pages, decoded metadata limits, consistent business/service schema, local initial HTML, incoming/internal links, responsive assets and 404.`)
