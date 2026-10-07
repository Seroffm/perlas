import { ArrowUpRight, CheckCircle2, Phone } from 'lucide-react'
import QuickContactForm from './QuickContactForm'
import ResponsiveImage from './ResponsiveImage'
import type { BlogPostContent, LocalLandingContent } from './content-types'

const BASE_PATH = import.meta.env.BASE_URL
const REGIONS_PATH = `${BASE_PATH}einsatzgebiete/`
const PHONE_HREF = 'tel:+491776867145'
type ServiceLink = { slug: string; title: string; text: string }

function PhoneLink({ light = false }: { light?: boolean }) {
  // The shared contact-click listener measures this exact public telephone link.
  return <a className={`local-action${light ? ' local-action--light' : ''}`} href={PHONE_HREF}><Phone aria-hidden="true" /> 0177 68 67 145</a>
}

export default function LocalLandingPage({ page, services, guides }: {
  page: LocalLandingContent
  services: ServiceLink[]
  guides: BlogPostContent[]
}) {
  const service = services.find((entry) => entry.slug === page.serviceSlug)
  const relatedGuides = page.guideSlugs
    .map((slug) => guides.find((guide) => guide.slug === slug))
    .filter((guide): guide is BlogPostContent => Boolean(guide))
  const updated = new Intl.DateTimeFormat('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin',
  }).format(new Date(`${page.updatedOn}T12:00:00Z`))

  return (
    <main className="local-landing-page">
      <nav className="local-breadcrumb" aria-label="Brotkrümeln">
        <a href={BASE_PATH}>Startseite</a><span aria-hidden="true">/</span>
        <a href={REGIONS_PATH}>Einsatzgebiete</a><span aria-hidden="true">/</span>
        <span aria-current="page">{page.heading}</span>
      </nav>

      <section className="local-hero" aria-labelledby="local-page-heading">
        <div className="local-hero-copy">
          <span className="local-eyebrow">Perla’s für {page.locality}</span>
          <h1 id="local-page-heading">{page.heading}</h1>
          <p>{page.intro}</p>
          <div className="local-actions">
            <a className="local-action local-action--light" href="#anfrage">{page.ctaText}<ArrowUpRight aria-hidden="true" /></a>
            <PhoneLink light />
          </div>
          <p className="local-hero-note">Persönlich abstimmen · Standort Sulzbach (Taunus)</p>
        </div>
        <figure className="local-hero-media">
          <ResponsiveImage
            asset={page.heroImage.src}
            alt={page.heroImage.alt}
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1320px) 54vw, 700px"
            style={{ objectPosition: page.heroImage.position ?? '50% 50%' }}
            loading="eager"
            fetchPriority="high"
          />
          <figcaption>Bildbeispiel aus unserem Leistungsangebot.</figcaption>
        </figure>
      </section>

      <section className="local-section" aria-labelledby="local-scope-heading">
        <div className="local-section-heading">
          <span className="local-eyebrow">Ihr Leistungsumfang</span>
          <h2 id="local-scope-heading">Leistungen für Ihre Immobilie.</h2>
          <p>{page.scopeIntro}</p>
        </div>
        <div className="local-scope-grid">
          {page.scopeCards.map((card) => (
            <article key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <ul>
                {card.items.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" /><span>{item}</span></li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="local-section local-fit" aria-labelledby="local-fit-heading">
        <div>
          <span className="local-eyebrow">Objekt und Nutzung</span>
          <h2 id="local-fit-heading">Für wen passt diese Leistung?</h2>
          <p>{page.audience}</p>
        </div>
        <div className="local-provider">
          <h3>Ein Ansprechpartner aus Sulzbach.</h3>
          <p>Perla’s Objektbetreuung hat seinen Unternehmensstandort in Sulzbach (Taunus). Diese Seite beschreibt ein Einsatzgebiet, keine zusätzliche Niederlassung.</p>
          <address>Hauptstraße 1 · 65843 Sulzbach (Taunus)</address>
          <a href={`${BASE_PATH}ueber-uns/`}>Team und Arbeitsweise kennenlernen <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </section>

      <section className="local-section" aria-labelledby="local-process-heading">
        <div className="local-section-heading">
          <span className="local-eyebrow">Vom Bedarf zum Auftrag</span>
          <h2 id="local-process-heading">So stimmen wir den Einsatz ab.</h2>
        </div>
        <ol className="local-process-list">
          {page.processSteps.map((step, index) => (
            <li key={step.title}>
              <span className="local-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{step.title}</h3><p>{step.text}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="local-section local-cost" aria-labelledby="local-cost-heading">
        <div>
          <span className="local-eyebrow">Ein Angebot für Ihre Immobilie</span>
          <h2 id="local-cost-heading">{page.costTitle}</h2>
          <p>{page.costText}</p>
        </div>
        <a className="local-action" href="#anfrage">Bedarf unverbindlich besprechen <ArrowUpRight aria-hidden="true" /></a>
      </section>

      <section className="local-section local-faq" aria-labelledby="local-faq-heading">
        <div className="local-section-heading">
          <span className="local-eyebrow">Vor Ihrer Anfrage</span>
          <h2 id="local-faq-heading">Häufige Fragen.</h2>
        </div>
        <div className="local-faq-list">
          {page.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}<span aria-hidden="true">+</span></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="local-section local-inquiry" aria-labelledby="local-inquiry-heading">
        <div className="local-inquiry-copy">
          <span className="local-eyebrow">Ihr nächster Schritt</span>
          <h2 id="local-inquiry-heading">{page.ctaText}</h2>
          <p>Nennen Sie uns den Standort, die Objektart und den gewünschten Umfang. Wir klären persönlich, ob und wie wir Ihr Objekt betreuen können.</p>
          <PhoneLink light />
          <a className="local-contact-email" href="mailto:mail@perlas.de">mail@perlas.de</a>
          <p>Für den ersten Kontakt ist keine vollständige Objektadresse erforderlich.</p>
        </div>
        <div className="local-inquiry-form" id="anfrage"><QuickContactForm topic={page.heading} /></div>
      </section>

      {(service || relatedGuides.length > 0) && (
        <section className="local-section" aria-labelledby="local-related-heading">
          <div className="local-section-heading">
            <span className="local-eyebrow">Passende Vertiefung</span>
            <h2 id="local-related-heading">Leistung und Vorbereitung.</h2>
          </div>
          <div className="local-related-grid">
            {service && (
              <a href={`${BASE_PATH}leistungen/${service.slug}/`}>
                <span>Leistungsumfang</span><h3>{service.title}</h3><p>{service.text}</p>
                <strong>Allgemeine Leistung ansehen <ArrowUpRight aria-hidden="true" /></strong>
              </a>
            )}
            {relatedGuides.map((guide) => (
              <a href={`${BASE_PATH}blog/${guide.slug}/`} key={guide.slug}>
                <span>Praxiswissen</span><h3>{guide.title}</h3><p>{guide.excerpt}</p>
                <strong>Ratgeber lesen <ArrowUpRight aria-hidden="true" /></strong>
              </a>
            ))}
          </div>
        </section>
      )}
      <div className="local-section local-page-end">
        <a href={REGIONS_PATH}>Weitere Leistungen und Standorte ansehen <ArrowUpRight aria-hidden="true" /></a>
        <p>Inhaltlich aktualisiert: <time dateTime={page.updatedOn}>{updated}</time></p>
      </div>
    </main>
  )
}

export function RegionalLandingHub({ pages, heading, intro }: {
  pages: LocalLandingContent[]
  heading: string
  intro: string
}) {
  return (
    <main className="local-landing-page local-region-hub">
      <nav className="local-breadcrumb" aria-label="Brotkrümeln">
        <a href={BASE_PATH}>Startseite</a><span aria-hidden="true">/</span><span aria-current="page">Einsatzgebiete</span>
      </nav>
      <section className="local-section local-hub-intro" aria-labelledby="local-hub-heading">
        <span className="local-eyebrow">Aus Sulzbach für Ihre Immobilie</span>
        <h1 id="local-hub-heading">{heading}</h1>
        <p>{intro}</p>
        <div className="local-actions"><a className="local-action" href={`${BASE_PATH}kontakt/`}>Objekt und Standort besprechen <ArrowUpRight aria-hidden="true" /></a><PhoneLink /></div>
      </section>
      <section className="local-section" aria-labelledby="local-hub-options-heading">
        <div className="local-section-heading"><span className="local-eyebrow">Passenden Bereich auswählen</span><h2 id="local-hub-options-heading">Auf Ihre Aufgaben abgestimmt.</h2></div>
        <div className="local-hub-grid">
          {pages.map((page) => (
            <a className="local-hub-card" href={`${REGIONS_PATH}${page.slug}/`} key={page.slug}>
              <ResponsiveImage asset={page.heroImage.src} alt={page.heroImage.alt} sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1100px) 50vw, 540px" style={{ objectPosition: page.heroImage.position ?? '50% 50%' }} />
              <div><span>{page.locality}</span><h3>{page.heading}</h3><p>{page.scopeIntro}</p><strong>Leistung vor Ort besprechen <ArrowUpRight aria-hidden="true" /></strong></div>
            </a>
          ))}
        </div>
        <p className="local-photo-note">Die Bilder geben Einblicke in unseren Bildbestand und sind keine ortsspezifischen Referenzen.</p>
      </section>
      <section className="local-section local-hub-contact" aria-labelledby="local-hub-contact-heading">
        <div><span className="local-eyebrow">Objektbezogen prüfen</span><h2 id="local-hub-contact-heading">Ihr Standort ist noch nicht dabei?</h2><p>Auch andere Standorte im Main-Taunus-Kreis und im angrenzenden Rhein-Main-Gebiet prüfen wir für Ihr konkretes Objekt. Fragen Sie den gewünschten Leistungsumfang direkt bei unserem Team in Sulzbach (Taunus) an.</p></div>
        <div className="local-actions"><a className="local-action" href={`${BASE_PATH}kontakt/`}>Betreuung anfragen <ArrowUpRight aria-hidden="true" /></a><PhoneLink /></div>
      </section>
    </main>
  )
}
