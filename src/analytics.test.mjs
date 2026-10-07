// Offline tests: no browser, injected Google script execution or outbound requests.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import vm from 'node:vm'
import { webcrypto } from 'node:crypto'
import ts from 'typescript'

const directory = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(directory, 'analytics.ts'), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText
const measurementId = 'G-1234567890'
const consentKey = 'perlas-cookie-consent-v3'
const validConsent = (analytics = true) => ({
  necessary: true, analytics, marketing: false,
  savedAt: '2026-10-06T10:00:00.000Z', version: 3,
})

function fixture({
  consent,
  url = 'https://www.perlas.de/kontakt/?email=private%40example.test#secret',
  referrer = 'https://example.test/?name=Private&email=private@example.test#secret',
} = {}) {
  const listeners = new Map()
  const storage = new Map()
  if (consent !== undefined) storage.set(consentKey, typeof consent === 'string' ? consent : JSON.stringify(consent))
  const scripts = []
  const removedScripts = []
  const cookieWrites = []
  const cookies = new Map()
  const location = new URL(url)
  const fakeWindow = {
    location,
    localStorage: { getItem: key => storage.get(key) ?? null },
    addEventListener: (type, listener) => {
      const handlers = listeners.get(type) ?? new Set()
      handlers.add(listener)
      listeners.set(type, handlers)
    },
    removeEventListener: (type, listener) => listeners.get(type)?.delete(listener),
  }
  const fakeDocument = {
    // These deliberately sensitive values must never be read into event parameters.
    title: 'private@example.test',
    referrer,
    createElement: tag => {
      assert.equal(tag, 'script')
      const script = { remove() { removedScripts.push(script) } }
      return script
    },
    head: { appendChild: script => scripts.push(script) },
  }
  Object.defineProperty(fakeDocument, 'cookie', {
    get: () => [...cookies].map(([name, value]) => `${name}=${value}`).join('; '),
    set: value => {
      cookieWrites.push(value)
      const name = value.slice(0, value.indexOf('='))
      if (value.includes('Max-Age=0')) cookies.delete(name)
    },
  })
  const exports = {}
  vm.runInNewContext(compiled, {
    exports, window: fakeWindow, document: fakeDocument, URL, Date,
    require: filename => ({ default: JSON.parse(fs.readFileSync(path.join(directory, filename), 'utf8')) }),
  }, { filename: 'analytics.ts' })
  return {
    ...exports, window: fakeWindow, scripts, removedScripts, cookieWrites, cookies, storage, listeners,
    dispatch(type, detail = {}) {
      for (const listener of listeners.get(type) ?? []) listener(detail)
    },
    save(analytics) {
      const next = validConsent(analytics)
      storage.set(consentKey, JSON.stringify(next))
      this.dispatch('perlas:consent-change', { detail: next })
    },
    commands() { return Array.from(fakeWindow.perlasAnalyticsDataLayer ?? [], command => Array.from(command)) },
    pageViews() { return this.commands().filter(command => command[0] === 'event' && command[1] === 'page_view') },
    leads() { return this.commands().filter(command => command[0] === 'event' && command[1] === 'generate_lead') },
    phoneClicks() { return this.commands().filter(command => command[0] === 'event' && command[1] === 'phone_click') },
  }
}

test('missing, invalid and legacy IDs leave analytics entirely inactive', () => {
  for (const id of [undefined, '', 'G-INVALID', 'UA-123456789-1', 'AW-1234567890', ' G-1234567890', 'G-1234567890&extra=1']) {
    const instance = fixture({ consent: validConsent() })
    instance.initializeAnalytics(id)
    assert.equal(instance.scripts.length, 0)
    assert.equal(instance.commands().length, 0)
    assert.equal(instance.listeners.size, 0)
  }
  assert.equal(fixture().isValidMeasurementId(measurementId), true)
})

