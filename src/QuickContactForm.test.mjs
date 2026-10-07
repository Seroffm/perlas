// Offline component/transport tests. All requests are intercepted; no email is sent.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { webcrypto } from 'node:crypto'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const directory = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
function compile(filename) {
  const source = fs.readFileSync(path.join(directory, filename), 'utf8').replaceAll('import.meta.env', '__testEnvironment')
  return ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
}
const componentCode = compile('QuickContactForm.tsx')
const backendCode = compile('backend.ts')

function transport({ apiConfigured = true, responseKind = 'success', confirmationEmailSent = false, gate } = {}) {
  const requests = []
  const leads = []
  const exports = {}
  const instance = { responseKind }
  vm.runInNewContext(backendCode, {
    exports, FormData, AbortController, TextEncoder, crypto: webcrypto, Error, TypeError,
    window: { location: new URL('https://perlas.de/kontakt/'), setTimeout, clearTimeout },
    __testEnvironment: { VITE_PERLAS_API_URL: apiConfigured ? 'https://api.example.test' : undefined },
    require: filename => {
      if (filename === './config') return { DEMO_FORM_SUCCESS: false, DEMO_FORM_SUBMIT_DELAY_MS: 0 }
      if (filename === './analytics') return { recordLead: value => leads.push(value) }
      throw new Error(`Unexpected dependency: ${filename}`)
    },
    fetch: async (url, options) => {
      assert.equal(url, 'https://api.example.test/contact-requests')
      requests.push({ url, fields: Object.fromEntries(options.body), options })
      if (gate) await gate
      if (instance.responseKind === 'network-error') throw new TypeError('Offline network failure')
      const rejected = instance.responseKind === 'rejected' || options.body.get('website') !== ''
      return {
        ok: !rejected, status: rejected ? 422 : 200,
        headers: { get: () => 'application/json' },
        json: async () => rejected ? { message: 'Simulierte Ablehnung. Bitte prüfen Sie Ihre Angaben.' } : {
          ok: true,
          requestId: options.body.get('requestId'),
          reference: 'P-ABCDEF1234',
          confirmationEmailSent: instance.responseKind === 'unconfirmed' ? 'invalid' : confirmationEmailSent,
        },
      }
    },
  }, { filename: 'backend.ts' })
  return Object.assign(instance, exports, { requests, leads })
}

function loadComponent(react, runtime, backend, FormDataClass = FormData, window = {}) {
  const exports = {}
  vm.runInNewContext(componentCode, {
    exports, FormData: FormDataClass, Error, window,
    __testEnvironment: { BASE_URL: '/' },
    require: filename => {
      if (filename === 'react') return react
      if (filename === 'react/jsx-runtime') return runtime
      if (filename === './backend') return backend
      if (filename === './QuickContactForm.css') return {}
      throw new Error(`Unexpected component dependency: ${filename}`)
    },
  }, { filename: 'QuickContactForm.tsx' })
  return exports.default
}

function visit(node, predicate) {
  if (!node || typeof node !== 'object') return null
  if (predicate(node)) return node
  for (const child of [].concat(node.props?.children ?? [])) {
    if (Array.isArray(child)) {
      for (const nested of child) { const found = visit(nested, predicate); if (found) return found }
    } else {
      const found = visit(child, predicate)
      if (found) return found
    }
  }
  return null
}

function nodeText(node) {
  if (Array.isArray(node)) return node.map(nodeText).join(' ')
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node !== 'object') return String(node)
  return nodeText(node.props?.children ?? '')
}

