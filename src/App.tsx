import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
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
import ContactPage from './ContactPage'
import QuoteModal from './QuoteModal'
import serviceContent from './service-data.json'

const BASE_PATH = import.meta.env.BASE_URL
const A = `${BASE_PATH}assets/`
const WHATSAPP_URL = 'https://wa.me/491776867145?text=Hallo%20Perla%E2%80%99s%20Team%2C%20ich%20interessiere%20mich%20f%C3%BCr%20Ihre%20Objektbetreuung.'
const CONTACT_PATH = `${BASE_PATH}kontakt/`
const FACILITY_PATH = `${BASE_PATH}facility-management/`

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

function usePageSeo(service?: Feature, pageKind: 'home' | 'contact' | 'facility' = 'home') {
  useEffect(() => {
    const siteUrl = new URL(BASE_PATH, window.location.origin)
    const isContactPage = pageKind === 'contact'
    const isFacilityPage = pageKind === 'facility'
    const pageUrl = service
      ? new URL(`leistungen/${service.slug}/`, siteUrl)
      : isContactPage
        ? new URL('kontakt/', siteUrl)
        : isFacilityPage
          ? new URL('facility-management/', siteUrl)
          : siteUrl
    const title = service?.seoTitle
      ?? (isContactPage
        ? 'Kontakt & Anfrage | Perla’s Facility Management'
        : isFacilityPage
          ? 'Facility Management Rhein-Main | Perla’s Objektbetreuung'
          : 'Perla’s Facility Management | Objektbetreuung Rhein-Main')
    const description = service?.seoDescription
      ?? (isContactPage
        ? 'Kontaktieren Sie Perla’s per Telefon, E-Mail, WhatsApp oder Anfrageformular und besprechen Sie die Betreuung Ihrer Immobilie im Rhein-Main-Gebiet.'
        : isFacilityPage
          ? 'Facility Management für Hausverwaltungen, größere Wohnanlagen, Gewerbeimmobilien und institutionelle Gebäude im Rhein-Main-Gebiet.'
          : 'Perla’s bündelt Facility Management und professionelle Objektbetreuung für Hausverwaltungen, Wohnanlagen und Gewerbeimmobilien im Rhein-Main-Gebiet.')
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
      : isContactPage
        ? {
            '@context': 'https://schema.org',
            '@graph': [
              business,
              {
                '@type': 'ContactPage',
                '@id': `${pageUrl.href}#contact-page`,
                url: pageUrl.href,
                name: 'Kontakt zu Perla’s Objektbetreuung',
                description,
                inLanguage: 'de-DE',
                mainEntity: { '@id': businessId },
              },
            ],
          }
        : isFacilityPage
          ? {
              '@context': 'https://schema.org',
              '@graph': [
                business,
                {
                  '@type': 'WebPage',
                  '@id': `${pageUrl.href}#facility-management`,
                  url: pageUrl.href,
                  name: 'Facility Management von Perla’s Objektbetreuung',
                  description,
                  inLanguage: 'de-DE',
                  mainEntity: { '@id': businessId },
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
  }, [pageKind, service])
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
  { name: 'Hausverwaltungen', href: `${FACILITY_PATH}#hausverwaltungen`, icon: KeyRound },
  { name: 'Größere Wohnanlagen', href: `${FACILITY_PATH}#wohnanlagen`, icon: Home },
  { name: 'Gewerbeimmobilien', href: `${FACILITY_PATH}#gewerbeimmobilien`, icon: Building2 },
  { name: 'Bürogebäude', href: `${FACILITY_PATH}#institutionelle-gebaeude`, icon: BriefcaseBusiness },
  { name: 'Unternehmensstandorte', href: `${FACILITY_PATH}#gewerbeimmobilien`, icon: ShieldCheck },
  { name: 'Institutionelle Gebäude', href: `${FACILITY_PATH}#institutionelle-gebaeude`, icon: Hospital },
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
    title: 'Hausverwaltungen',
    navLabel: 'Hausverwaltungen',
    text: 'Klare Zuständigkeiten und gebündelte Rückmeldungen für professionell verwaltete Immobilienbestände.',
    requirements: ['Ein Ansprechpartner für laufende Aufgaben', 'Abgestimmte Leistungsintervalle', 'Nachvollziehbare Zustands- und Leistungsmeldungen'],
    approach: 'Wir stimmen die benötigten Leistungen objektbezogen ab und führen Rückmeldungen zu einem übersichtlichen Gesamtbild zusammen.',
    services: ['objektpflege', 'gebaeudereinigung', 'wartung-instandhaltung', 'gartenpflege', 'winterdienst'],
  },
  {
    id: 'wohnanlagen',
    icon: Home,
    title: 'Größere Wohnanlagen & Immobilienbestände',
    navLabel: 'Größere Wohnanlagen',
    text: 'Laufende Betreuung gemeinschaftlich genutzter Gebäude- und Außenbereiche mit planbaren Abläufen.',
    requirements: ['Regelmäßige Objekt- und Sichtkontrollen', 'Pflege von Gemeinschafts- und Außenflächen', 'Koordination saisonaler und wiederkehrender Aufgaben'],
    approach: 'Gebäude, Außenanlagen und Zugänge werden in einem abgestimmten Betreuungskonzept betrachtet. Auffälligkeiten werden frühzeitig weitergegeben.',
    services: ['objektpflege', 'gebaeudereinigung', 'wartung-instandhaltung', 'gartenpflege', 'winterdienst', 'wohnungswechsel'],
  },
  {
    id: 'gewerbeimmobilien',
    icon: Building2,
    title: 'Gewerbeimmobilien & Unternehmensstandorte',
    navLabel: 'Gewerbeimmobilien',
    text: 'Objektbetreuung, Reinigung und technische Aufgaben werden so kombiniert, dass der laufende Betrieb möglichst wenig beeinträchtigt wird.',
    requirements: ['Planbare Einsätze im laufenden Betrieb', 'Gepflegte Innen- und Außenbereiche', 'Klare Weitergabe technischer Auffälligkeiten'],
    approach: 'Leistungen und Einsatzzeiten richten sich nach Objekt, Nutzung und Zugänglichkeit. Notwendige Facharbeiten werden mit geeigneten Fachbetrieben abgestimmt.',
    services: ['objektpflege', 'wartung-instandhaltung', 'gebaeudereinigung', 'gartenpflege', 'winterdienst'],
  },
  {
    id: 'institutionelle-gebaeude',
    icon: Hospital,
    title: 'Büro-, Praxis- & institutionelle Gebäude',
    navLabel: 'Institutionelle Gebäude',
    text: 'Für regelmäßig genutzte Gebäude verbinden wir feste Zuständigkeiten mit planbaren Leistungen für Innen- und Außenbereiche.',
    requirements: ['Verlässliche Abläufe bei regelmäßiger Nutzung', 'Saubere und gepflegte Gemeinschaftsflächen', 'Dokumentierte Kontrollen und Rückmeldungen'],
    approach: 'Wir legen Aufgaben, Intervalle und Ansprechpartner gemeinsam fest. Bei technischen Fachthemen koordinieren wir die Weitergabe an geeignete Spezialisten.',
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
    tag: 'Facility Management',
    title: 'Was ein belastbares Betreuungskonzept ausmacht',
    text: 'Welche Aufgaben, Leistungsintervalle und Zuständigkeiten in ein verständliches Leistungsverzeichnis gehören.',
  },
  {
    image: 'perlas-team.png',
    tag: 'Praxiswissen',
    title: 'Wie sich Facility-Leistungen über das Jahr planen lassen',
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
  const [facilityOpen, setFacilityOpen] = useState(false)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setFacilityOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const closeMenu = () => {
    setMenuOpen(false)
    setFacilityOpen(false)
  }

  return (
    <header className={menuOpen ? 'site-header menu-is-open' : 'site-header'}>
      <div className="nav-wrap">
        <a className="wordmark" href={homeHref()} aria-label="Perla’s Objektbetreuung Startseite">
          <img src={`${A}perlas-logo.svg`} alt="Perla’s Objektbetreuung GmbH & Co. KG" />
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => {
            setMenuOpen((current) => !current)
            if (menuOpen) setFacilityOpen(false)
          }}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="main-navigation" className={menuOpen ? 'is-open' : ''} aria-label="Hauptnavigation">
          <div
            className={facilityOpen ? 'nav-facility is-open' : 'nav-facility'}
            onMouseEnter={() => {
              if (window.matchMedia('(hover: hover)').matches) setFacilityOpen(true)
            }}
            onMouseLeave={() => {
              if (window.matchMedia('(hover: hover)').matches) setFacilityOpen(false)
            }}
            onFocus={(event) => {
              if (event.target instanceof HTMLAnchorElement) setFacilityOpen(true)
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFacilityOpen(false)
            }}
          >
            <div className="nav-facility-trigger">
              <a href={FACILITY_PATH} onClick={closeMenu}>Facility Management</a>
              <button
                type="button"
                aria-label={facilityOpen ? 'Zielgruppen im Facility Management schließen' : 'Zielgruppen im Facility Management anzeigen'}
                aria-expanded={facilityOpen}
                aria-controls="facility-navigation"
                onClick={() => setFacilityOpen((current) => !current)}
              >
                <ChevronDown aria-hidden="true" />
              </button>
            </div>
            <div className="facility-dropdown" id="facility-navigation">
              <span>Facility Management für</span>
              {audienceSolutions.map((audience) => {
                const Icon = audience.icon
                return (
                  <a href={`${FACILITY_PATH}#${audience.id}`} onClick={closeMenu} key={audience.id}>
                    <Icon aria-hidden="true" />
                    <strong>{audience.navLabel}</strong>
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>
          <a href={homeHref('#leistungen')} onClick={closeMenu}>Leistungen</a>
          <a href={homeHref('#ueber-uns')} onClick={closeMenu}>Über uns</a>
          <a className="sign-in" href={CONTACT_PATH} onClick={closeMenu}>Kontakt</a>
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
          <a href={CONTACT_PATH} onClick={() => setIsOpen(false)}>
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
    if (getPagePath().startsWith('/kontakt')) return 'contact'

    if (
      getPagePath().startsWith('/leistungen') || getPagePath().startsWith('/facility-management')
      || ['#facility-services', '#objekte', '#leistungen'].includes(window.location.hash)
    ) {
      return 'services'
    }

    return 'start'
  })

  useEffect(() => {
    const syncActiveItem = () => {
      if (getPagePath().startsWith('/kontakt')) {
        setActiveItem('contact')
      } else if (
        getPagePath().startsWith('/leistungen') || getPagePath().startsWith('/facility-management')
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
        href={FACILITY_PATH}
        aria-current={activeItem === 'services' ? 'page' : undefined}
        onClick={() => setActiveItem('services')}
      >
        <Building2 aria-hidden="true" />
        <span>Facility</span>
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
        className={activeItem === 'contact' ? 'is-active' : ''}
        href={CONTACT_PATH}
        aria-current={activeItem === 'contact' ? 'page' : undefined}
        onClick={() => setActiveItem('contact')}
      >
        <MessageCircle aria-hidden="true" />
        <span>Kontakt</span>
      </a>
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
        <p className="eyebrow">Facility Management im Rhein-Main-Gebiet</p>
        <h1>Facility Management für professionell verwaltete Immobilien.</h1>
        <p className="hero-lead">
          Perla’s verbindet Objektbetreuung, technische Koordination, Gebäudereinigung,
          Außenanlagenpflege und Winterdienst. Hausverwaltungen und gewerbliche Auftraggeber
          erhalten einen festen Ansprechpartner für die laufenden Aufgaben ihrer Immobilien.
        </p>
        <div className="button-row">
          <ButtonLink href={CONTACT_PATH} arrow>Betreuung anfragen</ButtonLink>
          <ButtonLink href={FACILITY_PATH} kind="outline">Facility Management</ButtonLink>
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
        <span className="eyebrow">Facility Management</span>
        <h2 id="facility-heading">Mehrere Leistungen. Ein abgestimmtes Betreuungskonzept.</h2>
        <p>
          Perla’s verbindet Objektbetreuung, Reinigung, Wartung, Außenanlagenpflege und
          Winterdienst zu einem objektbezogenen Leistungsplan. So werden mehrere laufende Aufgaben
          über einen Ansprechpartner, abgestimmte Intervalle und klare Rückmeldungen koordiniert.
        </p>
        <ButtonLink href={FACILITY_PATH} arrow>Facility Management ansehen</ButtonLink>
        <nav className="facility-service-links" aria-label="Einzelleistungen im Detail">
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
      <p id="partner-strip-heading">Facility Management für professionelle Auftraggeber und verwaltete Immobilien</p>
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
        <span className="eyebrow">Facility Management nach Zielgruppe</span>
        <h2 id="audience-heading">Betreuung passend zu Bestand, Nutzung und Organisation.</h2>
        <p>
          Auf der Facility-Management-Seite finden Hausverwaltungen und gewerbliche Auftraggeber
          die passende Einordnung für ihre Objekte – mit den jeweils relevanten Leistungen.
        </p>
      </div>
      <div className="audience-grid">
        {audienceSolutions.map((audience, index) => {
          const Icon = audience.icon

          return (
            <a
              className="audience-card"
              href={`${FACILITY_PATH}#${audience.id}`}
              data-reveal="up"
              style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}
              key={audience.id}
            >
              <div className="audience-card-icon"><Icon aria-hidden="true" /></div>
              <h3>{audience.title}</h3>
              <p>{audience.text}</p>
              <span className="audience-card-link">Bereich ansehen <ArrowUpRight aria-hidden="true" /></span>
            </a>
          )
        })}
      </div>
    </section>
  )
}

function FacilityManagementPage({ onQuoteOpen }: { onQuoteOpen: () => void }) {
  const targetImages: Record<string, { src: string; alt: string }> = {
    hausverwaltungen: {
      src: 'perlas-office.png',
      alt: 'Einsatzplanung für professionell verwaltete Immobilien',
    },
    wohnanlagen: {
      src: 'perlas-property.png',
      alt: 'Größere Wohnanlage im Rhein-Main-Gebiet',
    },
    gewerbeimmobilien: {
      src: 'perlas-hero.png',
      alt: 'Objektkontrolle an einer gewerblich genutzten Immobilie',
    },
    'institutionelle-gebaeude': {
      src: 'perlas-team.png',
      alt: 'Team für die laufende Objektbetreuung',
    },
  }

  return (
    <main className="facility-page">
      <section className="fm-hero">
        <div className="fm-hero-copy" data-reveal="left">
          <a className="service-breadcrumb" href={homeHref()}>Startseite / Facility Management</a>
          <span className="eyebrow">Facility Management im Rhein-Main-Gebiet</span>
          <h1>Gebäude ganzheitlich betreuen. Aufgaben klar koordinieren.</h1>
          <p>
            Perla’s bündelt die laufenden Aufgaben größerer und professionell verwalteter
            Immobilien in einem objektbezogenen Betreuungskonzept. Hausverwaltungen und
            gewerbliche Auftraggeber erhalten feste Zuständigkeiten, abgestimmte Intervalle und
            nachvollziehbare Rückmeldungen.
          </p>
          <div className="button-row">
            <ButtonLink href={CONTACT_PATH} arrow>Betreuung besprechen</ButtonLink>
            <ButtonLink href="#zielgruppen" kind="outline">Passenden Bereich wählen</ButtonLink>
          </div>
          <dl className="fm-hero-facts">
            <div><dt>Ein Ansprechpartner</dt><dd>für die laufende Abstimmung</dd></div>
            <div><dt>Klare Intervalle</dt><dd>für wiederkehrende Aufgaben</dd></div>
            <div><dt>Verständliche Rückmeldungen</dt><dd>zu Zustand und Handlungsbedarf</dd></div>
          </dl>
        </div>
        <figure className="fm-hero-visual" data-reveal="right" style={{ '--reveal-delay': '90ms' } as CSSProperties}>
          <img src={`${A}perlas-property.png`} alt="Professionell verwaltete Wohnanlage im Rhein-Main-Gebiet" />
          <figcaption>
            <Building2 aria-hidden="true" />
            <span><strong>Facility Management mit Überblick</strong><small>Objekt · Aufgaben · Zuständigkeiten</small></span>
          </figcaption>
        </figure>
      </section>

      <section className="fm-principles" aria-labelledby="fm-principles-heading">
        <div className="fm-section-heading" data-reveal="up">
          <span className="eyebrow">Was Facility Management bei Perla’s bedeutet</span>
          <h2 id="fm-principles-heading">Erst das Objekt verstehen. Dann Leistungen sinnvoll verbinden.</h2>
          <p>
            Ausgangspunkt ist nicht eine einzelne Tätigkeit, sondern der laufende Bedarf der
            Immobilie. Daraus entstehen abgestimmte Aufgaben, Intervalle und Zuständigkeiten.
          </p>
        </div>
        <div className="fm-principle-grid" data-reveal="up" style={{ '--reveal-delay': '90ms' } as CSSProperties}>
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
        <aside className="fm-specialist-note" data-reveal="up">
          <ShieldCheck aria-hidden="true" />
          <div>
            <strong>Technische Themen klar eingeordnet</strong>
            <p>
              Sichtkontrollen, Zustandsmeldungen und die organisatorische Abstimmung gehören zur
              Objektbetreuung. Sobald eine fachliche Prüfung oder eine entsprechende
              Qualifikation erforderlich ist, koordinieren wir die weitere Bearbeitung mit einem
              geeigneten Fachbetrieb und stellen sie nicht als eigene Fachleistung dar.
            </p>
          </div>
        </aside>
      </section>

      <section className="fm-targets" id="zielgruppen" aria-labelledby="fm-targets-heading">
        <div className="fm-section-heading" data-reveal="up">
          <span className="eyebrow">Objekte &amp; Auftraggeber</span>
          <h2 id="fm-targets-heading">Facility Management nach Nutzung und Organisationsform.</h2>
          <p>
            Wählen Sie den Bereich, der Ihrem Bestand am nächsten kommt. Verlinkt sind jeweils
            ausschließlich Leistungen, für die bereits eine eigene Detailseite vorhanden ist.
          </p>
        </div>
        <div className="fm-target-list">
          {audienceSolutions.map((audience, index) => {
            const Icon = audience.icon
            const linkedServices = audience.services
              .map((slug) => features.find((feature) => feature.slug === slug))
              .filter((feature): feature is Feature => Boolean(feature))
            const image = targetImages[audience.id]

            return (
              <article className="fm-target" id={audience.id} key={audience.id}>
                <div className="fm-target-copy" data-reveal={index % 2 === 0 ? 'left' : 'right'}>
                  <div className="fm-target-title">
                    <span><Icon aria-hidden="true" /></span>
                    <div><small>Facility Management für</small><h3>{audience.title}</h3></div>
                  </div>
                  <p className="fm-target-lead">{audience.text}</p>
                  <h4>Typische Anforderungen</h4>
                  <ul>
                    {audience.requirements.map((requirement) => (
                      <li key={requirement}><CheckCircle2 aria-hidden="true" /> {requirement}</li>
                    ))}
                  </ul>
                  <div className="fm-target-approach">
                    <strong>Unser Ansatz</strong>
                    <p>{audience.approach}</p>
                  </div>
                  <nav className="fm-service-links" aria-label={`Vorhandene Leistungen für ${audience.title}`}>
                    <span>Passende Leistungsseiten</span>
                    {linkedServices.map((service) => (
                      <a href={`${BASE_PATH}leistungen/${service.slug}/`} key={service.slug}>
                        {service.title}<ArrowUpRight aria-hidden="true" />
                      </a>
                    ))}
                  </nav>
                </div>
                <figure className="fm-target-image" data-reveal={index % 2 === 0 ? 'right' : 'left'}>
                  <img src={`${A}${image.src}`} alt={image.alt} />
                  <figcaption>{audience.navLabel}</figcaption>
                </figure>
              </article>
            )
          })}
        </div>
      </section>

      <section className="fm-complex" aria-labelledby="fm-complex-heading">
        <div className="fm-complex-copy" data-reveal="left">
          <span className="eyebrow">Größere &amp; komplexere Objekte</span>
          <h2 id="fm-complex-heading">Auch viele Teilbereiche bleiben als Gesamtablauf steuerbar.</h2>
          <p>
            Bei umfangreicheren Immobilienbeständen werden wiederkehrende Aufgaben nach Flächen,
            Nutzung und Zuständigkeit gegliedert. So bleibt erkennbar, was regelmäßig betreut,
            kontrolliert, gemeldet oder durch einen Fachbetrieb bearbeitet werden muss.
          </p>
          <ButtonLink href={CONTACT_PATH} kind="outline-light" arrow>Objektstruktur besprechen</ButtonLink>
        </div>
        <div className="fm-complex-grid" data-reveal="right" style={{ '--reveal-delay': '90ms' } as CSSProperties}>
          {[
            ['Gebäude & Gemeinschaftsflächen', 'Reinigung, Objektpflege und regelmäßige Kontrollgänge werden in passenden Intervallen geplant.'],
            ['Außenanlagen & Winter', 'Grünpflege, Wege, Zugänge und saisonale Winterdienste werden aufeinander abgestimmt.'],
            ['Parkflächen & Tiefgaragen', 'Sauberkeit, sichtbare Auffälligkeiten und organisatorischer Handlungsbedarf fließen in die Rückmeldung ein.'],
            ['Technische Anlagen', 'Sichtkontrollen und Meldungen werden koordiniert; fachliche Prüfungen und Arbeiten bleiben bei geeigneten Fachbetrieben.'],
          ].map(([title, text], index) => (
            <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="fm-cta" data-reveal="up">
        <div>
          <span className="eyebrow">Nächster Schritt</span>
          <h2>Welche Betreuung braucht Ihr Objekt?</h2>
          <p>Wir erfassen Immobilie, Nutzung und laufende Aufgaben und besprechen daraus einen passenden Leistungsumfang.</p>
        </div>
        <div className="fm-cta-actions">
          <button className="button button--yellow" type="button" onClick={onQuoteOpen}>
            <span>Angebot anfragen</span><img src={`${A}arrow.svg`} alt="" />
          </button>
          <a href="tel:+491776867145"><Phone aria-hidden="true" /> 0177 68 67 145</a>
        </div>
      </section>
    </main>
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
          erhalten verständliche Rückmeldungen zu erledigten Aufgaben und offenen Punkten. Aufgaben
          aus dem klassischen Hausmeisterservice werden dabei in die ganzheitliche Betreuung eingebunden.
        </p>
        <div className="about-actions">
          <ButtonLink href={CONTACT_PATH} arrow>Betreuung besprechen</ButtonLink>
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
        <h2 id="features-heading">Einzelleistungen für die laufende Immobilienbetreuung.</h2>
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
            <a href={CONTACT_PATH}><MessageCircle aria-hidden="true" /> Allgemein Kontakt aufnehmen</a>
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
          <a href={CONTACT_PATH}>
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
          <li><span>02</span><div><strong>Facility-Leistungen zusammenstellen</strong><small>Leistungen, Intervalle, Zuständigkeiten und Qualitätskontrollen werden festgelegt.</small></div></li>
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
    <footer className="footer" id="seitenende">
      <div className="footer-grid" data-reveal="up">
        <div className="footer-meta">
          <h2>Direkt erreichbar.</h2>
          <div className="contact-list">
            <a href="tel:+491776867145"><Phone aria-hidden="true" /> 0177 68 67 145</a>
            <a href="mailto:mail@perlas.de"><Mail aria-hidden="true" /> mail@perlas.de</a>
            <p><MapPin aria-hidden="true" /> Hauptstraße 1, 65843 Sulzbach</p>
          </div>
          <p className="footer-description">
            Facility Management und professionelle Objektbetreuung für Hausverwaltungen,
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
            ['Facility Management', 'facility-management/'],
            ['Zielgruppen', 'facility-management/#zielgruppen'],
            ['Leistungen', '#leistungen'],
            ['Ablauf', '#ablauf'],
            ['Kontakt', 'kontakt/'],
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
              <a className="contact-card-button" href={CONTACT_PATH}>
                Kontaktseite öffnen
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
  const pagePath = getPagePath()
  const isContactPage = /^\/kontakt\/?$/.test(pagePath)
  const isFacilityPage = /^\/facility-management\/?$/.test(pagePath)
  const serviceSlug = pagePath.match(/^\/leistungen\/([^/]+)\/?$/)?.[1]
  const activeService = features.find((service) => service.slug === serviceSlug)

  usePageSeo(activeService, isContactPage ? 'contact' : isFacilityPage ? 'facility' : 'home')
  useRevealAnimations(isContactPage ? 'contact' : isFacilityPage ? 'facility' : activeService?.slug)

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
      ) : isContactPage ? (
        <ContactPage onQuoteOpen={() => openQuote()} />
      ) : isFacilityPage ? (
        <FacilityManagementPage onQuoteOpen={() => openQuote()} />
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
