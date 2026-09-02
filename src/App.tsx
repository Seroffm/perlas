import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
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
import BlogPage, { BlogArticlePage } from './BlogPage'
import CareerPage from './CareerPage'
import audienceContent from './audience-data.json'
import blogContent from './blog-data.json'
import jobContent from './job-data.json'
import serviceContent from './service-data.json'
import type { BlogPostContent, JobOpeningContent } from './content-types'

const BASE_PATH = import.meta.env.BASE_URL
const A = `${BASE_PATH}assets/`
const WHATSAPP_URL = 'https://wa.me/491776867145?text=Hallo%20Perla%E2%80%99s%20Team%2C%20ich%20interessiere%20mich%20f%C3%BCr%20Ihre%20Objektbetreuung.'
const CONTACT_PATH = `${BASE_PATH}kontakt/`
const FACILITY_PATH = `${BASE_PATH}facility-management/`
const SERVICES_PATH = `${BASE_PATH}leistungen/`
const ABOUT_PATH = `${BASE_PATH}ueber-uns/`
const BLOG_PATH = `${BASE_PATH}blog/`
const IMPRINT_PATH = `${BASE_PATH}impressum/`
const PRIVACY_PATH = `${BASE_PATH}datenschutz/`

const homeHref = (hash = '') => `${BASE_PATH}${hash}`
const audienceHref = (id: string) => `${FACILITY_PATH}${id}/`

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

type PageKind = 'home' | 'contact' | 'facility' | 'services' | 'about' | 'blog' | 'career' | 'imprint' | 'privacy'

const blogPosts = blogContent as BlogPostContent[]
const jobOpenings = jobContent as JobOpeningContent[]

type AudienceSolutionContent = {
  id: string
  title: string
  navLabel: string
  text: string
  seoTitle: string
  seoDescription: string
  heroTitle: string
  heroText: string
  introTitle: string
  introText: string
  requirements: string[]
  approach: string
  services: string[]
  image: { src: string; alt: string }
  scopeCards: Array<{ title: string; text: string }>
  process: Array<{ title: string; text: string }>
  faqs: Array<{ question: string; answer: string }>
}

type AudienceSolution = AudienceSolutionContent & { icon: LucideIcon }

function usePageSeo(service?: Feature, pageKind: PageKind = 'home', audience?: AudienceSolution, article?: BlogPostContent) {
  useEffect(() => {
    const siteUrl = new URL(BASE_PATH, window.location.origin)
    const servicesUrl = new URL('leistungen/', siteUrl)
    const facilityUrl = new URL('facility-management/', siteUrl)
    const pageDefinitions: Record<Exclude<PageKind, 'home'>, { path: string; title: string; description: string; schemaType: string }> = {
      contact: {
        path: 'kontakt/',
        title: 'Kontakt & Anfrage | Perla’s Facility Management',
        description: 'Kontaktieren Sie Perla’s per Telefon, E-Mail, WhatsApp oder Anfrageformular und besprechen Sie die Betreuung Ihrer Immobilie im Rhein-Main-Gebiet.',
        schemaType: 'ContactPage',
      },
      facility: {
        path: 'facility-management/',
        title: 'Facility Management Rhein-Main | Perla’s Objektbetreuung',
        description: 'Facility Management für Hausverwaltungen, größere Wohnanlagen, Gewerbeimmobilien sowie institutionelle und öffentliche Gebäude im Rhein-Main-Gebiet.',
        schemaType: 'WebPage',
      },
      services: {
        path: 'leistungen/',
        title: 'Leistungen für Immobilien | Perla’s Rhein-Main',
        description: 'Objektpflege, Wartung, Gebäudereinigung, Gartenpflege, Winterdienst und Wohnungswechsel von Perla’s im Rhein-Main-Gebiet.',
        schemaType: 'CollectionPage',
      },
      about: {
        path: 'ueber-uns/',
        title: 'Über Perla’s | Objektbetreuung seit 1999',
        description: 'Lernen Sie Perla’s Objektbetreuung, die Arbeitsweise und die Werte hinter dem Facility Management im Rhein-Main-Gebiet kennen.',
        schemaType: 'AboutPage',
      },
      blog: {
        path: 'blog/',
        title: 'Blog: Wissen zur Objektbetreuung | Perla’s',
        description: 'Praxiswissen zu Facility Management, Objektbetreuung, Gebäudereinigung, Außenanlagen und saisonaler Planung im Rhein-Main-Gebiet.',
        schemaType: 'CollectionPage',
      },
      career: {
        path: 'karriere/',
        title: 'Karriere & Jobs | Perla’s Objektbetreuung',
        description: 'Arbeiten bei Perla’s: Einsatzbereiche in Objektbetreuung, Gebäudereinigung und Außenanlagenpflege im Rhein-Main-Gebiet kennenlernen.',
        schemaType: 'CollectionPage',
      },
      imprint: {
        path: 'impressum/',
        title: 'Impressum | Perla’s Objektbetreuung',
        description: 'Impressum und Anbieterkennzeichnung von Perla’s Objektbetreuung im Rhein-Main-Gebiet.',
        schemaType: 'WebPage',
      },
      privacy: {
        path: 'datenschutz/',
        title: 'Datenschutz | Perla’s Objektbetreuung',
        description: 'Vorläufige Informationen zum Datenschutz auf der Website von Perla’s Objektbetreuung.',
        schemaType: 'WebPage',
      },
    }
    const pageDefinition = pageKind === 'home' ? undefined : pageDefinitions[pageKind]
    const pageUrl = article
      ? new URL(`blog/${article.slug}/`, siteUrl)
      : service
      ? new URL(`leistungen/${service.slug}/`, siteUrl)
      : audience
        ? new URL(`facility-management/${audience.id}/`, siteUrl)
      : pageDefinition
        ? new URL(pageDefinition.path, siteUrl)
        : siteUrl
    const title = article?.seoTitle
      ?? audience?.seoTitle
      ?? service?.seoTitle
      ?? pageDefinition?.title
      ?? 'Perla’s Facility Management | Objektbetreuung Rhein-Main'
    const description = article?.seoDescription
      ?? audience?.seoDescription
      ?? service?.seoDescription
      ?? pageDefinition?.description
      ?? 'Perla’s bündelt Facility Management und professionelle Objektbetreuung für Hausverwaltungen, Wohnanlagen und Gewerbeimmobilien im Rhein-Main-Gebiet.'
    const imageUrl = new URL(`${BASE_PATH}assets/${article?.image ?? audience?.image.src ?? 'perlas-hero.png'}`, window.location.origin)
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
    const structuredData = article
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            business,
            {
              '@type': 'BlogPosting',
              '@id': `${pageUrl.href}#article`,
              headline: article.title,
              description: article.seoDescription,
              image: imageUrl.href,
              datePublished: '2026-08-31',
              dateModified: '2026-08-31',
              inLanguage: 'de-DE',
              author: { '@id': businessId },
              publisher: { '@id': businessId },
              mainEntityOfPage: pageUrl.href,
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Startseite', item: siteUrl.href },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: new URL('blog/', siteUrl).href },
                { '@type': 'ListItem', position: 3, name: article.title, item: pageUrl.href },
              ],
            },
          ],
        }
      : service
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
                { '@type': 'ListItem', position: 2, name: 'Leistungen', item: servicesUrl.href },
                { '@type': 'ListItem', position: 3, name: service.title, item: pageUrl.href },
              ],
            },
          ],
        }
      : audience
        ? {
            '@context': 'https://schema.org',
            '@graph': [
              business,
              {
                '@type': 'Service',
                '@id': `${pageUrl.href}#service`,
                name: `Facility Management für ${audience.navLabel}`,
                description: audience.seoDescription,
                url: pageUrl.href,
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
                  { '@type': 'ListItem', position: 3, name: audience.navLabel, item: pageUrl.href },
                ],
              },
            ],
          }
      : pageDefinition
        ? {
            '@context': 'https://schema.org',
            '@graph': [
              business,
              {
                '@type': pageDefinition.schemaType,
                '@id': `${pageUrl.href}#page`,
                url: pageUrl.href,
                name: title,
                description,
                inLanguage: 'de-DE',
                mainEntity: { '@id': businessId },
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Startseite', item: siteUrl.href },
                  { '@type': 'ListItem', position: 2, name: pageKind === 'about' ? 'Über uns' : pageKind === 'services' ? 'Leistungen' : pageKind === 'facility' ? 'Facility Management' : pageKind === 'blog' ? 'Blog' : pageKind === 'career' ? 'Karriere' : pageKind === 'imprint' ? 'Impressum' : pageKind === 'privacy' ? 'Datenschutz' : 'Kontakt', item: pageUrl.href },
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
  }, [article, audience, pageKind, service])
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
      {arrow && <img src={`${A}${kind === 'outline' ? 'arrow.svg' : 'arrow-white.svg'}`} alt="" />}
    </a>
  )
}

