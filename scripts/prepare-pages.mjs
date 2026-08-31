import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const distPath = fileURLToPath(new URL('../dist/', import.meta.url))
const indexPath = fileURLToPath(new URL('../dist/index.html', import.meta.url))
const serviceDataPath = fileURLToPath(new URL('../src/service-data.json', import.meta.url))
const audienceDataPath = fileURLToPath(new URL('../src/audience-data.json', import.meta.url))
const blogDataPath = fileURLToPath(new URL('../src/blog-data.json', import.meta.url))
const jobDataPath = fileURLToPath(new URL('../src/job-data.json', import.meta.url))
const appPath = fileURLToPath(new URL('../src/App.tsx', import.meta.url))
const contactPagePath = fileURLToPath(new URL('../src/ContactPage.tsx', import.meta.url))
const blogPagePath = fileURLToPath(new URL('../src/BlogPage.tsx', import.meta.url))
const careerPagePath = fileURLToPath(new URL('../src/CareerPage.tsx', import.meta.url))
const sourceIndexPath = fileURLToPath(new URL('../index.html', import.meta.url))
const siteUrl = new URL(process.env.PERLAS_SITE_URL ?? 'https://seroffm.github.io/perlas/')
const basePath = siteUrl.pathname.endsWith('/') ? siteUrl.pathname : `${siteUrl.pathname}/`
const indexingOverride = process.env.PERLAS_INDEX_SITE
const indexingEnabled = indexingOverride == null
  ? !siteUrl.hostname.endsWith('github.io')
  : indexingOverride === 'true'
const pageRobots = indexingEnabled ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'
const services = JSON.parse(await readFile(serviceDataPath, 'utf8'))
const audiences = JSON.parse(await readFile(audienceDataPath, 'utf8'))
const blogPosts = JSON.parse(await readFile(blogDataPath, 'utf8'))
const jobs = JSON.parse(await readFile(jobDataPath, 'utf8'))
const coreServiceSlugs = new Set([
  'objektpflege',
  'wartung-instandhaltung',
  'gebaeudereinigung',
  'gartenpflege',
  'winterdienst',
])
const indexTemplate = await readFile(indexPath, 'utf8')

const sourceStats = await Promise.all([
  serviceDataPath,
  audienceDataPath,
  blogDataPath,
  jobDataPath,
  appPath,
  contactPagePath,
  blogPagePath,
  careerPagePath,
  sourceIndexPath,
].map((path) => stat(path)))
const lastModified = new Date(Math.max(...sourceStats.map((entry) => entry.mtimeMs)))
  .toISOString()
  .slice(0, 10)

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
  description: 'Objektpflege, Wartung, Gebäudereinigung, Gartenpflege, Winterdienst und Wohnungswechsel von Perla’s im Rhein-Main-Gebiet.',
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
  description: 'Vorläufige Informationen zum Datenschutz auf der Website von Perla’s Objektbetreuung.',
  url: privacyUrl.href,
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

function audienceUrl(audience) {
  return new URL(`${basePath}facility-management/${audience.id}/`, siteUrl.origin)
}

