import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Home,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  Snowflake,
  Sparkles,
  TreePine,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import QuoteModal from './QuoteModal'

const BASE_PATH = import.meta.env.BASE_URL
const A = `${BASE_PATH}assets/`
const WHATSAPP_URL = 'https://wa.me/491776867145?text=Hallo%20Perla%E2%80%99s%20Team%2C%20ich%20interessiere%20mich%20f%C3%BCr%20Ihre%20Objektbetreuung.'

const homeHref = (hash = '') => `${BASE_PATH}${hash}`

function getPagePath() {
  const baseWithoutTrailingSlash = BASE_PATH.replace(/\/$/, '')

  if (baseWithoutTrailingSlash && window.location.pathname.startsWith(baseWithoutTrailingSlash)) {
    return window.location.pathname.slice(baseWithoutTrailingSlash.length) || '/'
  }

  return window.location.pathname
}

type ButtonLinkProps = {
  children: string
  href: string
  kind?: 'yellow' | 'outline' | 'purple' | 'outline-light'
  compact?: boolean
  arrow?: boolean
}

function useRevealAnimations(routeKey?: string) {
  useLayoutEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 })

    elements.forEach((element) => {
      element.classList.add('reveal-ready')
      observer.observe(element)
    })

    return () => observer.disconnect()
  }, [routeKey])
}

function ButtonLink({
  children,
  href,
  kind = 'yellow',
  compact = false,
  arrow = false,
}: ButtonLinkProps) {
  return (
    <a
      className={`button button--${kind}${compact ? ' button--compact' : ''}`}
      href={href}
    >
      <span>{children}</span>
      {arrow && <img src={`${A}${kind === 'purple' ? 'arrow-white.svg' : 'arrow.svg'}`} alt="" />}
    </a>
  )
}

const reviews = [
  {
    copy:
      'Seit wir mit Perla’s Objektbetreuung zusammenarbeiten, hat sich die Pflege unserer Immobilien deutlich verbessert. Das Team ist zuverlässig und schnell zur Stelle.',
    author: 'Michael S.',
  },
  {
    copy:
      'Wir sind begeistert von der Professionalität und dem Engagement. Unsere Mieter wissen, dass ihre Anliegen ernst genommen und schnell bearbeitet werden.',
    author: 'Claudia M.',
  },
  {
    copy:
      'Ob kleine Reparaturen oder die regelmäßige Pflege unserer Außenanlagen: Alles wird prompt und zu unserer vollsten Zufriedenheit erledigt.',
    author: 'Sabine W.',
  },
  {
    copy:
      'Als Hausverwaltung kennen wir viele Dienstleister. Perla’s hebt sich durch Qualität, persönlichen Service und absolute Zuverlässigkeit klar ab.',
    author: 'Emre K.',
  },
  {
    copy:
      'Besonders die schnelle Reaktionszeit und die transparente Abstimmung geben uns im Alltag die Sicherheit, dass jedes Objekt gut betreut ist.',
    author: 'Langjähriger Kunde',
  },
]

const proofStats = [
  ['25+', 'Jahre Erfahrung'],
  ['700+', 'abgeschlossene Projekte'],
  ['1000+', 'glückliche Mieter & Verwaltungen'],
  ['1', 'starkes Team'],
]

// Die neutralen Einträge können später direkt durch freigegebene Kundenlogos
// ergänzt werden. Das Layout unterstützt sowohl Wortmarken als auch Bilddateien.
type Partner = { name: string; mark: string; logo?: string }

const partners: Partner[] = [
  { name: 'Hausverwaltungen', mark: 'HV' },
  { name: 'Wohnanlagen', mark: 'WEG' },
  { name: 'Gewerbeobjekte', mark: 'GO' },
  { name: 'Praxen', mark: 'PR' },
  { name: 'Eigentümer', mark: 'EI' },
  { name: 'Büroflächen', mark: 'BF' },
]

type Feature = {
  icon: LucideIcon
  slug: string
  title: string
  text: string
  detail: string
  bullets: string[]
  image: string
}

