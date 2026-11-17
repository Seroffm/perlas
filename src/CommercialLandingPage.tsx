import { ArrowRight, ArrowUpRight, Building2, Check, ClipboardCheck, Mail, MapPin, Phone, Plus, Star, UsersRound } from 'lucide-react'
import QuickContactForm from './QuickContactForm'
import ResponsiveImage from './ResponsiveImage'
import WorkEvidence from './WorkEvidence'
import googleReviewData from './google-reviews-data.json'
import type { CommercialLandingContent } from './commercial-landing-types'
import './commercial-landings.css'

export type { CommercialLandingContent } from './commercial-landing-types'

const BASE_PATH = import.meta.env.BASE_URL
const PHONE_HREF = 'tel:+491776867145'
const PHONE_LABEL = '0177 68 67 145'
const partners = [
  { name: 'David Lloyd Clubs', asset: 'partners/david-lloyd-clubs.png' },
  { name: 'UNIRESTA', asset: 'partners/uniresta.jpeg' },
  { name: 'VALO Immobilienmanagement', asset: 'partners/valo.png' },
  { name: 'Zeidler', asset: 'partners/zeidler.webp' },
]
const customerVoice = googleReviewData.reviews.find(review => review.author === 'David S.')
const scopeIcons = [Building2, ClipboardCheck, UsersRound]

function localPath(path: string) {
  return `${BASE_PATH}${path.replace(/^\/+/, '')}`
}

function DirectPhone({ light = false }: { light?: boolean }) {
  return (
    <a className={`cl-phone${light ? ' cl-phone--light' : ''}`} href={PHONE_HREF}>
      <Phone aria-hidden="true" /><span>{PHONE_LABEL}</span>
    </a>
  )
}

function CheckList({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <ul className={`cl-checklist ${className}`}>
      {items.map((item) => <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>)}
    </ul>
  )
}