// Lightweight hook harness exercises the actual event handler without a browser.
// It is complemented by real React server rendering below, not a replacement for mobile visual QA.
function fixture({ topic, ...transportOptions } = {}) {
  const backend = transport(transportOptions)
  const slots = []
  const pendingEffects = []
  const frames = []
  const focused = []
  const busy = []
  let cursor = 0
  let tree
  const react = {
    useId() { cursor++; return 'quick-test' },
    useState(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = initial
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value }]
    },
    useRef(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = { current: initial }
      return slots[index]
    },
    useEffect(effect, dependencies) {
      const index = cursor++
      if (!slots[index] || dependencies.some((value, offset) => !Object.is(value, slots[index][offset]))) pendingEffects.push(effect)
      slots[index] = dependencies
    },
  }
  const element = (type, props) => {
    const node = { type, props }
    if (props.ref) props.ref.current = {
      focus() { focused.push(props.name ?? props.id ?? type) },
      querySelector(selector) {
        const match = visit(tree, candidate => selector === '[aria-invalid="true"]'
          ? candidate.props?.['aria-invalid'] === true
          : selector === 'input[name="name"]' && candidate.type === 'input' && candidate.props?.name === 'name')
        return match ? { focus() { focused.push(match.props.name ?? match.props.id) } } : null
      },
    }
    return node
  }
  class MockFormData {
    constructor(form) { this.form = form }
    get(name) { return name === 'website' ? this.form.website ?? '' : null }
  }
  const Component = loadComponent(react, { jsx: element, jsxs: element }, backend, MockFormData, {
    requestAnimationFrame(callback) { frames.push(callback) },
  })
  const instance = {
    backend, busy, focused,
    render() {
      cursor = 0
      tree = Component({ topic, onBusyChange: value => busy.push(value) })
      while (pendingEffects.length) pendingEffects.shift()()
      while (frames.length) frames.shift()()
      return tree
    },
    find(predicate) { return visit(tree, predicate) },
    field(name) { return visit(tree, node => node.props?.name === name) },
    set(name, value) {
      const field = this.field(name)
      assert.ok(field, name)
      field.props.onChange({ target: { value, checked: value } })
      this.render()
    },
    submit(website = '') {
      const form = visit(tree, node => node.type === 'form')
      assert.ok(form)
      return form.props.onSubmit({ preventDefault() {}, currentTarget: { website } })
    },
    text() { return nodeText(tree) },
  }
  instance.render()
  return instance
}

function fillMinimum(instance) {
  instance.set('name', ' Test Verwaltung ')
  instance.set('email', ' test@example.test ')
  instance.set('privacy', true)
}

test('real React markup has labelled fields, only name/email/privacy required and no street', () => {
  const backend = transport()
  const Component = loadComponent(React, require('react/jsx-runtime'), backend)
  const markup = renderToStaticMarkup(React.createElement(Component, { topic: 'Objektbetreuung' }))
  assert.match(markup, /Thema:<\/strong> Objektbetreuung/)
  assert.match(markup, /name="name"[^>]*required=""/)
  assert.match(markup, /name="email"[^>]*required=""/)
  assert.match(markup, /name="privacy"[^>]*required=""/)
  for (const name of ['phone', 'location', 'role', 'message']) {
    const field = markup.match(new RegExp(`<(?:input|select|textarea)[^>]*name="${name}"[^>]*>`))?.[0]
    assert.ok(field, name)
    assert.doesNotMatch(field, /required/)
  }
  assert.doesNotMatch(markup, /name="street"|<details[^>]* open/)
  assert.match(markup, /aria-hidden="true"[^>]*>Website/)
  assert.equal(backend.requests.length, 0)
})

test('invalid minimum fields never call the API and focus the first labelled error', async () => {
  const instance = fixture()
  await instance.submit()
  instance.render()
  assert.equal(instance.backend.requests.length, 0)
  for (const name of ['name', 'email', 'privacy']) assert.equal(instance.field(name).props['aria-invalid'], true)
  assert.equal(instance.focused.at(-1), 'name')
  instance.set('name', 'Test')
  instance.set('email', 'not-an-email')
  instance.set('privacy', true)
  await instance.submit()
  instance.render()
  assert.equal(instance.backend.requests.length, 0)
  assert.equal(instance.focused.at(-1), 'email')
})

test('minimum request uses existing contact API with blank optional addresses and fixed subtype only', async () => {
  const instance = fixture()
  fillMinimum(instance)
  await instance.submit()
  instance.render()
  const { fields } = instance.backend.requests[0]
  assert.equal(fields.name, 'Test Verwaltung')
  assert.equal(fields.email, 'test@example.test')
  assert.equal(fields.street, '')
  assert.equal(fields.location, '')
  assert.equal(fields.phone, '')
  assert.equal(fields.privacyConsent, 'true')
  assert.equal(fields.website, '')
  assert.match(fields.message, /Kurze Anfrage/)
  assert.deepEqual(instance.backend.leads, ['quick_contact'])
  assert.match(instance.text(), /P-ABCDEF1234/)
  assert.match(instance.text(), /eine E-Mail-Bestätigung konnte jedoch nicht gesendet werden/)
  assert.doesNotMatch(instance.text(), /Eine Eingangsbestätigung wurde an/)
  assert.deepEqual(instance.busy, [true, false])
  assert.equal(instance.focused.at(-1), 'quick-test-success')
})