const features: Feature[] = [
  {
    icon: Building2,
    slug: 'objektpflege',
    title: 'Objektpflege',
    text: 'Regelmäßige Kontrollgänge und eine zuverlässige Pflege für Wohn- und Gewerbeobjekte.',
    detail: 'Wir behalten Ihr Objekt im Blick, erkennen Handlungsbedarf frühzeitig und sorgen dafür, dass Gemeinschaftsflächen und Außenbereiche dauerhaft einen gepflegten Eindruck machen.',
    bullets: ['Regelmäßige Objektkontrollen', 'Dokumentierte Zustandsmeldungen', 'Koordination kleiner Maßnahmen'],
    image: 'perlas-property.png',
  },
  {
    icon: Wrench,
    slug: 'wartung-instandhaltung',
    title: 'Wartung & Instandhaltung',
    text: 'Kleine Reparaturen, technische Kontrollen und präventive Maßnahmen aus einer Hand.',
    detail: 'Von der kleinen Reparatur bis zur koordinierten Wartung kümmern wir uns schnell, nachvollziehbar und mit einem festen Ansprechpartner um den laufenden Werterhalt.',
    bullets: ['Kleinreparaturen', 'Technische Sichtkontrollen', 'Koordination von Fachbetrieben'],
    image: 'perlas-service.jpg',
  },
  {
    icon: Sparkles,
    slug: 'gebaeudereinigung',
    title: 'Gebäudereinigung',
    text: 'Saubere Treppenhäuser, Büros, Gemeinschaftsflächen und gepflegte Außenbereiche.',
    detail: 'Individuelle Reinigungspläne sorgen für verlässlich saubere Flächen, klare Qualitätsstandards und einen überzeugenden ersten Eindruck bei Mietern und Besuchern.',
    bullets: ['Treppenhaus- und Unterhaltsreinigung', 'Büro- und Praxisflächen', 'Kontrollierte Qualitätsstandards'],
    image: 'perlas-office.png',
  },
  {
    icon: TreePine,
    slug: 'gartenpflege',
    title: 'Gartenpflege',
    text: 'Professionelle Pflege von Grünanlagen, Hecken, Wegen und saisonalen Außenflächen.',
    detail: 'Wir pflegen Grünflächen saisonal und vorausschauend, damit Wege, Hecken und Außenanlagen das ganze Jahr über sicher und repräsentativ bleiben.',
    bullets: ['Rasen- und Heckenschnitt', 'Pflege von Beeten und Wegen', 'Saisonale Pflegeplanung'],
    image: 'perlas-team.png',
  },
  {
    icon: Snowflake,
    slug: 'winterdienst',
    title: 'Winterdienst',
    text: 'Zuverlässiges Räumen und Streuen für sichere Wege und planbare Abläufe im Winter.',
    detail: 'Mit klaren Einsatzplänen und verlässlicher Dokumentation halten wir Wege und Zugänge bei Schnee und Glätte sicher nutzbar.',
    bullets: ['Räum- und Streudienst', 'Wetterabhängige Einsatzplanung', 'Nachvollziehbare Dokumentation'],
    image: 'perlas-property.png',
  },
  {
    icon: PackageCheck,
    slug: 'wohnungswechsel',
    title: 'Wohnungswechsel',
    text: 'Reibungslose Übergaben, Entrümpelungen und Unterstützung bei Umzügen und Räumungen.',
    detail: 'Wir unterstützen Hausverwaltungen und Eigentümer bei Übergaben, Räumungen und der schnellen Vorbereitung von Wohnungen für die nächste Nutzung.',
    bullets: ['Unterstützung bei Übergaben', 'Entrümpelung und Räumung', 'Vorbereitung für die Neuvermietung'],
    image: 'perlas-service.jpg',
  },
]