test('only exact HTTPS production origins can initialise analytics', () => {
  for (const url of [
    'http://perlas.de/', 'http://www.perlas.de/', 'http://localhost:4175/',
    'https://localhost/', 'http://127.0.0.1:4175/', 'https://seroffm.github.io/perlas/',
    'https://other.example/', 'https://preview.perlas.de/', 'https://perlas.de.evil.example/',
    'https://perlas.de:8443/',
  ]) {
    const instance = fixture({ consent: validConsent(), url })
    instance.initializeAnalytics(measurementId)
    assert.equal(instance.scripts.length, 0)
    assert.equal(instance.commands().length, 0)
    assert.equal(instance.listeners.size, 0)
    assert.equal(instance.window[`ga-disable-${measurementId}`], undefined)
  }
  for (const url of ['https://perlas.de/', 'https://www.perlas.de/', 'https://www.perlas.de:443/']) {
    const instance = fixture({ consent: validConsent(), url })
    instance.initializeAnalytics(measurementId)
    assert.equal(instance.scripts.length, 1)
  }
})

test('absent, rejected, malformed, old or non-boolean consent cannot load Google', () => {
  for (const consent of [undefined, validConsent(false), '{broken', null, 'true',
    { ...validConsent(), version: 2 }, { ...validConsent(), analytics: 'true' },
    { ...validConsent(), necessary: false }, { ...validConsent(), marketing: 'true' },
    { ...validConsent(), savedAt: 'invalid' }]) {
    const instance = fixture({ consent })
    instance.initializeAnalytics(measurementId)
    instance.dispatch('perlas:consent-change', { detail: validConsent() })
    assert.equal(instance.scripts.length, 0)
    assert.equal(instance.commands().length, 0)
    assert.equal(instance.window[`ga-disable-${measurementId}`], true)
  }
  const instance = fixture()
  instance.window.localStorage.getItem = () => { throw new Error('Blocked storage') }
  assert.doesNotThrow(() => instance.initializeAnalytics(measurementId))
  assert.equal(instance.scripts.length, 0)
})

test('a valid analytics choice loads one private-channel script and one safe page view', () => {
  const instance = fixture()
  instance.initializeAnalytics(measurementId)
  instance.save(true)
  assert.equal(instance.scripts.length, 1)
  const script = instance.scripts[0]
  assert.equal(script.src, `https://www.googletagmanager.com/gtag/js?id=${measurementId}&l=perlasAnalyticsDataLayer`)
  assert.equal(script.async, true)
  assert.equal(script.referrerPolicy, 'no-referrer')
  assert.equal(instance.pageViews().length, 0)
  assert.equal(instance.window[`ga-disable-${measurementId}`], true)
  script.onload()
  instance.save(true)
  instance.dispatch('focus')
  assert.equal(instance.scripts.length, 1)
  assert.equal(instance.pageViews().length, 1)
  const [, name, payload] = instance.pageViews()[0]
  assert.equal(name, 'page_view')
  assert.equal(payload.page_location, 'https://www.perlas.de/kontakt/')
  assert.equal(payload.page_referrer, '')
  assert.equal(payload.page_title, 'Perla’s Objektbetreuung')
  assert.equal(payload.send_to, measurementId)
  assert.equal(instance.window[`ga-disable-${measurementId}`], false)
  assert.equal(instance.window.dataLayer, undefined)
  assert.equal(instance.window.gtag, undefined)
  const settings = instance.commands().find(command => command[0] === 'config')[2]
  assert.equal(settings.send_page_view, false)
  assert.equal(settings.allow_google_signals, false)
  assert.equal(settings.allow_ad_personalization_signals, false)
  assert.equal(settings.url_passthrough, false)
  assert.equal(settings.cookie_domain, 'none')
  assert.equal(settings.cookie_path, '/')
  assert.equal(settings.cookie_update, false)
  assert.equal(settings.cookie_expires, 90 * 24 * 60 * 60)
  const serialized = JSON.stringify(instance.commands())
  for (const forbidden of ['private@example.test', 'private%40example.test', '#secret', '?email=', 'user_id', 'user_properties']) {
    assert.equal(serialized.includes(forbidden), false, forbidden)
  }
  const consentCommands = instance.commands().filter(command => command[0] === 'consent')
  assert.equal(consentCommands[0][1], 'default')
  for (const command of consentCommands) {
    assert.equal(command[2].ad_storage, 'denied')
    assert.equal(command[2].ad_user_data, 'denied')
    assert.equal(command[2].ad_personalization, 'denied')
  }
})