const GOOGLE_REVIEWS_URL =
  'https://www.google.com/search?q=Perla%27s+Objektbetreuung+GmbH+%26+Co.+KG+Sulzbach+Rezensionen'

const reviews = [
  {
    copy: 'Freundlich, hilfsbereit und zuverlässig.',
    author: 'Amanda Li',
    age: 'vor 2 Monaten',
  },
  {
    copy: 'Zuverlässig und unkompliziert.',
    author: 'Melanie Michaelpillai',
    age: 'vor 7 Monaten',
  },
  {
    copy: 'Kommunikation ist unkompliziert.',
    author: 'Alexis Sheva',
    age: 'vor einem Jahr',
  },
  {
    copy: 'Schnell, zuverlässig und immer erreichbar.',
    author: 'Challenge 4 Change',
    age: 'vor einem Jahr',
  },
  {
    copy: 'Zuverlässig und sorgfältig.',
    author: 'Z D',
    age: 'vor einem Jahr',
  },
  {
    copy: 'Sehr professionelle und saubere Arbeit.',
    author: 'Gabriele Dell Olio',
    age: 'vor 7 Monaten',
  },
]

const proofStats = [
  ['25+', 'Jahre Erfahrung'],
  ['700+', 'abgeschlossene Projekte'],
  ['1000+', 'glückliche Mieter & Verwaltungen'],
  ['1', 'starkes Team'],
]

type Partner = {
  name: string
  logo: string
  fallback?: string
}

