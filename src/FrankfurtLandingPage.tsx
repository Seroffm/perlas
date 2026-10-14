import { ArrowRight, ArrowUpRight, Check, CheckCircle2, ClipboardCheck, Mail, MapPin, Phone, Star } from 'lucide-react'
import QuickContactForm from './QuickContactForm'
import ResponsiveImage from './ResponsiveImage'
import googleReviewData from './google-reviews-data.json'
import type { LocalLandingContent } from './content-types'
import './frankfurt-landing.css'

const BASE_PATH = import.meta.env.BASE_URL
const PHONE_HREF = 'tel:+491776867145'

export const frankfurtServiceImages = [
  { asset: 'kundenbilder/fahrzeuge/perlas_fahrzeug_wohnobjekt_02.png', alt: 'Perla’s Servicefahrzeug vor einem Wohngebäude', service: 'objektpflege', position: '50% 59%' },
  { asset: 'kundenbilder/leistungen/gebaeudereinigung_flur.png', alt: 'Reinigungsarbeit in einem gemeinschaftlich genutzten Flur', service: 'gebaeudereinigung', position: '50% 54%' },
  { asset: 'kundenbilder/leistungen/gartenpflege_hecke_01.png', alt: 'Heckenschnitt mit einer motorisierten Heckenschere', service: 'gartenpflege', position: '50% 46%' },
  { asset: 'kundenbilder/leistungen/muellmanagement/muellmanagement_tonne_bewegen_01.png', alt: 'Perla’s Mitarbeiter bewegt eine Mülltonne am Objekt', service: 'muellmanagement', position: '50% 50%' },
  { asset: 'kundenbilder/leistungen/winterdienst_team.png', alt: 'Perla’s Team beim Winterdienst mit Streugerät', service: 'winterdienst', position: '50% 50%' },
  { asset: 'kundenbilder/leistungen/kleinreparatur_bohren.png', alt: 'Kleine Instandhaltungsarbeit mit Bohrmaschine am Objekt', service: 'wartung-instandhaltung', position: '50% 42%' },
]

export const frankfurtPartners = [
  { name: 'David Lloyd Clubs', asset: 'partners/david-lloyd-clubs.png' },
  { name: 'Immtelli', asset: 'partners/immtelli.png' },
  { name: 'UNIRESTA', asset: 'partners/uniresta.jpeg' },
  { name: 'VALO Immobilienmanagement', asset: 'partners/valo.png' },
  { name: 'Zeidler', asset: 'partners/zeidler.webp' },
]

const featuredReviews = ['Amanda L.', 'Alexis S.', 'Gabriele D.']
  .map((author) => googleReviewData.reviews.find((review) => review.author === author))
  .filter((review): review is (typeof googleReviewData.reviews)[number] => Boolean(review))

function FrankfurtPhone({ light = false }: { light?: boolean }) {
  return <a className={`ff-phone${light ? ' ff-phone--light' : ''}`} href={PHONE_HREF}><Phone aria-hidden="true" /><span>0177 68 67 145</span></a>
}

