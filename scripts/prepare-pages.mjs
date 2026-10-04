import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const distPath = fileURLToPath(new URL('../dist/', import.meta.url))
const indexPath = fileURLToPath(new URL('../dist/index.html', import.meta.url))
const serviceDataPath = fileURLToPath(new URL('../src/service-data.json', import.meta.url))
const audienceDataPath = fileURLToPath(new URL('../src/audience-data.json', import.meta.url))
const blogDataPath = fileURLToPath(new URL('../src/blog-data.json', import.meta.url))
const jobDataPath = fileURLToPath(new URL('../src/job-data.json', import.meta.url))
const imprintDataPath = fileURLToPath(new URL('../src/imprint-content.json', import.meta.url))
const privacyDataPath = fileURLToPath(new URL('../src/privacy-content.json', import.meta.url))
const googleReviewsDataPath = fileURLToPath(new URL('../src/google-reviews-data.json', import.meta.url))
const imageVariantsPath = fileURLToPath(new URL('../src/image-variants.json', import.meta.url))
const buildEnv = loadEnv('production', fileURLToPath(new URL('../', import.meta.url)), '')
const siteUrl = new URL(buildEnv.PERLAS_SITE_URL ?? 'https://seroffm.github.io/perlas/')
const basePath = siteUrl.pathname.endsWith('/') ? siteUrl.pathname : `${siteUrl.pathname}/`
const indexingOverride = buildEnv.PERLAS_INDEX_SITE
const indexingEnabled = indexingOverride == null
  ? !siteUrl.hostname.endsWith('github.io')
  : indexingOverride === 'true'
const pageRobots = indexingEnabled ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'
const services = JSON.parse(await readFile(serviceDataPath, 'utf8'))
const audiences = JSON.parse(await readFile(audienceDataPath, 'utf8'))
const blogPosts = JSON.parse(await readFile(blogDataPath, 'utf8'))
const jobs = JSON.parse(await readFile(jobDataPath, 'utf8'))
const imprintContent = JSON.parse(await readFile(imprintDataPath, 'utf8'))
const privacyContent = JSON.parse(await readFile(privacyDataPath, 'utf8'))
const googleReviewData = JSON.parse(await readFile(googleReviewsDataPath, 'utf8'))
const imageVariants = JSON.parse(await readFile(imageVariantsPath, 'utf8'))
const featuredBlogPostSlug = 'objektkontrollen-richtig-dokumentieren'
const coreServiceSlugs = new Set([
  'objektpflege',
  'wartung-instandhaltung',
  'gebaeudereinigung',
  'gartenpflege',
  'winterdienst',
  'muellmanagement',
])
const specializedDetailSlugs = new Set([
  'baumpflege-baumfaellung',
  'spielplatzkontrolle-spielgeraetewartung',
  'buero-einrichtungsservice',
])
const indexTemplate = await readFile(indexPath, 'utf8')
// Discover Vite's content-hashed fonts so the first viewport need not wait for CSS parsing.
const fontFiles = (await readdir(`${distPath}assets`))
  .filter((filename) => /^inter-latin-(?:400|800)-normal-[\w-]+\.woff2$/.test(filename))
  .sort()
if (fontFiles.length !== 2) throw new Error('Expected the two Latin Inter WOFF2 fonts in the production build.')
const fontPreloads = fontFiles
  .map((filename) => `<link rel="preload" href="${basePath}assets/${filename}" as="font" type="font/woff2" crossorigin>`)
  .join('\n    ')

const homeSeo = {
  title: 'Perla’s Facility Management | Objektbetreuung Rhein-Main',
  description: 'Perla’s bündelt Facility Management und professionelle Objektbetreuung für Hausverwaltungen, Wohnanlagen und Gewerbeimmobilien im Rhein-Main-Gebiet.',
  url: siteUrl.href,
}

const contactUrl = new URL(`${basePath}kontakt/`, siteUrl.origin)
const contactSeo = {
  title: 'Kontakt & Anfrage | Perla’s Facility Management',
  description: 'Kontaktieren Sie Perla’s per Telefon, E-Mail, WhatsApp oder Anfrageformular und besprechen Sie die Betreuung Ihrer Immobilie im Rhein-Main-Gebiet.',
  url: contactUrl.href,
}

const facilityUrl = new URL(`${basePath}facility-management/`, siteUrl.origin)
const facilitySeo = {
  title: 'Facility Management Rhein-Main | Perla’s Objektbetreuung',
  description: 'Facility Management für Hausverwaltungen, größere Wohnanlagen, Gewerbeimmobilien sowie institutionelle und öffentliche Gebäude im Rhein-Main-Gebiet.',
  url: facilityUrl.href,
}

const servicesUrl = new URL(`${basePath}leistungen/`, siteUrl.origin)
const servicesSeo = {
  title: 'Leistungen für Immobilien | Perla’s Rhein-Main',
  description: 'Objektpflege, Wartung, Gebäudereinigung, Gartenpflege, Winterdienst, Müllmanagement und Einzelaufträge von Perla’s im Rhein-Main-Gebiet.',
  url: servicesUrl.href,
}

const aboutUrl = new URL(`${basePath}ueber-uns/`, siteUrl.origin)
const aboutSeo = {
  title: 'Über Perla’s | Objektbetreuung seit 1999',
  description: 'Lernen Sie Perla’s Objektbetreuung, die Arbeitsweise und die Werte hinter dem Facility Management im Rhein-Main-Gebiet kennen.',
  url: aboutUrl.href,
}

const blogUrl = new URL(`${basePath}blog/`, siteUrl.origin)
const blogSeo = {
  title: 'Blog: Wissen zur Objektbetreuung | Perla’s',
  description: 'Praxiswissen zu Facility Management, Objektbetreuung, Gebäudereinigung, Außenanlagen und saisonaler Planung im Rhein-Main-Gebiet.',
  url: blogUrl.href,
}

const careerUrl = new URL(`${basePath}karriere/`, siteUrl.origin)
const careerSeo = {
  title: 'Karriere & Jobs | Perla’s Objektbetreuung',
  description: 'Arbeiten bei Perla’s: Einsatzbereiche in Objektbetreuung, Gebäudereinigung und Außenanlagenpflege im Rhein-Main-Gebiet kennenlernen.',
  url: careerUrl.href,
}

const imprintUrl = new URL(`${basePath}impressum/`, siteUrl.origin)
const imprintSeo = {
  title: 'Impressum | Perla’s Objektbetreuung',
  description: 'Impressum und Anbieterkennzeichnung von Perla’s Objektbetreuung im Rhein-Main-Gebiet.',
  url: imprintUrl.href,
}