function blogPostUrl(post) {
  return new URL(`${basePath}blog/${post.slug}/`, siteUrl.origin)
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

function staticHeader() {
  return `<header class="seo-static-header"><a href="${basePath}"><img src="${basePath}assets/perlas-logo.svg" alt="Perla’s Objektbetreuung GmbH &amp; Co. KG" /></a><nav aria-label="Hauptnavigation"><a href="${basePath}facility-management/">Facility Management</a><a href="${basePath}leistungen/">Leistungen</a><a href="${basePath}ueber-uns/">Über uns</a><a href="${basePath}blog/">Blog</a><a href="${basePath}kontakt/">Kontakt</a></nav></header>`
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
        dateModified: '2026-08-31',
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
  const targetLinks = audiences
    .map((audience) => `<li><a href="${basePath}facility-management/${audience.id}/">${escapeHtml(audience.navLabel)}</a></li>`)
    .join('')

  const partnerNames = [
    'BundesImmobilien',
    'David Lloyd Meridian',
    'David Lloyd Clubs',
    'Immtelli',
    'UNIRESTA',
    'VALO Immobilienmanagement',
    'Zeidler',
    'Bundesanstalt für Immobilienaufgaben',
  ].map((partner) => `<li>${escapeHtml(partner)}</li>`).join('')

  const googleReviews = [
    ['Amanda Li', 'Freundlich, hilfsbereit und zuverlässig.'],
    ['Melanie Michaelpillai', 'Zuverlässig und unkompliziert.'],
    ['Alexis Sheva', 'Kommunikation ist unkompliziert.'],
    ['Challenge 4 Change', 'Schnell, zuverlässig und immer erreichbar.'],
    ['Z D', 'Zuverlässig und sorgfältig.'],
    ['Gabriele Dell Olio', 'Sehr professionelle und saubere Arbeit.'],
  ].map(([author, copy]) => `<li><blockquote>${escapeHtml(copy)}</blockquote><p>${escapeHtml(author)}, Google-Rezension</p></li>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><section class="seo-static-hero"><p>Facility Management im Rhein-Main-Gebiet</p><h1>Facility Management für professionell verwaltete Immobilien.</h1><p>Perla’s bündelt Objektbetreuung, technische Koordination, Reinigung, Außenanlagenpflege und Winterdienst. Hausverwaltungen und gewerbliche Auftraggeber erhalten einen festen Ansprechpartner für die laufenden Aufgaben ihrer Immobilien.</p><a href="${basePath}kontakt/">Betreuung anfragen</a><a href="${basePath}facility-management/">Facility Management ansehen</a></section><section><h2>Für diese Immobilien und Auftraggeber arbeiten wir</h2><ul>${partnerNames}</ul></section><section><h2>5,0 Sterne aus 32 Google-Rezensionen</h2><p>Kurze Auszüge aus öffentlich abgegebenen Bewertungen für Perla’s Objektbetreuung.</p><ul class="seo-static-links">${googleReviews}</ul><a href="https://www.google.com/search?q=Perla%27s+Objektbetreuung+GmbH+%26+Co.+KG+Sulzbach+Rezensionen">Alle Rezensionen bei Google ansehen</a></section><section><h2>Der passende Einstieg für Ihr Objekt</h2><ul class="seo-static-links"><li><a href="${basePath}facility-management/">Facility Management</a><p>Mehrere Aufgaben in einem abgestimmten Betreuungskonzept.</p></li><li><a href="${basePath}leistungen/">Leistungen</a><p>Einzelleistungen für den laufenden Immobilienbetrieb.</p></li><li><a href="${basePath}ueber-uns/">Über uns</a><p>Perla’s Objektbetreuung seit 1999.</p></li><li><a href="${basePath}blog/">Blog</a><p>Praxiswissen für den laufenden Immobilienbetrieb.</p></li><li><a href="${basePath}kontakt/">Kontakt</a><p>Ihr Objekt persönlich besprechen.</p></li></ul></section><section><h2>Betreuung nach Objektart</h2><ul class="seo-static-links">${targetLinks}</ul><a href="${basePath}leistungen/">Weitere Leistungen</a></section><section><h2>Erfahrung, klare Abläufe und ein fester Ansprechpartner</h2><p>Perla’s schafft Übersicht über wiederkehrende Aufgaben und hält Rückmeldungen zu Zustand, Leistung und Handlungsbedarf an einer Stelle zusammen.</p></section><section><h2>Mitarbeiter gesucht</h2><p>Perla’s sucht Verstärkung für Objektbetreuung, Gebäudereinigung und Außenanlagenpflege im Rhein-Main-Gebiet.</p><a href="${basePath}karriere/">Karriere bei Perla’s</a></section></main>`
}

function facilityMarkup() {
  const targets = audiences
    .map((audience) => `<section id="${audience.id}"><h2><a href="${basePath}facility-management/${audience.id}/">Facility Management für ${escapeHtml(audience.title)}</a></h2><p>${escapeHtml(audience.text)}</p><a href="${basePath}facility-management/${audience.id}/">Bereich im Detail ansehen</a><ul class="seo-static-links">${selectedServiceLinks(audience.services)}</ul></section>`)
    .join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Facility Management</nav><section class="seo-static-hero"><p>Facility Management im Rhein-Main-Gebiet</p><h1>Gebäude ganzheitlich betreuen. Aufgaben klar koordinieren.</h1><p>Perla’s bündelt die laufenden Aufgaben größerer und professionell verwalteter Immobilien in einem objektbezogenen Betreuungskonzept.</p><a href="${basePath}kontakt/">Betreuung besprechen</a></section><section><h2>Erst das Objekt verstehen. Dann Leistungen sinnvoll verbinden.</h2><p>Aufgaben, Intervalle, Zuständigkeiten und Rückmeldungen werden objektbezogen abgestimmt. Sichtkontrollen und organisatorische Koordination gehören zur Betreuung. Fachliche Prüfungen und Arbeiten werden mit geeigneten Fachbetrieben koordiniert und nicht als eigene Fachleistung dargestellt.</p></section>${targets}<section><h2>Größere und komplexere Objekte</h2><p>Gebäude- und Gemeinschaftsflächen, Außenanlagen, Winterdienst, Parkflächen, Tiefgaragen und technische Themen werden nach Zuständigkeit gegliedert. Technische Facharbeiten bleiben bei geeigneten Fachbetrieben.</p><a href="${basePath}kontakt/">Objektstruktur besprechen</a></section></main>`
}

function servicesMarkup() {
  const catalog = services
    .map((service) => `<article><h2><a href="${basePath}leistungen/${service.slug}/">${escapeHtml(service.title)}</a></h2><p>${escapeHtml(service.text)}</p><a href="${basePath}leistungen/${service.slug}/">Leistung ansehen</a></article>`)
    .join('')

  const targets = audiences
    .map((audience) => `<li><a href="${basePath}facility-management/${audience.id}/">${escapeHtml(audience.navLabel)}</a></li>`)
    .join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Leistungen</nav><section class="seo-static-hero"><p>Facility Services im Rhein-Main-Gebiet</p><h1>Leistungen für den laufenden Betrieb Ihrer Immobilie.</h1><p>Wählen Sie eine einzelne Leistung oder kombinieren Sie mehrere Aufgaben zu einem objektbezogenen Betreuungskonzept.</p><a href="${basePath}kontakt/">Leistung anfragen</a><a href="${basePath}facility-management/">Facility Management</a></section><section><h2>Für diese Immobilien arbeiten wir</h2><ul class="seo-static-links">${targets}</ul></section><section><h2>Bestehende Leistungen im Detail</h2><div class="seo-static-grid">${catalog}</div></section><section><h2>Wenn aus Einzelleistungen Facility Management wird</h2><p>Bei größeren oder professionell verwalteten Immobilien lassen sich Leistungen, Intervalle, Zuständigkeiten und Rückmeldungen in einem Betreuungskonzept bündeln.</p><a href="${basePath}facility-management/">Facility Management ansehen</a></section></main>`
}

function aboutMarkup() {
  const values = [
    ['Verantwortung', 'Aufgaben, Zuständigkeiten und offene Punkte werden nachvollziehbar eingeordnet.'],
    ['Planbarkeit', 'Wiederkehrende Leistungen erhalten klare Intervalle und abgestimmte Abläufe.'],
    ['Persönliche Abstimmung', 'Ein fester Ansprechpartner bündelt Rückmeldungen und die laufende Koordination.'],
    ['Objektbezug', 'Der tatsächliche Bedarf der Immobilie bildet die Grundlage für den Leistungsumfang.'],
  ].map(([title, text]) => `<article><h2>${title}</h2><p>${text}</p></article>`).join('')
  const team = [
    ['about-team-portrait-1.jpg', 'Porträt einer Mitarbeiterin von Perla’s Objektbetreuung'],
    ['about-team-portrait-2.jpeg', 'Porträt eines Mitarbeiters von Perla’s Objektbetreuung'],
    ['about-team-portrait-3.jpg', 'Porträt eines Mitarbeiters aus dem Team von Perla’s'],
  ].map(([image, alt]) => `<figure><img src="${basePath}assets/${image}" alt="${escapeHtml(alt)}" loading="lazy"><figcaption><strong>Name wird ergänzt</strong><span>Position wird ergänzt</span></figcaption></figure>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Über uns</nav><section class="seo-static-hero"><p>Perla’s Objektbetreuung</p><h1>Seit 1999 für Immobilien im Rhein-Main-Gebiet da.</h1><p>Perla’s verbindet persönliche Abstimmung mit planbarer Objektbetreuung. Wir erfassen Aufgaben vor Ort, koordinieren wiederkehrende Einsätze und halten Rückmeldungen verständlich zusammen.</p><a href="${basePath}kontakt/">Persönlich kennenlernen</a></section><section><h2>Immobilienbetreuung braucht Übersicht und Verbindlichkeit</h2><p>Seit 1999 ist Perla’s im Rhein-Main-Gebiet tätig. Ausgangspunkt bleibt immer das konkrete Objekt: seine Nutzung, die Flächen, die wiederkehrenden Aufgaben und die benötigten Zuständigkeiten.</p><p>Technische Fachprüfungen und qualifikationsgebundene Arbeiten werden klar abgegrenzt und bei Bedarf mit geeigneten Fachbetrieben koordiniert.</p></section><section><h2>Menschen hinter Perla’s</h2><p>Persönliche Ansprechpartner sorgen dafür, dass Absprachen klar bleiben und Aufgaben am Objekt verlässlich zusammenlaufen.</p><div class="seo-static-grid">${team}</div></section><section><h2>Wofür wir stehen</h2><div class="seo-static-grid">${values}</div></section><section><h2>Vom Objektbedarf zum klaren Ablauf</h2><ol><li>Objekt verstehen</li><li>Leistungen festlegen</li><li>Betreuung koordinieren</li></ol></section></main>`
}

function blogMarkup() {
  const articles = blogPosts.map((post) => `<article><img src="${basePath}assets/${escapeHtml(post.image)}" alt="${escapeHtml(post.alt)}" loading="lazy"><p>${escapeHtml(post.category)} · ${escapeHtml(post.readTime)}</p><h2><a href="${basePath}blog/${post.slug}/">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.excerpt)}</p><a href="${basePath}blog/${post.slug}/">Beitrag lesen</a></article>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Blog</nav><section class="seo-static-hero"><p>Wissen aus der Objektbetreuung</p><h1>Praxiswissen für den laufenden Immobilienbetrieb.</h1><p>Verständliche Beiträge zu Facility Management, Gebäudereinigung, Außenanlagen, saisonaler Planung und den Abläufen hinter einer verlässlichen Objektbetreuung.</p></section><section><h2>Alle Beiträge</h2><div class="seo-static-grid">${articles}</div></section><section><h2>Fragen zu Ihrem Objekt?</h2><p>Beschreiben Sie kurz die Immobilie und die Aufgabe, für die Sie eine Lösung suchen.</p><a href="${basePath}kontakt/">Kontakt aufnehmen</a></section></main>`
}

function blogArticleMarkup(post) {
  const sections = post.sections.map((section) => `<section><h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.points ? `<ul>${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}</section>`).join('')
  const related = blogPosts.filter((entry) => entry.slug !== post.slug).slice(0, 2).map((entry) => `<li><a href="${basePath}blog/${entry.slug}/">${escapeHtml(entry.title)}</a></li>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / <a href="${basePath}blog/">Blog</a> / ${escapeHtml(post.category)}</nav><article><header class="seo-static-hero"><p>${escapeHtml(post.category)} · ${escapeHtml(post.readTime)}</p><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.intro)}</p><img src="${basePath}assets/${escapeHtml(post.image)}" alt="${escapeHtml(post.alt)}"></header>${sections}</article><nav aria-label="Weitere Blogbeiträge"><h2>Weitere Beiträge</h2><ul>${related}</ul></nav><section><h2>Was braucht Ihre Immobilie?</h2><p>Wir ordnen Aufgaben, Zuständigkeiten und sinnvolle Intervalle gemeinsam mit Ihnen ein.</p><a href="${basePath}kontakt/">Kontakt aufnehmen</a></section></main>`
}

function careerMarkup() {
  const jobCards = jobs.map((job) => `<article><p>${escapeHtml(job.department)} · ${escapeHtml(job.location)} · ${escapeHtml(job.type)}</p><h2>${escapeHtml(job.title)}</h2><p>${escapeHtml(job.intro)}</p><h3>Typische Aufgaben</h3><ul>${job.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join('')}</ul><h3>Das ist uns wichtig</h3><ul>${job.requirements.map((requirement) => `<li>${escapeHtml(requirement)}</li>`).join('')}</ul></article>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Karriere</nav><section class="seo-static-hero"><p>Mitarbeiter gesucht</p><h1>Gute Objektbetreuung entsteht im Team.</h1><p>Wir suchen zuverlässige Menschen, die gerne praktisch arbeiten, Verantwortung übernehmen und unsere Kunden im Rhein-Main-Gebiet freundlich unterstützen.</p><a href="#stellen">Offene Bereiche ansehen</a><a href="#bewerbung">Initiativ bewerben</a></section><section><h2>Was uns in der Zusammenarbeit wichtig ist</h2><ul><li>Verlässlichkeit</li><li>Verantwortung</li><li>Direkte Abstimmung</li></ul></section><section id="stellen"><h2>Hier suchen wir Verstärkung</h2><div class="seo-static-grid">${jobCards}</div></section><section id="bewerbung"><h2>Kurzbewerbung</h2><p>Schicken Sie Ihre wichtigsten Kontaktdaten und den gewünschten Einsatzbereich an Perla’s.</p><form action="mailto:mail@perlas.de" method="post"><label>Name <input name="name" required></label><label>E-Mail <input type="email" name="email" required></label><label>Gewünschter Bereich <select name="role">${jobs.map((job) => `<option>${escapeHtml(job.title)}</option>`).join('')}<option>Initiativbewerbung</option></select></label><label>Nachricht <textarea name="message" required></textarea></label><button type="submit">Bewerbung vorbereiten</button></form><p><a href="mailto:mail@perlas.de?subject=Bewerbung%20bei%20Perla%27s">Direkt an mail@perlas.de schreiben</a></p></section></main>`
}

function contactMarkup() {
  const steps = [
    ['01', 'Anfrage senden', 'Kontakt per Formular, Telefon, E-Mail oder WhatsApp.'],
    ['02', 'Objekt vor Ort besprechen', 'Flächen, Anforderungen und Besonderheiten werden bei Bedarf gemeinsam aufgenommen.'],
    ['03', 'Leistungen und Intervalle festlegen', 'Aufgaben sowie Reinigungs-, Kontroll-, Wartungs- und Pflegeintervalle werden abgestimmt.'],
    ['04', 'Individuelles Angebot', 'Perla’s erstellt ein Angebot für den vereinbarten Leistungsumfang.'],
    ['05', 'Betreuung starten', 'Ansprechpartner, Termine und organisatorische Abläufe werden geklärt.'],
  ].map(([number, title, text]) => `<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Kontakt</nav><section class="seo-static-hero"><p>Kontakt zu Perla’s</p><h1>Lassen Sie uns über Ihr Objekt sprechen.</h1><p>Besprechen Sie einzelne Leistungen oder ein abgestimmtes Betreuungskonzept für Ihre Immobilie im Rhein-Main-Gebiet.</p><a href="tel:+491776867145">Direkt anrufen</a></section><section><h2>So erreichen Sie uns</h2><ul><li><a href="tel:+491776867145">Telefon: 0177 68 67 145</a></li><li><a href="mailto:mail@perlas.de">E-Mail: mail@perlas.de</a></li><li>Hauptstraße 1, 65843 Sulzbach (Taunus)</li><li><a href="https://www.google.com/maps/dir/?api=1&amp;destination=Hauptstra%C3%9Fe%201%2C%2065843%20Sulzbach%20(Taunus)%2C%20Deutschland">Route in Google Maps öffnen</a></li></ul></section><section><h2>So läuft Ihre Anfrage ab</h2><div class="seo-static-grid">${steps}</div></section></main>`
}

function legalMarkup(type) {
  if (type === 'imprint') {
    return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Impressum</nav><section class="seo-static-hero"><p>Rechtliche Informationen</p><h1>Impressum</h1><p>Vorläufiger Platzhalter. Fehlende Pflichtangaben werden vor dem finalen Livegang ergänzt.</p></section><section><h2>Angaben zum Anbieter</h2><p>Perla’s Objektbetreuung GmbH &amp; Co. KG<br>Hauptstraße 1<br>65843 Sulzbach (Taunus)<br>Deutschland</p><h2>Kontakt</h2><p>Telefon: 0177 68 67 145<br>E-Mail: mail@perlas.de</p><h2>Noch zu ergänzen</h2><p>Vertretungsberechtigte Person, Registergericht, Registernummer, Umsatzsteuer-ID und inhaltlich verantwortliche Person.</p></section></main>`
  }

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Datenschutz</nav><section class="seo-static-hero"><p>Rechtliche Informationen</p><h1>Datenschutzerklärung</h1><p>Vorläufiger Platzhalter. Die Angaben werden nach der finalen Hosting- und Diensteauswahl rechtlich geprüft und vervollständigt.</p></section><section><h2>Verantwortliche Stelle</h2><p>Perla’s Objektbetreuung GmbH &amp; Co. KG, Hauptstraße 1, 65843 Sulzbach (Taunus), mail@perlas.de</p><h2>Kontaktaufnahme und Bewerbungen</h2><p>Angaben aus Kontakt-, Angebots- und Bewerbungsanfragen werden zur Bearbeitung der jeweiligen Anfrage verwendet. Ohne konfiguriertes Backend bereiten die Formulare eine E-Mail im E-Mail-Programm des Nutzers vor. Nach einer späteren API-Anbindung werden Empfänger, Speicherdauer und technische Verarbeitung vor dem Produktivbetrieb abschließend ergänzt.</p><h2>Technische Daten und Cookies</h2><p>Server-Protokolle, eingesetzte Dienste, Speicherdauern und Rechtsgrundlagen werden vor dem Produktivbetrieb abschließend ergänzt.</p></section></main>`
}

function serviceMarkup(service) {
  const scopes = service.scopeCards.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p><ul>${item.items.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul></article>`).join('')
  const process = service.processSteps.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join('')
  const audiences = service.audiences.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const faqs = service.faqs.map((item) => `<details open><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')
  const related = relatedServiceLinks(service)

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / <a href="${basePath}leistungen/">Leistungen</a> / ${escapeHtml(service.title)}</nav><section class="seo-static-hero"><p>Facility Services im Rhein-Main-Gebiet</p><h1>${escapeHtml(service.title)}</h1><p>${escapeHtml(service.detail)}</p><a href="${basePath}kontakt/">Individuelles Angebot anfragen</a><a href="tel:+491776867145">Direkt anrufen</a><a href="mailto:mail@perlas.de">E-Mail schreiben</a></section><section><h2>Was wir bei ${escapeHtml(service.title)} konkret übernehmen</h2><p>${escapeHtml(service.scopeIntro)}</p><div class="seo-static-grid">${scopes}</div></section><section><h2>So läuft die Zusammenarbeit ab</h2><div class="seo-static-grid">${process}</div></section><section><h2>Für diese Objekte geeignet</h2><ul>${audiences}</ul><h2>${escapeHtml(service.boundaryTitle)}</h2><p>${escapeHtml(service.boundaryText)}</p></section><section><h2>Häufige Fragen zu ${escapeHtml(service.title)}</h2>${faqs}</section><section><h2>Wie möchten Sie Kontakt aufnehmen?</h2><p>Nutzen Sie das Angebotsformular oder sprechen Sie direkt mit Perla’s.</p><ul><li><a href="${basePath}kontakt/">Angebot für ${escapeHtml(service.title)} anfragen</a></li><li><a href="tel:+491776867145">Direkt anrufen: 0177 68 67 145</a></li><li><a href="mailto:mail@perlas.de">E-Mail an mail@perlas.de schreiben</a></li></ul></section><nav aria-label="Passende Leistungen"><h2>Diese Leistungen könnten ebenfalls relevant sein</h2><ul class="seo-static-links">${related}</ul></nav></main>`
}

function audienceMarkup(audience) {
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
  const contactForm = `<form action="mailto:mail@perlas.de" method="post" enctype="text/plain"><input type="hidden" name="Thema" value="Facility Management für ${escapeHtml(audience.navLabel)}"><label>Name *<input type="text" name="Name" autocomplete="name" required></label><label>Unternehmen / Verwaltung<input type="text" name="Unternehmen" autocomplete="organization"></label><label>E-Mail *<input type="email" name="E-Mail" autocomplete="email" required></label><label>Telefon<input type="tel" name="Telefon" autocomplete="tel"></label><label>Angaben zum Objekt *<textarea name="Objekt" rows="4" required></textarea></label><label><input type="checkbox" required> Ich habe die <a href="${basePath}datenschutz/">Datenschutzhinweise</a> gelesen.</label><button type="submit">Anfrage per E-Mail vorbereiten</button></form>`

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / <a href="${basePath}facility-management/">Facility Management</a> / ${escapeHtml(audience.navLabel)}</nav><section class="seo-static-hero"><p>Facility Management für</p><h1>${escapeHtml(audience.heroTitle)}</h1><p>${escapeHtml(audience.heroText)}</p><a href="${basePath}kontakt/">Betreuung anfragen</a><a href="tel:+491776867145">Direkt anrufen</a><img src="${basePath}assets/${escapeHtml(audience.image.src)}" alt="${escapeHtml(audience.image.alt)}"></section><section><h2>${escapeHtml(audience.introTitle)}</h2><p>${escapeHtml(audience.introText)}</p><div class="seo-static-grid">${scopes}</div></section><section><h2>Im Alltag zählen klare Zuständigkeiten</h2><ul>${requirements}</ul><h2>Ein Betreuungskonzept, das zum Objekt passt</h2><p>${escapeHtml(audience.approach)}</p></section><section><h2>Passende Leistungen für ${escapeHtml(audience.navLabel)}</h2><ul class="seo-static-links">${selectedServiceLinks(audience.services)}</ul></section><section><h2>Vom Objekt zum klaren Ablauf</h2><div class="seo-static-grid">${process}</div></section><section><h2>Häufige Fragen zu ${escapeHtml(audience.navLabel)}</h2>${faqs}</section><section><h2>Passt diese Betreuung zu Ihrem Objekt?</h2><p>Beschreiben Sie kurz Ihre Immobilie, den Standort und die Aufgaben, die Sie abgeben möchten.</p>${contactForm}<ul><li><a href="tel:+491776867145">Direkt anrufen: 0177 68 67 145</a></li><li><a href="mailto:mail@perlas.de">E-Mail an mail@perlas.de schreiben</a></li><li><a href="${basePath}kontakt/">Allgemeine Kontaktseite öffnen</a></li></ul></section></main>`
}

function buildPage({ title, description, url, markup, data, robots = pageRobots, ogType = 'website' }) {
  const socialImage = new URL(`${basePath}assets/perlas-hero.png`, siteUrl.origin).href
  const extraHead = `
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:locale" content="de_DE" />
    <meta property="og:type" content="${ogType}" />
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
