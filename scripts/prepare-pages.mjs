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
  return `<header class="seo-static-header"><a href="${basePath}"><img src="${basePath}assets/perlas-logo.svg" alt="Perla’s Objektbetreuung GmbH &amp; Co. KG" /></a><nav aria-label="Hauptnavigation"><a href="${basePath}facility-management/">Facility Management</a><a href="${basePath}leistungen/">Leistungen</a><a href="${basePath}ueber-uns/">Über uns</a><a href="${basePath}kontakt/">Angebot anfragen</a><a href="${basePath}kontakt/">Kontakt</a></nav></header>`
}

function selectedServiceLinks(slugs) {
  return slugs
    .map((slug) => services.find((service) => service.slug === slug))
    .filter(Boolean)
    .map((service) => `<li><a href="${basePath}leistungen/${service.slug}/">${escapeHtml(service.title)}</a></li>`)
    .join('')
}

function homeMarkup() {
  return `${staticHeader()}<main class="seo-static-main"><section class="seo-static-hero"><p>Facility Management im Rhein-Main-Gebiet</p><h1>Facility Management für professionell verwaltete Immobilien.</h1><p>Perla’s bündelt Objektbetreuung, technische Koordination, Reinigung, Außenanlagenpflege und Winterdienst. Hausverwaltungen und gewerbliche Auftraggeber erhalten einen festen Ansprechpartner für die laufenden Aufgaben ihrer Immobilien.</p><a href="${basePath}kontakt/">Betreuung anfragen</a><a href="${basePath}facility-management/">Facility Management ansehen</a></section><section><h2>Der passende Einstieg für Ihr Objekt</h2><ul class="seo-static-links"><li><a href="${basePath}facility-management/">Facility Management</a><p>Mehrere Aufgaben in einem abgestimmten Betreuungskonzept.</p></li><li><a href="${basePath}leistungen/">Leistungen</a><p>Einzelleistungen für den laufenden Immobilienbetrieb.</p></li><li><a href="${basePath}ueber-uns/">Über uns</a><p>Perla’s Objektbetreuung seit 1999.</p></li><li><a href="${basePath}kontakt/">Kontakt</a><p>Ihr Objekt persönlich besprechen.</p></li></ul></section><section><h2>Betreuung nach Objektart</h2><ul class="seo-static-links"><li><a href="${basePath}facility-management/#hausverwaltungen">Hausverwaltungen</a></li><li><a href="${basePath}facility-management/#wohnanlagen">Größere Wohnanlagen</a></li><li><a href="${basePath}facility-management/#gewerbeimmobilien">Gewerbeimmobilien</a></li><li><a href="${basePath}facility-management/#institutionelle-gebaeude">Institutionelle &amp; öffentliche Gebäude</a></li></ul><a href="${basePath}leistungen/">Weitere Leistungen</a></section><section><h2>Erfahrung, klare Abläufe und ein fester Ansprechpartner</h2><p>Perla’s schafft Übersicht über wiederkehrende Aufgaben und hält Rückmeldungen zu Zustand, Leistung und Handlungsbedarf an einer Stelle zusammen.</p></section></main>`
}

