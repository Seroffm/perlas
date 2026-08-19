import { useEffect, useRef, useState } from 'react'
import { Check, ShieldCheck, SlidersHorizontal, X } from 'lucide-react'

type ConsentPreferences = {
  necessary: true
  analytics: boolean
  marketing: boolean
  savedAt: string
  version: 1
}

const STORAGE_KEY = 'perlas-cookie-consent-v1'

function readPreferences(): ConsentPreferences | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) as ConsentPreferences : null
  } catch {
    return null
  }
}

export default function CookieConsent() {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(readPreferences)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const openSettings = () => {
      setAnalytics(preferences?.analytics ?? false)
      setMarketing(preferences?.marketing ?? false)
      setSettingsOpen(true)
    }

    window.addEventListener('perlas:open-cookie-settings', openSettings)
    return () => window.removeEventListener('perlas:open-cookie-settings', openSettings)
  }, [preferences])

  useEffect(() => {
    if (!settingsOpen) return

    const scrollPosition = window.scrollY
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    }
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollPosition}px`
    document.body.style.width = '100%'
    document.documentElement.style.overflow = 'hidden'

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href]',
    )
    focusable?.[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSettingsOpen(false)
        return
      }

      if (event.key !== 'Tab' || !focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyStyles.overflow
      document.body.style.position = previousBodyStyles.position
      document.body.style.top = previousBodyStyles.top
      document.body.style.width = previousBodyStyles.width
      document.documentElement.style.overflow = previousHtmlOverflow
      window.scrollTo(0, scrollPosition)
      settingsButtonRef.current?.focus()
    }
  }, [settingsOpen])

  const savePreferences = (nextAnalytics: boolean, nextMarketing: boolean) => {
    const next: ConsentPreferences = {
      necessary: true,
      analytics: nextAnalytics,
      marketing: nextMarketing,
      savedAt: new Date().toISOString(),
      version: 1,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('perlas:consent-change', { detail: next }))
    setPreferences(next)
    setSettingsOpen(false)
  }

  const openSettings = () => {
    setAnalytics(preferences?.analytics ?? false)
    setMarketing(preferences?.marketing ?? false)
    setSettingsOpen(true)
  }

  return (
    <div className="cookie-consent-root">
      {!preferences && !settingsOpen && (
        <section className="cookie-banner" role="region" aria-labelledby="cookie-banner-title">
          <div className="cookie-banner-icon" aria-hidden="true"><ShieldCheck /></div>
          <div className="cookie-banner-copy">
            <span>Ihre Entscheidung</span>
            <h2 id="cookie-banner-title">Cookies nach Ihrer Wahl.</h2>
            <p>
              Notwendige Speicherungen sorgen dafür, dass die Website funktioniert. Google Maps
              und andere optionale externe Dienste werden nur mit Ihrer Zustimmung aktiviert.
            </p>
            <a href="https://perlas.de/datenschutz/">Mehr zum Datenschutz</a>
          </div>
          <div className="cookie-banner-actions">
            <button className="cookie-primary" type="button" onClick={() => savePreferences(true, true)}>
              Alle akzeptieren
            </button>
            <button type="button" onClick={() => savePreferences(false, false)}>Nur notwendige</button>
            <button ref={settingsButtonRef} type="button" onClick={openSettings}>
              <SlidersHorizontal aria-hidden="true" /> Einstellungen
            </button>
          </div>
        </section>
      )}

      {settingsOpen && (
        <div className="cookie-settings-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSettingsOpen(false)
        }}>
          <div
            className="cookie-settings"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
          >
            <div className="cookie-settings-head">
              <div>
                <span className="eyebrow">Datenschutz</span>
                <h2 id="cookie-settings-title">Cookie-Einstellungen</h2>
              </div>
              <button type="button" aria-label="Einstellungen schließen" onClick={() => setSettingsOpen(false)}>
                <X aria-hidden="true" />
              </button>
            </div>
            <p className="cookie-settings-intro">
              Sie bestimmen, welche optionalen Dienste verwendet werden dürfen. Ihre Auswahl
              können Sie jederzeit im Footer ändern.
            </p>
            <div className="cookie-options">
              <label className="cookie-option is-required">
                <span className="cookie-check"><Check aria-hidden="true" /></span>
                <span><strong>Technisch notwendig</strong><small>Speichert Ihre Auswahl und ermöglicht grundlegende Funktionen.</small></span>
                <input type="checkbox" checked disabled aria-label="Technisch notwendige Cookies sind immer aktiv" />
              </label>
              <label className="cookie-option">
                <span><strong>Analyse</strong><small>Hilft dabei zu verstehen, wie die Website genutzt wird. Aktuell nicht eingebunden.</small></span>
                <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
              </label>
              <label className="cookie-option">
                <span><strong>Externe Medien</strong><small>Erlaubt das Laden der Google-Maps-Karte auf der Kontaktseite.</small></span>
                <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />
              </label>
            </div>
            <div className="cookie-settings-actions">
              <button type="button" onClick={() => savePreferences(false, false)}>Nur notwendige</button>
              <button className="cookie-primary" type="button" onClick={() => savePreferences(analytics, marketing)}>
                Auswahl speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