test('known public detail pages work with a deployment base; unknown paths cannot leak PII', () => {
  for (const [url, expected] of [
    ['https://www.perlas.de/perlas/leistungen/winterdienst/?utm_source=private#secret', 'https://www.perlas.de/perlas/leistungen/winterdienst/'],
    ['https://www.perlas.de/perlas/facility-management/hausverwaltungen/', 'https://www.perlas.de/perlas/facility-management/hausverwaltungen/'],
    ['https://www.perlas.de/perlas/blog/winterdienst-richtig-planen/', 'https://www.perlas.de/perlas/blog/winterdienst-richtig-planen/'],
    ['https://www.perlas.de/perlas/', 'https://www.perlas.de/perlas/'],
    ['https://www.perlas.de/perlas/private@example.test/', 'https://www.perlas.de/perlas/404/'],
    ['https://www.perlas.de/private@example.test/', 'https://www.perlas.de/perlas/404/'],
  ]) {
    const instance = fixture({ consent: validConsent(), url })
    instance.initializeAnalytics(measurementId, '/perlas/')
    instance.scripts[0].onload()
    assert.equal(instance.pageViews()[0][2].page_location, expected)
    assert.equal(JSON.stringify(instance.commands()).includes('private'), false)
  }
})

test('only fixed Google, Bing and DuckDuckGo origins preserve organic attribution', () => {
  for (const [origin, expectedOrigin, expectedSource] of [
    ['https://google.com', 'https://www.google.com', 'google'],
    ['https://www.google.com', 'https://www.google.com', 'google'],
    ['https://google.de', 'https://www.google.de', 'google'],
    ['https://WWW.GOOGLE.DE:443', 'https://www.google.de', 'google'],
    ['https://bing.com', 'https://www.bing.com', 'bing'],
    ['https://www.bing.com', 'https://www.bing.com', 'bing'],
    ['https://duckduckgo.com', 'https://duckduckgo.com', 'duckduckgo'],
    ['https://www.duckduckgo.com', 'https://duckduckgo.com', 'duckduckgo'],
  ]) {
    const instance = fixture({ consent: validConsent(), referrer: `${origin}/private@example.test/?q=private%40example.test#secret` })
    instance.initializeAnalytics(measurementId)
    instance.scripts[0].onload()
    const settings = instance.commands().find(command => command[0] === 'config')[2]
    const payload = instance.pageViews()[0][2]
    for (const parameters of [settings, payload]) {
      assert.equal(parameters.page_referrer, expectedOrigin)
      assert.equal(parameters.campaign_source, expectedSource)
      assert.equal(parameters.campaign_medium, 'organic')
    }
    assert.equal(JSON.stringify(instance.commands()).includes('private'), false)
  }
})

test('internal, arbitrary, deceptive and malformed referrers remain empty/direct', () => {
  for (const referrer of [
    '', 'not-a-url', 'https://www.perlas.de/private@example.test/?q=private#secret',
    'https://perlas.de/private@example.test/', 'https://user-12345.example.test/?q=private',
    'https://www.google.com.evil.example/?q=private', 'https://private.google.com/?q=private',
    'https://www.google.com:8443/?q=private', 'http://www.google.com/?q=private',
    'https://www.google.co.uk/?q=private',
  ]) {
    const instance = fixture({ consent: validConsent(), referrer })
    instance.initializeAnalytics(measurementId)
    instance.scripts[0].onload()
    const settings = instance.commands().find(command => command[0] === 'config')[2]
    assert.equal(settings.page_referrer, '')
    assert.equal(settings.campaign_source, '(direct)')
    assert.equal(settings.campaign_medium, '(none)')
    assert.equal(JSON.stringify(instance.commands()).includes('private'), false)
  }
})

