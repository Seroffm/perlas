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
// Keep the route allowlist independent of content collections: only the six
// commissioned blog articles may be added, never accidental service/city pages.
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
  'blog/bueroreinigung-eschborn-angebot-kosten/',
  'blog/gebaeudereinigung-wiesbaden-erbenheim-leistungsverzeichnis/',
  'blog/tiefgaragenreinigung-frankfurt-weg/',
  'blog/baumfaellung-neu-isenburg-genehmigung-firma/',
  'blog/hausmeisterservice-sulzbach-weg-leistungen/',
  'blog/spielplatzkontrolle-main-taunus-hausverwaltungen/',
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
assert.deepEqual(urls.map((url) => url.href).sort(), expectedUrls, 'Only the existing routes plus six commissioned articles are allowed (33 canonicals)')
const blogContent = JSON.parse(await readFile(path.join(workspace, 'src/blog-data.json'), 'utf8'))
const blogByUrl = new Map(blogContent.map((post) => [new URL(`blog/${post.slug}/`, site).href, post]))
assert.equal(blogByUrl.size, 9, 'Exactly nine unique blog articles required')
assert.deepEqual([...blogByUrl.keys()].sort(), expectedUrls.filter((url) => url.startsWith(new URL('blog/', site).href) && url !== new URL('blog/', site).href), 'Blog data and allowed article routes must agree')
const sitemapLastmods = new Map([...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => [
  match[1].match(/<loc>([^<]+)<\/loc>/)?.[1],
  match[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
]))
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date())
const blogDateToIso = (value) => {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value)
  assert(match, `Invalid blog date format: ${value}`)
  const iso = `${match[3]}-${match[2]}-${match[1]}`
  const date = new Date(`${iso}T00:00:00Z`)
  assert(Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === iso, `Invalid calendar date: ${value}`)
  assert(iso <= today, `Future blog publication/update date: ${value}`)
  return iso
}
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
  if (blogByUrl.has(url.href)) {
    assert.equal(entries.filter((entry) => schemaTypes(entry).includes('BlogPosting')).length, 1, `Exactly one Article schema required: ${url}`)
  }
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
    if (schemaTypes(entry).includes('BlogPosting')) {
      const post = blogByUrl.get(url.href)
      assert(post, `Article schema on a non-article page: ${url}`)
      const published = blogDateToIso(post.published ?? '31.08.2026')
      const updated = blogDateToIso(post.updated)
      assert(published <= updated, `Article modified before publication: ${url}`)
      assert.equal(entry['@id'], `${url.href}#article`, `Stable Article identity: ${url}`)
      assert.equal(entry.headline, post.title, `Article headline: ${url}`)
      assert.equal(entry.datePublished, published, `Article publication date: ${url}`)
      assert.equal(entry.dateModified, updated, `Article update date: ${url}`)
      assert.equal(entry.mainEntityOfPage, url.href, `Article canonical identity: ${url}`)
      assert.deepEqual(entry.author, { '@type': 'Organization', name: 'Perla’s Objektbetreuung GmbH & Co. KG', url: site.href }, `Article author: ${url}`)
      assert.equal(entry.publisher?.['@id'], businessId, `Article publisher: ${url}`)
      assert.equal(entry.image, new URL(`assets/${post.image}`, site).href, `Relevant Article image: ${url}`)
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
  const post = blogByUrl.get(url.href)
  if (post) {
    const headline = visibleText(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '')
    assert.equal(headline, post.title, `Visible Article headline: ${url}`)
    const published = blogDateToIso(post.published ?? '31.08.2026')
    const updated = blogDateToIso(post.updated)
    assert(markup(main, 'time').some((time) => time.datetime === published), `Visible publication date absent: ${url}`)
    assert(markup(main, 'time').some((time) => time.datetime === updated), `Visible update date absent: ${url}`)
    assert(mainText.includes('Perla’s Objektbetreuung'), `Visible Article author absent: ${url}`)
    const articleLinks = markup(main, 'a').map((link) => decodeEntities(link.href ?? ''))
    assert(articleLinks.includes(`${site.pathname}ueber-uns/`), `Article author profile link absent: ${url}`)
    assert(articleLinks.includes(`${site.pathname}kontakt/`), `Article contact CTA absent: ${url}`)
    assert(articleLinks.includes('tel:+491776867145'), `Article phone CTA absent: ${url}`)
    for (const [index, section] of post.sections.entries()) {
      assert(mainText.includes(section.title), `Article section absent: ${url}`)
      assert(articleLinks.includes(`#abschnitt-${index + 1}`) && main.includes(`id="abschnitt-${index + 1}"`), `Article table-of-contents target absent: ${url}`)
      if (section.table) {
        assert(section.table.headers.length > 0 && section.table.rows.every((row) => row.length === section.table.headers.length), `Non-rectangular Article table: ${url}`)
        for (const cell of [...section.table.headers, ...section.table.rows.flat()]) assert(mainText.includes(cell), `Article table cell absent: ${url}`)
      }
    }
    for (const item of post.takeaways ?? []) assert(mainText.includes(item), `Article takeaway absent: ${url}`)
    for (const faq of post.faqs ?? []) {
      assert(mainText.includes(faq.question) && mainText.includes(faq.answer), `Article FAQ absent: ${url}`)
    }
    for (const source of post.sources ?? []) assert(articleLinks.includes(new URL(source.url).href), `Article source link absent: ${url}`)
    assert.equal(sitemapLastmods.get(url.href), updated, `Article sitemap lastmod differs from actual update: ${url}`)
    await access(path.join(dist, 'assets', post.image))
  } else {
    assert.equal(sitemapLastmods.get(url.href), undefined, `Do not invent lastmod on unchanged non-blog pages: ${url}`)
  }
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
console.log(`SEO build checks passed: ${urls.length} allowed canonical pages including ${blogByUrl.size} articles, decoded metadata limits, business/service/article schema, true article dates/lastmod, local initial HTML, article content/CTAs/sources, incoming/internal links, responsive assets and 404.`)
