import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Clock3,
  Home,
  Hospital,
  KeyRound,
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
import CookieConsent from './CookieConsent'
import QuoteModal from './QuoteModal'
import serviceContent from './service-data.json'

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

function ensureMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value))
}

function usePageSeo(service?: Feature) {
  useEffect(() => {
    const siteUrl = new URL(BASE_PATH, window.location.origin)
    const pageUrl = service ? new URL(`leistungen/${service.slug}/`, siteUrl) : siteUrl
    const title = service?.seoTitle ?? 'Perla’s Facility Services | Objektbetreuung Rhein-Main'
    const description = service?.seoDescription
      ?? 'Perla’s bündelt Facility Services und professionelle Objektbetreuung für Hausverwaltungen, Wohnanlagen und Gewerbeimmobilien im Rhein-Main-Gebiet.'
    const imageUrl = new URL(`${BASE_PATH}assets/perlas-hero.png`, window.location.origin)
    const indexingOverride = import.meta.env.VITE_PERLAS_INDEX_SITE
    const indexingEnabled = indexingOverride
      ? indexingOverride === 'true'
      : !window.location.hostname.endsWith('github.io')
    const robots = indexingEnabled ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'

    document.title = title
    ensureMeta('meta[name="description"]', { name: 'description', content: description })
    ensureMeta('meta[name="robots"]', { name: 'robots', content: robots })
    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    ensureMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    ensureMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    ensureMeta('meta[property="og:url"]', { property: 'og:url', content: pageUrl.href })
    ensureMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl.href })
    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = pageUrl.href

    const businessId = `${siteUrl.href}#business`
    const business = {
      '@type': 'HomeAndConstructionBusiness',
      '@id': businessId,
      name: 'Perla’s Objektbetreuung',
      url: siteUrl.href,
      telephone: '+49 177 6867145',
      email: 'mail@perlas.de',
      foundingDate: '1999',
      image: imageUrl.href,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Hauptstraße 1',
        postalCode: '65843',
        addressLocality: 'Sulzbach (Taunus)',
        addressCountry: 'DE',
      },
      areaServed: ['Main-Taunus-Kreis', 'Rhein-Main-Gebiet'],
    }
    const structuredData = service
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            business,
            {
              '@type': 'Service',
              '@id': `${pageUrl.href}#service`,
              name: service.title,
              description: service.detail,
              url: pageUrl.href,
              provider: { '@id': businessId },
              areaServed: ['Main-Taunus-Kreis', 'Rhein-Main-Gebiet'],
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Startseite', item: siteUrl.href },
                { '@type': 'ListItem', position: 2, name: 'Leistungen', item: `${siteUrl.href}#leistungen` },
                { '@type': 'ListItem', position: 3, name: service.title, item: pageUrl.href },
              ],
            },
          ],
        }
      : {
          '@context': 'https://schema.org',
          '@graph': [
            business,
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

    let structuredDataScript = document.head.querySelector<HTMLScriptElement>('#perlas-structured-data')
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script')
      structuredDataScript.id = 'perlas-structured-data'
      structuredDataScript.type = 'application/ld+json'
      document.head.appendChild(structuredDataScript)
    }
    structuredDataScript.textContent = JSON.stringify(structuredData)
  }, [service])
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

type Partner = { name: string; href: string; icon: LucideIcon }

const partners: Partner[] = [
  { name: 'Hausverwaltungen', href: homeHref('#hausverwaltungen'), icon: KeyRound },
  { name: 'Größere Wohnanlagen', href: homeHref('#hausverwaltungen'), icon: Home },
  { name: 'Gewerbeimmobilien', href: homeHref('#gewerbeimmobilien'), icon: Building2 },
  { name: 'Bürogebäude', href: homeHref('#institutionelle-gebaeude'), icon: BriefcaseBusiness },
  { name: 'Unternehmensstandorte', href: homeHref('#gewerbeimmobilien'), icon: ShieldCheck },
  { name: 'Institutionelle Gebäude', href: homeHref('#institutionelle-gebaeude'), icon: Hospital },
]

type Feature = (typeof serviceContent)[number] & { icon: LucideIcon }

const featureBasics = [
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
    image: 'perlas-hero.png',
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
    image: 'perlas-property.png',
  },
]

const features: Feature[] = serviceContent.map((service) => ({
  ...service,
  icon: featureBasics.find((feature) => feature.slug === service.slug)?.icon ?? Building2,
}))