test('revoking before script load cancels the pending loader and stale callbacks', () => {
  const instance = fixture({ consent: validConsent() })
  instance.initializeAnalytics(measurementId)
  const pending = instance.scripts[0]
  const staleCallback = pending.onload
  instance.save(false)
  assert.equal(instance.window[`ga-disable-${measurementId}`], true)
  assert.equal(instance.removedScripts.includes(pending), true)
  assert.equal(pending.onload, null)
  staleCallback()
  assert.equal(instance.pageViews().length, 0)
  instance.save(true)
  assert.equal(instance.scripts.length, 2)
  instance.scripts[1].onload()
  assert.equal(instance.pageViews().length, 1)
})

test('revocation disables the property and clears only its two cookie names', () => {
  const instance = fixture({ consent: validConsent() })
  instance.initializeAnalytics(measurementId)
  instance.scripts[0].onload()
  instance.cookies.set('_ga', 'our-client')
  instance.cookies.set('_ga_1234567890', 'our-session')
  instance.cookies.set('_ga_OTHER12345', 'another-property')
  instance.cookies.set('some_other_service', 'untouched')
  instance.save(false)
  assert.equal(instance.window[`ga-disable-${measurementId}`], true)
  assert.equal(instance.commands().at(-1)[2].analytics_storage, 'denied')
  assert.equal(instance.cookies.has('_ga'), false)
  assert.equal(instance.cookies.has('_ga_1234567890'), false)
  assert.equal(instance.cookies.get('_ga_OTHER12345'), 'another-property')
  assert.equal(instance.cookies.get('some_other_service'), 'untouched')
  assert.equal(instance.cookieWrites.every(value => /^_ga(?:_1234567890)?=;/.test(value)), true)
  assert.equal(instance.cookieWrites.some(value => value.includes('Domain=perlas.de')), true)
  const eventCount = instance.pageViews().length
  instance.dispatch('focus')
  instance.dispatch('perlas:consent-change', { detail: validConsent() })
  assert.equal(instance.pageViews().length, eventCount)
  instance.save(true)
  assert.equal(instance.scripts.length, 1)
  assert.equal(instance.pageViews().length, eventCount + 1)
})

test('cross-tab storage clearing and a late non-event consent change both revoke', () => {
  const instance = fixture({ consent: validConsent() })
  instance.initializeAnalytics(measurementId)
  instance.scripts[0].onload()
  instance.storage.clear()
  instance.dispatch('storage', { key: null })
  assert.equal(instance.window[`ga-disable-${measurementId}`], true)
  const delayed = fixture({ consent: validConsent() })
  delayed.initializeAnalytics(measurementId)
  delayed.storage.set(consentKey, JSON.stringify(validConsent(false)))
  delayed.scripts[0].onload()
  assert.equal(delayed.pageViews().length, 0)
  assert.equal(delayed.window[`ga-disable-${measurementId}`], true)
})

test('a fresh cross-tab grant restores consent but unrelated storage cannot', () => {
  const instance = fixture({ consent: validConsent() })
  instance.initializeAnalytics(measurementId)
  instance.scripts[0].onload()
  instance.storage.set(consentKey, JSON.stringify(validConsent(false)))
  instance.dispatch('storage', { key: consentKey, newValue: JSON.stringify(validConsent(false)) })
  assert.equal(instance.window[`ga-disable-${measurementId}`], true)
  instance.storage.set(consentKey, JSON.stringify(validConsent()))
  instance.dispatch('storage', { key: 'unrelated', newValue: JSON.stringify(validConsent()) })
  assert.equal(instance.window[`ga-disable-${measurementId}`], true)
  instance.dispatch('storage', { key: consentKey, newValue: '{broken' })
  assert.equal(instance.window[`ga-disable-${measurementId}`], true)
  instance.dispatch('storage', { key: consentKey, newValue: JSON.stringify(validConsent()) })
  assert.equal(instance.window[`ga-disable-${measurementId}`], false)
  assert.equal(instance.pageViews().length, 2)
})