const partners: Partner[] = [
  { name: 'BundesImmobilien', logo: 'partners/bundesimmobilien.png' },
  { name: 'David Lloyd Meridian', logo: 'partners/david-lloyd-meridian.png' },
  { name: 'David Lloyd Clubs', logo: 'partners/david-lloyd-clubs.png' },
  { name: 'Immtelli', logo: 'partners/immtelli.png' },
  { name: 'UNIRESTA', logo: 'partners/uniresta.jpeg' },
  { name: 'VALO Immobilienmanagement', logo: 'partners/valo.png' },
  { name: 'Zeidler', logo: 'partners/zeidler.webp' },
  {
    name: 'Bundesanstalt für Immobilienaufgaben',
    logo: 'partners/bundesanstalt.webp',
    fallback: 'partners/bundesanstalt.jpeg',
  },
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

const audienceIcons: Record<string, LucideIcon> = {
  hausverwaltungen: KeyRound,
  wohnanlagen: Home,
  gewerbeimmobilien: Building2,
  'institutionelle-gebaeude': Hospital,
}

const audienceSolutions: AudienceSolution[] = (audienceContent as AudienceSolutionContent[]).map((audience) => ({
  ...audience,
  icon: audienceIcons[audience.id] ?? Building2,
}))

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
                  <a href={audienceHref(audience.id)} onClick={closeMenu} key={audience.id}>
                    <Icon aria-hidden="true" />
                    <strong>{audience.navLabel}</strong>
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>
          <a href={SERVICES_PATH} onClick={closeMenu}>Leistungen</a>
          <a href={ABOUT_PATH} onClick={closeMenu}>Über uns</a>
          <a href={BLOG_PATH} onClick={closeMenu}>Blog</a>
          <a href={CONTACT_PATH} onClick={closeMenu}>Kontakt</a>
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
        href={SERVICES_PATH}
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

function PageBreadcrumb({ current, parent }: { current: string; parent?: { label: string; href: string } }) {
  return (
    <nav className="page-breadcrumb" aria-label="Brotkrümeln">
      <a href={homeHref()}>Startseite</a>
      <span aria-hidden="true">/</span>
      {parent && <><a href={parent.href}>{parent.label}</a><span aria-hidden="true">/</span></>}
      <span aria-current="page">{current}</span>
    </nav>
  )
}

function HomeOverview() {
  const highlightedServices = coreFeatures.slice(0, 3)

  return (
    <section className="home-overview" aria-labelledby="home-overview-heading">
      <div className="home-section-heading" data-reveal="up">
        <span className="eyebrow">Perla’s im Überblick</span>
        <h2 id="home-overview-heading">Der passende Weg für Ihr Objekt.</h2>
        <p>Von der ganzheitlichen Betreuung bis zur einzelnen Leistung: Wählen Sie den Bereich, der zu Ihrem Bedarf passt.</p>
      </div>
      <div className="home-path-grid">
        <a className="home-path-card home-path-card--featured" href={FACILITY_PATH} data-reveal="left">
          <span className="home-path-icon"><ClipboardCheck aria-hidden="true" /></span>
          <span className="eyebrow">Facility Management</span>
          <h3>Mehrere Aufgaben. Ein abgestimmtes Betreuungskonzept.</h3>
          <p>Für professionell verwaltete Immobilien verbinden wir Leistungen, Intervalle und Rückmeldungen zu einem klaren Gesamtablauf.</p>
          <span className="home-path-link">Facility Management ansehen <ArrowUpRight aria-hidden="true" /></span>
        </a>
        <a className="home-path-card" href={SERVICES_PATH} data-reveal="up" style={{ '--reveal-delay': '60ms' } as CSSProperties}>
          <span className="home-path-icon"><Wrench aria-hidden="true" /></span>
          <span className="eyebrow">Leistungen</span>
          <h3>Einzelleistungen gezielt auswählen.</h3>
          <p>{highlightedServices.map((service) => service.title).join(' · ')} und weitere Leistungen im Überblick.</p>
          <span className="home-path-link">Alle Leistungen <ArrowUpRight aria-hidden="true" /></span>
        </a>
        <a className="home-path-card" href={ABOUT_PATH} data-reveal="up" style={{ '--reveal-delay': '100ms' } as CSSProperties}>
          <span className="home-path-icon"><ShieldCheck aria-hidden="true" /></span>
          <span className="eyebrow">Über uns</span>
          <h3>Objektbetreuung mit Verantwortung.</h3>
          <p>Seit 1999 betreut Perla’s Immobilien im Rhein-Main-Gebiet – persönlich, planbar und mit festen Zuständigkeiten.</p>
          <span className="home-path-link">Perla’s kennenlernen <ArrowUpRight aria-hidden="true" /></span>
        </a>
        <a className="home-path-card home-path-card--contact" href={CONTACT_PATH} data-reveal="right" style={{ '--reveal-delay': '140ms' } as CSSProperties}>
          <span className="home-path-icon"><MessageCircle aria-hidden="true" /></span>
          <span className="eyebrow">Kontakt</span>
          <h3>Ihr Objekt persönlich besprechen.</h3>
          <p>Schildern Sie kurz die Immobilie und den Bedarf. Wir klären gemeinsam, welcher Leistungsumfang sinnvoll ist.</p>
          <span className="home-path-link">Kontakt aufnehmen <ArrowUpRight aria-hidden="true" /></span>
        </a>
      </div>
    </section>
  )
}

function HomeCoreServices() {
  return (
    <section className="home-core-services" id="leistungen" aria-labelledby="home-core-services-heading">
      <div className="home-section-heading" data-reveal="up">
        <span className="eyebrow">Kernleistungen</span>
        <h2 id="home-core-services-heading">Das übernehmen wir für Ihre Immobilie.</h2>
        <p>Fünf Leistungen, die sich einzeln beauftragen oder im Facility Management sinnvoll verbinden lassen.</p>
      </div>
      <div className="home-service-card-grid">
        {coreFeatures.map((service, index) => {
          const Icon = service.icon

          return (
            <a
              className="home-service-card"
              href={`${SERVICES_PATH}${service.slug}/`}
              key={service.slug}
              data-reveal="up"
              style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties}
            >
              <div className="home-service-card-copy">
                <span className="home-service-card-icon"><Icon aria-hidden="true" /></span>
                <h3>{service.title}</h3>
                <span className="home-service-card-link">Leistung ansehen <ArrowUpRight aria-hidden="true" /></span>
              </div>
            </a>
          )
        })}
      </div>
      <ButtonLink href={SERVICES_PATH} kind="outline" arrow>Alle Leistungen ansehen</ButtonLink>
    </section>
  )
}

function HomeTrust() {
  return (
    <section className="home-trust" aria-labelledby="home-trust-heading">
      <div className="home-trust-copy" data-reveal="left">
        <span className="eyebrow">Verlässlich im laufenden Betrieb</span>
        <h2 id="home-trust-heading">Erfahrung und klare Abläufe.</h2>
        <p>Perla’s schafft Übersicht über wiederkehrende Aufgaben und hält Rückmeldungen zu Zustand, Leistung und Handlungsbedarf an einer Stelle zusammen.</p>
        <ButtonLink href={ABOUT_PATH} kind="outline" arrow>Mehr über Perla’s</ButtonLink>
      </div>
      <div className="home-trust-stats" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
        {proofStats.map(([value, label]) => (
          <div key={label}><strong>{value}</strong><span>{label}</span></div>
        ))}
      </div>
    </section>
  )
}

function ServicesOverviewPage() {
  return (
    <main className="architecture-page services-overview-page">
      <section className="architecture-hero">
        <div className="architecture-hero-copy" data-reveal="left">
          <PageBreadcrumb current="Leistungen" />
          <span className="eyebrow">Facility Services im Rhein-Main-Gebiet</span>
          <h1>Leistungen für den laufenden Betrieb Ihrer Immobilie.</h1>
          <p>Wählen Sie eine einzelne Leistung oder kombinieren Sie mehrere Aufgaben zu einem objektbezogenen Betreuungskonzept.</p>
          <div className="button-row">
            <ButtonLink href={CONTACT_PATH} arrow>Leistung anfragen</ButtonLink>
            <ButtonLink href={FACILITY_PATH} kind="outline">Facility Management</ButtonLink>
          </div>
        </div>
        <figure className="architecture-hero-image" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          <img src={`${A}perlas-hero.png`} alt="Mitarbeiter von Perla’s bei der Objektkontrolle" />
          <figcaption>Objektbezogen geplant · verlässlich ausgeführt</figcaption>
        </figure>
      </section>

      <section className="services-audience-nav" aria-labelledby="services-audience-heading">
        <div className="architecture-section-heading" data-reveal="up">
          <span className="eyebrow">Objekte &amp; Auftraggeber</span>
          <h2 id="services-audience-heading">Für diese Immobilien arbeiten wir.</h2>
          <p>Wählen Sie den passenden Bereich und erfahren Sie, wie sich einzelne Leistungen zu einer abgestimmten Betreuung verbinden lassen.</p>
        </div>
        <nav className="services-audience-links" aria-label="Facility Management nach Objektart">
          {audienceSolutions.map((audience, index) => {
            const Icon = audience.icon
            return (
              <a
                href={audienceHref(audience.id)}
                data-reveal="up"
                style={{ '--reveal-delay': `${index * 45}ms` } as CSSProperties}
                key={audience.id}
              >
                <span><Icon aria-hidden="true" /></span>
                <strong>{audience.navLabel}</strong>
                <ArrowUpRight aria-hidden="true" />
              </a>
            )
          })}
        </nav>
      </section>

      <section className="services-catalog" aria-labelledby="services-catalog-heading">
        <div className="architecture-section-heading" data-reveal="up">
          <span className="eyebrow">Leistungsübersicht</span>
          <h2 id="services-catalog-heading">Unsere Leistungen im Überblick.</h2>
          <p>Jede Leistung führt zu einer eigenen Seite mit Leistungsumfang, Ablauf, Einsatzbereichen und klarer fachlicher Einordnung.</p>
        </div>
        <div className="services-catalog-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <a className="services-catalog-card" href={`${SERVICES_PATH}${feature.slug}/`} data-reveal="up" style={{ '--reveal-delay': `${(index % 3) * 55}ms` } as CSSProperties} key={feature.slug}>
                <span className="services-catalog-icon"><Icon aria-hidden="true" strokeWidth={1.8} /></span>
                <div><h3>{feature.title}</h3><p>{feature.text}</p></div>
                <span>Leistung ansehen <ArrowUpRight aria-hidden="true" /></span>
              </a>
            )
          })}
        </div>
      </section>

      <section className="architecture-bridge" data-reveal="up">
        <div>
          <span className="eyebrow">Mehrere Leistungen verbinden</span>
          <h2>Leistungen sinnvoll verbinden.</h2>
          <p>Bei größeren oder professionell verwalteten Immobilien lassen sich Leistungen, Intervalle, Zuständigkeiten und Rückmeldungen in einem Betreuungskonzept bündeln.</p>
        </div>
        <ButtonLink href={FACILITY_PATH} kind="outline" arrow>Facility Management ansehen</ButtonLink>
      </section>
    </main>
  )
}