const insights = [
  {
    image: 'perlas-office.png',
    tag: 'Über uns',
    title: 'Unsere Geschichte: Über 25 Jahre Vertrauen und Qualität',
    text: 'Seit 1999 ist Perla’s Objektbetreuung ein zuverlässiger Partner, der sich mit Herz und Verstand um Immobilien kümmert.',
  },
  {
    image: 'perlas-property.png',
    tag: 'Ratgeber',
    title: 'Effiziente Objektverwaltung: So hilft ein Hausmeisterservice',
    text: 'Wie klare Zuständigkeiten, regelmäßige Kontrollen und digitale Dokumentation Zeit und Kosten sparen.',
  },
  {
    image: 'perlas-service.jpg',
    tag: 'Checkliste',
    title: 'Den richtigen Hausmeisterservice finden: Tipps & Hinweise',
    text: 'Worauf Hausverwaltungen und Eigentümer bei Leistung, Kommunikation und Reaktionszeit achten sollten.',
  },
  {
    image: 'perlas-team.png',
    tag: 'Praxiswissen',
    title: 'Saisonale Objektpflege: Gut vorbereitet durch das ganze Jahr',
    text: 'Welche Aufgaben im Frühjahr, Sommer, Herbst und Winter den Wert und die Sicherheit einer Immobilie erhalten.',
  },
]

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={menuOpen ? 'site-header menu-is-open' : 'site-header'}>
      <div className="nav-wrap">
        <a className="wordmark" href={homeHref()} aria-label="PERLAS Startseite">PERLAS</a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="main-navigation" className={menuOpen ? 'is-open' : ''} aria-label="Hauptnavigation">
          <a href={homeHref('#leistungen')} onClick={closeMenu}>Leistungen</a>
          <a href={homeHref('#ablauf')} onClick={closeMenu}>Ablauf</a>
          <a href={homeHref('#ueber-uns')} onClick={closeMenu}>Über uns</a>
          <a className="company-link" href={homeHref('#einblicke')} onClick={closeMenu}>
            Einblicke <img src={`${A}dropdown.svg`} alt="" />
          </a>
          <a className="sign-in" href={homeHref('#kontakt')} onClick={closeMenu}>Kontakt</a>
        </nav>
      </div>
    </header>
  )
}

function WhatsAppButton() {
  const label = 'WhatsApp'

  return (
    <a
      className="whatsapp-button"
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="PERLAS über WhatsApp kontaktieren"
    >
      <span className="whatsapp-orb" aria-hidden="true" />
      <span className="whatsapp-icon" aria-hidden="true">
        <MessageCircle />
      </span>
      <span className="whatsapp-label" aria-hidden="true">
        {label.split('').map((letter, index) => (
          <span
            className="whatsapp-letter"
            style={{ '--letter-index': index } as CSSProperties}
            key={`${letter}-${index}`}
          >
            {letter}
          </span>
        ))}
      </span>
    </a>
  )
}