test('failed Google loading is non-fatal and never sends a page view', () => {
  const instance = fixture({ consent: validConsent() })
  instance.initializeAnalytics(measurementId)
  assert.doesNotThrow(() => instance.scripts[0].onerror())
  assert.equal(instance.pageViews().length, 0)
  assert.equal(instance.window[`ga-disable-${measurementId}`], true)
  instance.dispatch('focus')
  assert.equal(instance.scripts.length, 2)
  instance.scripts[1].onload()
  assert.equal(instance.pageViews().length, 1)
})

test('an explicit revoke cannot be undone by readable old storage after a failed write', () => {
  const instance = fixture({ consent: validConsent() })
  instance.initializeAnalytics(measurementId)
  instance.scripts[0].onload()
  instance.dispatch('perlas:consent-change', { detail: validConsent(false) })
  instance.dispatch('focus')
  instance.dispatch('perlas:consent-change')
  assert.equal(instance.window[`ga-disable-${measurementId}`], true)
  assert.equal(instance.pageViews().length, 1)
  const invalidGrant = { ...validConsent(), savedAt: '2026-10-06T12:00:00.000Z' }
  instance.dispatch('perlas:consent-change', { detail: invalidGrant })
  assert.equal(instance.window[`ga-disable-${measurementId}`], true)
  instance.save(true)
  assert.equal(instance.window[`ga-disable-${measurementId}`], false)
  assert.equal(instance.pageViews().length, 2)
})

test('duplicate installation and cleanup cannot create extra handlers or measurements', () => {
  const instance = fixture({ consent: validConsent() })
  const cleanup = instance.initializeAnalytics(measurementId)
  const duplicateCleanup = instance.initializeAnalytics(measurementId)
  assert.equal(instance.scripts.length, 1)
  duplicateCleanup()
  cleanup()
  cleanup()
  instance.save(true)
  assert.equal(instance.scripts.length, 1)
  assert.equal(instance.window[`ga-disable-${measurementId}`], true)
  assert.equal([...instance.listeners.values()].every(handlers => handlers.size === 0), true)
})

test('lead events are not queued before initialization, consent or completed Google loading', () => {
  const instance = fixture()
  instance.recordLead('contact')
  instance.initializeAnalytics(measurementId)
  instance.recordLead('quote')
  assert.equal(instance.commands().length, 0)
  instance.save(true)
  instance.recordLead('contact')
  assert.equal(instance.leads().length, 0)
  instance.scripts[0].onload()
  assert.equal(instance.leads().length, 0)
  instance.recordLead('quote')
  assert.equal(instance.leads().length, 1)
  instance.dispatch('focus')
  assert.equal(instance.leads().length, 1)
})

test('only fixed contact and quote categories and sanitized page values reach lead parameters', () => {
  const instance = fixture({ consent: validConsent(), url: 'https://perlas.de/private@example.test/?requestId=private#secret' })
  instance.initializeAnalytics(measurementId)
  instance.scripts[0].onload()
  for (const value of [undefined, null, '', 'career', 'contact-requests', 'private@example.test', {}, ['quote'], new String('contact')]) {
    instance.recordLead(value)
  }
  assert.equal(instance.leads().length, 0)
  // Extra caller arguments, even in JavaScript, are never forwarded.
  instance.recordLead('contact', { email: 'private@example.test', requestId: 'private' })
  instance.recordLead('quote', 'private@example.test')
  assert.equal(instance.leads().length, 2)
  for (const [index, command] of instance.leads().entries()) {
    assert.equal(command[2].form_type, index === 0 ? 'contact' : 'quote')
    assert.equal(command[2].send_to, measurementId)
    assert.equal(command[2].page_location, 'https://perlas.de/404/')
    assert.deepEqual(Object.keys(command[2]).sort(), [
      'campaign_medium', 'campaign_source', 'form_type', 'page_location', 'page_referrer', 'page_title', 'send_to',
    ])
  }
  assert.equal(JSON.stringify(instance.commands()).includes('private'), false)
})

