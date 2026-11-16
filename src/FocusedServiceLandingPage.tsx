import { ArrowRight, ArrowUpRight, Check, Mail, Phone, Plus } from 'lucide-react'
import QuickContactForm from './QuickContactForm'
import ResponsiveImage from './ResponsiveImage'
import type { FocusedServiceContent } from './focused-service-types'
import './focused-services.css'

const BASE_PATH = import.meta.env.BASE_URL
const PHONE_HREF = 'tel:+491776867145'
const PHONE_LABEL = '0177 68 67 145'
const localPath = (path: string) => `${BASE_PATH}${path.replace(/^\/+/, '')}`

function PhoneLink() {
  return <a className="fs-phone" href={PHONE_HREF}><Phone aria-hidden="true" /><span>{PHONE_LABEL}</span></a>
}

function Points({ items }: { items: string[] }) {
  return <ul className="fs-points">{items.map(item => <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>)}</ul>
}

export default function FocusedServiceLandingPage({ page, staticMode = false }: {
  page: FocusedServiceContent
  staticMode?: boolean
}) {
  const id = `fs-${page.slug}`
  const topic = page.inquiry.topic ?? page.heading.replace(/\.$/, '')
  const updated = new Intl.DateTimeFormat('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin',
  }).format(new Date(`${page.updatedOn}T12:00:00Z`))

  return (
    <main className="fs-landing" lang="de">
      <nav className="fs-container fs-breadcrumb" aria-label="Brotkrümeln">
        <ol>
          <li><a href={BASE_PATH}>Startseite</a></li>
          <li><a href={localPath('/leistungen/')}>Leistungen</a></li>
          <li><span aria-current="page">{topic}</span></li>
        </ol>
      </nav>

      <section className="fs-container fs-hero" aria-labelledby={`${id}-heading`}>
        <div className="fs-hero-copy">
          <p className="fs-eyebrow">{page.eyebrow}</p>
          <h1 id={`${id}-heading`}>{page.heading}</h1>
          {page.heroPromise && <p className="fs-promise">{page.heroPromise}</p>}
          <p className="fs-intro">{page.intro}</p>
          <div className="fs-actions">
            <a className="fs-button" href="#anfrage">{page.ctaText}<ArrowUpRight aria-hidden="true" /></a>
            <PhoneLink />
          </div>
          <p className="fs-hero-note">Unverbindlich anfragen. Gemeinsam den passenden Umfang klären.</p>
        </div>
        <figure className="fs-hero-figure">
          <ResponsiveImage
            asset={page.heroImage.src}
            alt={page.heroImage.alt}
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 759px) calc(100vw - 40px), (max-width: 1199px) 43vw, 510px"
            style={{ objectPosition: page.heroImage.position ?? '50% 50%' }}
          />
          <figcaption>{page.heroImage.caption ?? 'Einblick in das Perla’s Leistungsangebot.'}</figcaption>
        </figure>
      </section>

      <div className="fs-container fs-assurance" aria-label="Über Perla’s">
        <span><strong>Seit 1999</strong> für Immobilien da</span>
        <span><strong>Aus Sulzbach</strong> in Rhein-Main im Einsatz</span>
        <a href={localPath('/ueber-uns/')}>Persönlich kennenlernen<ArrowUpRight aria-hidden="true" /></a>
      </div>

      <nav className="fs-container fs-jump-nav" aria-label="Auf dieser Seite">
        <a href={`#${id}-leistungen`}>Leistungsumfang</a>
        <a href={`#${id}-planung`}>Gut vorbereitet</a>
        <a href={`#${id}-kosten`}>Ablauf & Kosten</a>
        <a href={`#${id}-fragen`}>Häufige Fragen</a>
      </nav>

      <section className="fs-container fs-section fs-scope" id={`${id}-leistungen`} aria-labelledby={`${id}-scope-heading`}>
        <div className="fs-section-heading">
          <p className="fs-eyebrow">Konkret für Ihr Objekt</p>
          <h2 id={`${id}-scope-heading`}>{page.scopeTitle}</h2>
          <p>{page.scopeIntro}</p>
        </div>
        <div className="fs-scope-list">
          {page.scopeCards.map((card, index) => (
            <article className="fs-scope-item" key={card.title}>
              <span className="fs-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h3>{card.title}</h3>
              <div><p>{card.text}</p><Points items={card.items} /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="fs-planning" id={`${id}-planung`} aria-labelledby={`${id}-planning-heading`}>
        <div className="fs-container fs-planning-grid">
          <div className="fs-planning-copy">
            <p className="fs-eyebrow">Eine gute Grundlage für Ihr Angebot</p>
            <h2 id={`${id}-planning-heading`}>{page.planning.title}</h2>
            <p>{page.planning.intro}</p>
            <p className="fs-table-hint">Die Tabelle lässt sich bei Bedarf seitlich verschieben.</p>
            <div className="fs-table-scroll" role="region" aria-labelledby={`${id}-table-caption`} tabIndex={0}>
              <table>
                <caption id={`${id}-table-caption`}>{page.planning.title} – Planungshilfe</caption>
                <thead><tr>{page.planning.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead>
                <tbody>{page.planning.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, columnIndex) => columnIndex === 0
                  ? <th scope="row" key={columnIndex}>{cell}</th>
                  : <td key={columnIndex}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
            {page.planning.note && <p className="fs-planning-note">{page.planning.note}</p>}
          </div>
          <aside className="fs-detail" aria-labelledby={`${id}-detail-heading`}>
            <figure>
              <ResponsiveImage
                asset={page.detail.image.src}
                alt={page.detail.image.alt}
                sizes="(max-width: 759px) calc(100vw - 40px), (max-width: 1199px) 34vw, 390px"
                style={{ objectPosition: page.detail.image.position ?? '50% 50%' }}
              />
              {page.detail.image.caption && <figcaption>{page.detail.image.caption}</figcaption>}
            </figure>
            <h3 id={`${id}-detail-heading`}>{page.detail.title}</h3>
            <p>{page.detail.text}</p>
            <Points items={page.detail.points} />
          </aside>
        </div>
      </section>

      <section className="fs-container fs-section fs-process-cost" id={`${id}-kosten`} aria-labelledby={`${id}-process-heading`}>
        <div className="fs-process">
          <p className="fs-eyebrow">Persönlich abgestimmt</p>
          <h2 id={`${id}-process-heading`}>Vom ersten Kontakt zum Auftrag.</h2>
          <ol>{page.processSteps.map((step, index) => <li key={step.title}>
            <span className="fs-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <div><h3>{step.title}</h3><p>{step.text}</p></div>
          </li>)}</ol>
        </div>
        <aside className="fs-cost" aria-labelledby={`${id}-cost-heading`}>
          <p className="fs-eyebrow">Nachvollziehbar kalkuliert</p>
          <h2 id={`${id}-cost-heading`}>{page.cost.title}</h2>
          <p>{page.cost.text}</p>
          <Points items={page.cost.factors} />
          <a className="fs-text-link" href="#anfrage">Passendes Angebot anfragen<ArrowRight aria-hidden="true" /></a>
        </aside>
      </section>

      <section className="fs-container fs-faq fs-section" id={`${id}-fragen`} aria-labelledby={`${id}-faq-heading`}>
        <div className="fs-section-heading">
          <p className="fs-eyebrow">Vor Ihrer Anfrage</p>
          <h2 id={`${id}-faq-heading`}>Gut zu wissen.</h2>
        </div>
        <div className="fs-faq-list">{page.faqs.map(faq => <details key={faq.question}>
          <summary>{faq.question}<Plus aria-hidden="true" /></summary>
          <p>{faq.answer}</p>
        </details>)}</div>
      </section>

      <section className="fs-inquiry" id="anfrage" aria-labelledby={`${id}-inquiry-heading`}>
        <div className="fs-container fs-inquiry-grid">
          <div className="fs-inquiry-copy">
            <p className="fs-eyebrow">Lassen Sie uns darüber sprechen</p>
            <h2 id={`${id}-inquiry-heading`}>{page.inquiry.title}</h2>
            <p>{page.inquiry.text}</p>
            <Points items={page.inquiry.checklist} />
            <div className="fs-direct-contact">
              <span>Ihr direkter Kontakt</span>
              <PhoneLink />
              <a className="fs-mail" href="mailto:mail@perlas.de"><Mail aria-hidden="true" />mail@perlas.de</a>
            </div>
          </div>
          <div className="fs-form-panel">
            {staticMode ? <div className="fs-static-contact">
              <h3>Ihre Anfrage an Perla’s</h3>
              <p>Für Ihre Anfrage erreichen Sie uns direkt per Telefon oder E-Mail. Das Onlineformular steht nach Aktivierung von JavaScript zur Verfügung.</p>
              <PhoneLink />
              <a className="fs-mail" href="mailto:mail@perlas.de"><Mail aria-hidden="true" />mail@perlas.de</a>
              <p className="fs-static-topic">Ihr Thema: {topic}</p>
            </div> : <QuickContactForm topic={topic} />}
          </div>
        </div>
      </section>

      <section className="fs-container fs-provider" aria-labelledby={`${id}-provider-heading`}>
        <div><p className="fs-eyebrow">Aus Sulzbach für Rhein-Main</p><h2 id={`${id}-provider-heading`}>Ihr Ansprechpartner bei Perla’s.</h2></div>
        <div><p>{page.serviceAreaText}</p><address>Perla’s Objektbetreuung · Hauptstraße 1 · 65843 Sulzbach (Taunus)</address></div>
      </section>

      <footer className="fs-container fs-page-footer">
        <p>Mehr zum Bereich <a href={localPath(`/leistungen/${page.serviceSlug}/`)}>{page.parentLabel}</a></p>
        <nav className="fs-related" aria-label="Passende Leistungen und Informationen">
          {page.relatedLinks.map(link => <a href={localPath(link.path)} key={link.path}>{link.label}<ArrowUpRight aria-hidden="true" /></a>)}
        </nav>
        <p>Inhaltlich aktualisiert: <time dateTime={page.updatedOn}>{updated}</time></p>
      </footer>
    </main>
  )
}