const privacyUrl = new URL(`${basePath}datenschutz/`, siteUrl.origin)
const privacySeo = {
  title: 'Datenschutz | Perla’s Objektbetreuung',
  description: 'Datenschutzerklärung von Perla’s Objektbetreuung mit Informationen zu Datenverarbeitung, Cookies, Kontaktwegen und Betroffenenrechten.',
  url: privacyUrl.href,
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const fullImageSizes = '(max-width: 1087px) calc(100vw - 48px), 1040px'
const gridImageSizes = '(max-width: 760px) calc(100vw - 48px), (max-width: 1087px) calc((100vw - 84px) / 3), 334px'
const homeHeroImageSizes = '(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 45vw, 600px'
const detailHeroImageSizes = '(max-width: 767px) calc(100vw - 40px), 600px'
const blogHeroImageSizes = '(max-width: 767px) calc(100vw - 40px), 900px'
const careerHeroImageSizes = '(max-width: 767px) calc(100vw - 40px), 50vw'

function imageMarkup(src, alt, { sizes, loading = 'lazy', fetchPriority } = {}) {
  const imageSizes = sizes ?? (loading === 'eager' ? detailHeroImageSizes : fullImageSizes)
  const variants = imageVariants[src]
  const imageSrc = `${basePath}assets/${variants?.src ?? src}`
  const srcSet = variants?.srcSet
    .split(',')
    .map((candidate) => `${basePath}assets/${candidate.trim()}`)
    .join(', ')
  const dimensions = variants ? ` width="${variants.width}" height="${variants.height}"` : ''
  const responsiveAttributes = srcSet ? ` srcset="${escapeHtml(srcSet)}" sizes="${escapeHtml(imageSizes)}"` : ''
  const priorityAttribute = fetchPriority ? ` fetchpriority="${escapeHtml(fetchPriority)}"` : ''

  return `<img class="seo-static-image" src="${escapeHtml(imageSrc)}" alt="${escapeHtml(alt)}"${responsiveAttributes}${dimensions} loading="${escapeHtml(loading)}" decoding="async"${priorityAttribute}>`
}

const businessId = `${siteUrl.href}#business`
const businessData = {
  '@type': 'HomeAndConstructionBusiness',
  '@id': businessId,
  name: 'Perla’s Objektbetreuung',
  url: siteUrl.href,
  telephone: '+49 177 6867145',
  email: 'mail@perlas.de',
  foundingDate: '1999',
  image: new URL(`${basePath}assets/kundenbilder/objekte/wohnanlage_modern_02.png`, siteUrl.origin).href,
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

function audienceUrl(audience) {
  return new URL(`${basePath}facility-management/${audience.id}/`, siteUrl.origin)
}

function blogPostUrl(post) {
  return new URL(`${basePath}blog/${post.slug}/`, siteUrl.origin)
}

function blogDateToIso(value) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value)
  return match ? `${match[3]}-${match[2]}-${match[1]}` : undefined
}

function audienceStructuredData(audience) {
  const url = audienceUrl(audience).href
  return {
    '@context': 'https://schema.org',
    '@graph': [
      businessData,
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: `Facility Management für ${audience.navLabel}`,
        description: audience.seoDescription,
        url,
        provider: { '@id': businessId },
        areaServed: ['Main-Taunus-Kreis', 'Rhein-Main-Gebiet'],
        audience: {
          '@type': 'Audience',
          audienceType: audience.navLabel,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Startseite', item: siteUrl.href },
          { '@type': 'ListItem', position: 2, name: 'Facility Management', item: facilityUrl.href },
          { '@type': 'ListItem', position: 3, name: audience.navLabel, item: url },
        ],
      },
    ],
  }
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
          { '@type': 'ListItem', position: 2, name: 'Leistungen', item: servicesUrl.href },
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

function facilityStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      businessData,
      {
        '@type': 'WebPage',
        '@id': `${facilityUrl.href}#facility-management`,
        url: facilityUrl.href,
        name: 'Facility Management von Perla’s Objektbetreuung',
        description: facilitySeo.description,
        inLanguage: 'de-DE',
        mainEntity: { '@id': businessId },
      },
    ],
  }
}

