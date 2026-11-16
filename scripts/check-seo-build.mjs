// Read-only checks for the published static output, independent of JavaScript rendering.
import { readFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'
import { loadEnv } from 'vite'
import { validateLegacyRedirects } from './prepare-legacy-redirects.mjs'

const workspace = fileURLToPath(new URL('../', import.meta.url))
const dist = path.join(workspace, 'dist')
const env = loadEnv('production', workspace, '')
const site = new URL(env.PERLAS_SITE_URL ?? 'https://seroffm.github.io/perlas/')
if (!site.pathname.endsWith('/')) site.pathname += '/'
const indexingEnabled = env.PERLAS_INDEX_SITE == null
  ? !site.hostname.endsWith('github.io')
  : env.PERLAS_INDEX_SITE === 'true'
const expectedPageRobots = indexingEnabled ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8')
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]))
const sitemapIndex = await readFile(path.join(dist, 'sitemap_index.xml'), 'utf8')
assert(sitemapIndex.includes('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Valid compatibility sitemap index required')
assert.deepEqual([...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]), [new URL('sitemap.xml', site).href], 'Sitemap index must point only to the current canonical sitemap')
// Keep the route allowlist independent of content collections. The twenty local
// service pages, four focused service offers and ten articles have each been
// explicitly commissioned.
const existingPaths = [
  '',
  'facility-management/',
  'facility-management/hausverwaltungen/',
  'facility-management/wohnanlagen/',
  'facility-management/gewerbeimmobilien/',
  'facility-management/institutionelle-gebaeude/',
  'leistungen/',
  'einsatzgebiete/',
  'einsatzgebiete/objektbetreuung-eschborn/',
  'einsatzgebiete/gebaeudereinigung-frankfurt-hoechst/',
  'einsatzgebiete/bueroreinigung-frankfurt-westend/',
  'einsatzgebiete/treppenhausreinigung-frankfurt-bockenheim/',
  'einsatzgebiete/winterdienst-frankfurt-riedberg/',
  'einsatzgebiete/baumpflege-baumfaellung-neu-isenburg/',
  'einsatzgebiete/hausmeisterservice-frankfurt/',
  'einsatzgebiete/hausmeisterservice-kelkheim/',
  'einsatzgebiete/bueroreinigung-frankfurt/',
  'einsatzgebiete/gebaeudereinigung-eschborn/',
  'einsatzgebiete/tiefgaragenreinigung-frankfurt/',
  'einsatzgebiete/hausmeisterservice-wiesbaden/',
  'einsatzgebiete/gebaeudereinigung-wiesbaden/',
  'einsatzgebiete/hausmeisterservice-hanau/',
  'einsatzgebiete/gebaeudereinigung-hanau/',
  'einsatzgebiete/hausmeisterservice-taunusstein/',
  'einsatzgebiete/gebaeudereinigung-taunusstein/',
  'einsatzgebiete/hausmeisterservice-ruesselsheim/',
  'einsatzgebiete/gebaeudereinigung-ruesselsheim/',
  'einsatzgebiete/grundreinigung-frankfurt/',
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
  'blog/hausmeisterservice-objektbetreuung-frankfurt-umgebung/',
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
  'leistungen/treppenhausreinigung/',
  'leistungen/heckenschnitt/',
  'leistungen/winterdienst-gewerbe/',
  'leistungen/hausmeisterservice-gewerbe/',
]
const expectedUrls = existingPaths.map((relative) => new URL(relative, site).href).sort()
assert.equal(expectedUrls.length, 59, 'Exactly 59 commissioned canonical pages required')
assert.deepEqual(urls.map((url) => url.href).sort(), expectedUrls, 'Only the 59 explicitly commissioned canonical routes are allowed')
const robotsFile = await readFile(path.join(dist, 'robots.txt'), 'utf8')
const robotsGroups = []
let robotsGroup
for (const rawLine of robotsFile.split(/\r?\n/)) {
  const line = rawLine.replace(/#.*$/, '').trim()
  if (!line.includes(':')) continue
  const separator = line.indexOf(':')
  const key = line.slice(0, separator).trim().toLowerCase()
  const value = line.slice(separator + 1).trim()
  if (key === 'user-agent') {
    if (!robotsGroup || robotsGroup.rules.length) {
      robotsGroup = { agents: [], rules: [] }
      robotsGroups.push(robotsGroup)
    }
    robotsGroup.agents.push(value.toLowerCase())
  } else if (robotsGroup && ['allow', 'disallow'].includes(key) && value) {
    robotsGroup.rules.push({ directive: key, path: value })
  }
}
const wildcardGroups = robotsGroups.filter((group) => group.agents.includes('*'))
assert.equal(wildcardGroups.length, 1, 'One unambiguous wildcard robots group required')
const robotsAllows = (pathname) => {
  const matching = wildcardGroups[0].rules.filter((rule) => {
    const expression = rule.path.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replaceAll('*', '.*')
    return new RegExp(`^${expression}`).test(pathname)
  }).sort((left, right) => right.path.length - left.path.length || Number(right.directive === 'allow') - Number(left.directive === 'allow'))
  return !matching.length || matching[0].directive === 'allow'
}
for (const url of urls) assert.equal(robotsAllows(url.pathname), indexingEnabled, `robots.txt must match the configured indexability for ${url}`)
const advertisedSitemaps = [...robotsFile.matchAll(/^\s*sitemap\s*:\s*(\S+)\s*$/gim)].map((match) => match[1])
assert.deepEqual(advertisedSitemaps, indexingEnabled ? [new URL('sitemap.xml', site).href] : [], 'robots.txt sitemap advertisement must match the configured canonical site and indexing mode')
const blogContent = JSON.parse(await readFile(path.join(workspace, 'src/blog-data.json'), 'utf8'))
const blogByUrl = new Map(blogContent.map((post) => [new URL(`blog/${post.slug}/`, site).href, post]))
const serviceContent = JSON.parse(await readFile(path.join(workspace, 'src/service-data.json'), 'utf8'))
const serviceByUrl = new Map(serviceContent.map((service) => [new URL(`leistungen/${service.slug}/`, site).href, service]))
const localContent = JSON.parse(await readFile(path.join(workspace, 'src/local-landing-data.json'), 'utf8'))
const commercialContent = JSON.parse(await readFile(path.join(workspace, 'src/commercial-landing-data.json'), 'utf8'))
const focusedContent = JSON.parse(await readFile(path.join(workspace, 'src/focused-service-data.json'), 'utf8'))
const allLocalContent = [...localContent, ...commercialContent]
const localByUrl = new Map(allLocalContent.map((landing) => [new URL(`einsatzgebiete/${landing.slug}/`, site).href, landing]))
const commercialByUrl = new Map(commercialContent.map((landing) => [new URL(`einsatzgebiete/${landing.slug}/`, site).href, landing]))
const focusedByUrl = new Map(focusedContent.map((landing) => [new URL(landing.path.replace(/^\//, ''), site).href, landing]))
const seoContent = JSON.parse(await readFile(path.join(workspace, 'src/seo-data.json'), 'utf8'))
const googleReviews = JSON.parse(await readFile(path.join(workspace, 'src/google-reviews-data.json'), 'utf8'))
const imageVariants = JSON.parse(await readFile(path.join(workspace, 'src/image-variants.json'), 'utf8'))
const footerGroups = JSON.parse(await readFile(path.join(workspace, 'src/footer-links.json'), 'utf8')).groups
const regionsUrl = new URL('einsatzgebiete/', site).href
const servicesUrl = new URL('leistungen/', site).href
const frankfurtLandingSlug = 'hausmeisterservice-frankfurt'
const frankfurtArticleSlug = 'hausmeisterservice-objektbetreuung-frankfurt-umgebung'
const frankfurtLandingUrl = new URL(`einsatzgebiete/${frankfurtLandingSlug}/`, site).href
const frankfurtArticleUrl = new URL(`blog/${frankfurtArticleSlug}/`, site).href
assert.equal(localContent.length, 7, 'Keep the seven established local service pages')
assert.equal(commercialByUrl.size, 13, 'Exactly thirteen unique commissioned commercial landing pages required')
assert.deepEqual([...commercialByUrl.keys()].sort(), [
  'hausmeisterservice-kelkheim', 'bueroreinigung-frankfurt',
  'gebaeudereinigung-eschborn', 'tiefgaragenreinigung-frankfurt',
  'hausmeisterservice-wiesbaden',
  'gebaeudereinigung-wiesbaden',
  'hausmeisterservice-hanau',
  'gebaeudereinigung-hanau',
  'hausmeisterservice-taunusstein',
  'gebaeudereinigung-taunusstein',
  'hausmeisterservice-ruesselsheim',
  'gebaeudereinigung-ruesselsheim',
  'grundreinigung-frankfurt',
].map((slug) => new URL(`einsatzgebiete/${slug}/`, site).href).sort(), 'Only the thirteen explicitly commissioned commercial landing routes are allowed')
assert.equal(allLocalContent.length, 20, 'Exactly twenty local content entries required, without slug collisions')
assert.equal(localByUrl.size, 20, 'Exactly twenty unique commissioned local service pages required')
assert.deepEqual([...localByUrl.keys()].sort(), expectedUrls.filter((url) => url.startsWith(regionsUrl) && url !== regionsUrl), 'Local data and independently allowed routes must agree')
assert.equal(focusedContent.length, 4, 'Exactly four individually commissioned focused service offers required')
assert.equal(focusedByUrl.size, 4, 'Focused service paths must be unique')
assert.deepEqual([...focusedByUrl.keys()].sort(), [
  'leistungen/treppenhausreinigung/',
  'leistungen/heckenschnitt/',
  'leistungen/winterdienst-gewerbe/',
  'leistungen/hausmeisterservice-gewerbe/',
].map((relative) => new URL(relative, site).href).sort(), 'Only the four explicitly commissioned focused service routes are allowed')
for (const landing of focusedContent) {
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(landing.slug), `Safe focused service slug required: ${landing.slug}`)
  assert.equal(landing.path, `/leistungen/${landing.slug}/`, `Focused service path must match its approved slug: ${landing.slug}`)
  assert(serviceContent.some((service) => service.slug === landing.serviceSlug), `Unknown focused parent service: ${landing.slug}`)
  assert(!serviceByUrl.has(new URL(landing.path.replace(/^\//, ''), site).href), `Focused offer must not replace an existing parent service: ${landing.slug}`)
  assert.equal(landing.locality, 'Rhein-Main', `Keep focused service area separate from the actual company address: ${landing.slug}`)
  assert(landing.eyebrow && landing.parentLabel, `Focused service identity and parent label required: ${landing.slug}`)
  assert(landing.heroPromise && landing.intro, `Specific focused offer and introduction required: ${landing.slug}`)
  assert(landing.scopeCards.length === 3 && landing.scopeCards.every((card) => card.title && card.text && card.items.length >= 2), `Substantive focused service scope required: ${landing.slug}`)
  assert(landing.processSteps.length >= 3 && landing.faqs.length >= 3, `Focused workflow and visible FAQ required: ${landing.slug}`)
  assert(Array.isArray(landing.guideSlugs) && landing.guideSlugs.length >= 1 && landing.guideSlugs.length <= 2 && new Set(landing.guideSlugs).size === landing.guideSlugs.length, `Focused guides must be a curated unique shortlist: ${landing.slug}`)
}
for (const landing of allLocalContent) {
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(landing.slug), `Safe local slug required: ${landing.slug}`)
  assert(serviceContent.some((service) => service.slug === landing.serviceSlug), `Unknown local parent service: ${landing.slug}`)
  assert(typeof landing.locality === 'string' && landing.locality.length > 3, `Local service area absent: ${landing.slug}`)
  assert(landing.scopeCards.length >= 3 && landing.scopeCards.every((card) => card.title && card.text && card.items.length >= 2), `Substantive local scope required: ${landing.slug}`)
  assert(landing.processSteps.length >= 3 && landing.faqs.length >= 3, `Local workflow and FAQ required: ${landing.slug}`)
  assert(Array.isArray(landing.guideSlugs), `Local guides must be explicitly selected: ${landing.slug}`)
  assert(new Set(landing.guideSlugs).size === landing.guideSlugs.length && landing.guideSlugs.length <= 2, `Local guides must be a curated unique shortlist: ${landing.slug}`)
}
for (const landing of localContent) {
  assert(typeof landing.audience === 'string' && landing.audience.length > 30, `Specific local audience required: ${landing.slug}`)
  const expectedUpdate = landing.slug === frankfurtLandingSlug ? '2026-10-14'
    : landing.slug === 'objektbetreuung-eschborn' ? '2026-11-16' : '2026-10-07'
  assert.equal(landing.updatedOn, expectedUpdate, `Keep the actual local substantive update date, never a rolling date: ${landing.slug}`)
}
for (const landing of [...commercialContent, ...focusedContent]) {
  assert.equal(landing.updatedOn, '2026-11-16', `Keep the actual commercial publication date: ${landing.slug}`)
  assert(landing.scopeTitle && landing.scopeIntro && landing.serviceAreaText, `Commercial scope and genuine service area required: ${landing.slug}`)
  assert(landing.planning?.title && landing.planning.intro && landing.planning.headers.length >= 2 && landing.planning.rows.length >= 3, `Useful planning comparison required: ${landing.slug}`)
  assert(landing.planning.rows.every((row) => row.length === landing.planning.headers.length), `Rectangular commercial planning table required: ${landing.slug}`)
  assert(landing.detail?.title && landing.detail.text && landing.detail.image?.src && landing.detail.points.length >= 3, `Individual commercial detail and photograph required: ${landing.slug}`)
  assert(landing.cost?.title && landing.cost.text && landing.cost.factors.length >= 3, `Specific commercial quotation factors required: ${landing.slug}`)
  assert(landing.inquiry?.title && landing.inquiry.text && landing.inquiry.checklist.length >= 3, `Concrete commercial inquiry preparation required: ${landing.slug}`)
  assert(landing.guideSlugs.length >= 1, `Commercial landing requires a relevant existing guide: ${landing.slug}`)
  assert(landing.relatedLinks.length >= 2 && landing.relatedLinks.every((link) => link.label && link.path?.startsWith('/') && !link.path.startsWith('//')), `Curated local contextual links required: ${landing.slug}`)
}
assert.equal(blogByUrl.size, 10, 'Exactly ten unique blog articles required')
assert.deepEqual([...blogByUrl.keys()].sort(), expectedUrls.filter((url) => url.startsWith(new URL('blog/', site).href) && url !== new URL('blog/', site).href), 'Blog data and allowed article routes must agree')
assert.equal(blogByUrl.get(frankfurtArticleUrl)?.published, '14.10.2026', 'Keep the Frankfurt article’s actual publication date')
assert.equal(blogByUrl.get(frankfurtArticleUrl)?.updated, '14.10.2026', 'Keep the Frankfurt article’s substantive update date')
assert.equal(localByUrl.get(frankfurtLandingUrl)?.serviceSlug, 'objektpflege', 'Frankfurt landing must belong to the actual housekeeper service')
assert(localByUrl.get(frankfurtLandingUrl)?.guideSlugs.includes(frankfurtArticleSlug), 'Frankfurt landing and its commissioned article must be contextually linked')
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
// HTML attribute names are case-insensitive; React's server renderer emits
// camel-case srcSet/fetchPriority while the handcrafted pages use lowercase.
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)=["']([^"']*)["']/g)].map((match) => [match[1].toLowerCase(), match[2]]))
const markup = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map((match) => attributes(match[0]))
const fileForUrl = (url) => {
  const relative = decodeURIComponent(url.pathname.slice(site.pathname.length))
  return path.join(dist, relative, relative.endsWith('/') || !relative ? 'index.html' : '')
}
const schemaTypes = (entry) => Array.isArray(entry['@type']) ? entry['@type'] : [entry['@type']]
const businessId = `${site.href}#business`
const regionalPaths = new Set(existingPaths.filter((relative) =>
  !relative || relative === 'kontakt/' || relative.startsWith('leistungen/') || relative.startsWith('facility-management/')))
const localCopyFingerprints = new Set()
for (const landing of allLocalContent) {
  let copy = [landing.intro, landing.scopeIntro, landing.audience ?? '', landing.cost?.text ?? landing.costText, ...landing.scopeCards.map((card) => `${card.title} ${card.text} ${card.items.join(' ')}`)].join(' ').toLowerCase()
  for (const location of allLocalContent.flatMap((item) => [item.locality, item.region]).filter(Boolean)) {
    copy = copy.replaceAll(location.toLowerCase(), '[ort]')
  }
  copy = copy.replace(/\s+/g, ' ').trim()
  assert(!localCopyFingerprints.has(copy), `Do not publish city-name-swapped landing copies: ${landing.slug}`)
  localCopyFingerprints.add(copy)
}
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
  const focused = focusedByUrl.get(url.href)
  const local = localByUrl.get(url.href) ?? focused
  if (local) {
    const localService = entries.filter((entry) => schemaTypes(entry).includes('Service'))
    assert.equal(localService.length, 1, `Exactly one local Service schema required: ${url}`)
    assert.equal(localService[0].name, local.heading, `Local Service name differs from H1: ${url}`)
    assert.equal(localService[0].description, local.seoDescription, `Local Service description: ${url}`)
    assert.deepEqual(localService[0].areaServed, { '@type': 'Place', name: local.locality }, `Local service area must not invent a branch office: ${url}`)
    const breadcrumb = entries.find((entry) => schemaTypes(entry).includes('BreadcrumbList'))
    assert.deepEqual(breadcrumb?.itemListElement?.map((item) => item.item), [site.href, focused ? servicesUrl : regionsUrl, url.href], `Service breadcrumb hierarchy: ${url}`)
    if (focused) {
      const webPages = entries.filter((entry) => schemaTypes(entry).includes('WebPage'))
      assert.equal(webPages.length, 1, `Exactly one focused WebPage schema required: ${url}`)
      assert.equal(webPages[0]['@id'], `${url.href}#page`, `Stable focused page identity: ${url}`)
      assert.equal(webPages[0].url, url.href, `Focused WebPage canonical URL: ${url}`)
      assert.equal(webPages[0].name, focused.seoTitle, `Focused WebPage name: ${url}`)
      assert.equal(webPages[0].description, focused.seoDescription, `Focused WebPage description: ${url}`)
      assert.equal(webPages[0].dateModified, focused.updatedOn, `Focused WebPage actual update date: ${url}`)
      assert.equal(webPages[0].mainEntity?.['@id'], `${url.href}#service`, `Focused WebPage must identify its own offered service: ${url}`)
      assert(entries.every((entry) => !Object.hasOwn(entry, 'aggregateRating') && !schemaTypes(entry).includes('AggregateRating')), `Focused offers must not invent review-star markup: ${url}`)
      for (const faqPage of entries.filter((entry) => schemaTypes(entry).includes('FAQPage'))) {
        assert.deepEqual(faqPage.mainEntity?.map((entry) => ({ question: entry.name, answer: entry.acceptedAnswer?.text })), focused.faqs, `Optional focused FAQ schema must match the visible questions and answers: ${url}`)
      }
    }
    if (url.href === frankfurtLandingUrl) {
      assert(entries.every((entry) => !Object.hasOwn(entry, 'aggregateRating') && !schemaTypes(entry).includes('AggregateRating')), 'Frankfurt landing must not turn its own business reviews into review-star markup')
    }
  }
  if (url.href === regionsUrl) {
    assert.equal(entries.filter((entry) => schemaTypes(entry).includes('CollectionPage')).length, 1, 'Regional hub must be a CollectionPage')
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
  const robotsMeta = markup(html, 'meta').filter((meta) => meta.name?.toLowerCase() === 'robots')
  assert.equal(robotsMeta.length, 1, `Exactly one robots directive required: ${url}`)
  assert.equal(robotsMeta[0].content, expectedPageRobots, `Robots meta differs from configured indexability: ${url}`)
  if (indexingEnabled) assert(!markup(html, 'meta').some((meta) => meta.name?.toLowerCase() === 'googlebot' && /noindex|nofollow/i.test(meta.content ?? '')), `Googlebot-specific metadata must not block a public page: ${url}`)
  assert.equal(markup(html, 'meta').find((meta) => meta.name === 'twitter:card')?.content, 'summary_large_image', `Twitter card absent: ${url}`)
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `One H1 required: ${url}`)
  assert(html.includes('class="sf-footer"'), `Shared static footer absent: ${url}`)
  const footer = html.match(/<footer\b[^>]*class="sf-footer"[^>]*>([\s\S]*?)<\/footer>/)?.[1] ?? ''
  const footerHrefs = markup(footer, 'a').map(link => decodeEntities(link.href ?? ''))
  for (const group of footerGroups) {
    assert(visibleText(footer).includes(group.title), `Footer group absent: ${group.id} at ${url}`)
    for (const link of group.links) {
      const target = new URL(link.path, site)
      assert(expectedUrls.includes(target.href), `Uncommissioned footer destination: ${target}`)
      assert(footerHrefs.includes(target.pathname), `Shared footer link absent: ${target} at ${url}`)
    }
  }
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
    for (const landing of allLocalContent.filter((entry) => entry.guideSlugs.includes(post.slug))) {
      assert(articleLinks.includes(`${site.pathname}einsatzgebiete/${landing.slug}/`), `Guide must lead to its relevant local service page: ${url} -> ${landing.slug}`)
      assert(articleLinks.includes(`${site.pathname}einsatzgebiete/${landing.slug}/#anfrage`), `Guide must offer a direct local inquiry CTA: ${url} -> ${landing.slug}`)
    }
    assert.equal(sitemapLastmods.get(url.href), updated, `Article sitemap lastmod differs from actual update: ${url}`)
    await access(path.join(dist, 'assets', post.image))
  } else if (localByUrl.has(url.href) || focusedByUrl.has(url.href) || url.href === regionsUrl) {
    const updated = localByUrl.get(url.href)?.updatedOn ?? focusedByUrl.get(url.href)?.updatedOn ?? '2026-11-16'
    assert(updated <= today, `Future local publication date: ${url}`)
    assert.equal(sitemapLastmods.get(url.href), updated, `Local sitemap lastmod must match actual publication: ${url}`)
  } else if (serviceByUrl.get(url.href)?.updatedOn) {
    const updated = serviceByUrl.get(url.href).updatedOn
    assert(/^\d{4}-\d{2}-\d{2}$/.test(updated) && updated <= today && new Date(`${updated}T00:00:00Z`).toISOString().slice(0, 10) === updated, `Invalid actual service update date: ${url}`)
    assert.equal(sitemapLastmods.get(url.href), updated, `Service lastmod must match the stored substantive update: ${url}`)
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
  assert(links.includes(`${site.pathname}einsatzgebiete/`), `Crawlable regional hub link absent: ${url}`)
  pages.set(url.href, { html, ids, links })
  const focused = focusedByUrl.get(url.href)
  const local = localByUrl.get(url.href) ?? focused
  if (local) {
    const commercial = commercialByUrl.get(url.href) ?? focused
    const headline = visibleText(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '')
    assert.equal(headline, local.heading, `Local initial H1 differs from visible content: ${url}`)
    assert.equal(title, local.seoTitle)
    assert.equal(description, local.seoDescription)
    assert(mainText.length >= 2300, `Local landing needs useful individual initial copy, not an empty doorway: ${url}`)
    const requiredCopy = [local.intro, local.scopeIntro,
      ...(focused ? [focused.eyebrow, focused.heroPromise, focused.parentLabel] : []),
      ...local.scopeCards.flatMap((card) => [card.title, card.text, ...card.items]),
      ...local.processSteps.flatMap((step) => [step.title, step.text]),
      ...local.faqs.flatMap((faq) => [faq.question, faq.answer]),
      ...(commercial ? [commercial.scopeTitle, commercial.planning.title, commercial.planning.intro,
        ...commercial.planning.headers, ...commercial.planning.rows.flat(),
        ...(commercial.planning.note ? [commercial.planning.note] : []),
        commercial.detail.title, commercial.detail.text, ...commercial.detail.points,
        commercial.cost.title, commercial.cost.text, ...commercial.cost.factors,
        commercial.inquiry.title, commercial.inquiry.text, ...commercial.inquiry.checklist,
        commercial.serviceAreaText] : [local.audience, local.costTitle, local.costText]),
    ]
    for (const text of requiredCopy) {
      assert(typeof text === 'string' && text.trim(), `Local copy must be concrete text: ${url}`)
      assert(mainText.includes(text), `Local section absent from initial HTML: ${url} -> ${text.slice(0, 50)}`)
    }
    assert(mainText.includes('Sulzbach (Taunus)'), `Disclose the real company location on local landing: ${url}`)
    const mainLinks = markup(main, 'a').map((link) => decodeEntities(link.href ?? ''))
    assert(mainLinks.includes('#anfrage') && ids.has('anfrage'), `Local on-page inquiry CTA absent: ${url}`)
    assert(mainLinks.includes('tel:+491776867145') && mainLinks.includes('mailto:mail@perlas.de'), `Local no-JavaScript contact alternatives absent: ${url}`)
    assert(mainLinks.includes(`${site.pathname}leistungen/${local.serviceSlug}/`), `Local parent service link absent: ${url}`)
    assert(mainLinks.includes(`${site.pathname}${focused ? 'leistungen/' : 'einsatzgebiete/'}`), `Service hub link absent from the main content: ${url}`)
    if (focused) {
      assert(/<main\b[^>]*class="[^"]*\bfs-landing\b/.test(html), `Focused offer must use the shared clean landing renderer: ${url}`)
      assert(mainText.includes(focused.inquiry.topic ?? focused.heading), `Focused inquiry topic absent from static fallback: ${url}`)
    }
    for (const slug of local.guideSlugs) {
      const post = blogContent.find((entry) => entry.slug === slug)
      assert(post?.relatedServices.includes(local.serviceSlug), `Local guide must cover the parent service: ${url} -> ${slug}`)
      assert(mainLinks.includes(`${site.pathname}blog/${slug}/`), `Local guide link absent: ${url}`)
    }
    const hero = markup(main, 'img').find((image) => decodeEntities(image.alt ?? '') === local.heroImage.alt)
    assert(hero?.src?.includes('/optimized/') && hero.width && hero.height && hero.srcset && hero.sizes, `Responsive local hero with reserved dimensions required: ${url}`)
    assert.equal(hero.loading, 'eager', `Do not lazily load the local hero: ${url}`)
    assert.equal(hero.fetchpriority, 'high', `Local hero must be prioritized: ${url}`)
    await access(path.join(dist, 'assets', local.heroImage.src))
    if (commercial) {
      assert(!/<form\b|<input\b|<textarea\b|<select\b/.test(main), `Static commercial HTML must offer direct contact instead of a non-working form: ${url}`)
      assert(/<table\b/.test(main), `Commercial planning comparison must be a real table: ${url}`)
      const detailPhoto = markup(main, 'img').find((image) => decodeEntities(image.alt ?? '') === commercial.detail.image.alt)
      assert(detailPhoto?.src?.includes('/optimized/') && detailPhoto.width && detailPhoto.height && detailPhoto.srcset && detailPhoto.sizes, `Responsive commercial detail photograph required: ${url}`)
      assert.equal(detailPhoto.loading, 'lazy', `Below-the-fold commercial photograph should load lazily: ${url}`)
      await access(path.join(dist, 'assets', commercial.detail.image.src))
      for (const link of commercial.relatedLinks) {
        assert(mainLinks.includes(`${site.pathname}${link.path.slice(1)}`), `Commercial contextual link absent: ${url} -> ${link.path}`)
        assert(mainText.includes(link.label), `Commercial contextual link needs its descriptive label: ${url}`)
      }
      assert(markup(main, 'time').some((time) => time.datetime === commercial.updatedOn), `Visible commercial publication/update date absent: ${url}`)
    }
    if (url.href === frankfurtLandingUrl) {
      // Test the requested proof and contact elements, rather than prescribing
      // an SEO word count or an implementation-specific section layout.
      assert(mainText.includes('1999'), 'Frankfurt landing must display the established company history')
      assert(mainText.includes('Hauptstraße 1'), 'Frankfurt landing must disclose its actual Sulzbach address')
      assert(mainLinks.includes(`${site.pathname}ueber-uns/`), 'Frankfurt landing needs a verifiable company/team link')
      assert(mainLinks.includes(`${site.pathname}blog/${frankfurtArticleSlug}/`), 'Frankfurt landing needs its supporting article link')
      assert(mainLinks.includes(googleReviews.profileUrl), 'Frankfurt review summary must link to its Google source')
      const quotedReviews = googleReviews.reviews.filter((review) => mainText.includes(review.author) && mainText.includes(review.text))
      assert(quotedReviews.length >= 3, 'Frankfurt customer quotes must match the shared maintained review data')
      const realPhotoSources = new Set(Object.entries(imageVariants)
        .filter(([original]) => original.startsWith('kundenbilder/') && !/\bvisualisierungen\b|_ki\./i.test(original))
        .map(([, variant]) => new URL(`assets/${variant.src}`, site).href))
      const photos = markup(main, 'img').filter((image) => image.src && realPhotoSources.has(new URL(decodeEntities(image.src), url).href))
      assert(new Set(photos.map((image) => image.src)).size >= 3, 'Frankfurt landing needs multiple distinct existing customer photographs')
      for (const image of photos) {
        assert(image.alt?.trim(), 'Frankfurt customer photographs need descriptive alternative text')
        assert(image.width && image.height && image.srcset && image.sizes, 'Frankfurt customer photographs need responsive sources and reserved dimensions')
      }
    }
  }
  if (url.href === regionsUrl) {
    assert.equal(visibleText(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? ''), seoContent.pages.regions.heading ?? 'Leistungen für Ihren Standort.', 'Regional hub H1 differs from content')
    for (const landing of allLocalContent) assert(markup(main, 'a').some((link) => link.href === `${site.pathname}einsatzgebiete/${landing.slug}/`), `Local page orphaned from its hub: ${landing.slug}`)
  }
  if (url.href === servicesUrl) {
    const overviewLinks = markup(main, 'a').map((link) => decodeEntities(link.href ?? ''))
    for (const focused of focusedContent) {
      assert(overviewLinks.includes(`${site.pathname}${focused.path.slice(1)}`), `Focused offer needs a crawlable services-overview link: ${focused.slug}`)
    }
  }
  const service = serviceByUrl.get(url.href)
  if (service) {
    assert.equal(visibleText(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? ''), service.heading ?? service.title, `Service initial H1 differs from content: ${url}`)
    if (service.guideSlugs) {
      assert(service.guideSlugs.length >= 1 && service.guideSlugs.length <= 2 && new Set(service.guideSlugs).size === service.guideSlugs.length, `Service guides must be a curated unique shortlist: ${url}`)
      for (const slug of service.guideSlugs) {
        const guide = blogContent.find((post) => post.slug === slug)
        assert(guide?.relatedServices.includes(service.slug), `Guide must exist and cover this service: ${url} -> ${slug}`)
        const guideLink = `${site.pathname}blog/${slug}/`
        assert(markup(main, 'a').some((link) => link.href === guideLink), `Contextual service guide link absent from initial main: ${url}`)
        assert(mainText.includes(guide.title), `Descriptive guide title absent: ${url}`)
      }
    }
    for (const local of allLocalContent.filter((landing) => landing.serviceSlug === service.slug)) {
      assert(markup(main, 'a').some((link) => link.href === `${site.pathname}einsatzgebiete/${local.slug}/`), `Local page needs a relevant parent-service incoming link: ${local.slug}`)
    }
    for (const focused of focusedContent.filter((landing) => landing.serviceSlug === service.slug)) {
      assert(markup(main, 'a').some((link) => link.href === `${site.pathname}${focused.path.slice(1)}`), `Focused offer needs a relevant parent-service incoming link: ${focused.slug}`)
    }
  }
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
const blogIndex = pages.get(new URL('blog/', site).href).html
const firstBlogArticle = blogIndex.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? ''
assert(markup(firstBlogArticle, 'a').some((link) => link.href === `${site.pathname}blog/${frankfurtArticleSlug}/`), 'Frankfurt article must be the featured article on the blog index')
const commissionedBlogs = blogContent.filter((post) => ['07.10.2026', '14.10.2026'].includes(post.published))
for (const post of commissionedBlogs) assert(serviceContent.some((service) => service.guideSlugs?.includes(post.slug)), `New article requires a contextual service incoming link: ${post.slug}`)
const legacyManifest = JSON.parse(await readFile(path.join(workspace, 'src/legacy-redirects.json'), 'utf8'))
const redirects = validateLegacyRedirects(legacyManifest, site, expectedUrls)
assert.equal(redirects.length, 13, 'Only the thirteen approved legacy redirects are allowed')
for (const redirect of redirects) {
  const html = await readFile(fileForUrl(redirect.from), 'utf8')
  assert(!expectedUrls.includes(redirect.from.href), 'Redirects must not be in the sitemap')
  assert.equal(markup(html, 'meta').find((meta) => meta['http-equiv'] === 'refresh')?.content, `0; url=${redirect.target.href}`)
  assert.equal(markup(html, 'link').find((link) => link.rel === 'canonical')?.href, redirect.target.href)
  assert.deepEqual(markup(html, 'a').map((link) => link.href), [redirect.target.href])
  assert(!/<script\b|noindex|nofollow/i.test(html), 'Instant redirect must not depend on JavaScript or block discovery')
  assert(!html.includes('assets/'), 'Legacy redirect must not load application/analytics assets')
  await access(fileForUrl(redirect.target))
}
console.log(`SEO build checks passed: ${urls.length} allowed canonical pages including ${localByUrl.size} local service landings, ${focusedByUrl.size} focused service offers and ${blogByUrl.size} articles, ${redirects.length} exact instant redirects, metadata/schema, substantive dates/lastmod, individual initial HTML, contextual service/article/local links, responsive assets and 404.`)
