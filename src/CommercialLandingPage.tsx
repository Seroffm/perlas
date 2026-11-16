import { ArrowRight, ArrowUpRight, Check, Mail, MapPin, Phone, Plus } from 'lucide-react'
import QuickContactForm from './QuickContactForm'
import ResponsiveImage from './ResponsiveImage'
import type { CommercialLandingContent } from './commercial-landing-types'
import './commercial-landings.css'

export type { CommercialLandingContent } from './commercial-landing-types'

const BASE_PATH = import.meta.env.BASE_URL
const PHONE_HREF = 'tel:+491776867145'
const PHONE_LABEL = '0177 68 67 145'

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
          <li><span aria-current="page">{page.heading.replace(/\.$/, '')}</span></li>
        </ol>
      </nav>

      <section className="cl-container cl-hero" aria-labelledby={`${id}-heading`}>
        <div className="cl-hero-copy">
          <p className="cl-eyebrow"><MapPin aria-hidden="true" />Perla’s für {page.locality}</p>
          <h1 id={`${id}-heading`}>{page.heading}</h1>
          <p className="cl-hero-intro">{page.intro}</p>
          <div className="cl-actions">
            <a className="cl-button" href="#anfrage">{page.ctaText}<ArrowUpRight aria-hidden="true" /></a>
            <DirectPhone />
          </div>
          <p className="cl-hero-note"><Check aria-hidden="true" /> Unverbindlich anfragen. Den Umfang persönlich klären.</p>
        </div>
        <figure className="cl-hero-photo">
          <ResponsiveImage
            asset={page.heroImage.src}
            alt={page.heroImage.alt}
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 799px) calc(100vw - 40px), (max-width: 1240px) 44vw, 530px"
            style={{ objectPosition: page.heroImage.position ?? '50% 50%' }}
          />
          <figcaption>{page.heroImage.caption ?? 'Einblick in unser Leistungsangebot.'}</figcaption>
        </figure>
      </section>

      <div className="cl-container cl-location-note">
        <MapPin aria-hidden="true" />
        <div><p>{page.serviceAreaText}</p><address>Unser Unternehmensstandort: Hauptstraße 1 · 65843 Sulzbach (Taunus)</address></div>
      </div>

      <section className="cl-container cl-section" aria-labelledby={`${id}-scope-heading`}>
        <div className="cl-section-heading">
          <p className="cl-eyebrow">Passend zu Ihrem Objekt</p>
          <h2 id={`${id}-scope-heading`}>{page.scopeTitle}</h2>
          <p>{page.scopeIntro}</p>
        </div>
        <div className="cl-scope-grid">
          {page.scopeCards.map((card, index) => (
            <article className="cl-scope-card" key={card.title}>
              <span className="cl-card-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <CheckList items={card.items} />
            </article>
          ))}
        </div>
      </section>

      <section className="cl-planning-band" aria-labelledby={`${id}-planning-heading`}>
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

      <section className="cl-container cl-section cl-process-cost" aria-labelledby={`${id}-process-heading`}>
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

      <section className="cl-container cl-section cl-faq" aria-labelledby={`${id}-faq-heading`}>
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