const coreServiceSlugs = [
  'objektpflege',
  'wartung-instandhaltung',
  'gebaeudereinigung',
  'gartenpflege',
  'winterdienst',
]

const coreFeatures = coreServiceSlugs
  .map((slug) => features.find((feature) => feature.slug === slug))
  .filter((feature): feature is Feature => Boolean(feature))

const supplementaryFeatures = features.filter((feature) => !coreServiceSlugs.includes(feature.slug))

const facilityPillars = [
  {
    icon: ClipboardCheck,
    title: 'Objektkontrolle',
    text: 'Regelmäßige Kontrollen zeigen, wo Handlungsbedarf besteht und welche Aufgaben als Nächstes anstehen.',
  },
  {
    icon: Wrench,
    title: 'Technische Betreuung',
    text: 'Kleine Reparaturen und Sichtkontrollen werden übernommen. Fachbetriebe lassen sich bei Bedarf koordinieren.',
  },
  {
    icon: ShieldCheck,
    title: 'Qualitätskontrolle',
    text: 'Leistungsbereiche und Intervalle sind festgelegt. Rückmeldungen und Abweichungen laufen über einen Ansprechpartner.',
  },
  {
    icon: Clock3,
    title: 'Dokumentation',
    text: 'Erledigte Aufgaben, Auffälligkeiten und offene Punkte werden verständlich zusammengefasst.',
  },
]

const audienceSolutions = [
  {
    id: 'hausverwaltungen',
    icon: KeyRound,
    title: 'Hausverwaltungen & Wohnanlagen',
    text: 'Für professionell verwaltete Wohnanlagen und Mehrfamilienhausbestände bündeln wir die laufenden Aufgaben an Gebäude und Außenflächen.',
    services: ['objektpflege', 'gebaeudereinigung', 'wartung-instandhaltung', 'gartenpflege', 'winterdienst'],
  },
  {
    id: 'gewerbeimmobilien',
    icon: Building2,
    title: 'Gewerbeimmobilien & Unternehmensstandorte',
    text: 'Objektbetreuung, Reinigung und technische Aufgaben werden so kombiniert, dass der laufende Betrieb möglichst wenig beeinträchtigt wird.',
    services: ['objektpflege', 'wartung-instandhaltung', 'gebaeudereinigung', 'gartenpflege', 'winterdienst'],
  },
  {
    id: 'institutionelle-gebaeude',
    icon: Hospital,
    title: 'Büro-, Praxis- & institutionelle Gebäude',
    text: 'Für regelmäßig genutzte Gebäude verbinden wir feste Zuständigkeiten mit planbaren Leistungen für Innen- und Außenbereiche.',
    services: ['objektpflege', 'gebaeudereinigung', 'wartung-instandhaltung', 'winterdienst', 'gartenpflege'],
  },
]

const insights = [
  {
    image: 'perlas-office.png',
    tag: 'Über uns',
    title: 'Wie Perla’s seit 1999 gewachsen ist',
    text: 'Ein Blick auf unsere Arbeit, unser Team und die Grundsätze, nach denen wir Immobilien betreuen.',
  },
  {
    image: 'perlas-property.png',
    tag: 'Ratgeber',
    title: 'Wie professionelle Objektbetreuung Verwaltungen entlastet',
    text: 'Objektkontrollen, feste Zuständigkeiten und verständliche Rückmeldungen schaffen Übersicht im Immobilienbestand.',
  },
  {
    image: 'perlas-hero.png',
    tag: 'Facility Services',
    title: 'Was ein belastbares Betreuungskonzept ausmacht',
    text: 'Welche Aufgaben, Leistungsintervalle und Zuständigkeiten in ein verständliches Leistungsverzeichnis gehören.',
  },
  {
    image: 'perlas-team.png',
    tag: 'Praxiswissen',
    title: 'Wie sich Facility Services über das Jahr planen lassen',
    text: 'Reinigung, Außenanlagenpflege, Wartung und Winterdienst benötigen unterschiedliche Leistungsintervalle.',
  },
]