test('lead events require fresh stored consent and stop immediately on explicit withdrawal or cleanup', () => {
  const instance = fixture({ consent: validConsent() })
  const cleanup = instance.initializeAnalytics(measurementId)
  instance.scripts[0].onload()
  instance.recordLead('contact')
  assert.equal(instance.leads().length, 1)
  // A storage update must be honored even before the change event arrives.
  instance.storage.set(consentKey, JSON.stringify(validConsent(false)))
  instance.recordLead('quote')
  assert.equal(instance.leads().length, 1)
  instance.save(true)
  instance.dispatch('perlas:consent-change', { detail: validConsent(false) })
  // The readable old grant cannot undo an explicit denial if persistence fails.
  instance.recordLead('contact')
  assert.equal(instance.leads().length, 1)
  instance.save(true)
  assert.equal(instance.leads().length, 1)
  instance.recordLead('quote')
  assert.equal(instance.leads().length, 2)
  cleanup()
  instance.recordLead('contact')
  assert.equal(instance.leads().length, 2)
})

test('failed Google loading and revoked pending loaders never replay lead conversions', () => {
  const instance = fixture({ consent: validConsent() })
  instance.initializeAnalytics(measurementId)
  instance.recordLead('quote')
  instance.scripts[0].onerror()
  instance.recordLead('contact')
  instance.dispatch('focus')
  instance.save(false)
  instance.recordLead('quote')
  instance.save(true)
  instance.scripts.at(-1).onload()
  assert.equal(instance.leads().length, 0)
  instance.recordLead('contact')
  assert.equal(instance.leads().length, 1)
})

test('optional lead measurement cannot throw into the successful form flow', () => {
  const instance = fixture({ consent: validConsent() })
  instance.initializeAnalytics(measurementId)
  instance.scripts[0].onload()
  instance.window.perlasAnalyticsDataLayer.push = () => { throw new Error('Optional measurement failed') }
  assert.doesNotThrow(() => instance.recordLead('contact'))
  assert.doesNotThrow(() => instance.recordPhoneClick())
})

test('phone clicks are suppressed before consent and loading without later replay', () => {
  const instance = fixture()
  instance.recordPhoneClick()
  instance.initializeAnalytics(measurementId)
  instance.recordPhoneClick()
  assert.equal(instance.commands().length, 0)
  instance.save(true)
  instance.recordPhoneClick()
  assert.equal(instance.phoneClicks().length, 0)
  instance.scripts[0].onload()
  assert.equal(instance.phoneClicks().length, 0)
  instance.recordPhoneClick()
  assert.equal(instance.phoneClicks().length, 1)
})