test('optional role/location/message and preselected topic use known API fields, not new schema', async () => {
  const instance = fixture({ topic: ' Tiefgaragenreinigung ' })
  fillMinimum(instance)
  instance.set('phone', ' 0123456789 ')
  instance.set('location', ' 65843 Sulzbach ')
  instance.set('role', 'Hausverwaltung')
  instance.set('message', ' Betreuung für zwei Wohnanlagen ')
  await instance.submit()
  instance.render()
  const { fields } = instance.backend.requests[0]
  assert.equal(fields.subject, 'Kurze Anfrage: Tiefgaragenreinigung')
  assert.equal(fields.location, '65843 Sulzbach')
  assert.equal(fields.phone, '0123456789')
  assert.match(fields.message, /Ich frage an als: Hausverwaltung/)
  assert.match(fields.message, /Mein Anliegen: Betreuung für zwei Wohnanlagen/)
  assert.equal('role' in fields, false)
  assert.deepEqual(instance.backend.leads, ['quick_contact'])
})

test('rejected response retains values and permits a same-ID retry without premature lead or success', async () => {
  const instance = fixture({ responseKind: 'rejected' })
  fillMinimum(instance)
  await instance.submit()
  instance.render()
  assert.match(instance.text(), /Simulierte Ablehnung/)
  assert.equal(instance.field('email').props.value, ' test@example.test ')
  assert.equal(instance.field('privacy').props.checked, true)
  assert.equal(instance.find(node => node.props?.role === 'alert') !== null, true)
  assert.equal(instance.focused.at(-1), 'p')
  assert.equal(instance.backend.leads.length, 0)
  const requestId = instance.backend.requests[0].fields.requestId
  instance.backend.responseKind = 'success'
  await instance.submit()
  instance.render()
  assert.equal(instance.backend.requests[1].fields.requestId, requestId)
  assert.deepEqual(instance.backend.leads, ['quick_contact'])
})

test('missing API, network error and malformed confirmation never show success or record a lead', async () => {
  for (const options of [{ apiConfigured: false }, { responseKind: 'network-error' }, { responseKind: 'unconfirmed' }]) {
    const instance = fixture(options)
    fillMinimum(instance)
    await instance.submit()
    instance.render()
    assert.ok(instance.field('name'))
    assert.equal(instance.backend.leads.length, 0)
    assert.match(instance.text(), /Ihre Eingaben bleiben erhalten/)
    assert.doesNotMatch(instance.text(), /Vorgang P-/)
  }
})

test('pending request disables the field group, suppresses duplicates and restores busy state', async () => {
  let release
  const gate = new Promise(resolve => { release = resolve })
  const instance = fixture({ gate })
  fillMinimum(instance)
  const first = instance.submit()
  instance.render()
  assert.equal(instance.find(node => node.type === 'fieldset').props.disabled, true)
  assert.equal(instance.find(node => node.type === 'button' && node.props.type === 'submit').props.disabled, true)
  await instance.submit()
  release()
  await first
  instance.render()
  assert.equal(instance.backend.requests.length, 1)
  assert.deepEqual(instance.busy, [true, false])
})

test('confirmed acknowledgment is accurately shown and another request clears and refocuses fields', async () => {
  const instance = fixture({ confirmationEmailSent: true })
  fillMinimum(instance)
  await instance.submit()
  instance.render()
  assert.match(instance.text(), /Eine Eingangsbestätigung wurde an test@example.test gesendet/)
  instance.find(node => node.type === 'button').props.onClick()
  instance.render()
  assert.equal(instance.field('name').props.value, '')
  assert.equal(instance.field('email').props.value, '')
  assert.equal(instance.field('privacy').props.checked, false)
  assert.equal(instance.focused.at(-1), 'name')
})

test('honeypot reaches the existing validator and its rejection cannot become a successful lead', async () => {
  const instance = fixture()
  fillMinimum(instance)
  await instance.submit('https://spam.example.test')
  instance.render()
  assert.equal(instance.backend.requests[0].fields.website, 'https://spam.example.test')
  assert.equal(instance.backend.leads.length, 0)
  assert.ok(instance.field('name'))
})