const heroSlides = [
  {
    image: 'perlas-property.png',
    alt: 'Größere Wohnanlage im Rhein-Main-Gebiet',
    label: 'Professionell verwaltete Wohnanlagen',
    position: '58% center',
  },
  {
    image: 'perlas-hero.png',
    alt: 'Mitarbeiter von Perla’s bei einer digitalen Objektkontrolle',
    label: 'Objektkontrolle & Dokumentation',
    position: '50% center',
  },
  {
    image: 'perlas-office.png',
    alt: 'Mitarbeiter von Perla’s bei der Einsatzplanung',
    label: 'Koordination & Ansprechpartner',
    position: '52% center',
  },
  {
    image: 'perlas-team.png',
    alt: 'Das Team von Perla’s Objektbetreuung vor einer Wohnanlage',
    label: 'Team für laufende Objektbetreuung',
    position: '50% center',
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
          <a href={homeHref('#facility-services')} onClick={closeMenu}>Facility Services</a>
          <a href={homeHref('#objekte')} onClick={closeMenu}>Objekte</a>
          <a href={homeHref('#leistungen')} onClick={closeMenu}>Leistungen</a>
          <a href={homeHref('#ueber-uns')} onClick={closeMenu}>Über uns</a>
          <a className="sign-in" href={homeHref('#kontakt')} onClick={closeMenu}>Kontakt</a>
        </nav>
      </div>
    </header>
  )
}

function ContactDock() {
  const [isOpen, setIsOpen] = useState(false)
  const dockRef = useRef<HTMLElement>(null)
  const label = 'WhatsApp'

  useEffect(() => {
    if (!isOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    const closeOutside = (event: PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOutside)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOutside)
    }
  }, [isOpen])

  return (
    <aside className={isOpen ? 'contact-dock is-open' : 'contact-dock'} ref={dockRef} aria-label="Direkte Kontaktmöglichkeiten">
      <div className="contact-dock-panel" id="contact-dock-panel" aria-hidden={!isOpen}>
        <span className="eyebrow">Direkter Draht</span>
        <strong>Wie dürfen wir helfen?</strong>
        <p>Wählen Sie einfach den Kontaktweg, der für Sie am schnellsten ist.</p>
        <nav aria-label="Kontaktwege">
          <a className="is-whatsapp" href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={() => setIsOpen(false)}>
            <MessageCircle aria-hidden="true" />
            <span><strong>WhatsApp</strong><small>Nachricht schreiben</small></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href="tel:+491776867145" onClick={() => setIsOpen(false)}>
            <Phone aria-hidden="true" />
            <span><strong>Direkt anrufen</strong><small>0177 68 67 145</small></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href="mailto:mail@perlas.de" onClick={() => setIsOpen(false)}>
            <Mail aria-hidden="true" />
            <span><strong>E-Mail schreiben</strong><small>mail@perlas.de</small></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href={homeHref('#kontakt')} onClick={() => setIsOpen(false)}>
            <ClipboardCheck aria-hidden="true" />
            <span><strong>Kontaktseite</strong><small>Allgemeine Anfrage senden</small></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </nav>
      </div>
      <div className="contact-dock-bar">
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
        <button
          className="contact-dock-toggle"
          type="button"
          aria-label={isOpen ? 'Weitere Kontaktwege schließen' : 'Weitere Kontaktwege öffnen'}
          aria-expanded={isOpen}
          aria-controls="contact-dock-panel"
          onClick={() => setIsOpen((current) => !current)}
        >
          <ChevronUp aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}

