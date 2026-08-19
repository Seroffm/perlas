import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const distPath = fileURLToPath(new URL('../dist/', import.meta.url))
const indexPath = fileURLToPath(new URL('../dist/index.html', import.meta.url))
const serviceDataPath = fileURLToPath(new URL('../src/service-data.json', import.meta.url))
const appPath = fileURLToPath(new URL('../src/App.tsx', import.meta.url))
const contactPagePath = fileURLToPath(new URL('../src/ContactPage.tsx', import.meta.url))
const sourceIndexPath = fileURLToPath(new URL('../index.html', import.meta.url))
const siteUrl = new URL(process.env.PERLAS_SITE_URL ?? 'https://seroffm.github.io/perlas/')
const basePath = siteUrl.pathname.endsWith('/') ? siteUrl.pathname : `${siteUrl.pathname}/`
const indexingOverride = process.env.PERLAS_INDEX_SITE
const indexingEnabled = indexingOverride == null
  ? !siteUrl.hostname.endsWith('github.io')
  : indexingOverride === 'true'
const pageRobots = indexingEnabled ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'
const services = JSON.parse(await readFile(serviceDataPath, 'utf8'))
const coreServiceSlugs = new Set([
  'objektpflege',
  'wartung-instandhaltung',
  'gebaeudereinigung',
  'gartenpflege',
  'winterdienst',
])
const indexTemplate = await readFile(indexPath, 'utf8')

const sourceStats = await Promise.all([serviceDataPath, appPath, contactPagePath, sourceIndexPath].map((path) => stat(path)))
const lastModified = new Date(Math.max(...sourceStats.map((entry) => entry.mtimeMs)))
  .toISOString()
  .slice(0, 10)

const homeSeo = {
  title: 'Perla’s Facility Services | Objektbetreuung Rhein-Main',
  description: 'Perla’s bündelt Facility Services und professionelle Objektbetreuung für Hausverwaltungen, Wohnanlagen und Gewerbeimmobilien im Rhein-Main-Gebiet.',
  url: siteUrl.href,
}

const contactUrl = new URL(`${basePath}kontakt/`, siteUrl.origin)
const contactSeo = {
  title: 'Kontakt & Anfrage | Perla’s Facility Services',
  description: 'Kontaktieren Sie Perla’s per Telefon, E-Mail, WhatsApp oder Anfrageformular und besprechen Sie die Betreuung Ihrer Immobilie im Rhein-Main-Gebiet.',
  url: contactUrl.href,
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const businessId = `${siteUrl.href}#business`
const businessData = {
  '@type': 'HomeAndConstructionBusiness',
  '@id': businessId,
  name: 'Perla’s Objektbetreuung',
  url: siteUrl.href,
  telephone: '+49 177 6867145',
  email: 'mail@perlas.de',
  foundingDate: '1999',
  image: new URL(`${basePath}assets/perlas-hero.png`, siteUrl.origin).href,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Hauptstraße 1',
    postalCode: '65843',
    addressLocality: 'Sulzbach (Taunus)',
    addressCountry: 'DE',
  },
  areaServed: ['Main-Taunus-Kreis', 'Rhein-Main-Gebiet'],
}

function serviceUrl(service) {
  return new URL(`${basePath}leistungen/${service.slug}/`, siteUrl.origin)
}

function structuredData(service) {
  if (!service) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        businessData,
        {
          '@type': 'WebSite',
          '@id': `${siteUrl.href}#website`,
          url: siteUrl.href,
          name: 'PERLAS',
          alternateName: 'Perla’s Objektbetreuung',
          inLanguage: 'de-DE',
        },
      ],
    }
  }

  const url = serviceUrl(service).href
  return {
    '@context': 'https://schema.org',
    '@graph': [
      businessData,
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: service.title,
        description: service.detail,
        url,
        provider: { '@id': businessId },
        areaServed: ['Main-Taunus-Kreis', 'Rhein-Main-Gebiet'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Startseite', item: siteUrl.href },
          { '@type': 'ListItem', position: 2, name: 'Leistungen', item: `${siteUrl.href}#leistungen` },
          { '@type': 'ListItem', position: 3, name: service.title, item: url },
        ],
      },
    ],
  }
}

function contactStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      businessData,
      {
        '@type': 'ContactPage',
        '@id': `${contactUrl.href}#contact-page`,
        url: contactUrl.href,
        name: 'Kontakt zu Perla’s Objektbetreuung',
        description: contactSeo.description,
        inLanguage: 'de-DE',
        mainEntity: { '@id': businessId },
      },
    ],
  }
}

