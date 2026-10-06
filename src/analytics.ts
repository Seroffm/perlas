import audiences from './audience-data.json'
import posts from './blog-data.json'
import services from './service-data.json'

const CONSENT_STORAGE_KEY = 'perlas-cookie-consent-v3'
const DATA_LAYER_NAME = 'perlasAnalyticsDataLayer'
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{10}$/
const PRODUCTION_ORIGINS = new Set(['https://perlas.de', 'https://www.perlas.de'])
const searchReferrers: Record<string, { origin: string; source: string }> = {
  'https://google.com': { origin: 'https://www.google.com', source: 'google' },
  'https://www.google.com': { origin: 'https://www.google.com', source: 'google' },
  'https://google.de': { origin: 'https://www.google.de', source: 'google' },
  'https://www.google.de': { origin: 'https://www.google.de', source: 'google' },
  'https://bing.com': { origin: 'https://www.bing.com', source: 'bing' },
  'https://www.bing.com': { origin: 'https://www.bing.com', source: 'bing' },
  'https://duckduckgo.com': { origin: 'https://duckduckgo.com', source: 'duckduckgo' },
  'https://www.duckduckgo.com': { origin: 'https://duckduckgo.com', source: 'duckduckgo' },
}
const publicRoutes = new Set([
  '', 'facility-management/', 'leistungen/', 'ueber-uns/', 'blog/',
  'karriere/', 'kontakt/', 'impressum/', 'datenschutz/',
  ...audiences.map(({ id }) => `facility-management/${id}/`),
  ...posts.map(({ slug }) => `blog/${slug}/`),
  ...services.map(({ slug }) => `leistungen/${slug}/`),
])

type AnalyticsWindow = Window & {
  perlasAnalyticsDataLayer?: IArguments[]
  [key: `ga-disable-${string}`]: boolean | undefined
}

type ConsentPreferences = {
  necessary: true
  analytics: boolean
  marketing: boolean
  savedAt: string
  version: 3
}

let activeCleanup: (() => void) | undefined

export function isValidMeasurementId(value: unknown): value is string {
  return typeof value === 'string' && MEASUREMENT_ID_PATTERN.test(value)
}

function isValidConsent(value: unknown): value is ConsentPreferences {
  if (!value || typeof value !== 'object') return false
  const consent = value as Record<string, unknown>
  return consent.version === 3 && consent.necessary === true
    && typeof consent.analytics === 'boolean' && typeof consent.marketing === 'boolean'
    && typeof consent.savedAt === 'string' && Number.isFinite(Date.parse(consent.savedAt))
}

function readConsent(): ConsentPreferences | null {
  try {
    const preferences: unknown = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? 'null')
    return isValidConsent(preferences) ? preferences : null
  } catch {
    // Unreadable, absent or malformed storage must never imply consent.
    return null
  }
}

function safeAttribution() {
  try {
    const referrer = new URL(document.referrer)
    const known = referrer.origin !== window.location.origin ? searchReferrers[referrer.origin] : undefined
    if (known) {
      return { page_referrer: known.origin, campaign_source: known.source, campaign_medium: 'organic' }
    }
  } catch { /* Missing or invalid referrers are intentionally treated as direct. */ }
  return { page_referrer: '', campaign_source: '(direct)', campaign_medium: '(none)' }
}

function safePageValues(basePath: string) {
  const base = new URL(basePath, window.location.origin).pathname.replace(/\/?$/, '/')
  const pathname = window.location.pathname
  const relativePath = pathname === base.slice(0, -1) ? ''
    : pathname.startsWith(base) ? pathname.slice(base.length).replace(/\/?$/, '/') : null
  const route = relativePath === '/' ? '' : relativePath
  // Unknown paths may contain personal data; send only a fixed 404 bucket instead.
  const page = route !== null && publicRoutes.has(route) ? route : '404/'
  return {
    page_location: `${window.location.origin}${base}${page}`,
    ...safeAttribution(),
    page_title: 'Perla’s Objektbetreuung',
  }
}