test('phone clicks have only safe page context and require fresh consent until cleanup', () => {
  const instance = fixture({ consent: validConsent() })
  const cleanup = instance.initializeAnalytics(measurementId)
  instance.scripts[0].onload()
  // No caller-supplied link, number or arbitrary object is accepted or forwarded.
  instance.recordPhoneClick('tel:private@example.test', { phone: 'private', email: 'private@example.test' })
  assert.equal(instance.phoneClicks().length, 1)
  const payload = instance.phoneClicks()[0][2]
  assert.equal(payload.send_to, measurementId)
  assert.equal(payload.page_location, 'https://www.perlas.de/kontakt/')
  assert.deepEqual(Object.keys(payload).sort(), [
    'campaign_medium', 'campaign_source', 'page_location', 'page_referrer', 'page_title', 'send_to',
  ])
  assert.equal(JSON.stringify(instance.phoneClicks()).includes('private'), false)
  instance.storage.set(consentKey, JSON.stringify(validConsent(false)))
  instance.recordPhoneClick()
  assert.equal(instance.phoneClicks().length, 1)
  instance.save(true)
  instance.dispatch('perlas:consent-change', { detail: validConsent(false) })
  instance.recordPhoneClick()
  assert.equal(instance.phoneClicks().length, 1)
  instance.save(true)
  assert.equal(instance.phoneClicks().length, 1)
  instance.recordPhoneClick()
  assert.equal(instance.phoneClicks().length, 2)
  cleanup()
  instance.recordPhoneClick()
  assert.equal(instance.phoneClicks().length, 2)
})

test('short-contact leads use a fixed category with no form values', () => {
  const instance = fixture({ consent: validConsent() })
  instance.initializeAnalytics(measurementId)
  instance.scripts[0].onload()
  instance.recordLead('quick_contact', { name: 'private@example.test' })
  assert.equal(instance.leads().length, 1)
  assert.equal(instance.leads()[0][2].form_type, 'quick_contact')
  assert.equal(JSON.stringify(instance.leads()).includes('private'), false)
})

test('email and WhatsApp link clicks are not inquiries and respect consent and cleanup', () => {
  const instance = fixture()
  const cleanup = instance.initializeAnalytics(measurementId)
  instance.recordContactClick('email')
  instance.save(true)
  instance.recordContactClick('whatsapp')
  instance.scripts[0].onload()
  assert.equal(instance.commands().filter(command => command[0] === 'event' && /^(email|whatsapp)_click$/.test(command[1])).length, 0)
  for (const value of ['private@example.test', 'career', {}, undefined]) instance.recordContactClick(value)
  instance.recordContactClick('email', 'private@example.test')
  instance.recordContactClick('whatsapp', { message: 'private' })
  const clicks = instance.commands().filter(command => command[0] === 'event' && /^(email|whatsapp)_click$/.test(command[1]))
  assert.equal(clicks.length, 2)
  assert.equal(instance.leads().length, 0)
  assert.equal(JSON.stringify(clicks).includes('private'), false)
  instance.save(false)
  instance.recordContactClick('email')
  cleanup()
  instance.recordContactClick('whatsapp')
  assert.equal(instance.commands().filter(command => command[0] === 'event' && /^(email|whatsapp)_click$/.test(command[1])).length, 2)
})

test('only exact public paid-source labels are recognized; other URL fields stay private', () => {
  for (const source of ['google', 'bing']) {
    const instance = fixture({ consent: validConsent(), url: `https://perlas.de/?utm_source=${source}&utm_medium=cpc&utm_campaign=private%40example.test&gclid=private#secret` })
    instance.initializeAnalytics(measurementId)
    instance.scripts[0].onload()
    assert.equal(instance.pageViews()[0][2].campaign_source, source)
    assert.equal(instance.pageViews()[0][2].campaign_medium, 'cpc')
    assert.equal(instance.pageViews()[0][2].page_location, 'https://perlas.de/')
    assert.equal(JSON.stringify(instance.commands()).includes('private'), false)
  }
  for (const query of ['utm_source=private%40example.test&utm_medium=cpc', 'utm_source=google&utm_medium=private', 'utm_source=google&utm_source=private&utm_medium=cpc', 'utm_source=google&utm_medium=cpc&utm_medium=email']) {
    const instance = fixture({ consent: validConsent(), url: `https://perlas.de/?${query}` })
    instance.initializeAnalytics(measurementId)
    instance.scripts[0].onload()
    assert.equal(instance.pageViews()[0][2].campaign_source, '(direct)')
    assert.equal(JSON.stringify(instance.commands()).includes('private'), false)
  }
})