export default function CommercialLandingPage({ page, staticMode = false }: {
  page: CommercialLandingContent
  staticMode?: boolean
}) {
  const id = `cl-${page.slug}`
  const updated = new Intl.DateTimeFormat('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin',
  }).format(new Date(`${page.updatedOn}T12:00:00Z`))

  return (
    <main className="cl-landing" lang="de">
      <nav className="cl-container cl-breadcrumb" aria-label="Brotkrümeln">
        <ol>
          <li><a href={BASE_PATH}>Startseite</a></li>
          <li><a href={localPath('/einsatzgebiete/')}>Einsatzgebiete</a></li>
          <li><span aria-current="page">{page.inquiry.topic ?? page.heading.replace(/\.$/, '')}</span></li>
        </ol>
      </nav>

      <section className="cl-container cl-hero" aria-labelledby={`${id}-heading`}>
        <div className="cl-hero-copy">
          <p className="cl-eyebrow cl-hero-eyebrow"><span aria-hidden="true" />Ihr Objektservice für {page.locality}</p>
          <h1 id={`${id}-heading`}>{page.heading}</h1>
          {page.heroPromise && <p className="cl-hero-promise">{page.heroPromise}</p>}
          <p className="cl-hero-intro">{page.intro}</p>
          {page.heroHighlights && <CheckList items={page.heroHighlights} className="cl-hero-highlights" />}
          <div className="cl-actions">
            <a className="cl-button" href="#anfrage">{page.ctaText}<ArrowUpRight aria-hidden="true" /></a>
            <DirectPhone />
          </div>
          <p className="cl-hero-note">Unverbindlich. Persönlich. Passend zu Ihrem Objekt.</p>
        </div>
        <div className="cl-hero-visual">
          <figure className="cl-hero-photo">
          <ResponsiveImage
            asset={page.heroImage.src}
            alt={page.heroImage.alt}
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 759px) calc(100vw - 48px), (max-width: 1240px) 45vw, 530px"
            style={{ objectPosition: page.heroImage.position ?? '50% 50%' }}
          />
            <figcaption>{page.heroImage.caption ?? 'Einblick in unser Leistungsangebot.'}</figcaption>
          </figure>
          <a className="cl-team-card" href={localPath('/ueber-uns/')}>
            <span className="cl-team-card-icon"><UsersRound aria-hidden="true" /></span>
            <span><small>Menschen statt Umwege</small><strong>Ihr Perla’s Team.</strong><span>Persönlich kennenlernen <ArrowUpRight aria-hidden="true" /></span></span>
          </a>
          <span className="cl-experience"><strong>Seit 1999</strong><span>für Immobilien da</span></span>
        </div>
      </section>

      <section className="cl-container cl-partners" aria-labelledby={`${id}-partners-heading`}>
        <div><p className="cl-eyebrow">Vertrauen wächst im Alltag</p><h2 id={`${id}-partners-heading`}>Unternehmen, die auf Perla’s setzen.</h2></div>
        <div className="cl-partner-logos">{partners.map(partner => <ResponsiveImage key={partner.name} asset={partner.asset} alt={partner.name} sizes="(max-width: 759px) 125px, 150px" />)}</div>
      </section>

      <nav className="cl-container cl-jump-nav" aria-label="Auf dieser Seite">
        <a href={`#${id}-leistungen`}>Leistungen</a><a href={`#${id}-planung`}>Vorbereitung</a><a href={`#${id}-ablauf`}>Ablauf & Kosten</a><a href={`#${id}-fragen`}>Häufige Fragen</a><a href="#anfrage">Angebot anfragen <ArrowUpRight aria-hidden="true" /></a>
      </nav>

      <section className="cl-scope-band" id={`${id}-leistungen`} aria-labelledby={`${id}-scope-heading`}>
        <div className="cl-container cl-section">
          <div className="cl-section-heading cl-section-heading--split">
            <div><p className="cl-eyebrow">So viel Service, wie Ihr Objekt braucht</p><h2 id={`${id}-scope-heading`}>{page.scopeTitle}</h2></div>
            <p>{page.scopeIntro}</p>
          </div>
        <div className="cl-scope-grid">
          {page.scopeCards.map((card, index) => {
            const Icon = scopeIcons[index % scopeIcons.length]
            return (
            <article className="cl-scope-card" key={card.title}>
              <span className="cl-scope-icon"><Icon aria-hidden="true" /></span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <CheckList items={card.items} />
            </article>
          )})}
        </div>
        <a className="cl-scope-link" href="#anfrage">Gemeinsam den passenden Umfang festlegen <ArrowRight aria-hidden="true" /></a>
        </div>
      </section>

      <section className="cl-planning-band" id={`${id}-planung`} aria-labelledby={`${id}-planning-heading`}>
        <div className="cl-container cl-planning-grid">
          <div className="cl-planning-copy">
            <p className="cl-eyebrow">Gut vorbereitet anfragen</p>
            <h2 id={`${id}-planning-heading`}>{page.planning.title}</h2>
            <p>{page.planning.intro}</p>
            <p className="cl-table-hint">Die Tabelle lässt sich auf kleinen Bildschirmen seitlich verschieben.</p>
            <div className="cl-table-scroll" role="region" aria-labelledby={`${id}-table-caption`} tabIndex={0}>
              <table>
                <caption id={`${id}-table-caption`}>{page.planning.title} – Planungshilfe</caption>
                <thead><tr>{page.planning.headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
                <tbody>
                  {page.planning.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, columnIndex) => columnIndex === 0
                        ? <th scope="row" key={columnIndex}>{cell}</th>
                        : <td key={columnIndex}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {page.planning.note && <p className="cl-planning-note">{page.planning.note}</p>}
          </div>
          <div className="cl-detail">
            <figure>
              <ResponsiveImage
                asset={page.detail.image.src}
                alt={page.detail.image.alt}
                sizes="(max-width: 799px) calc(100vw - 40px), (max-width: 1240px) 36vw, 430px"
                style={{ objectPosition: page.detail.image.position ?? '50% 50%' }}
              />
              {page.detail.image.caption && <figcaption>{page.detail.image.caption}</figcaption>}
            </figure>
            <h3>{page.detail.title}</h3>
            <p>{page.detail.text}</p>
            <CheckList items={page.detail.points} />
          </div>
        </div>
      </section>

      <section className="cl-container cl-section cl-process-cost" id={`${id}-ablauf`} aria-labelledby={`${id}-process-heading`}>
        <div className="cl-process">
          <p className="cl-eyebrow">Von der Anfrage zum Leistungsplan</p>
          <h2 id={`${id}-process-heading`}>So starten wir gemeinsam.</h2>
          <ol className="cl-process-list">
            {page.processSteps.map((step, index) => (
              <li key={step.title}>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
              </li>
            ))}
          </ol>
        </div>
        <aside className="cl-cost" aria-labelledby={`${id}-cost-heading`}>
          <p className="cl-eyebrow">Ein Angebot für Ihr Objekt</p>
          <h2 id={`${id}-cost-heading`}>{page.cost.title}</h2>
          <p>{page.cost.text}</p>
          <CheckList items={page.cost.factors} />
          <a className="cl-text-link" href="#anfrage">Umfang und Kosten besprechen<ArrowRight aria-hidden="true" /></a>
        </aside>
      </section>

      <section className="cl-container cl-local-proof" aria-labelledby={`${id}-local-heading`}>
        <div className="cl-local-copy"><p className="cl-eyebrow"><MapPin aria-hidden="true" />{page.locality} & Rhein-Main</p><h2 id={`${id}-local-heading`}>Nah am Objekt.<br />Direkt im Gespräch.</h2><p>{page.serviceAreaText}</p><address>Perla’s Objektbetreuung · Hauptstraße 1 · 65843 Sulzbach (Taunus)</address><a className="cl-text-link" href={localPath('/ueber-uns/')}>Team und Arbeitsweise kennenlernen <ArrowRight aria-hidden="true" /></a></div>
        {customerVoice && <figure className="cl-customer-voice"><span className="cl-voice-label">Eine Stimme über Perla’s</span><div className="cl-review-stars" role="img" aria-label={`${customerVoice.rating} von 5 Sternen`}>{Array.from({length:customerVoice.rating},(_,i)=><Star key={i} aria-hidden="true" />)}</div><blockquote>„{customerVoice.text}“</blockquote><figcaption><strong>{customerVoice.author}</strong><span>Google-Rezension über Perla’s insgesamt</span></figcaption><a href={googleReviewData.profileUrl} target="_blank" rel="noreferrer">Kundenstimmen bei Google <ArrowUpRight aria-hidden="true" /></a></figure>}
      </section>

      <WorkEvidence serviceSlug={page.serviceSlug} id={`${id}-praxis`} className="cl-container" />

      <section className="cl-container cl-section cl-faq" id={`${id}-fragen`} aria-labelledby={`${id}-faq-heading`}>
        <div className="cl-section-heading">
          <p className="cl-eyebrow">Vor der Beauftragung</p>
          <h2 id={`${id}-faq-heading`}>Die wichtigsten Fragen.</h2>
        </div>
        <div className="cl-faq-list">
          {page.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}<Plus aria-hidden="true" /></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cl-inquiry" id="anfrage" aria-labelledby={`${id}-inquiry-heading`}>
        <div className="cl-container cl-inquiry-grid">
          <div className="cl-inquiry-copy">
            <p className="cl-eyebrow">Lassen Sie uns Ihr Objekt kennenlernen</p>
            <h2 id={`${id}-inquiry-heading`}>{page.inquiry.title}</h2>
            <p>{page.inquiry.text}</p>
            <CheckList items={page.inquiry.checklist} />
            <div className="cl-inquiry-direct">
              <span>Lieber direkt sprechen?</span>
              <DirectPhone light />
              <a className="cl-mail" href="mailto:mail@perlas.de"><Mail aria-hidden="true" />mail@perlas.de</a>
            </div>
          </div>
          <div className="cl-form-card">
            {staticMode ? (
              <div className="cl-static-contact">
                <h3>Ihre Anfrage an Perla’s</h3>
                <p>Das Onlineformular ist nach Aktivierung von JavaScript verfügbar. Sie erreichen uns auch direkt per Telefon oder E-Mail.</p>
                <DirectPhone />
                <a className="cl-mail" href="mailto:mail@perlas.de"><Mail aria-hidden="true" />mail@perlas.de</a>
                <p className="cl-static-topic">Ihr Thema: {page.inquiry.topic ?? page.heading}</p>
              </div>
            ) : <QuickContactForm topic={page.inquiry.topic ?? page.heading} />}
          </div>
        </div>
      </section>

      <footer className="cl-container cl-page-footer">
        {page.relatedLinks.length > 0 && (
          <nav className="cl-related" aria-label="Passende Leistungen und Informationen">
            {page.relatedLinks.map((link) => <a href={localPath(link.path)} key={link.path}>{link.label}<ArrowUpRight aria-hidden="true" /></a>)}
          </nav>
        )}
        <p>Inhaltlich aktualisiert: <time dateTime={page.updatedOn}>{updated}</time></p>
      </footer>
    </main>
  )
}