export default function FrankfurtLandingPage({ page, staticMode = false }: { page: LocalLandingContent; staticMode?: boolean }) {
  const updated = new Intl.DateTimeFormat('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin',
  }).format(new Date(`${page.updatedOn}T12:00:00Z`))

  return (
    <main className="ff-landing">
      <nav className="ff-container ff-breadcrumb" aria-label="Brotkrümeln">
        <a href={BASE_PATH}>Startseite</a><span aria-hidden="true">/</span>
        <a href={`${BASE_PATH}einsatzgebiete/`}>Einsatzgebiete</a><span aria-hidden="true">/</span>
        <span aria-current="page">Hausmeisterservice Frankfurt</span>
      </nav>

      <section className="ff-container ff-hero" aria-labelledby="ff-heading">
        <div className="ff-hero-copy">
          <span className="ff-eyebrow"><span aria-hidden="true" /> Frankfurt am Main & Umgebung</span>
          <h1 id="ff-heading">{page.heading}</h1>
          <p className="ff-hero-promise">Ihr Objekt im Blick.<br />Ihr Alltag entlastet.</p>
          <p className="ff-hero-intro">{page.intro}</p>
          <div className="ff-actions">
            <a className="ff-button" href="#anfrage">{page.ctaText}<ArrowUpRight aria-hidden="true" /></a>
            <FrankfurtPhone />
          </div>
          <p className="ff-hero-note"><CheckCircle2 aria-hidden="true" /> Unverbindlich anfragen. Persönlich abstimmen.</p>
        </div>
        <div className="ff-hero-visual">
          <figure className="ff-hero-photo">
            <ResponsiveImage
              asset={page.heroImage.src}
              alt={page.heroImage.alt}
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1100px) 50vw, 610px"
              style={{ objectPosition: page.heroImage.position ?? '50% 50%' }}
            />
            <figcaption><MapPin aria-hidden="true" /> Einblick in unsere Objektbetreuung</figcaption>
          </figure>
          <a className="ff-hero-team" href={`${BASE_PATH}ueber-uns/`}>
            <ResponsiveImage asset="kundenbilder/team/update-2026-09-23/mitarbeiter_aelterer_hauswart_01.png" alt="Perla’s Mitarbeiter mit Werkzeug am Gebäudeeingang" sizes="100px" />
            <span><small>Persönlich für Sie da</small><strong>Das Perla’s Team.</strong><span>Menschen kennenlernen <ArrowUpRight aria-hidden="true" /></span></span>
          </a>
        </div>
      </section>

      <section className="ff-container ff-proof" aria-label="Perla’s auf einen Blick">
        <div><strong>Seit 1999</strong><span>Erfahrung in der Objektbetreuung</span></div>
        <div><strong>10+</strong><span>Mitarbeitende im Team</span></div>
        <div><strong>Ein Kontakt</strong><span>für Ihre laufende Betreuung</span></div>
        <div><strong>Rhein-Main</strong><span>aus Sulzbach für Ihre Immobilie</span></div>
      </section>

      <section className="ff-container ff-partners" aria-labelledby="ff-partners-heading">
        <h2 id="ff-partners-heading">Ausgewählte Kunden, die auf Perla’s setzen.</h2>
        <div className="ff-partner-grid">
          {frankfurtPartners.map((partner) => (
            <div className="ff-partner" key={partner.name}>
              <ResponsiveImage asset={partner.asset} alt={partner.name} sizes="(max-width: 600px) 120px, 170px" />
            </div>
          ))}
        </div>
      </section>

      <section className="ff-service-section" aria-labelledby="ff-services-heading">
        <div className="ff-container">
          <div className="ff-section-heading ff-section-heading--split">
            <div><span className="ff-eyebrow">So viel Betreuung, wie Ihr Objekt braucht</span><h2 id="ff-services-heading">Ein Hausmeisterservice.<br />Viele Aufgaben erledigt.</h2></div>
            <p>{page.scopeIntro}</p>
          </div>
          <div className="ff-service-grid">
            {page.scopeCards.map((card, index) => {
              const media = frankfurtServiceImages[index % frankfurtServiceImages.length]
              return (
                <a className="ff-service-card" href={`${BASE_PATH}leistungen/${media.service}/`} key={card.title}>
                  <div className="ff-service-photo"><ResponsiveImage asset={media.asset} alt={media.alt} style={{ objectPosition: media.position }} sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 900px) 45vw, 370px" /><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></div>
                  <div className="ff-service-copy"><h3>{card.title}<ArrowUpRight aria-hidden="true" /></h3><p>{card.text}</p><ul>{card.items.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></div>
                </a>
              )
            })}
          </div>
          <div className="ff-service-footer"><p><CheckCircle2 aria-hidden="true" /> Aufgaben, Intervalle und Zusatzleistungen werden im Angebot klar vereinbart.</p><a href="#anfrage">Passenden Umfang besprechen <ArrowRight aria-hidden="true" /></a></div>
        </div>
      </section>

      <section className="ff-container ff-reviews" aria-labelledby="ff-reviews-heading">
        <div className="ff-section-heading ff-section-heading--split">
          <div><span className="ff-eyebrow">Was Kunden an uns schätzen</span><h2 id="ff-reviews-heading">Vertrauen kommt<br />aus dem Alltag.</h2></div>
          <a className="ff-google-link" href={googleReviewData.profileUrl} target="_blank" rel="noreferrer"><img src={`${BASE_PATH}assets/google-g.svg`} alt="" width="26" height="26" /><span>Rezensionen bei Google ansehen</span><ArrowUpRight aria-hidden="true" /></a>
        </div>
        <div className="ff-review-grid">
          {featuredReviews.map((review) => (
            <figure className="ff-review-card" key={review.author}>
              <div className="ff-review-stars" role="img" aria-label={`${review.rating} von 5 Sternen`}>{Array.from({ length: review.rating }, (_, index) => <Star key={index} aria-hidden="true" />)}</div>
              <blockquote>„{review.text}“</blockquote>
              <figcaption><span className="ff-review-avatar" aria-hidden="true">{review.author.slice(0, 1)}</span><span><strong>{review.author}</strong><small>Rezension auf Google</small></span><img src={`${BASE_PATH}assets/google-g.svg`} alt="" width="20" height="20" /></figcaption>
            </figure>
          ))}
        </div>
        <p className="ff-review-note">Auszüge aus den auf unserer Website hinterlegten Google-Rezensionen. Die Kundenstimmen beziehen sich auf Perla’s insgesamt.</p>
      </section>

      <section className="ff-process-section" aria-labelledby="ff-process-heading">
        <div className="ff-container ff-process-layout">
          <div className="ff-process-copy"><span className="ff-eyebrow">Kurze Wege. Klare Absprachen.</span><h2 id="ff-process-heading">Sie nennen das Objekt.<br />Wir klären den Rest.</h2><p>{page.audience}</p><a className="ff-button ff-button--white" href="#anfrage">Objekt unverbindlich anfragen<ArrowUpRight aria-hidden="true" /></a></div>
          <ol className="ff-process-list">
            {page.processSteps.map((step, index) => <li key={step.title}><span className="ff-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="ff-container ff-region-cost" aria-labelledby="ff-region-heading">
        <div className="ff-region">
          <span className="ff-eyebrow"><MapPin aria-hidden="true" /> Frankfurt & Rhein-Main</span>
          <h2 id="ff-region-heading">Nah an Ihrem Objekt.<br />Fest verwurzelt in Sulzbach.</h2>
          <p>Hausmeisterservice und Objektbetreuung in Frankfurt am Main und Umgebung: Wir prüfen Standort, Aufgaben und Einsatzmöglichkeiten für Ihre Immobilie persönlich.</p>
          <div className="ff-location-tags" aria-label="Anfragegebiete"><span>Frankfurt am Main</span><span>Eschborn</span><span>Sulzbach</span><span>Schwalbach</span><span>Bad Soden</span></div>
          <address><strong>Perla’s Objektbetreuung</strong><span>Hauptstraße 1 · 65843 Sulzbach (Taunus)</span></address>
          <a className="ff-text-link" href={`${BASE_PATH}einsatzgebiete/`}>Einsatzgebiete ansehen <ArrowRight aria-hidden="true" /></a>
        </div>
        <div className="ff-cost">
          <ClipboardCheck aria-hidden="true" />
          <span className="ff-eyebrow">Transparent geplant</span>
          <h2 id="ff-cost-heading">{page.costTitle}</h2>
          <p>{page.costText}</p>
          <a className="ff-text-link" href="#anfrage">Individuelles Angebot anfragen <ArrowRight aria-hidden="true" /></a>
        </div>
      </section>

      <section className="ff-container ff-faq" aria-labelledby="ff-faq-heading">
        <div className="ff-section-heading"><span className="ff-eyebrow">Gut zu wissen</span><h2 id="ff-faq-heading">Kurz gefragt.<br />Klar beantwortet.</h2></div>
        <div className="ff-faq-list">{page.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
      </section>

      <section className="ff-inquiry-section" id="anfrage" aria-labelledby="ff-inquiry-heading">
        <div className="ff-container ff-inquiry-layout">
          <div className="ff-inquiry-copy"><span className="ff-eyebrow">Der erste Schritt ist ganz einfach</span><h2 id="ff-inquiry-heading">Geben Sie Ihr Objekt<br />in gute Hände.</h2><p>Sie suchen einen Hausmeisterservice in Frankfurt? Sagen Sie uns kurz, worum es geht. Wir besprechen die passende Betreuung persönlich mit Ihnen.</p><ul><li><CheckCircle2 aria-hidden="true" /> Nur Name und E-Mail als Kontaktangaben nötig</li><li><CheckCircle2 aria-hidden="true" /> Objekt und Leistungsumfang gemeinsam klären</li><li><CheckCircle2 aria-hidden="true" /> Unverbindlich. Kein Auftrag durch die Anfrage.</li></ul><div className="ff-contact-direct"><span>Lieber direkt sprechen?</span><FrankfurtPhone /><a className="ff-mail" href="mailto:mail@perlas.de"><Mail aria-hidden="true" />mail@perlas.de</a></div></div>
          <div className="ff-inquiry-form">{staticMode ? <div className="ff-static-inquiry"><h3>Ihre Anfrage an Perla’s</h3><p>Für das Online-Formular benötigen Sie JavaScript. Schreiben Sie uns oder rufen Sie direkt an.</p><FrankfurtPhone /><a className="ff-mail" href="mailto:mail@perlas.de"><Mail aria-hidden="true" />mail@perlas.de</a></div> : <QuickContactForm topic={page.heading} />}</div>
        </div>
      </section>

      <section className="ff-container ff-related" aria-labelledby="ff-related-heading">
        <div className="ff-related-heading"><span className="ff-eyebrow">Mehr Einblick</span><h2 id="ff-related-heading">So betreuen wir Immobilien.</h2></div>
        <a className="ff-related-article" href={`${BASE_PATH}blog/hausmeisterservice-objektbetreuung-frankfurt-umgebung/`}><ResponsiveImage asset="kundenbilder/team/update-2026-09-23/team_van_daumen_01.png" alt="Perla’s Mitarbeiter am beladenen Servicefahrzeug" sizes="(max-width: 600px) calc(100vw - 40px), 230px" /><div><span>Aus unserem Blog</span><h3>Hausmeisterservice und Objektbetreuung in Frankfurt und Umgebung.</h3><strong>Artikel lesen <ArrowUpRight aria-hidden="true" /></strong></div></a>
        <div className="ff-related-links"><a href={`${BASE_PATH}leistungen/objektpflege/`}>Unsere Objektbetreuung im Überblick<ArrowUpRight aria-hidden="true" /></a><a href={`${BASE_PATH}einsatzgebiete/objektbetreuung-eschborn/`}>Objektbetreuung in Eschborn<ArrowUpRight aria-hidden="true" /></a><a href={`${BASE_PATH}ueber-uns/`}>Das Team hinter Perla’s<ArrowUpRight aria-hidden="true" /></a></div>
      </section>
      <div className="ff-container ff-page-end"><a href={`${BASE_PATH}einsatzgebiete/`}>Alle Einsatzgebiete <ArrowRight aria-hidden="true" /></a><p>Inhaltlich aktualisiert: <time dateTime={page.updatedOn}>{updated}</time></p></div>
    </main>
  )
}