function AboutPage({ onQuoteOpen }: { onQuoteOpen: () => void }) {
  const values = [
    [ShieldCheck, 'Verantwortung', 'Aufgaben, Zuständigkeiten und offene Punkte werden nachvollziehbar eingeordnet.'],
    [Clock3, 'Planbarkeit', 'Wiederkehrende Leistungen erhalten klare Intervalle und abgestimmte Abläufe.'],
    [MessageCircle, 'Persönliche Abstimmung', 'Ein fester Ansprechpartner bündelt Rückmeldungen und die laufende Koordination.'],
    [ClipboardCheck, 'Objektbezug', 'Der tatsächliche Bedarf der Immobilie bildet die Grundlage für den Leistungsumfang.'],
  ] as const
  const teamMembers = [
    {
      image: 'about-team-portrait-1.jpg',
      alt: 'Porträt einer Mitarbeiterin von Perla’s Objektbetreuung',
    },
    {
      image: 'about-team-portrait-2.jpeg',
      alt: 'Porträt eines Mitarbeiters von Perla’s Objektbetreuung',
    },
    {
      image: 'about-team-portrait-3.jpg',
      alt: 'Porträt eines Mitarbeiters aus dem Team von Perla’s',
    },
  ]

  return (
    <main className="architecture-page about-page">
      <section className="architecture-hero architecture-hero--about">
        <div className="architecture-hero-copy" data-reveal="left">
          <PageBreadcrumb current="Über uns" />
          <span className="eyebrow">Perla’s Objektbetreuung</span>
          <h1>Seit 1999 für Immobilien im Rhein-Main-Gebiet da.</h1>
          <p>Perla’s verbindet persönliche Abstimmung mit planbarer Objektbetreuung. Wir erfassen Aufgaben vor Ort, koordinieren wiederkehrende Einsätze und halten Rückmeldungen verständlich zusammen.</p>
          <div className="button-row">
            <ButtonLink href={CONTACT_PATH} arrow>Persönlich kennenlernen</ButtonLink>
            <ButtonLink href={FACILITY_PATH} kind="outline">Unsere Arbeitsweise</ButtonLink>
          </div>
        </div>
        <figure className="architecture-hero-image" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          <img src={`${A}perlas-team.png`} alt="Das Team von Perla’s Objektbetreuung" />
          <figcaption>Vor Ort im Rhein-Main-Gebiet</figcaption>
        </figure>
      </section>

      <section className="about-story" aria-labelledby="about-story-heading">
        <div data-reveal="left">
          <span className="eyebrow">Unser Anspruch</span>
          <h2 id="about-story-heading">Übersicht schafft Verbindlichkeit.</h2>
        </div>
        <div data-reveal="right" style={{ '--reveal-delay': '70ms' } as CSSProperties}>
          <p>Seit 1999 ist Perla’s im Rhein-Main-Gebiet tätig. Aus der klassischen Objektbetreuung ist ein Angebot entstanden, das einzelne Facility Services sinnvoll miteinander verbindet.</p>
          <p>Ausgangspunkt bleibt immer das konkrete Objekt: seine Nutzung, die Flächen, die wiederkehrenden Aufgaben und die benötigten Zuständigkeiten. So entsteht ein Leistungsumfang, der verständlich bleibt und sich im Alltag steuern lässt.</p>
          <p>Technische Fachprüfungen und qualifikationsgebundene Arbeiten werden klar abgegrenzt und bei Bedarf mit geeigneten Fachbetrieben koordiniert.</p>
        </div>
      </section>

      <section className="about-team" id="team" aria-labelledby="about-team-heading">
        <div className="architecture-section-heading" data-reveal="up">
          <span className="eyebrow">Unser Team</span>
          <h2 id="about-team-heading">Menschen hinter Perla’s.</h2>
          <p>Persönliche Ansprechpartner sorgen dafür, dass Absprachen klar bleiben und Aufgaben am Objekt verlässlich zusammenlaufen.</p>
        </div>
        <div className="about-team-grid">
          {teamMembers.map((member, index) => (
            <figure
              className="about-team-card"
              data-reveal="up"
              style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}
              key={member.image}
            >
              <div className="about-team-image">
                <img src={`${A}${member.image}`} alt={member.alt} loading="lazy" decoding="async" />
                <span aria-hidden="true">0{index + 1}</span>
              </div>
              <figcaption>
                <strong>Name wird ergänzt</strong>
                <span>Position wird ergänzt</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="about-values" aria-labelledby="about-values-heading">
        <div className="architecture-section-heading" data-reveal="up">
          <span className="eyebrow">Wofür wir stehen</span>
          <h2 id="about-values-heading">So arbeiten wir zusammen.</h2>
        </div>
        <div className="about-values-grid">
          {values.map(([Icon, title, text], index) => (
            <article data-reveal="up" style={{ '--reveal-delay': `${index * 55}ms` } as CSSProperties} key={title}>
              <Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-method" aria-labelledby="about-method-heading">
        <div className="architecture-section-heading" data-reveal="left">
          <span className="eyebrow">So arbeiten wir</span>
          <h2 id="about-method-heading">Vom Bedarf zum klaren Ablauf.</h2>
        </div>
        <ol data-reveal="right">
          <li><span>01</span><div><strong>Objekt verstehen</strong><p>Flächen, Nutzung, Zugänge und laufende Aufgaben werden gemeinsam betrachtet.</p></div></li>
          <li><span>02</span><div><strong>Leistungen festlegen</strong><p>Aufgaben, Intervalle und Zuständigkeiten werden objektbezogen abgestimmt.</p></div></li>
          <li><span>03</span><div><strong>Betreuung koordinieren</strong><p>Einsätze, Rückmeldungen und offene Punkte laufen nachvollziehbar zusammen.</p></div></li>
        </ol>
      </section>

      <section className="architecture-cta" data-reveal="up">
        <div><span className="eyebrow">Direkter Austausch</span><h2>Sprechen wir über Ihr Objekt.</h2></div>
        <button className="button button--yellow" type="button" onClick={onQuoteOpen}><span>Angebot anfragen</span><img src={`${A}arrow-white.svg`} alt="" /></button>
      </section>
    </main>
  )
}

function FacilityOverview() {
  return (
    <section className="facility-overview" id="facility-services" aria-labelledby="facility-heading">
      <div className="facility-copy" data-reveal="left">
        <span className="eyebrow">Facility Management</span>
        <h2 id="facility-heading">Mehrere Leistungen. Ein klares Konzept.</h2>
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
      {partners.map((partner) => (
        <div
          className="partner-mark"
          role={duplicate ? undefined : 'listitem'}
          key={partner.name}
        >
          {partner.fallback ? (
            <picture>
              <source srcSet={`${A}${partner.logo}`} type="image/webp" />
              <img
                src={`${A}${partner.fallback}`}
                alt={duplicate ? '' : partner.name}
                decoding="async"
              />
            </picture>
          ) : (
            <img
              src={`${A}${partner.logo}`}
              alt={duplicate ? '' : partner.name}
              decoding="async"
            />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <section className="partner-strip" aria-labelledby="partner-strip-heading" data-reveal="fade">
      <p id="partner-strip-heading">Für diese Immobilien und Auftraggeber arbeiten wir</p>
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
        <h2 id="audience-heading">Betreuung, die zum Objekt passt.</h2>
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
              href={audienceHref(audience.id)}
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

function FacilityManagementPage() {
  return (
    <main className="facility-page">
      <section className="fm-hero">
        <div className="fm-hero-copy" data-reveal="left">
          <PageBreadcrumb current="Facility Management" />
          <span className="eyebrow">Facility Management im Rhein-Main-Gebiet</span>
          <h1>Gebäude ganzheitlich betreuen. Aufgaben klar koordinieren.</h1>
          <p>
            Perla’s bündelt die laufenden Aufgaben größerer und professionell verwalteter
            Immobilien in einem objektbezogenen Betreuungskonzept. Hausverwaltungen und
            gewerbliche Auftraggeber erhalten feste Zuständigkeiten, abgestimmte Intervalle und
            nachvollziehbare Rückmeldungen.
          </p>
          <div className="button-row">
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
          <h2 id="fm-principles-heading">Objekt verstehen. Leistungen verbinden.</h2>
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
          <h2 id="fm-targets-heading">Facility Management nach Nutzung.</h2>
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
            const image = audience.image

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
                  <a className="fm-target-detail-link" href={audienceHref(audience.id)}>
                    Bereich im Detail ansehen <ArrowUpRight aria-hidden="true" />
                  </a>
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
          <h2 id="fm-complex-heading">Komplexe Abläufe klar steuern.</h2>
          <p>
            Bei umfangreicheren Immobilienbeständen werden wiederkehrende Aufgaben nach Flächen,
            Nutzung und Zuständigkeit gegliedert. So bleibt erkennbar, was regelmäßig betreut,
            kontrolliert, gemeldet oder durch einen Fachbetrieb bearbeitet werden muss.
          </p>
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

    </main>
  )
}

function AudienceDetailPage({ audience, onQuoteOpen }: { audience: AudienceSolution; onQuoteOpen: () => void }) {
  const Icon = audience.icon
  const linkedServices = audience.services
    .map((slug) => features.find((service) => service.slug === slug))
    .filter((service): service is Feature => Boolean(service))

  return (
    <main className="audience-detail-page">
      <section className="audience-detail-hero">
        <div className="audience-detail-hero-copy" data-reveal="left">
          <PageBreadcrumb current={audience.navLabel} parent={{ label: 'Facility Management', href: FACILITY_PATH }} />
          <div className="audience-detail-icon"><Icon aria-hidden="true" /></div>
          <span className="eyebrow">Facility Management für</span>
          <h1>{audience.heroTitle}</h1>
          <p>{audience.heroText}</p>
          <div className="button-row">
            <button className="button button--yellow" type="button" onClick={onQuoteOpen}>
              <span>Betreuung anfragen</span><img src={`${A}arrow-white.svg`} alt="" />
            </button>
            <a className="button button--outline" href="tel:+491776867145">Direkt anrufen</a>
          </div>
        </div>
        <figure className="audience-detail-hero-image" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          <img src={`${A}${audience.image.src}`} alt={audience.image.alt} />
          <figcaption><Icon aria-hidden="true" /><span>{audience.navLabel}</span></figcaption>
        </figure>
      </section>

      <section className="audience-detail-scope" aria-labelledby="audience-scope-heading">
        <div className="architecture-section-heading" data-reveal="up">
          <span className="eyebrow">Passend zur Nutzung geplant</span>
          <h2 id="audience-scope-heading">{audience.introTitle}</h2>
          <p>{audience.introText}</p>
        </div>
        <div className="audience-detail-scope-grid">
          {audience.scopeCards.map((item, index) => (
            <article data-reveal="up" style={{ '--reveal-delay': `${index * 55}ms` } as CSSProperties} key={item.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="audience-detail-approach" aria-labelledby="audience-approach-heading">
        <div data-reveal="left">
          <span className="eyebrow">Typische Anforderungen</span>
          <h2 id="audience-approach-heading">Im Alltag zählen klare Zuständigkeiten.</h2>
          <ul>
            {audience.requirements.map((requirement) => (
              <li key={requirement}><CheckCircle2 aria-hidden="true" /><span>{requirement}</span></li>
            ))}
          </ul>
        </div>
        <article data-reveal="right" style={{ '--reveal-delay': '70ms' } as CSSProperties}>
          <Icon aria-hidden="true" />
          <span className="eyebrow">Unser Ansatz</span>
          <h3>Ein Betreuungskonzept, das zum Objekt passt.</h3>
          <p>{audience.approach}</p>
        </article>
      </section>

      <section className="audience-detail-services" aria-labelledby="audience-services-heading">
        <div className="architecture-section-heading" data-reveal="up">
          <span className="eyebrow">Direkt verknüpft</span>
          <h2 id="audience-services-heading">Passende Leistungen für {audience.navLabel}.</h2>
          <p>Jede Leistung führt zu einer eigenen Detailseite mit konkretem Umfang, Ablauf und Kontaktmöglichkeit.</p>
        </div>
        <div className="audience-detail-service-grid">
          {linkedServices.map((service, index) => {
            const ServiceIcon = service.icon
            return (
              <a href={`${SERVICES_PATH}${service.slug}/`} data-reveal="up" style={{ '--reveal-delay': `${(index % 3) * 45}ms` } as CSSProperties} key={service.slug}>
                <span><ServiceIcon aria-hidden="true" /></span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <strong>Leistung ansehen <ArrowUpRight aria-hidden="true" /></strong>
              </a>
            )
          })}
        </div>
      </section>

      <section className="audience-detail-process" aria-labelledby="audience-process-heading">
        <div className="architecture-section-heading" data-reveal="up">
          <span className="eyebrow">So starten wir</span>
          <h2 id="audience-process-heading">Vom Objekt zum klaren Ablauf.</h2>
        </div>
        <ol>
          {audience.process.map((step, index) => (
            <li data-reveal="up" style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties} key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{step.title}</h3><p>{step.text}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="audience-detail-faq" aria-labelledby="audience-faq-heading">
        <div className="architecture-section-heading" data-reveal="left">
          <span className="eyebrow">Häufige Fragen</span>
          <h2 id="audience-faq-heading">Fragen zu {audience.navLabel}.</h2>
        </div>
        <div data-reveal="right">
          {audience.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}<ChevronDown aria-hidden="true" /></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="service-contact audience-detail-contact" aria-labelledby="audience-contact-heading" data-reveal="up">
        <div className="service-contact-primary">
          <span className="eyebrow">Persönlich abstimmen</span>
          <h2 id="audience-contact-heading">Passt diese Betreuung zu Ihrem Objekt?</h2>
          <p>Beschreiben Sie kurz Ihre Immobilie, den Standort und die Aufgaben, die Sie abgeben möchten. Wir prüfen die Angaben und besprechen den passenden Leistungsumfang persönlich mit Ihnen.</p>
          <button className="button button--yellow" type="button" onClick={onQuoteOpen}>
            <span>Geführtes Angebotsformular öffnen</span><img src={`${A}arrow-white.svg`} alt="" />
          </button>
          <div className="service-contact-options" aria-label="Alternative Kontaktwege">
            <a href="tel:+491776867145">
              <Phone aria-hidden="true" />
              <span><strong>Direkt anrufen</strong><small>0177 68 67 145</small></span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href={`mailto:mail@perlas.de?subject=${encodeURIComponent(`Anfrage zu Facility Management für ${audience.navLabel}`)}`}>
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
        </div>
        <ServiceContactForm subject={`Facility Management für ${audience.navLabel}`} />
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
    <section className="reviews google-reviews" aria-labelledby="reviews-heading">
      <div className="google-reviews-heading" data-reveal="up">
        <div>
          <span className="eyebrow">Google-Bewertungen</span>
          <h2 id="reviews-heading">Was unsere Kunden sagen.</h2>
          <p>Kurze Auszüge aus öffentlich abgegebenen Rezensionen für Perla’s Objektbetreuung.</p>
        </div>
        <a
          className="google-review-summary"
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Alle Google-Rezensionen von Perla’s Objektbetreuung öffnen"
        >
          <span className="google-review-mark" aria-hidden="true">
            <img src={`${A}google-g.svg`} alt="" />
          </span>
          <span className="google-review-score">
            <strong>5,0</strong>
            <span className="stars" aria-label="5 von 5 Sternen">
              {Array.from({ length: 5 }, (_, index) => (
                <img src={`${A}star.svg`} alt="" key={index} />
              ))}
            </span>
            <small>32 Rezensionen auf Google</small>
          </span>
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div className="review-toolbar">
        <span>Auf Mobilgeräten seitlich wischen</span>
        <div className="review-controls" role="group" aria-label="Bewertungen durchblättern">
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
              <p>„{review.copy}“</p>
              <div className="review-author">
                <span aria-hidden="true">{review.author.slice(0, 1)}</span>
                <div>
                  <strong>{review.author}</strong>
                  <small><img src={`${A}google-g.svg`} alt="" /> Google · {review.age}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <a className="google-reviews-link" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noreferrer">
        Alle Rezensionen bei Google ansehen <ArrowUpRight aria-hidden="true" />
      </a>
    </section>
  )
}

function About() {
  return (
    <section className="about" id="ueber-uns">
      <div className="about-copy" data-reveal="left">
        <h2>Ein Ansprechpartner für Ihre Immobilie.</h2>
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
        <h2 id="features-heading">Leistungen für Ihre Immobilie.</h2>
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
            <img src={`${A}arrow-white.svg`} alt="" />
          </button>
          <ButtonLink href="#ablauf" kind="outline">So läuft die Betreuung</ButtonLink>
        </div>
      </div>
    </section>
  )
}

function ServiceContactForm({ subject }: { subject: string }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const company = String(formData.get('company') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()
    const body = [
      `Guten Tag, ich interessiere mich für ${subject}.`,
      '',
      `Name: ${name}`,
      `Unternehmen / Verwaltung: ${company || 'Nicht angegeben'}`,
      `E-Mail: ${email}`,
      `Telefon: ${phone || 'Nicht angegeben'}`,
      '',
      'Angaben zum Objekt:',
      message,
    ].join('\n')

    window.location.href = `mailto:mail@perlas.de?subject=${encodeURIComponent(`Anfrage zu ${subject}`)}&body=${encodeURIComponent(body)}`
  }

  return (
    <form className="service-contact-form" onSubmit={handleSubmit}>
      <div className="service-contact-form-heading">
        <span>Direktanfrage</span>
        <strong>{subject}</strong>
      </div>
      <div className="service-form-grid">
        <label>
          <span>Name *</span>
          <input type="text" name="name" autoComplete="name" required />
        </label>
        <label>
          <span>Unternehmen / Verwaltung</span>
          <input type="text" name="company" autoComplete="organization" />
        </label>
        <label>
          <span>E-Mail *</span>
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          <span>Telefon</span>
          <input type="tel" name="phone" autoComplete="tel" />
        </label>
        <label className="service-form-wide">
          <span>Was dürfen wir für Sie übernehmen? *</span>
          <textarea name="message" rows={4} placeholder="Objektart, Ort und gewünschter Leistungsumfang" required />
        </label>
      </div>
      <label className="service-form-consent">
        <input type="checkbox" name="privacy" required />
        <span>Ich habe die <a href={PRIVACY_PATH}>Datenschutzhinweise</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage zu.</span>
      </label>
      <button className="button button--purple" type="submit">
        <span>Anfrage per E-Mail vorbereiten</span>
        <img src={`${A}arrow-white.svg`} alt="" />
      </button>
      <small>Beim Absenden öffnet sich Ihr E-Mail-Programm mit den eingetragenen Angaben.</small>
    </form>
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
          <nav className="service-breadcrumb" aria-label="Brotkrümeln">
            <a href={homeHref()}>Startseite</a><span aria-hidden="true">/</span>
            <a href={SERVICES_PATH}>Leistungen</a><span aria-hidden="true">/</span>
            <span aria-current="page">{service.title}</span>
          </nav>
          <div className="service-detail-icon"><Icon aria-hidden="true" strokeWidth={1.8} /></div>
          <span className="eyebrow">Perla’s Objektbetreuung</span>
          <h1>{service.title}</h1>
          <p>{service.detail}</p>
          <div className="button-row">
            <button className="button button--yellow" type="button" onClick={() => onQuoteOpen(service.title)}>
              <span>Angebot für diese Leistung</span>
              <img src={`${A}arrow-white.svg`} alt="" />
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
          <span className="eyebrow">{service.title}</span>
          <h2 id="service-overview-heading">Leistung im Überblick.</h2>
          <p>{service.scopeIntro}</p>
          <div className="service-overview-meta" aria-label="Zusammenfassung des Leistungsumfangs">
            <span>{service.scopeCards.length} Leistungsbereiche</span>
            <span>Passend zum Objekt planbar</span>
          </div>
        </div>
        <div className="service-scope-grid" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          {service.scopeCards.map((item, index) => (
            <article className="service-scope-card" key={item.title}>
              <div className="service-scope-card-head">
                <span className="service-scope-number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
              <ul aria-label={`Enthaltene Aufgaben: ${item.title}`}>
                {item.items.map((detail) => (
                  <li key={detail}>
                    <CheckCircle2 aria-hidden="true" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="service-fit" aria-labelledby="service-fit-heading">
        <div className="service-fit-copy" data-reveal="left">
          <span className="eyebrow">Geeignete Objekte</span>
          <h2 id="service-fit-heading">Passend für diese Objekte.</h2>
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

      <section
        className="service-image-story"
        style={{ '--service-story-image': `url("${A}${service.image}")` } as CSSProperties}
        aria-labelledby="service-image-story-heading"
        data-reveal="up"
      >
        <div>
          <span className="eyebrow">Vor Ort gut organisiert</span>
          <h2 id="service-image-story-heading">Damit die Leistung im Alltag zuverlässig funktioniert.</h2>
          <p>{service.processSteps[0]?.text} {service.processSteps[1]?.text}</p>
          <a href="#service-contact-heading">Anfrage stellen <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </section>

      <section className="service-boundary" data-reveal="up">
        <div>
          <span className="eyebrow">Leistungsgrenzen</span>
          <h2>{service.boundaryTitle}</h2>
          <p>{service.boundaryText}</p>
        </div>
        <button className="button button--yellow" type="button" onClick={() => onQuoteOpen(service.title)}>
          <span>Leistungsumfang besprechen</span>
          <img src={`${A}arrow-white.svg`} alt="" />
        </button>
      </section>

      <section className="service-faq" aria-labelledby="service-faq-heading">
        <div className="service-section-heading" data-reveal="left">
          <span className="eyebrow">Gut zu wissen</span>
          <h2 id="service-faq-heading">Häufige Fragen.</h2>
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
          <h2 id="service-contact-heading">Sprechen wir über Ihr Objekt.</h2>
          <p>Schildern Sie uns kurz das Objekt und den gewünschten Umfang. Wir melden uns persönlich und klären gemeinsam, welche Ausführung und welche Intervalle sinnvoll sind.</p>
          <button className="button button--yellow" type="button" onClick={() => onQuoteOpen(service.title)}>
            <span>Geführtes Angebotsformular öffnen</span>
            <img src={`${A}arrow-white.svg`} alt="" />
          </button>
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
        </div>
        <ServiceContactForm subject={service.title} />
      </section>

      <section className="service-more" data-reveal="up">
        <span className="eyebrow">Passende Leistungen</span>
        <h2>Passende Leistungen für Ihr Objekt.</h2>
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
        <h2>Leistungen passend zu Ihrem Bestand.</h2>
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
          <img src={`${A}arrow-white.svg`} alt="" />
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

type LegalPageType = 'imprint' | 'privacy'

function LegalPage({ type }: { type: LegalPageType }) {
  const isImprint = type === 'imprint'

  return (
    <main className="legal-page">
      <section className="legal-hero">
        <PageBreadcrumb current={isImprint ? 'Impressum' : 'Datenschutz'} />
        <span className="eyebrow">Rechtliche Informationen</span>
        <h1>{isImprint ? 'Impressum' : <>Datenschutz<wbr />erklärung</>}</h1>
        <p>{isImprint ? 'Angaben zum Anbieter dieser Website.' : 'Informationen zum Umgang mit personenbezogenen Daten auf dieser Website.'}</p>
      </section>

      <section className="legal-content">
        <aside>
          <strong>Vorläufiger Platzhalter</strong>
          <p>Diese Seite ist strukturell vorbereitet, aber noch nicht abschließend rechtlich geprüft. Fehlende Pflichtangaben müssen vor dem finalen Livegang ergänzt werden.</p>
        </aside>
        {isImprint ? (
          <div className="legal-copy">
            <section>
              <h2>Angaben gemäß § 5 DDG</h2>
              <p>Perla’s Objektbetreuung GmbH &amp; Co. KG<br />Hauptstraße 1<br />65843 Sulzbach (Taunus)<br />Deutschland</p>
            </section>
            <section>
              <h2>Vertretung und Register</h2>
              <p>Vertretungsberechtigte Person: <strong>[wird ergänzt]</strong><br />Registergericht: <strong>[wird ergänzt]</strong><br />Registernummer: <strong>[wird ergänzt]</strong><br />Umsatzsteuer-ID: <strong>[wird ergänzt]</strong></p>
            </section>
            <section>
              <h2>Kontakt</h2>
              <p>Telefon: <a href="tel:+491776867145">0177 68 67 145</a><br />E-Mail: <a href="mailto:mail@perlas.de">mail@perlas.de</a></p>
            </section>
            <section>
              <h2>Verantwortlich für Inhalte</h2>
              <p>Verantwortliche Person nach § 18 Abs. 2 MStV: <strong>[wird ergänzt]</strong></p>
            </section>
          </div>
        ) : (
          <div className="legal-copy">
            <section>
              <h2>1. Verantwortliche Stelle</h2>
              <p>Perla’s Objektbetreuung GmbH &amp; Co. KG<br />Hauptstraße 1, 65843 Sulzbach (Taunus)<br />E-Mail: <a href="mailto:mail@perlas.de">mail@perlas.de</a></p>
            </section>
            <section>
              <h2>2. Daten beim Besuch der Website</h2>
              <p>Beim Aufruf der Website können technisch notwendige Verbindungsdaten in Server-Protokollen verarbeitet werden. Welche Daten der künftige Hostinganbieter konkret speichert und wie lange sie aufbewahrt werden, wird nach der finalen Hostingentscheidung ergänzt.</p>
            </section>
            <section>
              <h2>3. Kontaktaufnahme und Formulare</h2>
              <p>Angaben aus Kontakt-, Angebots- und Bewerbungsanfragen werden ausschließlich verwendet, um die jeweilige Anfrage zu bearbeiten. Direktanfragen auf Leistungsseiten öffnen mit den eingegebenen Angaben das E-Mail-Programm des Nutzers. Das Angebotsformular übermittelt Angaben derzeit noch nicht technisch; vor einer späteren API-Anbindung werden Empfänger, Speicherdauer und Verarbeitung abschließend ergänzt.</p>
            </section>
            <section>
              <h2>4. Cookies und Einwilligungen</h2>
              <p>Das Cookie-Banner ermöglicht die Auswahl technisch erforderlicher und optionaler Funktionen. Eine abschließende Auflistung aller eingesetzten Dienste, Speicherdauern und Rechtsgrundlagen wird vor dem Produktivbetrieb ergänzt.</p>
            </section>
            <section>
              <h2>5. Ihre Rechte</h2>
              <p>Betroffene Personen können im Rahmen der gesetzlichen Voraussetzungen Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit verlangen sowie erteilte Einwilligungen widerrufen. Die zuständige Aufsichtsbehörde wird in der finalen Fassung benannt.</p>
            </section>
          </div>
        )}
      </section>
    </main>
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
            <a href={IMPRINT_PATH}>Impressum</a>
            <a href={PRIVACY_PATH}>Datenschutz</a>
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
            ['Leistungen', 'leistungen/'],
            ['Über uns', 'ueber-uns/'],
            ['Blog', 'blog/'],
            ['Karriere', 'karriere/'],
            ['Kontakt', 'kontakt/'],
          ].map(([item, href]) => (
            <a href={homeHref(href)} key={item}>
              <span aria-hidden="true" /> {item}
            </a>
          ))}
        </nav>

        <div className="footer-side">
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
  const isServicesPage = /^\/leistungen\/?$/.test(pagePath)
  const isAboutPage = /^\/ueber-uns\/?$/.test(pagePath)
  const isBlogPage = /^\/blog\/?$/.test(pagePath)
  const isCareerPage = /^\/karriere\/?$/.test(pagePath)
  const isImprintPage = /^\/impressum\/?$/.test(pagePath)
  const isPrivacyPage = /^\/datenschutz\/?$/.test(pagePath)
  const serviceSlug = pagePath.match(/^\/leistungen\/([^/]+)\/?$/)?.[1]
  const activeService = features.find((service) => service.slug === serviceSlug)
  const audienceSlug = pagePath.match(/^\/facility-management\/([^/]+)\/?$/)?.[1]
  const activeAudience = audienceSolutions.find((audience) => audience.id === audienceSlug)
  const blogSlug = pagePath.match(/^\/blog\/([^/]+)\/?$/)?.[1]
  const activeBlogPost = blogPosts.find((post) => post.slug === blogSlug)
  const pageKind: PageKind = isContactPage
    ? 'contact'
    : isFacilityPage || activeAudience
      ? 'facility'
      : isServicesPage
        ? 'services'
        : isAboutPage
          ? 'about'
          : isBlogPage || activeBlogPost
            ? 'blog'
            : isCareerPage
              ? 'career'
          : isImprintPage
            ? 'imprint'
            : isPrivacyPage
              ? 'privacy'
          : 'home'

  usePageSeo(activeService, pageKind, activeAudience, activeBlogPost)
  useRevealAnimations(activeService?.slug ?? activeAudience?.id ?? activeBlogPost?.slug ?? pageKind)

  useEffect(() => {
    const scrollToCurrentSection = () => {
      const sectionId = decodeURIComponent(window.location.hash.slice(1))
      if (!sectionId) return

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          document.getElementById(sectionId)?.scrollIntoView({ block: 'start' })
        })
      })
    }

    scrollToCurrentSection()
    window.addEventListener('hashchange', scrollToCurrentSection)
    return () => window.removeEventListener('hashchange', scrollToCurrentSection)
  }, [pageKind])

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
      ) : activeAudience ? (
        <AudienceDetailPage audience={activeAudience} onQuoteOpen={() => openQuote(activeAudience.navLabel)} />
      ) : activeBlogPost ? (
        <BlogArticlePage post={activeBlogPost} relatedPosts={blogPosts.filter((post) => post.slug !== activeBlogPost.slug)} />
      ) : isContactPage ? (
        <ContactPage onQuoteOpen={() => openQuote()} />
      ) : isFacilityPage ? (
        <FacilityManagementPage />
      ) : isServicesPage ? (
        <ServicesOverviewPage />
      ) : isAboutPage ? (
        <AboutPage onQuoteOpen={() => openQuote()} />
      ) : isBlogPage ? (
        <BlogPage posts={blogPosts} />
      ) : isCareerPage ? (
        <CareerPage jobs={jobOpenings} />
      ) : isImprintPage ? (
        <LegalPage type="imprint" />
      ) : isPrivacyPage ? (
        <LegalPage type="privacy" />
      ) : (
        <main>
          <Hero />
          <HomeOverview />
          <HomeCoreServices />
          <HomeTrust />
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