function MobileIsland({ onQuoteOpen }: { onQuoteOpen: () => void }) {
  const [activeItem, setActiveItem] = useState<'start' | 'services' | 'quote' | 'whatsapp'>(() => {
    if (getPagePath().startsWith('/leistungen') || window.location.hash === '#leistungen') {
      return 'services'
    }

    return 'start'
  })

  useEffect(() => {
    const syncActiveItem = () => {
      if (getPagePath().startsWith('/leistungen') || window.location.hash === '#leistungen') {
        setActiveItem('services')
      } else if (window.location.hash === '#top' || window.location.hash === '') {
        setActiveItem('start')
      }
    }

    window.addEventListener('hashchange', syncActiveItem)
    return () => window.removeEventListener('hashchange', syncActiveItem)
  }, [])

  return (
    <nav className="mobile-island" aria-label="Mobile Schnellnavigation">
      <a
        className={activeItem === 'start' ? 'is-active' : ''}
        href={homeHref('#top')}
        aria-current={activeItem === 'start' ? 'page' : undefined}
        onClick={() => setActiveItem('start')}
      >
        <Home aria-hidden="true" />
        <span>Start</span>
      </a>
      <a
        className={activeItem === 'services' ? 'is-active' : ''}
        href={homeHref('#leistungen')}
        aria-current={activeItem === 'services' ? 'page' : undefined}
        onClick={() => setActiveItem('services')}
      >
        <Building2 aria-hidden="true" />
        <span>Leistungen</span>
      </a>
      <button
        className={activeItem === 'quote' ? 'is-active' : ''}
        type="button"
        aria-pressed={activeItem === 'quote'}
        onClick={() => { setActiveItem('quote'); onQuoteOpen() }}
      >
        <ClipboardCheck aria-hidden="true" />
        <span>Angebot</span>
      </button>
      <a
        className={activeItem === 'whatsapp' ? 'is-active' : ''}
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-current={activeItem === 'whatsapp' ? 'page' : undefined}
        onClick={() => setActiveItem('whatsapp')}
      >
        <MessageCircle aria-hidden="true" />
        <span>WhatsApp</span>
      </a>
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <img className="hero-circle" src={`${A}bg-circle.svg`} alt="" />
      <div className="hero-copy">
        <p className="eyebrow">Hausmeisterservice im Rhein-Main-Gebiet</p>
        <h1>Ihre Immobilie. Einfach gut betreut.</h1>
        <p className="hero-lead">
          Seit 1999 steht Perla’s für zuverlässige Objektpflege, digitale Abläufe und
          persönlichen Service — lokal, transparent und immer ansprechbar.
        </p>
        <div className="button-row">
          <ButtonLink href="#kontakt" arrow>Unverbindlich anfragen</ButtonLink>
          <ButtonLink href="#leistungen" kind="outline">Leistungen ansehen</ButtonLink>
        </div>
      </div>
      <div className="hero-art">
        <img
          className="hero-photo"
          src={`${A}perlas-hero.png`}
          alt="Mitarbeiter von Perla’s bei der digitalen Objektkontrolle"
        />
        <div className="hero-proof" aria-label="25 Jahre Erfahrung">
          <strong>25+</strong>
          <span>Jahre Erfahrung</span>
          <div>
            <CheckCircle2 aria-hidden="true" />
            <p>Digital geplant</p>
          </div>
          <div>
            <CheckCircle2 aria-hidden="true" />
            <p>Transparent dokumentiert</p>
          </div>
          <div>
            <CheckCircle2 aria-hidden="true" />
            <p>Lokal im Rhein-Main-Gebiet</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function PartnerMarquee() {
  const renderPartners = (duplicate = false) => (
    <div
      className="partner-set"
      role={duplicate ? 'presentation' : 'list'}
      aria-hidden={duplicate ? true : undefined}
    >
      {partners.map((partner) => (
        <div className="partner-mark" role={duplicate ? undefined : 'listitem'} key={partner.name}>
          {partner.logo ? (
            <img src={`${A}${partner.logo}`} alt={partner.name} />
          ) : (
            <>
              <span aria-hidden="true">{partner.mark}</span>
              <strong>{partner.name}</strong>
            </>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <section className="partner-strip" aria-labelledby="partner-strip-heading" data-reveal="fade">
      <p id="partner-strip-heading">Partner und Auftraggeber im Rhein-Main-Gebiet</p>
      <div className="partner-marquee">
        <div className="partner-track">
          {renderPartners()}
          {renderPartners(true)}
        </div>
      </div>
    </section>
  )
}

function Reviews() {
  const reviewWindowRef = useRef<HTMLDivElement>(null)
  const [canScrollBack, setCanScrollBack] = useState(false)
  const [canScrollForward, setCanScrollForward] = useState(true)

  const updateReviewControls = () => {
    const viewport = reviewWindowRef.current

    if (!viewport) return

    const maxScroll = viewport.scrollWidth - viewport.clientWidth
    setCanScrollBack(viewport.scrollLeft > 2)
    setCanScrollForward(viewport.scrollLeft < maxScroll - 2)
  }

  useEffect(() => {
    const viewport = reviewWindowRef.current

    if (!viewport) return

    updateReviewControls()
    viewport.addEventListener('scroll', updateReviewControls, { passive: true })
    window.addEventListener('resize', updateReviewControls)

    return () => {
      viewport.removeEventListener('scroll', updateReviewControls)
      window.removeEventListener('resize', updateReviewControls)
    }
  }, [])

  const scrollReviews = (direction: -1 | 1) => {
    const viewport = reviewWindowRef.current
    const card = viewport?.querySelector<HTMLElement>('.review-card')
    const track = viewport?.querySelector<HTMLElement>('.review-track')

    if (!viewport || !card || !track) return

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 24
    const distance = card.offsetWidth + gap
    const maxScroll = viewport.scrollWidth - viewport.clientWidth
    const nextPosition = Math.min(maxScroll, Math.max(0, viewport.scrollLeft + direction * distance))

    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    viewport.scrollTo({ left: nextPosition, behavior })
  }

  return (
    <section className="reviews" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" data-reveal="up">Was unsere Kunden über die Zusammenarbeit sagen</h2>
      <div className="review-controls" role="group" aria-label="Bewertungen durchblättern" data-reveal="right">
        <button
          className="review-control"
          type="button"
          aria-label="Vorherige Bewertungen"
          disabled={!canScrollBack}
          onClick={() => scrollReviews(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          className="review-control"
          type="button"
          aria-label="Weitere Bewertungen"
          disabled={!canScrollForward}
          onClick={() => scrollReviews(1)}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <div className="review-window" ref={reviewWindowRef} data-reveal="up" style={{ '--reveal-delay': '90ms' } as CSSProperties}>
        <div className="review-track">
          {reviews.map((review) => (
            <article className="review-card" key={review.author}>
              <div className="stars" aria-label="5 von 5 Sternen">
                {Array.from({ length: 5 }, (_, index) => (
                  <img src={`${A}star.svg`} alt="" key={index} />
                ))}
              </div>
              <p>{review.copy}</p>
              <strong>{review.author}</strong>
            </article>
          ))}
        </div>
      </div>
      <div className="featured proof-band" aria-label="Perla’s in Zahlen" data-reveal="up" style={{ '--reveal-delay': '160ms' } as CSSProperties}>
        <strong>Perla’s in Zahlen:</strong>
        <div className="proof-stats">
          {proofStats.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="about" id="ueber-uns">
      <div className="about-copy" data-reveal="left">
        <h2>Seit 1999 für Sie und Ihre Immobilie da.</h2>
        <p>
          Wir verbinden persönliche Betreuung mit digitaler Einsatzplanung. So bleiben
          Aufgaben, Zuständigkeiten und Ergebnisse jederzeit nachvollziehbar — für
          Eigentümer, Mieter und Hausverwaltungen.
        </p>
        <div className="about-actions">
          <ButtonLink href="#kontakt" arrow>Objektbetreuung anfragen</ButtonLink>
          <ButtonLink href="#ablauf" kind="outline">So arbeiten wir</ButtonLink>
        </div>
      </div>
      <div className="about-image" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
        <img src={`${A}perlas-team.png`} alt="Das Team von Perla’s Objektbetreuung" />
      </div>
    </section>
  )
}

function FeatureSection({ onQuoteOpen }: { onQuoteOpen: (service?: string) => void }) {
  return (
    <section className="features" id="leistungen" aria-labelledby="features-heading">
      <h2 id="features-heading" data-reveal="up">Alles, was Ihre Immobilie zuverlässig braucht</h2>
      <div className="feature-panel" data-reveal="scale" style={{ '--reveal-delay': '100ms' } as CSSProperties}>
        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <a className="feature-item" href={`${BASE_PATH}leistungen/${feature.slug}`} key={feature.title}>
                <div className="feature-icon" aria-hidden="true">
                  <Icon strokeWidth={1.8} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <span className="feature-link">Leistung ansehen <ArrowUpRight aria-hidden="true" /></span>
              </a>
            )
          })}
        </div>
        <div className="feature-actions">
          <button className="button button--yellow" type="button" onClick={() => onQuoteOpen()}>
            <span>Individuelles Angebot</span>
            <img src={`${A}arrow.svg`} alt="" />
          </button>
          <ButtonLink href="#ablauf" kind="outline">Ablauf kennenlernen</ButtonLink>
        </div>
      </div>
    </section>
  )
}

function ServiceDetailPage({ service, onQuoteOpen }: { service: Feature; onQuoteOpen: (service?: string) => void }) {
  const Icon = service.icon

  return (
    <main className="service-page">
      <section className="service-detail-hero">
        <div className="service-detail-copy" data-reveal="left">
          <a className="service-breadcrumb" href={homeHref('#leistungen')}>Leistungen / {service.title}</a>
          <div className="service-detail-icon"><Icon aria-hidden="true" strokeWidth={1.8} /></div>
          <span className="eyebrow">Perla’s Objektbetreuung</span>
          <h1>{service.title}</h1>
          <p>{service.detail}</p>
          <div className="button-row">
            <button className="button button--yellow" type="button" onClick={() => onQuoteOpen(service.title)}>
              <span>Angebot für diese Leistung</span>
              <img src={`${A}arrow.svg`} alt="" />
            </button>
            <a className="button button--outline" href="tel:+491776867145">Direkt anrufen</a>
          </div>
        </div>
        <div className="service-detail-image" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          <img src={`${A}${service.image}`} alt={`${service.title} von Perla’s Objektbetreuung`} />
        </div>
      </section>

      <section className="service-benefits" aria-labelledby="service-benefits-heading" data-reveal="up">
        <div>
          <span className="eyebrow">Klar. Verlässlich. Dokumentiert.</span>
          <h2 id="service-benefits-heading">Damit im Alltag nichts liegen bleibt.</h2>
          <p>
            Wir stimmen Rhythmus, Umfang und Kommunikation exakt auf Ihr Objekt ab — mit
            einem festen Ansprechpartner und transparenten Abläufen.
          </p>
        </div>
        <div className="service-benefit-list">
          {service.bullets.map((bullet, index) => (
            <article key={bullet}>
              <span>0{index + 1}</span>
              <CheckCircle2 aria-hidden="true" />
              <h3>{bullet}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="service-process" data-reveal="up">
        <div><ClipboardCheck aria-hidden="true" /><strong>Bedarf aufnehmen</strong><span>Objekt, Leistung und Rhythmus gemeinsam klären.</span></div>
        <div><Clock3 aria-hidden="true" /><strong>Einsatz planen</strong><span>Klare Zuständigkeiten und verlässliche Termine.</span></div>
        <div><ShieldCheck aria-hidden="true" /><strong>Qualität sichern</strong><span>Ergebnisse transparent dokumentieren und optimieren.</span></div>
      </section>

      <section className="service-more" data-reveal="up">
        <h2>Weitere Leistungen</h2>
        <div>
          {features.filter((item) => item.slug !== service.slug).slice(0, 3).map((item) => {
            const MoreIcon = item.icon
            return (
              <a href={`${BASE_PATH}leistungen/${item.slug}`} key={item.slug}>
                <MoreIcon aria-hidden="true" />
                <strong>{item.title}</strong>
                <ArrowUpRight aria-hidden="true" />
              </a>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function ProcessCards() {
  return (
    <section className="help-cards" id="ablauf">
      <article className="story-card" data-reveal="left">
        <h2>Planbar von Anfang an</h2>
        <p>Bedarf verstehen, Angebot abstimmen und die Betreuung zuverlässig starten.</p>
        <ButtonLink href="#kontakt" kind="purple" compact arrow>Erstgespräch starten</ButtonLink>
      </article>
      <article className="help-card" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
        <h2>Direkter Draht</h2>
        <p>Feste Ansprechpartner und schnelle Rückmeldung statt Warteschleife.</p>
        <ButtonLink href="tel:+491776867145" kind="outline" compact>0177 68 67 145</ButtonLink>
      </article>
    </section>
  )
}

function CallToAction() {
  return (
    <section className="cta-section">
      <h2 data-reveal="up">Genug von unklaren Zuständigkeiten?</h2>
      <p data-reveal="up" style={{ '--reveal-delay': '80ms' } as CSSProperties}>Wir melden uns innerhalb von 24 Stunden zurück.</p>
      <div className="button-row" data-reveal="up" style={{ '--reveal-delay': '150ms' } as CSSProperties}>
        <ButtonLink href="#kontakt" arrow>Anfrage senden</ButtonLink>
        <ButtonLink href="tel:+491776867145" kind="outline-light">Direkt anrufen</ButtonLink>
      </div>
    </section>
  )
}

function Insights() {
  return (
    <aside className="insights" id="einblicke" aria-labelledby="insights-heading">
      <h2 id="insights-heading" data-reveal="up">Wissen, das Werte erhält</h2>
      <div className="insight-grid" data-reveal="up" style={{ '--reveal-delay': '90ms' } as CSSProperties}>
        {insights.map((insight) => (
          <a className="insight-card" href="https://perlas.de/unser-blog/" key={insight.title}>
            <div className="insight-image">
              <img src={`${A}${insight.image}`} alt="" />
              <span>{insight.tag}</span>
            </div>
            <div className="insight-copy">
              <h3>{insight.title}</h3>
              <p>{insight.text}</p>
            </div>
          </a>
        ))}
      </div>
      <ButtonLink href="https://perlas.de/unser-blog/" arrow>Alle Einblicke</ButtonLink>
    </aside>
  )
}

function Footer() {
  return (
    <footer className="footer" id="kontakt">
      <div className="footer-grid" data-reveal="up">
        <div className="footer-meta">
          <h2>Pflegen. Erhalten. Entlasten.</h2>
          <div className="contact-list">
            <a href="tel:+491776867145"><Phone aria-hidden="true" /> 0177 68 67 145</a>
            <a href="mailto:mail@perlas.de"><Mail aria-hidden="true" /> mail@perlas.de</a>
            <p><MapPin aria-hidden="true" /> Hauptstraße 1, 65843 Sulzbach</p>
          </div>
          <div className="legal-links">
            <a href="https://perlas.de/impressum/">Impressum</a>
            <a href="https://perlas.de/datenschutz/">Datenschutz</a>
          </div>
          <p>© 2026 Perla’s Objektbetreuung GmbH &amp; Co. KG</p>
        </div>

        <nav className="footer-nav" aria-label="Footer-Navigation">
          <h2>Perla’s</h2>
          {[
            ['Leistungen', '#leistungen'],
            ['Ablauf', '#ablauf'],
            ['Über uns', '#ueber-uns'],
            ['Einblicke', '#einblicke'],
            ['Kontakt', '#kontakt'],
          ].map(([item, href]) => (
            <a href={homeHref(href)} key={item}>
              <span aria-hidden="true" /> {item}
            </a>
          ))}
        </nav>

        <div className="footer-side">
          <div className="contact-card">
            <img src={`${A}newsletter-mark.svg`} alt="" />
            <div className="form-content">
              <h2>Kostenloses Erstgespräch</h2>
              <p>
                Lassen Sie uns gemeinsam die beste Lösung für Ihre Immobilie finden.
                Persönlich, unverbindlich und klar.
              </p>
              <a className="contact-card-button" href="mailto:mail@perlas.de?subject=Anfrage%20zur%20Objektbetreuung">
                Anfrage senden
              </a>
            </div>
          </div>
          <div className="service-area">
            <strong>Im Rhein-Main-Gebiet für Sie da</strong>
            <span>Sulzbach · Frankfurt · Hofheim · Bad Soden · Eschborn · Umgebung</span>
          </div>
        </div>

        <p className="trademark">
          Hausmeisterservice, Objektpflege und Gebäudedienstleistungen für Wohnanlagen,
          Gewerbeobjekte, Praxen und Hausverwaltungen im gesamten Rhein-Main-Gebiet.
        </p>
      </div>
    </footer>
  )
}

export default function App() {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [quoteService, setQuoteService] = useState<string | undefined>()
  const serviceSlug = getPagePath().match(/^\/leistungen\/([^/]+)\/?$/)?.[1]
  const activeService = features.find((service) => service.slug === serviceSlug)

  useRevealAnimations(activeService?.slug)

  const openQuote = useCallback((service?: string) => {
    setQuoteService(service)
    setQuoteOpen(true)
  }, [])

  const closeQuote = useCallback(() => setQuoteOpen(false), [])

  return (
    <>
      <Header />
      {activeService ? (
        <ServiceDetailPage service={activeService} onQuoteOpen={openQuote} />
      ) : (
        <main>
          <Hero />
          <PartnerMarquee />
          <Reviews />
          <About />
          <FeatureSection onQuoteOpen={openQuote} />
          <ProcessCards />
          <CallToAction />
          <Insights />
        </main>
      )}
      <Footer />
      <WhatsAppButton />
      <MobileIsland onQuoteOpen={() => openQuote()} />
      <QuoteModal
        isOpen={quoteOpen}
        initialService={quoteService}
        serviceNames={features.map((service) => service.title)}
        onClose={closeQuote}
      />
    </>
  )
}