function MobileIsland({ onQuoteOpen }: { onQuoteOpen: () => void }) {
  const [activeItem, setActiveItem] = useState<'start' | 'services' | 'quote' | 'contact'>(() => {
    if (
      getPagePath().startsWith('/leistungen')
      || ['#facility-services', '#objekte', '#leistungen'].includes(window.location.hash)
    ) {
      return 'services'
    }

    return 'start'
  })
  const [contactOpen, setContactOpen] = useState(false)
  const islandRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const syncActiveItem = () => {
      if (
        getPagePath().startsWith('/leistungen')
        || ['#facility-services', '#objekte', '#leistungen'].includes(window.location.hash)
      ) {
        setActiveItem('services')
      } else if (window.location.hash === '#top' || window.location.hash === '') {
        setActiveItem('start')
      }
    }

    window.addEventListener('hashchange', syncActiveItem)
    return () => window.removeEventListener('hashchange', syncActiveItem)
  }, [])

  useEffect(() => {
    if (!contactOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setContactOpen(false)
    }
    const closeOutside = (event: PointerEvent) => {
      if (!islandRef.current?.contains(event.target as Node)) setContactOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOutside)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOutside)
    }
  }, [contactOpen])

  return (
    <nav className="mobile-island" aria-label="Mobile Schnellnavigation" ref={islandRef}>
      {contactOpen && (
        <div className="mobile-contact-panel" id="mobile-contact-panel" aria-label="Direkte Kontaktmöglichkeiten">
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={() => setContactOpen(false)}>
            <MessageCircle aria-hidden="true" />
            <span><strong>WhatsApp</strong><small>Nachricht schreiben</small></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href="tel:+491776867145" onClick={() => setContactOpen(false)}>
            <Phone aria-hidden="true" />
            <span><strong>Direkt anrufen</strong><small>0177 68 67 145</small></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href="mailto:mail@perlas.de" onClick={() => setContactOpen(false)}>
            <Mail aria-hidden="true" />
            <span><strong>E-Mail schreiben</strong><small>mail@perlas.de</small></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      )}
      <a
        className={activeItem === 'start' ? 'is-active' : ''}
        href={homeHref('#top')}
        aria-current={activeItem === 'start' ? 'page' : undefined}
        onClick={() => { setActiveItem('start'); setContactOpen(false) }}
      >
        <Home aria-hidden="true" />
        <span>Start</span>
      </a>
      <a
        className={activeItem === 'services' ? 'is-active' : ''}
        href={homeHref('#facility-services')}
        aria-current={activeItem === 'services' ? 'page' : undefined}
        onClick={() => { setActiveItem('services'); setContactOpen(false) }}
      >
        <Building2 aria-hidden="true" />
        <span>Facility</span>
      </a>
      <button
        className={activeItem === 'quote' ? 'is-active' : ''}
        type="button"
        aria-pressed={activeItem === 'quote'}
        onClick={() => { setActiveItem('quote'); setContactOpen(false); onQuoteOpen() }}
      >
        <ClipboardCheck aria-hidden="true" />
        <span>Angebot</span>
      </button>
      <button
        className={activeItem === 'contact' ? 'is-active' : ''}
        type="button"
        aria-expanded={contactOpen}
        aria-controls="mobile-contact-panel"
        onClick={() => { setActiveItem('contact'); setContactOpen((current) => !current) }}
      >
        <MessageCircle aria-hidden="true" />
        <span>Kontakt</span>
      </button>
    </nav>
  )
}

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [sliderResetKey, setSliderResetKey] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timeout = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, 5200)

    return () => window.clearTimeout(timeout)
  }, [activeSlide, sliderResetKey])

  const selectSlide = (index: number) => {
    setActiveSlide(index)
    setSliderResetKey((current) => current + 1)
  }

  return (
    <section className="hero" id="top">
      <img className="hero-circle" src={`${A}bg-circle.svg`} alt="" />
      <div className="hero-copy">
        <p className="eyebrow">Facility Services im Rhein-Main-Gebiet</p>
        <h1>Ganzheitliche Betreuung für professionell verwaltete Immobilien.</h1>
        <p className="hero-lead">
          Perla’s verbindet Objektbetreuung, technische Betreuung, Gebäudereinigung,
          Außenanlagenpflege und Winterdienst. Hausverwaltungen und gewerbliche Auftraggeber
          erhalten einen festen Ansprechpartner für die laufenden Aufgaben ihrer Immobilien.
        </p>
        <div className="button-row">
          <ButtonLink href="#kontakt" arrow>Betreuung anfragen</ButtonLink>
          <ButtonLink href="#facility-services" kind="outline">Facility Services</ButtonLink>
        </div>
      </div>
      <div className="hero-art" aria-roledescription="Karussell" aria-label="Einblicke in die Arbeit von Perla’s">
        <div className="hero-slides" aria-live="off">
          {heroSlides.map((slide, index) => (
            <figure className={index === activeSlide ? 'hero-slide is-active' : 'hero-slide'} aria-hidden={index !== activeSlide} key={slide.image}>
              <img
                src={`${A}${slide.image}`}
                alt={index === activeSlide ? slide.alt : ''}
                style={{ objectPosition: slide.position }}
              />
              <figcaption>{slide.label}</figcaption>
            </figure>
          ))}
        </div>
        <div className="hero-proof" aria-label="25 Jahre Erfahrung">
          <strong>25+</strong>
          <span>Jahre Erfahrung</span>
          <div>
            <CheckCircle2 aria-hidden="true" />
            <p>Zentral koordiniert</p>
          </div>
          <div>
            <CheckCircle2 aria-hidden="true" />
            <p>Leistungen dokumentiert</p>
          </div>
          <div>
            <CheckCircle2 aria-hidden="true" />
            <p>Lokal im Rhein-Main-Gebiet</p>
          </div>
        </div>
        <div className="hero-slider-controls" aria-label="Bild auswählen">
          {heroSlides.map((slide, index) => (
            <button
              className={index === activeSlide ? 'is-active' : ''}
              type="button"
              aria-label={`${slide.label} anzeigen`}
              aria-current={index === activeSlide ? 'true' : undefined}
              onClick={() => selectSlide(index)}
              key={slide.image}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FacilityOverview() {
  return (
    <section className="facility-overview" id="facility-services" aria-labelledby="facility-heading">
      <div className="facility-copy" data-reveal="left">
        <span className="eyebrow">Facility Management &amp; Services</span>
        <h2 id="facility-heading">Mehrere Leistungen. Ein abgestimmtes Betreuungskonzept.</h2>
        <p>
          Perla’s bündelt die laufende Objektbetreuung mit Reinigung, Wartung, Außenanlagenpflege
          und Winterdienst. Aufgaben, Leistungsintervalle und Zuständigkeiten werden für die
          jeweilige Immobilie festgelegt und über einen Ansprechpartner koordiniert.
        </p>
        <ButtonLink href="#objekte" arrow>Betreuung nach Objektart</ButtonLink>
        <nav className="facility-service-links" aria-label="Facility Services im Detail">
          {coreFeatures.map((service) => (
            <a href={`${BASE_PATH}leistungen/${service.slug}/`} key={service.slug}>
              {service.title}<ArrowUpRight aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
      <div className="facility-visual" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
        <img src={`${A}perlas-hero.png`} alt="Mitarbeiter von Perla’s bei einer Objektkontrolle und Dokumentation" />
        <span>Objektkontrolle · Koordination · Dokumentation</span>
      </div>
      <div className="facility-pillars" data-reveal="up" style={{ '--reveal-delay': '130ms' } as CSSProperties}>
        {facilityPillars.map((pillar) => {
          const Icon = pillar.icon
          return (
            <article key={pillar.title}>
              <Icon aria-hidden="true" />
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          )
        })}
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
      {partners.map((partner) => {
        const Icon = partner.icon
        return (
          <a
            className="partner-mark"
            role={duplicate ? undefined : 'listitem'}
            href={partner.href}
            tabIndex={duplicate ? -1 : undefined}
            key={partner.name}
          >
            <span aria-hidden="true"><Icon strokeWidth={1.9} /></span>
            <strong>{partner.name}</strong>
            <ArrowUpRight aria-hidden="true" />
          </a>
        )
      })}
    </div>
  )

  return (
    <section className="partner-strip" aria-labelledby="partner-strip-heading" data-reveal="fade">
      <p id="partner-strip-heading">Facility Services für professionelle Auftraggeber und verwaltete Immobilien</p>
      <div className="partner-marquee">
        <div className="partner-track">
          {renderPartners()}
          {renderPartners(true)}
        </div>
      </div>
    </section>
  )
}

function AudienceSolutions() {
  return (
    <section className="audience-solutions" id="objekte" aria-labelledby="audience-heading">
      <div className="audience-heading" data-reveal="up">
        <span className="eyebrow">Objekte &amp; Auftraggeber</span>
        <h2 id="audience-heading">Welche Leistungen zu Ihrer Immobilie passen.</h2>
        <p>
          Für größere Wohnanlagen, Gewerbeimmobilien und regelmäßig genutzte Gebäude kombinieren
          wir die benötigten Facility Services zu einer laufenden Betreuung.
        </p>
      </div>
      <div className="audience-grid">
        {audienceSolutions.map((audience, index) => {
          const Icon = audience.icon
          const linkedServices = audience.services
            .map((slug) => features.find((feature) => feature.slug === slug))
            .filter((feature): feature is Feature => Boolean(feature))

          return (
            <article
              className="audience-card"
              id={audience.id}
              data-reveal="up"
              style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}
              key={audience.id}
            >
              <div className="audience-card-icon"><Icon aria-hidden="true" /></div>
              <h3>{audience.title}</h3>
              <p>{audience.text}</p>
              <nav aria-label={`Leistungen für ${audience.title}`}>
                {linkedServices.map((service) => (
                  <a href={`${BASE_PATH}leistungen/${service.slug}/`} key={service.slug}>
                    {service.title}<ArrowUpRight aria-hidden="true" />
                  </a>
                ))}
              </nav>
            </article>
          )
        })}
      </div>
      <div className="audience-visuals" data-reveal="up">
        <figure>
          <img src={`${A}perlas-property.png`} alt="Größere Wohnanlage im Rhein-Main-Gebiet" />
          <figcaption>Größere Wohnanlagen &amp; Immobilienbestände</figcaption>
        </figure>
        <figure>
          <img src={`${A}perlas-office.png`} alt="Mitarbeiter von Perla’s bei der Einsatzplanung im Büro" />
          <figcaption>Einsatzplanung &amp; feste Ansprechpartner</figcaption>
        </figure>
        <div className="audience-image-placeholder" role="img" aria-label="Bildplatzhalter für eine größere Gewerbeimmobilie oder ein Verwaltungsgebäude">
          <Building2 aria-hidden="true" />
          <small>Bildmotiv vorgesehen</small>
          <strong>Größere Gewerbeimmobilie / Verwaltungsgebäude</strong>
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
        <h2>Ein Ansprechpartner für den laufenden Betrieb Ihrer Immobilien.</h2>
        <p>
          Perla’s ist seit 1999 im Rhein-Main-Gebiet tätig. Wir erfassen Aufgaben vor Ort, planen
          wiederkehrende Einsätze und koordinieren bei Bedarf weitere Dienstleister. Verwaltungen
          erhalten verständliche Rückmeldungen zu erledigten Aufgaben und offenen Punkten.
        </p>
        <div className="about-actions">
          <ButtonLink href="#kontakt" arrow>Betreuung besprechen</ButtonLink>
          <ButtonLink href="#ablauf" kind="outline">Unser Ablauf</ButtonLink>
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
      <div className="features-heading" data-reveal="up">
        <span className="eyebrow">Kernleistungen</span>
        <h2 id="features-heading">Facility Services für die laufende Immobilienbetreuung.</h2>
        <p>Diese fünf Leistungen stehen bei der regelmäßigen Betreuung größerer und professionell verwalteter Objekte im Vordergrund.</p>
      </div>
      <div className="feature-panel" data-reveal="scale" style={{ '--reveal-delay': '100ms' } as CSSProperties}>
        <div className="feature-grid">
          {coreFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <a className="feature-item" href={`${BASE_PATH}leistungen/${feature.slug}/`} key={feature.title}>
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
        {supplementaryFeatures.length > 0 && (
          <div className="supplementary-services">
            <span>Ergänzende Leistung</span>
            {supplementaryFeatures.map((feature) => (
              <a href={`${BASE_PATH}leistungen/${feature.slug}/`} key={feature.slug}>
                <PackageCheck aria-hidden="true" />
                <span><strong>{feature.title}</strong><small>{feature.text}</small></span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            ))}
          </div>
        )}
        <div className="feature-actions">
          <button className="button button--yellow" type="button" onClick={() => onQuoteOpen()}>
            <span>Angebot zusammenstellen</span>
            <img src={`${A}arrow.svg`} alt="" />
          </button>
          <ButtonLink href="#ablauf" kind="outline">So läuft die Betreuung</ButtonLink>
        </div>
      </div>
    </section>
  )
}

function ServiceDetailPage({ service, onQuoteOpen }: { service: Feature; onQuoteOpen: (service?: string) => void }) {
  const Icon = service.icon
  const emailHref = `mailto:mail@perlas.de?subject=${encodeURIComponent(`Anfrage zu ${service.title}`)}`
  const relatedServices = service.relatedServices
    .map((slug) => features.find((item) => item.slug === slug))
    .filter((item): item is Feature => Boolean(item))

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
          <div className="service-hero-links" aria-label="Weitere Kontaktmöglichkeiten">
            <a href={emailHref}><Mail aria-hidden="true" /> E-Mail schreiben</a>
            <a href={homeHref('#kontakt')}><MessageCircle aria-hidden="true" /> Allgemein Kontakt aufnehmen</a>
          </div>
        </div>
        <div className="service-detail-image" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          <img src={`${A}${service.image}`} alt={`${service.title} von Perla’s Objektbetreuung`} />
        </div>
      </section>

      <section className="service-overview" aria-labelledby="service-overview-heading">
        <div className="service-section-heading" data-reveal="left">
          <span className="eyebrow">Leistungsumfang</span>
          <h2 id="service-overview-heading">Was wir bei {service.title} konkret übernehmen.</h2>
          <p>{service.scopeIntro}</p>
        </div>
        <div className="service-scope-grid" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          {service.scopeCards.map((item, index) => (
            <article className="service-scope-card" key={item.title}>
              <span>0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <ul>
                {item.items.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="service-fit" aria-labelledby="service-fit-heading">
        <div className="service-fit-copy" data-reveal="left">
          <span className="eyebrow">Geeignete Objekte</span>
          <h2 id="service-fit-heading">Für diese Objekte bieten wir die Leistung an.</h2>
          <ul className="service-audience-list">
            {service.audiences.map((audience) => (
              <li key={audience}><CheckCircle2 aria-hidden="true" /> {audience}</li>
            ))}
          </ul>
        </div>
        <div className="service-benefit-list" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          {service.benefits.map((benefit, index) => (
            <article key={benefit.title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="service-process" data-reveal="up">
        {service.processSteps.map((step, index) => {
          const ProcessIcon = [ClipboardCheck, Clock3, ShieldCheck][index] ?? ClipboardCheck
          return (
            <div key={step.title}>
              <ProcessIcon aria-hidden="true" />
              <strong>{step.title}</strong>
              <span>{step.text}</span>
            </div>
          )
        })}
      </section>

      <section className="service-boundary" data-reveal="up">
        <div>
          <span className="eyebrow">Leistungsgrenzen</span>
          <h2>{service.boundaryTitle}</h2>
          <p>{service.boundaryText}</p>
        </div>
        <button className="button button--yellow" type="button" onClick={() => onQuoteOpen(service.title)}>
          <span>Leistungsumfang besprechen</span>
          <img src={`${A}arrow.svg`} alt="" />
        </button>
      </section>

      <section className="service-faq" aria-labelledby="service-faq-heading">
        <div className="service-section-heading" data-reveal="left">
          <span className="eyebrow">Häufige Fragen</span>
          <h2 id="service-faq-heading">Häufige Fragen zu {service.title}.</h2>
          <p>Antworten zu Leistungsumfang, Ablauf und Einsatzgebiet.</p>
        </div>
        <div className="service-faq-list" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          {service.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}<span aria-hidden="true">+</span></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="service-contact" aria-labelledby="service-contact-heading" data-reveal="up">
        <div className="service-contact-primary">
          <span className="eyebrow">Ihr nächster Schritt</span>
          <h2 id="service-contact-heading">Lassen Sie uns kurz über Ihr Objekt sprechen.</h2>
          <p>Sie entscheiden, wie Sie Kontakt aufnehmen möchten. Das Angebotsformular führt strukturiert durch die wichtigsten Angaben. Genauso gern können Sie direkt anrufen oder eine kurze Nachricht schreiben.</p>
          <button className="button button--yellow" type="button" onClick={() => onQuoteOpen(service.title)}>
            <span>Angebot für {service.title} anfragen</span>
            <img src={`${A}arrow.svg`} alt="" />
          </button>
        </div>
        <div className="service-contact-options" aria-label="Alternative Kontaktwege">
          <a href="tel:+491776867145">
            <Phone aria-hidden="true" />
            <span><strong>Direkt anrufen</strong><small>0177 68 67 145</small></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href={emailHref}>
            <Mail aria-hidden="true" />
            <span><strong>E-Mail schreiben</strong><small>mail@perlas.de</small></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href={homeHref('#kontakt')}>
            <MessageCircle aria-hidden="true" />
            <span><strong>Allgemeiner Kontakt</strong><small>Zur Kontaktseite</small></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="service-more" data-reveal="up">
        <span className="eyebrow">Passende Leistungen</span>
        <h2>Diese Leistungen könnten ebenfalls relevant sein.</h2>
        <p>Je nach Immobilie können diese drei Leistungen {service.title} ergänzen.</p>
        <div>
          {relatedServices.map((item) => {
            const MoreIcon = item.icon
            return (
              <a href={`${BASE_PATH}leistungen/${item.slug}/`} key={item.slug}>
                <MoreIcon aria-hidden="true" />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.text}</small>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function ClosingContact({ onQuoteOpen }: { onQuoteOpen: () => void }) {
  return (
    <section className="closing-contact" id="ablauf">
      <div className="closing-contact-copy" data-reveal="left">
        <span className="eyebrow">Betreuungskonzept</span>
        <h2>Leistungen und Intervalle für Ihren Immobilienbestand.</h2>
        <p>
          Bei einer Begehung erfassen wir Objekt, Nutzung und Aufgaben. Daraus entsteht ein
          verständlicher Leistungsplan mit Zuständigkeiten, Intervallen und Ansprechpartnern.
        </p>
        <ol className="closing-steps">
          <li><span>01</span><div><strong>Immobilie und Anforderungen erfassen</strong><small>Wir nehmen Flächen, Nutzung, Zugänge und die laufenden Aufgaben vor Ort auf.</small></div></li>
          <li><span>02</span><div><strong>Facility Services zusammenstellen</strong><small>Leistungen, Intervalle, Zuständigkeiten und Qualitätskontrollen werden festgelegt.</small></div></li>
          <li><span>03</span><div><strong>Betreuung und Dokumentation starten</strong><small>Die Einsätze beginnen nach dem abgestimmten Plan. Rückmeldungen laufen über einen festen Ansprechpartner.</small></div></li>
        </ol>
      </div>
      <div className="closing-contact-card" data-reveal="right" style={{ '--reveal-delay': '90ms' } as CSSProperties}>
        <MessageCircle aria-hidden="true" />
        <h3>Wie möchten Sie starten?</h3>
        <p>Stellen Sie Ihre Anfrage zusammen oder sprechen Sie direkt mit uns.</p>
        <button className="button button--yellow" type="button" onClick={onQuoteOpen}>
          <span>Angebot anfragen</span>
          <img src={`${A}arrow.svg`} alt="" />
        </button>
        <a className="closing-contact-link" href="tel:+491776867145"><Phone aria-hidden="true" /> 0177 68 67 145</a>
        <a className="closing-contact-link" href="mailto:mail@perlas.de"><Mail aria-hidden="true" /> mail@perlas.de</a>
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
          <h2>Direkt erreichbar.</h2>
          <div className="contact-list">
            <a href="tel:+491776867145"><Phone aria-hidden="true" /> 0177 68 67 145</a>
            <a href="mailto:mail@perlas.de"><Mail aria-hidden="true" /> mail@perlas.de</a>
            <p><MapPin aria-hidden="true" /> Hauptstraße 1, 65843 Sulzbach</p>
          </div>
          <p className="footer-description">
            Facility Services und professionelle Objektbetreuung für Hausverwaltungen,
            Wohnanlagen, Gewerbeimmobilien und institutionelle Gebäude im Rhein-Main-Gebiet.
          </p>
          <div className="legal-links">
            <a href="https://perlas.de/impressum/">Impressum</a>
            <a href="https://perlas.de/datenschutz/">Datenschutz</a>
            <button type="button" onClick={() => window.dispatchEvent(new Event('perlas:open-cookie-settings'))}>
              Cookie-Einstellungen
            </button>
          </div>
          <p>© 2026 Perla’s Objektbetreuung GmbH &amp; Co. KG</p>
        </div>

        <nav className="footer-nav" aria-label="Footer-Navigation">
          <h2>Perla’s</h2>
          {[
            ['Facility Services', '#facility-services'],
            ['Objekte', '#objekte'],
            ['Leistungen', '#leistungen'],
            ['Ablauf', '#ablauf'],
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
              <h2>Lassen Sie uns über Ihr Objekt sprechen</h2>
              <p>
                Schreiben Sie kurz, welche Immobilie Sie betreuen lassen möchten.
                Wir klären die nächsten Schritte persönlich mit Ihnen.
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

      </div>
    </footer>
  )
}

export default function App() {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [quoteService, setQuoteService] = useState<string | undefined>()
  const serviceSlug = getPagePath().match(/^\/leistungen\/([^/]+)\/?$/)?.[1]
  const activeService = features.find((service) => service.slug === serviceSlug)

  usePageSeo(activeService)
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
          <FacilityOverview />
          <PartnerMarquee />
          <AudienceSolutions />
          <Reviews />
          <About />
          <FeatureSection onQuoteOpen={openQuote} />
          <ClosingContact onQuoteOpen={() => openQuote()} />
          <Insights />
        </main>
      )}
      <Footer />
      <ContactDock />
      <MobileIsland onQuoteOpen={() => openQuote()} />
      <QuoteModal
        isOpen={quoteOpen}
        initialService={quoteService}
        serviceNames={features.map((service) => service.title)}
        onClose={closeQuote}
      />
      <CookieConsent />
    </>
  )
}