// The backend is executed with an isolated, stubbed fetch. No API or test email is sent.
const backendSource = fs.readFileSync(path.join(directory, 'backend.ts'), 'utf8')
const compiledBackend = ts.transpileModule(backendSource.replaceAll('import.meta.env', '__backendEnvironment'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText

function backendFixture({ apiConfigured = true, demo = false, responseKind = 'success' } = {}) {
  const leads = []
  const requests = []
  const exports = {}
  vm.runInNewContext(compiledBackend, {
    exports, FormData, AbortController, TextEncoder, crypto: webcrypto,
    window: { location: new URL('https://perlas.de/kontakt/'), setTimeout, clearTimeout },
    __backendEnvironment: { VITE_PERLAS_API_URL: apiConfigured ? 'https://api.example.test' : undefined },
    require: filename => {
      if (filename === './config') return { DEMO_FORM_SUBMIT_DELAY_MS: 0, DEMO_FORM_SUCCESS: demo }
      if (filename === './analytics') return { recordLead: (...args) => leads.push(args) }
      throw new Error(`Unexpected backend dependency: ${filename}`)
    },
    fetch: async (url, options) => {
      requests.push(url)
      if (responseKind === 'network-error') throw new TypeError('Stubbed network failure')
      return {
        ok: responseKind !== 'http-error', status: responseKind === 'http-error' ? 500 : 200,
        headers: { get: () => 'application/json' },
        json: async () => ({
          ok: responseKind !== 'unconfirmed',
          requestId: responseKind === 'mismatched-id' ? 'not-the-request' : options.body.get('requestId'),
          reference: 'P-ABCDEF1234', confirmationEmailSent: false,
        }),
      }
    },
  }, { filename: 'backend.ts' })
  return { ...exports, leads, requests }
}

const contactPayload = {
  subject: 'Private subject', name: 'Private name', company: 'Private company',
  email: 'private@example.test', phone: '0123456789', street: 'Private street',
  location: 'Private location', message: 'Private message',
}
const quotePayload = {
  ...contactPayload, propertyType: 'Private property', services: ['Private service'],
  preferredStart: 'Private date', details: 'Private details',
}

test('the backend records only server-confirmed contact and quote submissions without form values', async () => {
  const instance = backendFixture()
  const contact = await instance.submitContactRequest(contactPayload)
  assert.equal(contact.ok, true)
  const quote = await instance.submitQuoteRequest(quotePayload)
  assert.equal(quote.mode, 'api')
  assert.deepEqual(instance.leads, [['contact'], ['quote']])
  assert.equal(JSON.stringify(instance.leads).includes('Private'), false)
  assert.equal(JSON.stringify(instance.leads).includes('private@example.test'), false)
  await instance.submitCareerApplication({ ...contactPayload, role: 'Private role' })
  assert.deepEqual(instance.leads, [['contact'], ['quote']])
})

test('demo, missing API, network errors and unconfirmed server responses never record leads', async () => {
  const demo = backendFixture({ demo: true })
  assert.equal((await demo.submitQuoteRequest(quotePayload)).mode, 'demo')
  assert.equal(demo.requests.length, 0)
  assert.equal(demo.leads.length, 0)
  const missing = backendFixture({ apiConfigured: false })
  await assert.rejects(missing.submitContactRequest(contactPayload))
  await assert.rejects(missing.submitQuoteRequest(quotePayload))
  assert.equal(missing.leads.length, 0)
  for (const responseKind of ['network-error', 'http-error', 'unconfirmed', 'mismatched-id']) {
    const instance = backendFixture({ responseKind })
    await assert.rejects(instance.submitContactRequest(contactPayload))
    await assert.rejects(instance.submitQuoteRequest(quotePayload))
    assert.equal(instance.leads.length, 0, responseKind)
  }
})
