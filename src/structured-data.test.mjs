import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPageStructuredData } from './structured-data.mjs'

const base = {
  siteUrl: 'https://perlas.de/',
  title: 'Gebäudereinigung Frankfurt | Perla’s',
  description: 'Reinigung für Ihr Objekt in Frankfurt persönlich abstimmen.',
  areaServed: ['Sulzbach (Taunus)', 'Main-Taunus-Kreis', 'Rhein-Main-Gebiet'],
}

test('a local offer links a real service and keeps the actual Sulzbach business address', () => {
  const url = 'https://perlas.de/einsatzgebiete/gebaeudereinigung-frankfurt/'
  const data = buildPageStructuredData({
    ...base,
    pageUrl: url,
    modified: '2026-11-17',
    service: { name: 'Gebäudereinigung Frankfurt', description: base.description, areaServed: { '@type': 'Place', name: 'Frankfurt am Main' } },
    breadcrumbs: [
      { name: 'Startseite', url: base.siteUrl },
      { name: 'Einsatzgebiete', url: 'https://perlas.de/einsatzgebiete/' },
      { name: 'Gebäudereinigung Frankfurt', url },
    ],
  })
  const page = data['@graph'].find((entry) => entry['@type'] === 'WebPage')
  const service = data['@graph'].find((entry) => entry['@id'] === page.mainEntity['@id'])
  const business = data['@graph'].find((entry) => entry['@id'] === service.provider['@id'])
  assert.equal(service.areaServed.name, 'Frankfurt am Main')
  assert.equal(business.address.addressLocality, 'Sulzbach (Taunus)')
  assert.equal(business.address.postalCode, '65843')
  assert.equal(page.breadcrumb['@id'], `${url}#breadcrumb`)
  assert.equal(page.dateModified, '2026-11-17')
  assert(data['@graph'].every((entry) => !('aggregateRating' in entry)))
})

test('home and child identities respect a configured deployment subpath', () => {
  const siteUrl = 'https://example.test/perlas/'
  const data = buildPageStructuredData({ ...base, siteUrl })
  const page = data['@graph'].find((entry) => entry['@type'] === 'WebPage')
  const website = data['@graph'].find((entry) => entry['@id'] === page.isPartOf['@id'])
  assert.equal(website.url, siteUrl)
  assert.equal(page['@id'], `${siteUrl}#page`)
  assert(!data['@graph'].some((entry) => entry['@type'] === 'BreadcrumbList'))
  assert(!('potentialAction' in website), 'Do not invent a site search that does not exist')
  assert.throws(() => buildPageStructuredData({ ...base, siteUrl, pageUrl: 'https://example.test/other/' }))
  assert.throws(() => buildPageStructuredData({ ...base, pageUrl: 'https://other.example/' }))
  assert.throws(() => buildPageStructuredData({ ...base, pageUrl: 'https://perlas.de/?duplicate=1' }))
})

test('article dates preserve publication history and reject impossible updates', () => {
  const article = { headline: 'Reinigung richtig planen', image: 'assets/article.webp', datePublished: '2026-10-07', dateModified: '2026-11-17' }
  const data = buildPageStructuredData({ ...base, pageUrl: 'https://perlas.de/blog/reinigung-planen/', article })
  const page = data['@graph'].find((entry) => entry['@type'] === 'WebPage')
  const post = data['@graph'].find((entry) => entry['@id'] === page.mainEntity['@id'])
  assert.equal(post.datePublished, '2026-10-07')
  assert.equal(page.dateModified, post.dateModified)
  assert.equal(post.author['@type'], 'Organization')
  assert.throws(() => buildPageStructuredData({ ...base, article: { ...article, dateModified: '2026-02-30' } }))
  assert.throws(() => buildPageStructuredData({ ...base, article: { ...article, dateModified: '2026-10-06' } }))
})
