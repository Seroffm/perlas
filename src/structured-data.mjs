// One schema builder for the static HTML and the browser. It describes only
// published company details and the service/article actually shown on the page.
const pageTypes = new Set(['WebPage', 'AboutPage', 'ContactPage', 'CollectionPage'])

function isoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Invalid schema date: ${value}`)
  const date = new Date(`${value}T00:00:00Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid schema calendar date: ${value}`)
  }
  return value
}

export function buildPageStructuredData(options) {
  const site = new URL(options.siteUrl)
  if (!site.pathname.endsWith('/')) site.pathname += '/'
  const url = new URL(options.pageUrl ?? site.href, site)
  if (url.origin !== site.origin || !url.pathname.startsWith(site.pathname) || url.search || url.hash) {
    throw new Error(`Schema page must use a canonical URL within the site: ${url.href}`)
  }
  const pageType = options.pageType ?? 'WebPage'
  if (!pageTypes.has(pageType)) throw new Error(`Unsupported page schema type: ${pageType}`)
  if (options.service && options.article) throw new Error('A page cannot be both a service offer and a blog article')

  const businessId = `${site.href}#business`
  const websiteId = `${site.href}#website`
  const pageId = `${url.href}#page`
  const business = {
    '@type': 'LocalBusiness',
    '@id': businessId,
    name: 'Perla’s Objektbetreuung',
    url: site.href,
    telephone: '+49 177 6867145',
    email: 'mail@perlas.de',
    foundingDate: '1999',
    image: new URL('assets/kundenbilder/objekte/wohnanlage_modern_02.png', site).href,
    logo: new URL('assets/perlas-logo.svg', site).href,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Hauptstraße 1',
      postalCode: '65843',
      addressLocality: 'Sulzbach (Taunus)',
      addressCountry: 'DE',
    },
    areaServed: options.areaServed,
    sameAs: [
      'https://www.google.com/maps?cid=5731639589734766671',
      'https://trustlocal.de/hessen/sulzbach/entrumpelung/perlas-objektbetreuung-gmbh-co-kg/',
      'https://www.youtube.com/@perlasobjektbetreuung',
      'https://www.linkedin.com/company/97661595/',
      'https://www.instagram.com/perlas_objektbetreuung/',
    ],
  }
  const page = {
    '@type': pageType,
    '@id': pageId,
    url: url.href,
    name: options.title,
    description: options.description,
    inLanguage: 'de-DE',
    isPartOf: { '@id': websiteId },
    about: { '@id': businessId },
    mainEntity: { '@id': options.service ? `${url.href}#service` : options.article ? `${url.href}#article` : businessId },
  }
  if (options.imageUrl) page.primaryImageOfPage = new URL(options.imageUrl, site).href
  if (options.modified) page.dateModified = isoDate(options.modified)

  const graph = [business, page]
  if (url.href === site.href) {
    graph.push({
      '@type': 'WebSite',
      '@id': websiteId,
      url: site.href,
      name: 'PERLAS',
      alternateName: 'Perla’s Objektbetreuung',
      inLanguage: 'de-DE',
      publisher: { '@id': businessId },
    })
  }
  if (options.service) {
    const service = {
      '@type': 'Service',
      '@id': `${url.href}#service`,
      name: options.service.name,
      description: options.service.description,
      url: url.href,
      provider: { '@id': businessId },
      areaServed: options.service.areaServed,
    }
    if (options.service.audienceType) {
      service.audience = { '@type': 'Audience', audienceType: options.service.audienceType }
    }
    graph.push(service)
  }
  if (options.article) {
    const published = isoDate(options.article.datePublished)
    const modified = isoDate(options.article.dateModified)
    if (modified < published) throw new Error(`Article modified before publication: ${url.href}`)
    page.dateModified = modified
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${url.href}#article`,
      headline: options.article.headline,
      description: options.description,
      image: new URL(options.article.image, site).href,
      datePublished: published,
      dateModified: modified,
      inLanguage: 'de-DE',
      author: { '@type': 'Organization', name: 'Perla’s Objektbetreuung GmbH & Co. KG', url: site.href },
      publisher: { '@id': businessId },
      mainEntityOfPage: url.href,
    })
  }
  if (options.breadcrumbs?.length) {
    if (options.breadcrumbs.length < 2) throw new Error(`Breadcrumb requires a real hierarchy: ${url.href}`)
    const items = options.breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.url, site).href,
    }))
    if (items[0].item !== site.href || items.at(-1).item !== url.href || url.href === site.href) {
      throw new Error(`Breadcrumb must connect the home page to its current page: ${url.href}`)
    }
    const breadcrumbId = `${url.href}#breadcrumb`
    page.breadcrumb = { '@id': breadcrumbId }
    graph.push({ '@type': 'BreadcrumbList', '@id': breadcrumbId, itemListElement: items })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}
