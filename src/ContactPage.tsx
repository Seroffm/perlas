import { useEffect, useState, type CSSProperties } from 'react'
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Mail,
  MapPin,
  MapPinned,
  MessageCircle,
  Phone,
  PlayCircle,
  Route,
  SlidersHorizontal,
} from 'lucide-react'

type ContactPageProps = {
  onQuoteOpen: () => void
}

type ConsentSnapshot = {
  marketing?: boolean
}

const BASE_PATH = import.meta.env.BASE_URL
const ASSETS_PATH = `${BASE_PATH}assets/`
const CONSENT_STORAGE_KEY = 'perlas-cookie-consent-v1'
const WHATSAPP_URL = 'https://wa.me/491776867145?text=Hallo%20Perla%E2%80%99s%20Team%2C%20ich%20interessiere%20mich%20f%C3%BCr%20Ihre%20Objektbetreuung.'
const MAP_EMBED_URL = 'https://www.google.com/maps?q=Hauptstra%C3%9Fe%201%2C%2065843%20Sulzbach%20(Taunus)%2C%20Deutschland&output=embed'
const ROUTE_URL = 'https://www.google.com/maps/dir/?api=1&destination=Hauptstra%C3%9Fe%201%2C%2065843%20Sulzbach%20(Taunus)%2C%20Deutschland'

const requestSteps = [
  {
    icon: MessageCircle,
    title: 'Anfrage senden',
    text: 'Sie melden sich über Formular, Telefon, E-Mail oder WhatsApp bei uns.',
  },
  {
    icon: MapPinned,
    title: 'Objekt vor Ort besprechen',
    text: 'Bei Bedarf sehen wir uns Flächen, Anforderungen und Besonderheiten gemeinsam an.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Leistungen und Intervalle festlegen',
    text: 'Wir stimmen Aufgaben sowie Reinigungs-, Kontroll-, Wartungs- und Pflegeintervalle ab.',
  },
  {
    icon: FileCheck2,
    title: 'Individuelles Angebot',
    text: 'Auf Grundlage der Abstimmung erhalten Sie ein Angebot für den vereinbarten Leistungsumfang.',
  },
  {
    icon: PlayCircle,
    title: 'Betreuung starten',
    text: 'Nach Freigabe klären wir Ansprechpartner, Termine und die organisatorischen Abläufe.',
  },
]

function readMapConsent() {
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    return stored ? Boolean((JSON.parse(stored) as ConsentSnapshot).marketing) : false
  } catch {
    return false
  }
}

function LocationMap() {
  const [mapAllowed, setMapAllowed] = useState(readMapConsent)

  useEffect(() => {
    const updateConsent = (event: Event) => {
      setMapAllowed(Boolean((event as CustomEvent<ConsentSnapshot>).detail?.marketing))
    }

    window.addEventListener('perlas:consent-change', updateConsent)
    return () => window.removeEventListener('perlas:consent-change', updateConsent)
  }, [])

  const openConsentSettings = () => {
    window.dispatchEvent(new Event('perlas:open-cookie-settings'))
  }

  return (
    <div className="contact-map-frame">
      {mapAllowed ? (
        <iframe
          src={MAP_EMBED_URL}
          title="Google Maps: Perla’s in der Hauptstraße 1 in Sulzbach"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="contact-map-consent">
          <div className="contact-map-grid" aria-hidden="true" />
          <div className="contact-map-pin" aria-hidden="true"><MapPin /></div>
          <div className="contact-map-consent-copy">
            <span>Externe Karte deaktiviert</span>
            <strong>Hauptstraße 1, 65843 Sulzbach</strong>
            <p>Google Maps wird erst geladen, wenn Sie externe Medien in den Cookie-Einstellungen erlauben.</p>
            <button type="button" onClick={openConsentSettings}>Karte aktivieren</button>
          </div>
        </div>
      )}
      <a className="contact-route-link" href={ROUTE_URL} target="_blank" rel="noreferrer">
        <Route aria-hidden="true" /> Route in Google Maps öffnen <ArrowUpRight aria-hidden="true" />
      </a>
    </div>
  )
}