function clearOwnCookies(measurementId: string) {
  const names = ['_ga', `_ga_${measurementId.slice(2)}`]
  const existingNames = new Set(document.cookie.split(';').map(cookie => cookie.split('=', 1)[0].trim()))
  const domains = ['']
  const labels = window.location.hostname.split('.')
  // Include possible legacy domain-scoped copies, never unrelated cookie names.
  if (labels.length > 1 && !/^\d+(?:\.\d+){3}$/.test(window.location.hostname)) {
    for (let index = 0; index < labels.length - 1; index++) {
      domains.push(labels.slice(index).join('.'))
    }
  }
  for (const name of names) {
    if (!existingNames.has(name)) continue
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`
    }
  }
}

/**
 * Basic consent mode: no Google script, request or ping before analytics consent.
 * Only a manual page_view is added; never expose a general-purpose event/form API.
 * Before activation, disable Enhanced Measurement (including history tracking),
 * user-provided data, Google Signals and advertising destinations in the GA4 UI.
 * https://developers.google.com/tag-platform/security/guides/consent
 * https://developers.google.com/tag-platform/security/guides/privacy
 * https://support.google.com/analytics/answer/9216061
 */
export function initializeAnalytics(measurementId?: string, basePath = '/') {
  if (typeof window === 'undefined' || !PRODUCTION_ORIGINS.has(window.location.origin)
    || !isValidMeasurementId(measurementId) || activeCleanup) {
    return () => {}
  }

  const analyticsWindow = window as unknown as AnalyticsWindow
  const disableKey = `ga-disable-${measurementId}` as const
  const denied = {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
  }
  let consentGranted = false
  let explicitDenial = false
  let disposed = false
  let script: HTMLScriptElement | undefined
  let scriptLoaded = false
  let queueInitialized = false
  let configured = false
  let pageViewSent = false

  analyticsWindow[disableKey] = true

  function gtag(..._commands: unknown[]) {
    // A private, documented data-layer name prevents reusing unrelated GTM/form data.
    analyticsWindow.perlasAnalyticsDataLayer ??= []
    analyticsWindow.perlasAnalyticsDataLayer.push(arguments)
  }

  function privacyConfiguration() {
    return {
      ...safePageValues(basePath),
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ads_data_redaction: true,
      url_passthrough: false,
      // Keep only fixed search origins above; never read user-controlled UTM values.
      campaign_id: '(not set)',
      campaign_name: '(not set)', campaign_term: '(not set)', campaign_content: '(not set)',
      cookie_domain: 'none',
      cookie_path: '/',
      cookie_flags: window.location.protocol === 'https:' ? 'SameSite=Lax;Secure' : 'SameSite=Lax',
      cookie_expires: 90 * 24 * 60 * 60,
      cookie_update: false,
    }
  }

  function startMeasurement() {
    if (disposed || explicitDenial || !consentGranted || !scriptLoaded || !readConsent()?.analytics) return
    analyticsWindow[disableKey] = false
    gtag('consent', 'update', { ...denied, analytics_storage: 'granted' })
    if (!configured) {
      gtag('config', measurementId, privacyConfiguration())
      configured = true
    }
    if (!pageViewSent) {
      gtag('event', 'page_view', { ...safePageValues(basePath), send_to: measurementId })
      pageViewSent = true
    }
  }

  function stopMeasurement() {
    // The documented property-specific kill switch blocks cookie writes and hits.
    analyticsWindow[disableKey] = true
    consentGranted = false
    pageViewSent = false
    if (queueInitialized) gtag('consent', 'update', denied)
    if (script && !scriptLoaded) {
      script.onload = null
      script.onerror = null
      script.remove()
      script = undefined
      // Remove commands queued for a loader that is no longer authorised.
      analyticsWindow.perlasAnalyticsDataLayer!.length = 0
      queueInitialized = false
    }
    clearOwnCookies(measurementId!)
  }

  function reconcileConsent() {
    if (disposed) return
    if (explicitDenial || !readConsent()?.analytics) {
      stopMeasurement()
      return
    }
    if (consentGranted) return
    consentGranted = true
    if (scriptLoaded) {
      startMeasurement()
      return
    }
    if (!queueInitialized) {
      gtag('consent', 'default', denied)
      gtag('set', privacyConfiguration())
      gtag('js', new Date())
      queueInitialized = true
    }
    const pendingScript = document.createElement('script')
    pendingScript.id = 'perlas-ga4-script'
    pendingScript.async = true
    pendingScript.referrerPolicy = 'no-referrer'
    pendingScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}&l=${DATA_LAYER_NAME}`
    pendingScript.onload = () => {
      if (disposed || script !== pendingScript) return
      scriptLoaded = true
      // Consent may have changed while the external script was downloading.
      if (explicitDenial || !readConsent()?.analytics) stopMeasurement()
      else startMeasurement()
    }
    pendingScript.onerror = () => {
      if (disposed || scriptLoaded || script !== pendingScript) return
      analyticsWindow[disableKey] = true
      pendingScript.remove()
      script = undefined
      consentGranted = false
      queueInitialized = false
      analyticsWindow.perlasAnalyticsDataLayer!.length = 0
    }
    script = pendingScript
    document.head.appendChild(pendingScript)
  }

  const onConsentChange = (event: Event) => {
    const next: unknown = (event as CustomEvent<unknown>).detail
    if (next && typeof next === 'object' && (next as Record<string, unknown>).analytics === false) {
      // A storage write can fail during revocation: an explicit denial always wins.
      explicitDenial = true
    } else if (isValidConsent(next) && next.analytics && readConsent()?.savedAt === next.savedAt) {
      // Re-enable only after a new, explicitly granted choice was also persisted.
      explicitDenial = false
    }
    reconcileConsent()
  }
  const onStorage = (event: StorageEvent) => {
    if (event.storageArea && event.storageArea !== window.localStorage) return
    if (event.key === CONSENT_STORAGE_KEY || event.key === null) {
      if (event.key === null || event.newValue === null) explicitDenial = true
      else if (event.newValue) {
        try {
          const next: unknown = JSON.parse(event.newValue)
          if (isValidConsent(next) && next.savedAt === readConsent()?.savedAt) explicitDenial = !next.analytics
          else explicitDenial = true
        } catch {
          explicitDenial = true
        }
      }
      reconcileConsent()
    }
  }
  window.addEventListener('perlas:consent-change', onConsentChange)
  window.addEventListener('storage', onStorage)
  window.addEventListener('focus', reconcileConsent)
  reconcileConsent()

  const cleanup = () => {
    if (disposed) return
    stopMeasurement()
    disposed = true
    window.removeEventListener('perlas:consent-change', onConsentChange)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('focus', reconcileConsent)
    activeCleanup = undefined
  }
  activeCleanup = cleanup
  return cleanup
}