function serviceLinks(currentSlug, coreOnly = false) {
  return services
    .filter((service) => service.slug !== currentSlug && (!coreOnly || coreServiceSlugs.has(service.slug)))
    .map((service) => `<li><a href="${basePath}leistungen/${service.slug}/">${escapeHtml(service.title)}</a></li>`)
    .join('')
}

function relatedServiceLinks(service) {
  return service.relatedServices
    .map((slug) => services.find((entry) => entry.slug === slug))
    .filter(Boolean)
    .map((entry) => `<li><a href="${basePath}leistungen/${entry.slug}/">${escapeHtml(entry.title)}</a><p>${escapeHtml(entry.text)}</p></li>`)
    .join('')
}

function staticHeader() {
  return `<header class="seo-static-header"><a href="${basePath}">PERLAS</a><nav aria-label="Hauptnavigation"><a href="${basePath}#facility-services">Facility Services</a><a href="${basePath}#objekte">Objekte</a><a href="${basePath}#leistungen">Leistungen</a><a href="${basePath}#ueber-uns">Über uns</a><a href="${basePath}kontakt/">Kontakt</a></nav></header>`
}

function homeMarkup() {
  return `${staticHeader()}<main class="seo-static-main"><section class="seo-static-hero"><p>Facility Services im Rhein-Main-Gebiet</p><h1>Ganzheitliche Betreuung für professionell verwaltete Immobilien.</h1><p>Perla’s bündelt Objektbetreuung, technische Themen, Reinigung, Außenanlagenpflege und Winterdienst. Hausverwaltungen und gewerbliche Auftraggeber erhalten einen festen Ansprechpartner für die laufenden Aufgaben ihrer Immobilien.</p><a href="${basePath}kontakt/">Betreuung anfragen</a></section><section id="facility-services"><h2>Mehrere Leistungen. Ein abgestimmtes Betreuungskonzept.</h2><p>Aufgaben, Leistungsintervalle und Zuständigkeiten werden für die laufende Betreuung klar koordiniert und nachvollziehbar dokumentiert.</p><ul class="seo-static-links">${serviceLinks(undefined, true)}</ul><p>Ergänzende Leistung: <a href="${basePath}leistungen/wohnungswechsel/">Wohnungswechsel &amp; Räumung</a></p></section><section id="objekte"><h2>Lösungen für professionell verwaltete Objekte</h2><p>Unsere Facility Services richten sich an Hausverwaltungen, größere Wohnanlagen, Gewerbeimmobilien, Unternehmensstandorte sowie Büro-, Praxis- und institutionelle Gebäude.</p></section><section id="leistungen"><h2>Kernleistungen für den laufenden Immobilienbetrieb</h2><p>Objektpflege, Wartung, Gebäudereinigung, Außenanlagenpflege und Winterdienst werden passend zu Objekt und Nutzung zusammengestellt.</p></section></main>`
}