export default function ContactPage({ onQuoteOpen }: ContactPageProps) {
  return (
    <main className="contact-page">
      <section className="contact-page-hero" aria-labelledby="contact-page-heading">
        <div className="contact-page-hero-copy" data-reveal="left">
          <a className="contact-breadcrumb" href={BASE_PATH}>Startseite / Kontakt</a>
          <span className="eyebrow">Persönlich erreichbar</span>
          <h1 id="contact-page-heading">Lassen Sie uns über Ihr Objekt sprechen.</h1>
          <p>
            Ob einzelne Leistung oder abgestimmte Facility Services: Beschreiben Sie uns kurz Ihre
            Immobilie und die laufenden Aufgaben. Wir klären persönlich, welcher nächste Schritt sinnvoll ist.
          </p>
          <div className="button-row">
            <button className="button button--yellow" type="button" onClick={onQuoteOpen}>
              Anfrageformular öffnen <ArrowUpRight aria-hidden="true" />
            </button>
            <a className="button button--outline" href="tel:+491776867145">Direkt anrufen</a>
          </div>
          <div className="contact-page-assurance">
            <span><CheckCircle2 aria-hidden="true" /> Fester Ansprechpartner</span>
            <span><CheckCircle2 aria-hidden="true" /> Objektbezogener Leistungsplan</span>
          </div>
        </div>
        <figure className="contact-page-hero-visual" data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          <img src={`${ASSETS_PATH}perlas-office.png`} alt="Mitarbeiter von Perla’s bei der Planung einer Objektbetreuung" />
          <figcaption>
            <ClipboardCheck aria-hidden="true" />
            <span><strong>Strukturiert anfragen</strong><small>Objekt, Leistungen und Intervalle gemeinsam klären</small></span>
          </figcaption>
        </figure>
      </section>

      <section className="contact-channels" aria-labelledby="contact-channels-heading">
        <div className="contact-section-heading" data-reveal="up">
          <span className="eyebrow">Ihr direkter Weg zu Perla’s</span>
          <h2 id="contact-channels-heading">So erreichen Sie uns.</h2>
          <p>Für eine erste Abstimmung benötigen wir nur wenige Angaben zu Objekt, Standort und gewünschter Betreuung.</p>
        </div>
        <div className="contact-channel-grid" data-reveal="up" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          <a className="contact-channel" href="tel:+491776867145">
            <span className="contact-channel-icon"><Phone aria-hidden="true" /></span>
            <span><small>Telefon</small><strong>0177 68 67 145</strong><em>Direkt anrufen</em></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a className="contact-channel" href="mailto:mail@perlas.de?subject=Anfrage%20zur%20Objektbetreuung">
            <span className="contact-channel-icon"><Mail aria-hidden="true" /></span>
            <span><small>E-Mail</small><strong>mail@perlas.de</strong><em>E-Mail schreiben</em></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a className="contact-channel" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            <span className="contact-channel-icon"><MessageCircle aria-hidden="true" /></span>
            <span><small>WhatsApp</small><strong>Kurze Nachricht senden</strong><em>Chat öffnen</em></span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <button className="contact-channel contact-channel--inquiry" type="button" onClick={onQuoteOpen}>
            <span className="contact-channel-icon"><ClipboardCheck aria-hidden="true" /></span>
            <span><small>Anfrageformular</small><strong>Objekt strukturiert beschreiben</strong><em>Anfrage stellen</em></span>
            <ArrowUpRight aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="contact-location" aria-labelledby="contact-location-heading">
        <div className="contact-location-copy" data-reveal="left">
          <span className="eyebrow">Standort &amp; Einsatzgebiet</span>
          <h2 id="contact-location-heading">Im Rhein-Main-Gebiet für Sie da.</h2>
          <p>
            Perla’s sitzt in Sulzbach (Taunus). Von hier koordinieren wir die laufende Betreuung
            von Wohnanlagen, Gewerbeimmobilien und institutionellen Gebäuden im Rhein-Main-Gebiet.
          </p>
          <address>
            <MapPin aria-hidden="true" />
            <span><strong>Perla’s Objektbetreuung</strong>Hauptstraße 1<br />65843 Sulzbach (Taunus)</span>
          </address>
          <a className="contact-location-link" href={ROUTE_URL} target="_blank" rel="noreferrer">
            Route öffnen <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <div data-reveal="right" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
          <LocationMap />
        </div>
      </section>

      <section className="contact-process" aria-labelledby="contact-process-heading">
        <div className="contact-section-heading" data-reveal="up">
          <span className="eyebrow">Von der Anfrage zur Betreuung</span>
          <h2 id="contact-process-heading">So läuft Ihre Anfrage ab.</h2>
          <p>Fünf klare Schritte schaffen eine verlässliche Grundlage für Leistungsumfang, Intervalle und Zusammenarbeit.</p>
        </div>
        <ol className="contact-process-grid">
          {requestSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <li data-reveal="up" style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties} key={step.title}>
                <span className="contact-process-number">0{index + 1}</span>
                <Icon aria-hidden="true" />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            )
          })}
        </ol>
        <div className="contact-process-cta" data-reveal="up">
          <Building2 aria-hidden="true" />
          <div><strong>Bereit für den ersten Schritt?</strong><span>Starten Sie mit den wichtigsten Angaben zu Ihrer Immobilie.</span></div>
          <button className="button button--yellow" type="button" onClick={onQuoteOpen}>Anfrage stellen</button>
        </div>
      </section>
    </main>
  )
}