function pageStructuredData({ type, url, name, description }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      businessData,
      {
        '@type': type,
        '@id': `${url}#page`,
        url,
        name,
        description,
        inLanguage: 'de-DE',
        mainEntity: { '@id': businessId },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Startseite', item: siteUrl.href },
          { '@type': 'ListItem', position: 2, name, item: url },
        ],
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

const logoMarkup = `<img src="${basePath}assets/perlas-logo.svg" width="1683" height="368" alt="Perla’s Objektbetreuung GmbH &amp; Co. KG">`

function staticHeader() {
  return `<header class="seo-static-header"><a href="${basePath}">${logoMarkup}</a><nav aria-label="Hauptnavigation"><a href="${basePath}facility-management/">Facility Management</a><a href="${basePath}leistungen/">Leistungen</a><a href="${basePath}ueber-uns/">Über uns</a><a href="${basePath}blog/">Blog</a><a href="${basePath}karriere/">Karriere</a><a class="seo-static-contact" href="${basePath}kontakt/">Kontakt</a></nav></header>`
}

function staticFooter() {
  const navigation = [
    ['Startseite', ''],
    ['Facility Management', 'facility-management/'],
    ['Leistungen', 'leistungen/'],
    ['Über uns', 'ueber-uns/'],
    ['Blog', 'blog/'],
    ['Karriere', 'karriere/'],
    ['Kontakt', 'kontakt/'],
  ].map(([label, path]) => `<a href="${basePath}${path}">${label}</a>`).join('')

  return `<footer class="seo-static-footer" id="seitenende"><div class="seo-static-footer__inner"><div class="seo-static-footer__brand"><a href="${basePath}" aria-label="Perla’s Objektbetreuung Startseite">${logoMarkup}</a><p>Facility Management und professionelle Objektbetreuung für Hausverwaltungen, Wohnanlagen, Gewerbeimmobilien und institutionelle Gebäude im Rhein-Main-Gebiet.</p></div><div class="seo-static-footer__contact"><h2>Direkt erreichbar.</h2><address>Hauptstraße 1, 65843 Sulzbach (Taunus)</address><a href="tel:+491776867145">0177 68 67 145</a><a href="mailto:mail@perlas.de">mail@perlas.de</a></div><nav class="seo-static-footer__nav" aria-label="Footer-Navigation">${navigation}</nav><nav class="seo-static-footer__legal" aria-label="Rechtliche Informationen"><a href="${basePath}impressum/">Impressum</a><a href="${basePath}datenschutz/">Datenschutz</a><a href="${basePath}datenschutz/#einwilligung">Informationen zu Cookies und Einwilligung</a></nav><p>© 2026 Perla’s Objektbetreuung GmbH &amp; Co. KG</p></div></footer>`
}

function notFoundMarkup() {
  return `${staticHeader()}<main class="not-found-page"><div class="not-found-page__inner"><span class="eyebrow">SEITE NICHT GEFUNDEN</span><span class="not-found-page__code" aria-hidden="true">404</span><h1>Diese Seite gibt es leider nicht.</h1><p>Die aufgerufene Seite wurde möglicherweise verschoben oder ist nicht mehr verfügbar.</p><div class="not-found-page__actions"><a class="button button--yellow" href="${basePath}"><span>Zur Startseite</span></a><a class="button button--outline" href="${basePath}leistungen/"><span>Leistungen ansehen</span></a><a class="button button--outline" href="${basePath}kontakt/"><span>Kontakt</span></a></div></div></main>`
}

function blogPostStructuredData(post) {
  const url = blogPostUrl(post).href
  return {
    '@context': 'https://schema.org',
    '@graph': [
      businessData,
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: post.title,
        description: post.seoDescription,
        image: new URL(`${basePath}assets/${post.image}`, siteUrl.origin).href,
        datePublished: '2026-08-31',
        dateModified: blogDateToIso(post.updated),
        inLanguage: 'de-DE',
        author: { '@id': businessId },
        publisher: { '@id': businessId },
        mainEntityOfPage: url,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Startseite', item: siteUrl.href },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: blogUrl.href },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  }
}

function selectedServiceLinks(slugs) {
  return slugs
    .map((slug) => services.find((service) => service.slug === slug))
    .filter(Boolean)
    .map((service) => `<li><a href="${basePath}leistungen/${service.slug}/">${escapeHtml(service.title)}</a></li>`)
    .join('')
}

function homeMarkup() {
  const homeCoreServiceSlugs = ['objektpflege', 'muellmanagement', 'gebaeudereinigung', 'wartung-instandhaltung', 'gartenpflege', 'winterdienst']
  const coreServices = homeCoreServiceSlugs
    .map((slug) => services.find((service) => service.slug === slug))
    .filter(Boolean)
    .map((service) => `<li><a href="${basePath}leistungen/${service.slug}/">${escapeHtml(service.slug === 'objektpflege' ? 'Objektbetreuung' : service.title)}</a></li>`)
    .join('')

  const certifiedServices = [
    { slug: 'baumpflege-baumfaellung', title: 'Baumpflege & Baumfällung', text: 'Eigenständige Fachleistung für Pflege und Rückschnitt. Notwendige Fällungen erfolgen nach objektbezogener Prüfung.', certified: true },
    { slug: 'spielplatzkontrolle-spielgeraetewartung', title: 'Spielplatzkontrolle & Spielgerätewartung', text: 'Sichtkontrollen, dokumentierte Auffälligkeiten sowie abgestimmte Reinigung, Pflege und Wartung.', certified: true },
  ].map((service) => `<li>${service.certified ? '<span>Zertifiziert</span>' : ''}<strong><a href="${basePath}leistungen/${service.slug}/">${escapeHtml(service.title)}</a></strong><p>${escapeHtml(service.text)}</p></li>`).join('')

  const partnerNames = [
    'David Lloyd Clubs',
    'Immtelli',
    'UNIRESTA',
    'VALO Immobilienmanagement',
    'Zeidler',
    'Bundesanstalt für Immobilienaufgaben',
  ].map((partner) => `<li>${escapeHtml(partner)}</li>`).join('')

  const googleReviews = googleReviewData.reviews
    .map((review) => `<li><blockquote>${escapeHtml(review.text)}</blockquote><p>${escapeHtml(review.author)}, Google-Rezension</p></li>`)
    .join('')

  const audienceLinks = audiences
    .map((audience) => `<li><a href="${basePath}facility-management/${audience.id}/">${escapeHtml(audience.navLabel)}</a><p>${escapeHtml(audience.text)}</p></li>`)
    .join('')

  return [
    `${staticHeader()}<main class="seo-static-main"><section class="seo-static-hero"><p>Facility Management im Rhein-Main-Gebiet</p><h1>Facility Management für professionell verwaltete Immobilien.</h1><p>Perla’s bündelt Objektbetreuung, technische Koordination, Reinigung, Außenanlagenpflege und Winterdienst. Hausverwaltungen und gewerbliche Auftraggeber erhalten einen festen Ansprechpartner für die laufenden Aufgaben ihrer Immobilien.</p><a href="${basePath}kontakt/">Betreuung anfragen</a>${imageMarkup('kundenbilder/hero/facility-management-objekt.jpg', 'Modernes, professionell betreutes Verwaltungsgebäude mit gepflegten Außenanlagen', { sizes: homeHeroImageSizes, loading: 'eager', fetchPriority: 'high' })}</section>`,
    `<section><p>Perla’s persönlich</p><h2>Lernen Sie uns in 54 Sekunden kennen.</h2><p>Erhalten Sie einen kurzen Einblick in Perla’s, unsere Arbeitsweise und die Menschen hinter der laufenden Betreuung von Immobilien.</p><p>Das Video wird erst nach Ihrer Auswahl auf YouTube geöffnet. Dabei gelten die Datenschutzbedingungen von YouTube.</p><a href="https://www.youtube.com/watch?v=u8PsU3hYVYU" target="_blank" rel="noopener noreferrer">Video auf YouTube ansehen</a><p><a href="${basePath}datenschutz/#youtube">Hinweise zum Datenschutz bei YouTube</a></p></section>`,
    `<section><h2>Unternehmen und Verwaltungen, die auf Perla’s setzen.</h2><ul>${partnerNames}</ul></section>`,
    `<section><h2>${escapeHtml(googleReviewData.rating)} Sterne aus ${googleReviewData.reviewCount} Google-Rezensionen</h2><p>Kurze Auszüge aus öffentlich abgegebenen Bewertungen für Perla’s Objektbetreuung.</p><ul class="seo-static-links">${googleReviews}</ul><a href="${escapeHtml(googleReviewData.profileUrl)}" target="_blank" rel="noreferrer">Alle Rezensionen bei Google ansehen</a></section>`,
    `<section><p>So arbeitet Perla’s</p><h2>Objektbetreuung digital organisiert.</h2><p>Wiederkehrende Einsätze, Zuständigkeiten und Termine werden digital geplant. Durchgeführte Arbeiten und relevante Informationen bleiben dem Objekt zugeordnet dokumentiert.</p><ol><li><strong>Digitale Einsatzplanung</strong></li><li><strong>Digitale Dokumentation</strong></li><li><strong>Transparenz</strong></li><li><strong>Digitale Objektmappe</strong></li></ol><p>Für die digitale Einsatzplanung und Dokumentation nutzen wir <a href="https://hausmeisterapp.com/" target="_blank" rel="noreferrer">HausmeisterApp</a>.</p></section>`,
    `<section><p>Perla’s im Überblick</p><h2>Der passende Weg für Ihr Objekt.</h2><ul class="seo-static-links"><li><a href="${basePath}facility-management/">Facility Management ansehen</a><p>Mehrere Leistungen abgestimmt betreuen.</p></li><li><a href="${basePath}leistungen/">Alle Leistungen</a><p>Einzelleistungen gezielt auswählen.</p></li><li><a href="${basePath}ueber-uns/">Über uns</a><p>Perla’s persönlich kennenlernen.</p></li><li><a href="${basePath}kontakt/">Kontakt aufnehmen</a><p>Ihr Objekt persönlich besprechen.</p></li></ul></section>`,
    `<section><p>Facility Management nach Objektart</p><h2>Facility Management für professionell verwaltete Immobilien.</h2><p>Perla’s koordiniert wiederkehrende Aufgaben, Zuständigkeiten und Rückmeldungen für Hausverwaltungen, Wohnanlagen, Gewerbeimmobilien und institutionelle Gebäude.</p><ul class="seo-static-links">${audienceLinks}</ul><a href="${basePath}facility-management/">Alle Objektbereiche ansehen</a></section>`,
    `<section><p>Nachgewiesene Fachkompetenz</p><h2>Zertifizierte Leistungen.</h2><p>Die konkreten Qualifikationen und der vereinbarte Prüfumfang werden vor der Beauftragung transparent festgehalten.</p><ul class="seo-static-links">${certifiedServices}</ul><a href="${basePath}kontakt/">Spezialleistung anfragen</a></section>`,
    `<section><p>Kernleistungen</p><h2>Unsere Kernleistungen.</h2><p>Die wichtigsten Leistungen stehen am Anfang; weitere Bereiche lassen sich im Frontend bei Bedarf einblenden.</p><ul class="seo-static-links">${coreServices}</ul><a href="${basePath}leistungen/">Alle Leistungen ansehen</a></section>`,
    `<section><h2>Einsatzbereit im Rhein-Main-Gebiet</h2><p>10+ Mitarbeitende, abgestimmte Touren und ein wachsender Fuhrpark unterstützen die verlässliche Betreuung größerer Immobilien.</p>${imageMarkup('kundenbilder/fahrzeuge/perlas_fuhrpark_real.png', 'Perla’s Servicefahrzeuge und Lkw vor einer Wohnanlage')}</section>`,
    `<section><h2>Erfahrung und klare Abläufe</h2><p>Perla’s schafft Übersicht über wiederkehrende Aufgaben und hält Rückmeldungen zu Zustand, Leistung und Handlungsbedarf an einer Stelle zusammen.</p></section></main>`,
  ].join('').replace(
    '<section><h2>Einsatzbereit im Rhein-Main-Gebiet</h2>',
    '<section id="fuhrpark"><p>Fuhrpark &amp; Mobilität</p><h2>Einsatzbereit im Rhein-Main-Gebiet</h2>',
  )
}

function facilityMarkup() {
  const targets = audiences
    .map((audience) => `<section id="${audience.id}"><h2><a href="${basePath}facility-management/${audience.id}/">Facility Management für ${escapeHtml(audience.title)}</a></h2><p>${escapeHtml(audience.text)}</p><a href="${basePath}facility-management/${audience.id}/">Bereich im Detail ansehen</a><ul class="seo-static-links">${selectedServiceLinks(audience.services)}</ul></section>`)
    .join('')
  const specialists = [
    ['baumpflege-baumfaellung', 'Baumpflege & Baumfällung', true],
    ['spielplatzkontrolle-spielgeraetewartung', 'Spielplatzkontrolle & Spielgerätewartung', true],
    ['buero-einrichtungsservice', 'Büro- & Einrichtungsservice', false],
  ].map(([slug, title, certified]) => `<li>${certified ? '<span>Zertifiziert</span>' : '<span>Spezialisierte Leistung</span>'}<a href="${basePath}leistungen/${slug}/">${escapeHtml(title)}</a></li>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Facility Management</nav><section class="seo-static-hero"><p>Facility Management im Rhein-Main-Gebiet</p><h1>Gebäude ganzheitlich betreuen. Aufgaben klar koordinieren.</h1><p>Perla’s bündelt die laufenden Aufgaben größerer und professionell verwalteter Immobilien in einem objektbezogenen Betreuungskonzept.</p><a href="#zielgruppen">Passenden Bereich wählen</a></section><section><h2>Erst das Objekt verstehen. Dann Leistungen sinnvoll verbinden.</h2><p>Aufgaben, Intervalle, Zuständigkeiten und Rückmeldungen werden objektbezogen abgestimmt. Sichtkontrollen und organisatorische Koordination gehören zur Betreuung. Fachliche Prüfungen und Arbeiten werden mit geeigneten Fachbetrieben koordiniert und nicht als eigene Fachleistung dargestellt.</p></section><div id="zielgruppen">${targets}</div><section><p>Spezialisierte Zusatzleistungen</p><h2>Ergänzende Fachleistungen für professionell betreute Immobilien</h2><ul class="seo-static-links">${specialists}</ul></section><section><h2>Größere und komplexere Objekte</h2><p>Gebäude- und Gemeinschaftsflächen, Außenanlagen, Winterdienst, Parkflächen, Tiefgaragen und technische Themen werden nach Zuständigkeit gegliedert. Technische Facharbeiten bleiben bei geeigneten Fachbetrieben.</p><a href="${basePath}kontakt/">Kontakt aufnehmen</a></section></main>`
}

function servicesMarkup() {
  const catalog = services
    .filter((service) => !specializedDetailSlugs.has(service.slug))
    .map((service) => `<article><h2><a href="${basePath}leistungen/${service.slug}/">${escapeHtml(service.title)}</a></h2><p>${escapeHtml(service.text)}</p><a href="${basePath}leistungen/${service.slug}/">Leistung ansehen</a></article>`)
    .join('')

  const targets = audiences
    .map((audience) => `<li><a href="${basePath}facility-management/${audience.id}/">${escapeHtml(audience.navLabel)}</a></li>`)
    .join('')

  const specialized = [
    { slug: 'baumpflege-baumfaellung', title: 'Baumpflege & Baumfällung', text: 'Pflege und Rückschnitt. Notwendige Fällungen erfolgen nach objektbezogener Prüfung.', certified: true },
    { slug: 'spielplatzkontrolle-spielgeraetewartung', title: 'Spielplatzkontrolle & Spielgerätewartung', text: 'Regelmäßige Sichtkontrollen, dokumentierte Auffälligkeiten sowie abgestimmte Reinigung, Pflege und Wartung.', certified: true },
    { slug: 'buero-einrichtungsservice', title: 'Büro- & Einrichtungsservice', text: 'Möbel und Arbeitsplätze umstellen, interne Umzüge unterstützen und Räume für eine neue Nutzung vorbereiten.' },
  ].map((service) => `<li>${service.certified ? '<span>Zertifiziert</span>' : ''}<strong><a href="${basePath}leistungen/${service.slug}/">${escapeHtml(service.title)}</a></strong><p>${escapeHtml(service.text)}</p></li>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Leistungen</nav><section class="seo-static-hero"><p>Facility Services im Rhein-Main-Gebiet</p><h1>Leistungen für den laufenden Betrieb Ihrer Immobilie.</h1><p>Wählen Sie eine einzelne Leistung oder kombinieren Sie mehrere Aufgaben zu einem objektbezogenen Betreuungskonzept.</p><a href="${basePath}kontakt/">Leistung anfragen</a><a href="${basePath}facility-management/">Facility Management</a></section><section><h2>Für diese Immobilien arbeiten wir</h2><ul class="seo-static-links">${targets}</ul></section><section><h2>Ergänzende Fachleistungen für professionell betreute Immobilien.</h2><p>Umfang, Zuständigkeit und erforderliche Fachkunde werden je Leistung vor der Beauftragung geklärt.</p><ul>${specialized}</ul><a href="${basePath}kontakt/">Spezialleistung anfragen</a></section><section><h2>Bestehende Leistungen im Detail</h2><div class="seo-static-grid">${catalog}</div></section><section><h2>Wenn aus Einzelleistungen Facility Management wird</h2><p>Bei größeren oder professionell verwalteten Immobilien lassen sich Leistungen, Intervalle, Zuständigkeiten und Rückmeldungen in einem Betreuungskonzept bündeln.</p><a href="${basePath}facility-management/">Facility Management ansehen</a></section></main>`
}

function aboutMarkup() {
  const values = [
    ['Verantwortung', 'Aufgaben, Zuständigkeiten und offene Punkte werden nachvollziehbar eingeordnet.'],
    ['Planbarkeit', 'Wiederkehrende Leistungen erhalten klare Intervalle und abgestimmte Abläufe.'],
    ['Persönliche Abstimmung', 'Ein fester Ansprechpartner bündelt Rückmeldungen und die laufende Koordination.'],
    ['Objektbezug', 'Der tatsächliche Bedarf der Immobilie bildet die Grundlage für den Leistungsumfang.'],
  ].map(([title, text]) => `<article><h2>${title}</h2><p>${text}</p></article>`).join('')
  const team = [
    ['Salvatore', 'kundenbilder/leistungen/service-update-2026-09-23/reinigung_waschmaschinen_01.png', 'Mitarbeiter von Perla’s beim Transport einer Waschmaschine', 'Ansprechpartner und Objektservice'],
    ['Michael', 'kundenbilder/team/update-2026-09-23/mitarbeiter_reinigung_maennlich_01.png', 'Mitarbeiter von Perla’s bei der Reinigung eines Gebäudeflurs', 'Reinigung & Objektservice'],
    ['Roland', 'kundenbilder/team/update-2026-09-23/mitarbeiter_aelterer_hauswart_01.png', 'Mitarbeiter von Perla’s bei der Hausbetreuung', 'Hausbetreuung & Objektkontrolle'],
    ['Jannic', 'kundenbilder/team/update-2026-09-23/mitarbeiter_bohren_portrait_01.png', 'Mitarbeiter von Perla’s mit Werkzeug für Wartungsarbeiten', 'Wartung & Instandhaltung'],
    ['Marco', 'kundenbilder/team/update-2026-09-23/mitarbeiter_bueroeinrichtung_01.png', 'Mitarbeiter von Perla’s beim Einrichten eines Büroraums', 'Büro- & Einrichtungsservice'],
    ['Melanie', 'kundenbilder/team/update-2026-09-23/mitarbeiter_reinigung_weiblich_01.png', 'Mitarbeiterin von Perla’s bei der Gebäudereinigung', 'Gebäudereinigung'],
    ['Florian', 'kundenbilder/team/update-2026-09-23/mitarbeiter_rote_kappe_bohren_01.png', 'Mitarbeiter von Perla’s mit Werkzeug im Innenbereich', 'Wartung & Montage'],
    ['Petra', 'kundenbilder/team/update-2026-09-23/mitarbeiter_rechts_unten_ersetzen.png', 'Mitarbeiterin von Perla’s im Büro', 'Büro & Organisation'],
  ].map(([name, image, alt, role]) => `<figure>${imageMarkup(image, alt, { sizes: gridImageSizes })}<figcaption><strong>${escapeHtml(name)}</strong><span>${escapeHtml(role)}</span></figcaption></figure>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Über uns</nav><section class="seo-static-hero"><p>Perla’s Objektbetreuung</p><h1>Seit 1999 für Immobilien im Rhein-Main-Gebiet da.</h1><p>Perla’s verbindet persönliche Abstimmung mit planbarer Objektbetreuung. Wir erfassen Aufgaben vor Ort, koordinieren wiederkehrende Einsätze und halten Rückmeldungen verständlich zusammen.</p><a href="${basePath}kontakt/">Persönlich kennenlernen</a></section><section><p>Vorbereiteter Entwurf. Kundendaten werden noch finalisiert.</p><h2>Aus Nähe zum Objekt ist verlässliche Betreuung gewachsen</h2><p>Perla’s begann 1999 mit dem Anspruch, Immobilien persönlich zu kennen, Aufgaben zuverlässig zu erledigen und für Verwaltungen erreichbar zu bleiben. Mit den betreuten Objekten kamen Gebäudereinigung, Außenanlagenpflege, Winterdienst und technische Koordination hinzu.</p><p>Heute arbeitet ein Team aus mehr als zehn Mitarbeitenden an Wohnanlagen, Gewerbeimmobilien und institutionellen Gebäuden im Rhein-Main-Gebiet.</p><ol><li>1999: Start der persönlichen Objektbetreuung</li><li>2000er: Erweiterung der Facility Services</li><li>2010er: Feste Ansprechpartner und dokumentierte Abläufe</li><li>Heute: 10+ Mitarbeitende für größere Immobilien</li></ol></section><section><h2>Menschen hinter Perla’s</h2><p>Acht Mitarbeitende zeigen die heutige Breite des Teams.</p><div class="seo-static-grid">${team}</div></section><section><h2>Wofür wir stehen</h2><div class="seo-static-grid">${values}</div></section><section><h2>Vom Objektbedarf zum klaren Ablauf</h2><ol><li>Objekt verstehen</li><li>Leistungen festlegen</li><li>Betreuung koordinieren</li></ol></section></main>`
}

function blogMarkup() {
  const featuredPost = blogPosts.find((post) => post.slug === featuredBlogPostSlug) ?? blogPosts[0]
  const featuredArticle = `<article>${imageMarkup(featuredPost.image, featuredPost.alt, { sizes: blogHeroImageSizes, loading: 'eager', fetchPriority: 'high' })}<p>${escapeHtml(featuredPost.category)} · ${escapeHtml(featuredPost.readTime)}</p><p>Aktualisiert am ${escapeHtml(featuredPost.updated)}</p><h2><a href="${basePath}blog/${featuredPost.slug}/">${escapeHtml(featuredPost.title)}</a></h2><p>${escapeHtml(featuredPost.excerpt)}</p><a href="${basePath}blog/${featuredPost.slug}/">Artikel lesen</a></article>`
  const articles = blogPosts.map((post) => `<article>${imageMarkup(post.image, post.alt, { sizes: gridImageSizes })}<p>${escapeHtml(post.category)} · ${escapeHtml(post.readTime)} · Aktualisiert am ${escapeHtml(post.updated)}</p><h2><a href="${basePath}blog/${post.slug}/">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.excerpt)}</p><a href="${basePath}blog/${post.slug}/">Weiterlesen</a></article>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Blog</nav><section class="seo-static-hero"><p>Wissen aus der Objektbetreuung</p><h1>Praxiswissen für den laufenden Immobilienbetrieb.</h1><p>Verständliche Beiträge zu Facility Management, Gebäudereinigung, Außenanlagen, saisonaler Planung und den Abläufen hinter einer verlässlichen Objektbetreuung.</p></section><section><h2>Aktueller Beitrag</h2>${featuredArticle}</section><section><h2>Alle Beiträge</h2><div class="seo-static-grid">${articles}</div></section><section><h2>Fragen zu Ihrem Objekt?</h2><p>Beschreiben Sie kurz die Immobilie und die Aufgabe, für die Sie eine Lösung suchen.</p><a href="${basePath}kontakt/">Kontakt aufnehmen</a></section></main>`
}

function blogArticleMarkup(post) {
  const sections = post.sections.map((section) => `<section><h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.points ? `<ul>${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}</section>`).join('')
  const related = blogPosts.filter((entry) => entry.slug !== post.slug).slice(0, 2).map((entry) => `<li><a href="${basePath}blog/${entry.slug}/">${escapeHtml(entry.title)}</a></li>`).join('')
  const matchingServices = post.relatedServices
    .map((slug) => services.find((service) => service.slug === slug))
    .filter(Boolean)
    .map((service) => `<li><a href="${basePath}leistungen/${service.slug}/">${escapeHtml(service.title)}</a><p>${escapeHtml(service.text)}</p></li>`)
    .join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / <a href="${basePath}blog/">Blog</a> / ${escapeHtml(post.category)}</nav><article><header class="seo-static-hero"><p>${escapeHtml(post.category)} · ${escapeHtml(post.readTime)} · Aktualisiert am ${escapeHtml(post.updated)}</p><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.intro)}</p>${imageMarkup(post.image, post.alt, { sizes: blogHeroImageSizes, loading: 'eager', fetchPriority: 'high' })}</header>${sections}</article><nav aria-label="Passende Leistungen"><h2>Passende Leistungen zum Thema</h2><ul class="seo-static-links">${matchingServices}</ul></nav><nav aria-label="Weitere Blogbeiträge"><h2>Weitere Beiträge</h2><ul>${related}</ul></nav></main>`
}

function careerMarkup() {
  const jobCards = jobs.map((job) => `<article><p>${escapeHtml(job.department)} · ${escapeHtml(job.location)} · ${escapeHtml(job.type)}</p><h2>${escapeHtml(job.title)}</h2><p>${escapeHtml(job.intro)}</p><h3>Typische Aufgaben</h3><ul>${job.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join('')}</ul><h3>Das bringst du mit</h3><ul>${job.requirements.map((requirement) => `<li>${escapeHtml(requirement)}</li>`).join('')}</ul></article>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Karriere</nav><section class="seo-static-hero"><p>Komm ins Team</p><h1>Du hast Lust, anzupacken und Verantwortung zu übernehmen?</h1><p>Bei Perla’s arbeitest du an echten Wohn- und Gewerbeobjekten im Rhein-Main-Gebiet. Dich erwarten praktische, abwechslungsreiche Aufgaben, klare Absprachen und ein Team, das sich im Alltag gegenseitig unterstützt.</p><a href="#stellen">Offene Bereiche ansehen</a><a href="#bewerbung">Initiativ bewerben</a>${imageMarkup('kundenbilder/team/team_aussenbereich_01.png', 'Mitarbeiterin von Perla’s bei einem Außeneinsatz', { sizes: careerHeroImageSizes, loading: 'eager', fetchPriority: 'high' })}</section><section><p>Dein Arbeitsalltag bei Perla’s</p><h2>Praktische Aufgaben. Klare Absprachen. Ein Team, das anpackt.</h2><p>Du siehst, was du geschafft hast, übernimmst Verantwortung für deinen Bereich und kannst dich mit deiner Erfahrung Schritt für Schritt weiterentwickeln.</p><ul><li>Abwechslungsreiche Einsätze</li><li>Ein Team, kurze Wege</li><li>Verantwortung und Entwicklung</li></ul></section><section id="stellen"><h2>Hier suchen wir Verstärkung</h2><p>Gemeinsam klären wir, welcher Bereich zu dir passt und in welchem Umfang du einsteigen möchtest.</p><div class="seo-static-grid">${jobCards}</div></section><section id="bewerbung"><h2>Kurzbewerbung</h2><p>Schick uns deine wichtigsten Kontaktdaten und den gewünschten Einsatzbereich. Ein Lebenslauf ist für den ersten Kontakt nicht zwingend erforderlich.</p><p>Das Online-Bewerbungsformular benötigt JavaScript. Du kannst uns deine Bewerbung und Unterlagen auch direkt per E-Mail schicken.</p><p><a href="mailto:mail@perlas.de?subject=Bewerbung%20bei%20Perla%27s">Direkt an mail@perlas.de schreiben</a></p></section></main>`
}

function contactMarkup() {
  const steps = [
    ['01', 'Anfrage senden', 'Kontakt per Formular, Telefon, E-Mail oder WhatsApp.'],
    ['02', 'Objekt vor Ort besprechen', 'Flächen, Anforderungen und Besonderheiten werden bei Bedarf gemeinsam aufgenommen.'],
    ['03', 'Leistungen und Intervalle festlegen', 'Aufgaben sowie Reinigungs-, Kontroll-, Wartungs- und Pflegeintervalle werden abgestimmt.'],
    ['04', 'Individuelles Angebot', 'Perla’s erstellt ein Angebot für den vereinbarten Leistungsumfang.'],
    ['05', 'Betreuung starten', 'Ansprechpartner, Termine und organisatorische Abläufe werden geklärt.'],
  ].map(([number, title, text]) => `<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Kontakt</nav><section class="seo-static-hero"><p>Kontakt zu Perla’s</p><h1>Lassen Sie uns über Ihr Objekt sprechen.</h1><p>Besprechen Sie einzelne Leistungen oder ein abgestimmtes Betreuungskonzept für Ihre Immobilie im Rhein-Main-Gebiet.</p><a href="tel:+491776867145">Direkt anrufen</a></section><section><h2>So läuft Ihre Anfrage ab</h2><div class="seo-static-grid">${steps}</div></section><section><h2>So erreichen Sie uns</h2><ul><li><a href="tel:+491776867145">Telefon: 0177 68 67 145</a></li><li><a href="mailto:mail@perlas.de">E-Mail: mail@perlas.de</a></li><li>Hauptstraße 1, 65843 Sulzbach (Taunus)</li><li><a href="https://www.google.com/maps/dir/?api=1&amp;destination=Hauptstra%C3%9Fe%201%2C%2065843%20Sulzbach%20(Taunus)%2C%20Deutschland">Route in Google Maps öffnen</a></li></ul></section></main>`
}

function privacyBlockMarkup(block) {
  if (block.type === 'subheading') {
    return `<h3>${escapeHtml(block.text)}</h3>`
  }

  if (block.type === 'list') {
    return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
  }

  if (block.type === 'contact') {
    const address = escapeHtml(block.address).replaceAll('\n', '<br>')
    return `<address><strong>${escapeHtml(block.company)}</strong><br>${address}<br>Telefon: <a href="tel:${escapeHtml(block.phoneHref)}">${escapeHtml(block.phone)}</a><br>E-Mail: <a href="mailto:${escapeHtml(block.email)}">${escapeHtml(block.email)}</a></address>`
  }

  return `<p>${escapeHtml(block.text)}</p>`
}

function privacyMarkup() {
  const tableOfContents = privacyContent.sections
    .map((section) => `<li><a href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a></li>`)
    .join('')
  const sections = privacyContent.sections
    .map((section) => {
      const blocks = section.blocks.map(privacyBlockMarkup).join('')
      const review = section.review
        ? `<aside><strong>Hinweis zum aktuellen technischen Stand</strong><p>${escapeHtml(section.review)}</p></aside>`
        : ''
      return `<section id="${escapeHtml(section.id)}"><h2>${escapeHtml(section.title)}</h2>${blocks}${review}</section>`
    })
    .join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Datenschutz</nav><section class="seo-static-hero"><p>Rechtliche Informationen</p><h1>Datenschutzerklärung</h1><p>${escapeHtml(privacyContent.lead)}</p><p><strong>Stand: ${escapeHtml(privacyContent.updated)}</strong></p></section><nav aria-label="Inhaltsverzeichnis der Datenschutzerklärung"><h2>Inhaltsverzeichnis</h2><ol>${tableOfContents}</ol></nav><section><h2>Grundlage und Prüfstatus</h2><p>${escapeHtml(privacyContent.sourceNote)}</p></section>${sections}</main>`
}

function imprintBlockMarkup(block) {
  if (block.type === 'address') {
    const address = escapeHtml(block.address).replaceAll('\n', '<br>')
    return `<h3>${escapeHtml(block.heading)}</h3><address><strong>${escapeHtml(block.company)}</strong><br>${address}<br>Telefon: <a href="tel:${escapeHtml(block.phoneHref)}">${escapeHtml(block.phone)}</a><br>E-Mail: <a href="mailto:${escapeHtml(block.email)}">${escapeHtml(block.email)}</a></address>`
  }

  if (block.type === 'details') {
    return `<dl>${block.items.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join('')}</dl>`
  }

  return `<p>${escapeHtml(block.text)}</p>`
}

function imprintMarkup() {
  const tableOfContents = imprintContent.sections
    .map((section) => `<li><a href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a></li>`)
    .join('')
  const sections = imprintContent.sections
    .map((section) => `<section id="${escapeHtml(section.id)}"><h2>${escapeHtml(section.title)}</h2>${section.blocks.map(imprintBlockMarkup).join('')}</section>`)
    .join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Impressum</nav><section class="seo-static-hero"><p>Rechtliches</p><h1>Impressum</h1><p>${escapeHtml(imprintContent.lead)}</p></section><nav aria-label="Inhaltsverzeichnis des Impressums"><h2>Inhaltsverzeichnis</h2><ol>${tableOfContents}</ol></nav>${sections}</main>`
}

function legalMarkup(type) {
  if (type === 'imprint') {
    return imprintMarkup()
  }

  return privacyMarkup()
}

function serviceMarkup(service) {
  const scopes = service.scopeCards.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p><ul>${item.items.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul></article>`).join('')
  const process = service.processSteps.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join('')
  const audiences = service.audiences.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const faqs = service.faqs.map((item) => `<details open><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')
  const related = relatedServiceLinks(service)
  const boundary = service.slug === 'baumpflege-baumfaellung'
    ? ''
    : `<h2>${escapeHtml(service.boundaryTitle)}</h2><p>${escapeHtml(service.boundaryText)}</p>`
  const workflow = service.workflow?.length
    ? `<section><p>Verbundener Objektservice</p><h2>Ein Ablauf statt einzelner Maßnahmen.</h2><ol>${service.workflow.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol></section>`
    : ''
  const gallery = service.slug === 'tiefgaragenreinigung'
    ? `<section><p>Tiefgaragenreinigung in der Praxis</p><h2>Geräteeinsatz und gereinigte Fläche.</h2><p>Die Aufnahmen dokumentieren den praktischen Geräteeinsatz und eine gereinigte Tiefgaragenfläche. Sie werden bewusst nicht als Vorher-Nachher-Paar bezeichnet.</p><div class="seo-static-grid"><figure>${imageMarkup('kundenbilder/vorher_nachher/parkhaus_reinigung_geraet.png', 'Reinigungsgerät von Perla’s im Parkhaus', { sizes: gridImageSizes })}<figcaption>Im Einsatz</figcaption></figure><figure>${imageMarkup('kundenbilder/vorher_nachher/parkhaus_gereinigt.png', 'Gereinigte Stellfläche in einem Parkhaus', { sizes: gridImageSizes })}<figcaption>Gereinigte Fläche</figcaption></figure></div></section>`
    : service.slug === 'gartenpflege'
      ? `<section><p>Vorher / Nachher</p><h2>Außenbereiche sichtbar in Ordnung bringen.</h2><p>Dasselbe Objekt vor und nach dem Einsatz.</p><div class="seo-static-grid"><figure>${imageMarkup('kundenbilder/vorher_nachher/aussenbereich_vorher.png', 'Überwachsener Außenbereich vor der Pflege durch Perla’s', { sizes: gridImageSizes })}<figcaption>Vorher</figcaption></figure><figure>${imageMarkup('kundenbilder/vorher_nachher/aussenbereich_nachher.png', 'Freigeschnittener und gepflegter Außenbereich nach dem Einsatz', { sizes: gridImageSizes })}<figcaption>Nachher</figcaption></figure></div></section>`
      : service.slug === 'spielplatzkontrolle-spielgeraetewartung'
        ? `<section><p>Spielbereiche in der Praxis</p><h2>Außen- und Innenbereiche passend betreuen.</h2><p>Echte Objektaufnahmen zeigen unterschiedliche Spielgeräte und Flächen.</p><div class="seo-static-grid"><figure>${imageMarkup('kundenbilder/spielplatz/spielplatz_aussen_01.png', 'Heller Außenspielplatz mit modernen Spielgeräten', { sizes: gridImageSizes })}<figcaption>Außenspielplatz</figcaption></figure><figure>${imageMarkup('kundenbilder/spielplatz/spielplatz_schaukel_nah_01.png', 'Großer Nestschaukelbereich auf einer gepflegten Außenspielfläche', { sizes: gridImageSizes })}<figcaption>Schaukelbereich im Außenbereich</figcaption></figure><figure>${imageMarkup('kundenbilder/spielplatz/spielbereich_innen_01.png', 'Gepflegter Indoor-Spielbereich', { sizes: gridImageSizes })}<figcaption>Indoor-Spielbereich</figcaption></figure></div></section>`
        : ''

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / <a href="${basePath}leistungen/">Leistungen</a> / ${escapeHtml(service.title)}</nav><section class="seo-static-hero"><p>${service.eyebrow ? escapeHtml(service.eyebrow) : service.certified ? 'Zertifizierte Fachleistung' : 'Facility Services im Rhein-Main-Gebiet'}</p><h1>${escapeHtml(service.title)}</h1><p>${escapeHtml(service.detail)}</p><a href="${basePath}kontakt/">Individuelles Angebot anfragen</a><a href="tel:+491776867145">Direkt anrufen</a><a href="mailto:mail@perlas.de">E-Mail schreiben</a>${imageMarkup(service.image, service.imageAlt || `${service.title} von Perla’s Objektbetreuung`, { loading: 'eager', fetchPriority: 'high' })}</section><section><h2>Was wir bei ${escapeHtml(service.title)} konkret übernehmen</h2><p>${escapeHtml(service.scopeIntro)}</p><div class="seo-static-grid">${scopes}</div></section><section><h2>So läuft die Zusammenarbeit ab</h2><div class="seo-static-grid">${process}</div></section>${workflow}<section><h2>Für diese Objekte geeignet</h2><ul>${audiences}</ul>${boundary}</section>${gallery}<section><h2>Häufige Fragen zu ${escapeHtml(service.title)}</h2>${faqs}</section><section><h2>Wie möchten Sie Kontakt aufnehmen?</h2><p>Nutzen Sie das Angebotsformular oder sprechen Sie direkt mit Perla’s.</p><ul><li><a href="${basePath}kontakt/">Angebot für ${escapeHtml(service.title)} anfragen</a></li><li><a href="tel:+491776867145">Direkt anrufen: 0177 68 67 145</a></li><li><a href="mailto:mail@perlas.de">E-Mail an mail@perlas.de schreiben</a></li></ul></section><nav aria-label="Passende Leistungen"><h2>Diese Leistungen könnten ebenfalls relevant sein</h2><ul class="seo-static-links">${related}</ul></nav></main>`
}

function audienceMarkup(audience) {
  const heroImage = audience.detailImage ?? audience.image
  const scopes = audience.scopeCards
    .map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`)
    .join('')
  const requirements = audience.requirements
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')
  const process = audience.process
    .map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`)
    .join('')
  const faqs = audience.faqs
    .map((item) => `<details open><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`)
    .join('')
  const contactForm = '<p>Das Online-Anfrageformular benötigt JavaScript. Sie können uns Ihre Angaben zum Objekt und zur gewünschten Betreuung auch direkt per E-Mail senden oder persönlich anrufen.</p>'

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / <a href="${basePath}facility-management/">Facility Management</a> / ${escapeHtml(audience.navLabel)}</nav><section class="seo-static-hero"><p>Facility Management für</p><h1>${escapeHtml(audience.heroTitle)}</h1><p>${escapeHtml(audience.heroText)}</p><a href="${basePath}kontakt/">Betreuung anfragen</a><a href="tel:+491776867145">Direkt anrufen</a>${imageMarkup(heroImage.src, heroImage.alt, { loading: 'eager', fetchPriority: 'high' })}</section><section><h2>${escapeHtml(audience.introTitle)}</h2><p>${escapeHtml(audience.introText)}</p><div class="seo-static-grid">${scopes}</div></section><section><h2>Im Alltag zählen klare Zuständigkeiten</h2><ul>${requirements}</ul><h2>Ein Betreuungskonzept, das zum Objekt passt</h2><p>${escapeHtml(audience.approach)}</p></section><section><h2>Passende Leistungen für ${escapeHtml(audience.navLabel)}</h2><ul class="seo-static-links">${selectedServiceLinks(audience.services)}</ul></section><section><h2>Vom Objekt zum klaren Ablauf</h2><div class="seo-static-grid">${process}</div></section><section><h2>Häufige Fragen zu ${escapeHtml(audience.navLabel)}</h2>${faqs}</section><section><h2>Passt diese Betreuung zu Ihrem Objekt?</h2><p>Beschreiben Sie kurz Ihre Immobilie, den Standort und die Aufgaben, die Sie abgeben möchten.</p>${contactForm}<ul><li><a href="tel:+491776867145">Direkt anrufen: 0177 68 67 145</a></li><li><a href="mailto:mail@perlas.de">E-Mail an mail@perlas.de schreiben</a></li><li><a href="${basePath}kontakt/">Allgemeine Kontaktseite öffnen</a></li></ul></section></main>`
}

function buildPage({ title, description, url, markup, data, robots = pageRobots, ogType = 'website' }) {
  const socialImage = new URL(`${basePath}assets/kundenbilder/objekte/wohnanlage_modern_02.png`, siteUrl.origin).href
  const extraHead = `
    ${fontPreloads}
    <meta name="robots" content="${robots}" />
    ${url ? `<link rel="canonical" href="${url}" />` : ''}
    <meta property="og:locale" content="de_DE" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="PERLAS" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    ${url ? `<meta property="og:url" content="${url}" />` : ''}
    <meta property="og:image" content="${socialImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    ${data ? `<script id="perlas-structured-data" type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>` : ''}`

  return indexTemplate
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace('</head>', `${extraHead}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${markup}${staticFooter()}</div>`)
}

const homePage = buildPage({ ...homeSeo, markup: homeMarkup(), data: structuredData() })
await writeFile(indexPath, homePage)
await writeFile(`${distPath}404.html`, buildPage({
  title: 'Seite nicht gefunden | Perla’s Objektbetreuung',
  description: 'Die aufgerufene Seite wurde möglicherweise verschoben oder ist nicht mehr verfügbar.',
  markup: notFoundMarkup(),
  robots: 'noindex,nofollow',
}))
await writeFile(`${distPath}.nojekyll`, '')

await mkdir(`${distPath}kontakt/`, { recursive: true })
await writeFile(`${distPath}kontakt/index.html`, buildPage({
  ...contactSeo,
  markup: contactMarkup(),
  data: contactStructuredData(),
}))

await mkdir(`${distPath}facility-management/`, { recursive: true })
await writeFile(`${distPath}facility-management/index.html`, buildPage({
  ...facilitySeo,
  markup: facilityMarkup(),
  data: facilityStructuredData(),
}))

await Promise.all(audiences.map(async (audience) => {
  const targetPath = `${distPath}facility-management/${audience.id}/`
  const url = audienceUrl(audience).href
  await mkdir(targetPath, { recursive: true })
  await writeFile(`${targetPath}index.html`, buildPage({
    title: audience.seoTitle,
    description: audience.seoDescription,
    url,
    markup: audienceMarkup(audience),
    data: audienceStructuredData(audience),
  }))
}))

await mkdir(`${distPath}leistungen/`, { recursive: true })
await writeFile(`${distPath}leistungen/index.html`, buildPage({
  ...servicesSeo,
  markup: servicesMarkup(),
  data: pageStructuredData({
    type: 'CollectionPage',
    url: servicesUrl.href,
    name: 'Leistungen',
    description: servicesSeo.description,
  }),
}))

await mkdir(`${distPath}ueber-uns/`, { recursive: true })
await writeFile(`${distPath}ueber-uns/index.html`, buildPage({
  ...aboutSeo,
  markup: aboutMarkup(),
  data: pageStructuredData({
    type: 'AboutPage',
    url: aboutUrl.href,
    name: 'Über uns',
    description: aboutSeo.description,
  }),
}))

await mkdir(`${distPath}blog/`, { recursive: true })
await writeFile(`${distPath}blog/index.html`, buildPage({
  ...blogSeo,
  markup: blogMarkup(),
  data: pageStructuredData({
    type: 'CollectionPage',
    url: blogUrl.href,
    name: 'Blog',
    description: blogSeo.description,
  }),
}))

await Promise.all(blogPosts.map(async (post) => {
  const targetPath = `${distPath}blog/${post.slug}/`
  const url = blogPostUrl(post).href
  await mkdir(targetPath, { recursive: true })
  await writeFile(`${targetPath}index.html`, buildPage({
    title: post.seoTitle,
    description: post.seoDescription,
    url,
    markup: blogArticleMarkup(post),
    data: blogPostStructuredData(post),
    ogType: 'article',
  }))
}))

await mkdir(`${distPath}karriere/`, { recursive: true })
await writeFile(`${distPath}karriere/index.html`, buildPage({
  ...careerSeo,
  markup: careerMarkup(),
  data: pageStructuredData({
    type: 'CollectionPage',
    url: careerUrl.href,
    name: 'Karriere',
    description: careerSeo.description,
  }),
}))

await mkdir(`${distPath}impressum/`, { recursive: true })
await writeFile(`${distPath}impressum/index.html`, buildPage({
  ...imprintSeo,
  markup: legalMarkup('imprint'),
  data: pageStructuredData({
    type: 'WebPage',
    url: imprintUrl.href,
    name: 'Impressum',
    description: imprintSeo.description,
  }),
}))

await mkdir(`${distPath}datenschutz/`, { recursive: true })
await writeFile(`${distPath}datenschutz/index.html`, buildPage({
  ...privacySeo,
  markup: legalMarkup('privacy'),
  data: pageStructuredData({
    type: 'WebPage',
    url: privacyUrl.href,
    name: 'Datenschutz',
    description: privacySeo.description,
  }),
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

const sitemapUrls = [
  siteUrl.href,
  facilityUrl.href,
  ...audiences.map((audience) => audienceUrl(audience).href),
  servicesUrl.href,
  aboutUrl.href,
  blogUrl.href,
  ...blogPosts.map((post) => blogPostUrl(post).href),
  careerUrl.href,
  contactUrl.href,
  imprintUrl.href,
  privacyUrl.href,
  ...services.map((service) => serviceUrl(service).href),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
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

if (!siteUrl.hostname.endsWith('github.io')) {
  await writeFile(`${distPath}CNAME`, `${siteUrl.hostname}\n`)
}