function contactMarkup() {
  const steps = [
    ['01', 'Anfrage senden', 'Kontakt per Formular, Telefon, E-Mail oder WhatsApp.'],
    ['02', 'Objekt vor Ort besprechen', 'Flächen, Anforderungen und Besonderheiten werden bei Bedarf gemeinsam aufgenommen.'],
    ['03', 'Leistungen und Intervalle festlegen', 'Aufgaben sowie Reinigungs-, Kontroll-, Wartungs- und Pflegeintervalle werden abgestimmt.'],
    ['04', 'Individuelles Angebot', 'Perla’s erstellt ein Angebot für den vereinbarten Leistungsumfang.'],
    ['05', 'Betreuung starten', 'Ansprechpartner, Termine und organisatorische Abläufe werden geklärt.'],
  ].map(([number, title, text]) => `<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><section class="seo-static-hero"><p>Kontakt zu Perla’s</p><h1>Lassen Sie uns über Ihr Objekt sprechen.</h1><p>Besprechen Sie einzelne Leistungen oder ein abgestimmtes Betreuungskonzept für Ihre Immobilie im Rhein-Main-Gebiet.</p><a href="tel:+491776867145">Direkt anrufen</a></section><section><h2>So erreichen Sie uns</h2><ul><li><a href="tel:+491776867145">Telefon: 0177 68 67 145</a></li><li><a href="mailto:mail@perlas.de">E-Mail: mail@perlas.de</a></li><li>Hauptstraße 1, 65843 Sulzbach (Taunus)</li><li><a href="https://www.google.com/maps/dir/?api=1&amp;destination=Hauptstra%C3%9Fe%201%2C%2065843%20Sulzbach%20(Taunus)%2C%20Deutschland">Route in Google Maps öffnen</a></li></ul></section><section><h2>So läuft Ihre Anfrage ab</h2><div class="seo-static-grid">${steps}</div></section></main>`
}

function serviceMarkup(service) {
  const scopes = service.scopeCards.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p><ul>${item.items.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul></article>`).join('')
  const process = service.processSteps.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join('')
  const audiences = service.audiences.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const faqs = service.faqs.map((item) => `<details open><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')
  const related = relatedServiceLinks(service)

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / <a href="${basePath}#leistungen">Leistungen</a> / ${escapeHtml(service.title)}</nav><section class="seo-static-hero"><p>Facility Services im Rhein-Main-Gebiet</p><h1>${escapeHtml(service.title)}</h1><p>${escapeHtml(service.detail)}</p><a href="${basePath}kontakt/">Individuelles Angebot anfragen</a><a href="tel:+491776867145">Direkt anrufen</a><a href="mailto:mail@perlas.de">E-Mail schreiben</a></section><section><h2>Was wir bei ${escapeHtml(service.title)} konkret übernehmen</h2><p>${escapeHtml(service.scopeIntro)}</p><div class="seo-static-grid">${scopes}</div></section><section><h2>So läuft die Zusammenarbeit ab</h2><div class="seo-static-grid">${process}</div></section><section><h2>Für diese Objekte geeignet</h2><ul>${audiences}</ul><h2>${escapeHtml(service.boundaryTitle)}</h2><p>${escapeHtml(service.boundaryText)}</p></section><section><h2>Häufige Fragen zu ${escapeHtml(service.title)}</h2>${faqs}</section><section><h2>Wie möchten Sie Kontakt aufnehmen?</h2><p>Nutzen Sie das Angebotsformular oder sprechen Sie direkt mit Perla’s.</p><ul><li><a href="${basePath}kontakt/">Angebot für ${escapeHtml(service.title)} anfragen</a></li><li><a href="tel:+491776867145">Direkt anrufen: 0177 68 67 145</a></li><li><a href="mailto:mail@perlas.de">E-Mail an mail@perlas.de schreiben</a></li></ul></section><nav aria-label="Passende Leistungen"><h2>Diese Leistungen könnten ebenfalls relevant sein</h2><ul class="seo-static-links">${related}</ul></nav></main>`
}

function buildPage({ title, description, url, markup, data, robots = pageRobots }) {
  const socialImage = new URL(`${basePath}assets/perlas-hero.png`, siteUrl.origin).href
  const extraHead = `
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:locale" content="de_DE" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="PERLAS" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${socialImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <script id="perlas-structured-data" type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`

  return indexTemplate
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace('</head>', `${extraHead}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
}

const homePage = buildPage({ ...homeSeo, markup: homeMarkup(), data: structuredData() })
await writeFile(indexPath, homePage)
await writeFile(`${distPath}404.html`, buildPage({
  ...homeSeo,
  markup: homeMarkup(),
  data: structuredData(),
  robots: 'noindex,follow',
}))
await writeFile(`${distPath}.nojekyll`, '')

await mkdir(`${distPath}kontakt/`, { recursive: true })
await writeFile(`${distPath}kontakt/index.html`, buildPage({
  ...contactSeo,
  markup: contactMarkup(),
  data: contactStructuredData(),
}))

await Promise.all(services.map(async (service) => {
  const targetPath = `${distPath}leistungen/${service.slug}/`
  const url = serviceUrl(service).href
  await mkdir(targetPath, { recursive: true })
  await writeFile(`${targetPath}index.html`, buildPage({
    title: service.seoTitle,
    description: service.seoDescription,
    url,
    markup: serviceMarkup(service),
    data: structuredData(service),
  }))
}))

const sitemapUrls = [siteUrl.href, contactUrl.href, ...services.map((service) => serviceUrl(service).href)]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <url><loc>${url}</loc><lastmod>${lastModified}</lastmod></url>`).join('\n')}
</urlset>
`
const robots = indexingEnabled
  ? `User-agent: *
Allow: ${basePath}

Sitemap: ${new URL(`${basePath}sitemap.xml`, siteUrl.origin).href}
`
  : `User-agent: *
Disallow: ${basePath}
`

await writeFile(`${distPath}sitemap.xml`, sitemap)
await writeFile(`${distPath}robots.txt`, robots)