function facilityMarkup() {
  const targets = [
    {
      id: 'hausverwaltungen',
      title: 'Hausverwaltungen',
      text: 'Klare Zuständigkeiten und gebündelte Rückmeldungen für professionell verwaltete Immobilienbestände.',
      services: ['objektpflege', 'gebaeudereinigung', 'wartung-instandhaltung', 'gartenpflege', 'winterdienst'],
    },
    {
      id: 'wohnanlagen',
      title: 'Größere Wohnanlagen & Immobilienbestände',
      text: 'Laufende Betreuung gemeinschaftlich genutzter Gebäude- und Außenbereiche mit planbaren Abläufen.',
      services: ['objektpflege', 'gebaeudereinigung', 'wartung-instandhaltung', 'gartenpflege', 'winterdienst', 'wohnungswechsel'],
    },
    {
      id: 'gewerbeimmobilien',
      title: 'Gewerbeimmobilien & Unternehmensstandorte',
      text: 'Objektbetreuung, Reinigung und technische Aufgaben werden passend zu Nutzung und laufendem Betrieb kombiniert.',
      services: ['objektpflege', 'wartung-instandhaltung', 'gebaeudereinigung', 'gartenpflege', 'winterdienst'],
    },
    {
      id: 'institutionelle-gebaeude',
      title: 'Büro-, Praxis-, institutionelle & öffentliche Gebäude',
      text: 'Feste Zuständigkeiten und planbare Leistungen für regelmäßig genutzte institutionelle und öffentliche Innen- und Außenbereiche.',
      services: ['objektpflege', 'gebaeudereinigung', 'wartung-instandhaltung', 'winterdienst', 'gartenpflege'],
    },
  ].map((target) => `<section id="${target.id}"><h2>Facility Management für ${escapeHtml(target.title)}</h2><p>${escapeHtml(target.text)}</p><ul class="seo-static-links">${selectedServiceLinks(target.services)}</ul></section>`).join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Facility Management</nav><section class="seo-static-hero"><p>Facility Management im Rhein-Main-Gebiet</p><h1>Gebäude ganzheitlich betreuen. Aufgaben klar koordinieren.</h1><p>Perla’s bündelt die laufenden Aufgaben größerer und professionell verwalteter Immobilien in einem objektbezogenen Betreuungskonzept.</p><a href="${basePath}kontakt/">Betreuung besprechen</a></section><section><h2>Erst das Objekt verstehen. Dann Leistungen sinnvoll verbinden.</h2><p>Aufgaben, Intervalle, Zuständigkeiten und Rückmeldungen werden objektbezogen abgestimmt. Sichtkontrollen und organisatorische Koordination gehören zur Betreuung. Fachliche Prüfungen und Arbeiten werden mit geeigneten Fachbetrieben koordiniert und nicht als eigene Fachleistung dargestellt.</p></section>${targets}<section><h2>Größere und komplexere Objekte</h2><p>Gebäude- und Gemeinschaftsflächen, Außenanlagen, Winterdienst, Parkflächen, Tiefgaragen und technische Themen werden nach Zuständigkeit gegliedert. Technische Facharbeiten bleiben bei geeigneten Fachbetrieben.</p><a href="${basePath}kontakt/">Objektstruktur besprechen</a></section></main>`
}

function servicesMarkup() {
  const catalog = services
    .map((service) => `<article><h2><a href="${basePath}leistungen/${service.slug}/">${escapeHtml(service.title)}</a></h2><p>${escapeHtml(service.text)}</p><a href="${basePath}leistungen/${service.slug}/">Leistung ansehen</a></article>`)
    .join('')

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Leistungen</nav><section class="seo-static-hero"><p>Facility Services im Rhein-Main-Gebiet</p><h1>Leistungen für den laufenden Betrieb Ihrer Immobilie.</h1><p>Wählen Sie eine einzelne Leistung oder kombinieren Sie mehrere Aufgaben zu einem objektbezogenen Betreuungskonzept.</p><a href="${basePath}kontakt/">Leistung anfragen</a><a href="${basePath}facility-management/">Facility Management</a></section><section><h2>Bestehende Leistungen im Detail</h2><div class="seo-static-grid">${catalog}</div></section><section><h2>Wenn aus Einzelleistungen Facility Management wird</h2><p>Bei größeren oder professionell verwalteten Immobilien lassen sich Leistungen, Intervalle, Zuständigkeiten und Rückmeldungen in einem Betreuungskonzept bündeln.</p><a href="${basePath}facility-management/">Facility Management ansehen</a></section></main>`
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

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / Datenschutz</nav><section class="seo-static-hero"><p>Rechtliche Informationen</p><h1>Datenschutzerklärung</h1><p>Vorläufiger Platzhalter. Die Angaben werden nach der finalen Hosting- und Diensteauswahl rechtlich geprüft und vervollständigt.</p></section><section><h2>Verantwortliche Stelle</h2><p>Perla’s Objektbetreuung GmbH &amp; Co. KG, Hauptstraße 1, 65843 Sulzbach (Taunus), mail@perlas.de</p><h2>Kontaktaufnahme</h2><p>Angaben aus Kontakt- und Angebotsanfragen werden zur Bearbeitung der jeweiligen Anfrage verwendet.</p><h2>Technische Daten und Cookies</h2><p>Server-Protokolle, eingesetzte Dienste, Speicherdauern und Rechtsgrundlagen werden vor dem Produktivbetrieb abschließend ergänzt.</p></section></main>`
}

function serviceMarkup(service) {
  const scopes = service.scopeCards.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p><ul>${item.items.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul></article>`).join('')
  const process = service.processSteps.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join('')
  const audiences = service.audiences.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const faqs = service.faqs.map((item) => `<details open><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')
  const related = relatedServiceLinks(service)

  return `${staticHeader()}<main class="seo-static-main"><nav aria-label="Brotkrümeln"><a href="${basePath}">Startseite</a> / <a href="${basePath}leistungen/">Leistungen</a> / ${escapeHtml(service.title)}</nav><section class="seo-static-hero"><p>Facility Services im Rhein-Main-Gebiet</p><h1>${escapeHtml(service.title)}</h1><p>${escapeHtml(service.detail)}</p><a href="${basePath}kontakt/">Individuelles Angebot anfragen</a><a href="tel:+491776867145">Direkt anrufen</a><a href="mailto:mail@perlas.de">E-Mail schreiben</a></section><section><h2>Was wir bei ${escapeHtml(service.title)} konkret übernehmen</h2><p>${escapeHtml(service.scopeIntro)}</p><div class="seo-static-grid">${scopes}</div></section><section><h2>So läuft die Zusammenarbeit ab</h2><div class="seo-static-grid">${process}</div></section><section><h2>Für diese Objekte geeignet</h2><ul>${audiences}</ul><h2>${escapeHtml(service.boundaryTitle)}</h2><p>${escapeHtml(service.boundaryText)}</p></section><section><h2>Häufige Fragen zu ${escapeHtml(service.title)}</h2>${faqs}</section><section><h2>Wie möchten Sie Kontakt aufnehmen?</h2><p>Nutzen Sie das Angebotsformular oder sprechen Sie direkt mit Perla’s.</p><ul><li><a href="${basePath}kontakt/">Angebot für ${escapeHtml(service.title)} anfragen</a></li><li><a href="tel:+491776867145">Direkt anrufen: 0177 68 67 145</a></li><li><a href="mailto:mail@perlas.de">E-Mail an mail@perlas.de schreiben</a></li></ul></section><nav aria-label="Passende Leistungen"><h2>Diese Leistungen könnten ebenfalls relevant sein</h2><ul class="seo-static-links">${related}</ul></nav></main>`
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

await mkdir(`${distPath}facility-management/`, { recursive: true })
await writeFile(`${distPath}facility-management/index.html`, buildPage({
  ...facilitySeo,
  markup: facilityMarkup(),
  data: facilityStructuredData(),
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

const sitemapUrls = [siteUrl.href, facilityUrl.href, servicesUrl.href, aboutUrl.href, contactUrl.href, imprintUrl.href, privacyUrl.href, ...services.map((service) => serviceUrl(service).href)]
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
