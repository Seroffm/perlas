import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
import TestRenderer from 'react-test-renderer'

const require = createRequire(import.meta.url)
const compiled = ts.transpileModule(readFileSync(new URL('./QuoteDialogBoundary.tsx', import.meta.url), 'utf8')
  .replaceAll('import.meta.env', '__testEnvironment'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText

function fixture() {
  const document = { activeElement: null, body: { style: { overflow: 'auto' } } }
  class Element {
    isConnected = true
    focus() { document.activeElement = this }
  }
  const opener = new Element()
  opener.focus()
  const dialogs = []
  const exports = {}
  vm.runInNewContext(compiled, {
    exports, document, HTMLElement: Element,
    __testEnvironment: { BASE_URL: '/' },
    require: filename => filename.endsWith('.css') ? {} : require(filename),
  })
  return {
    ...exports, document, opener, dialogs,
    createNodeMock(node) {
      if (node.type === 'dialog') {
        const dialog = new Element()
        dialog.open = false
        dialog.showModal = () => { dialog.open = true }
        dialog.close = () => { dialog.open = false }
        dialogs.push(dialog)
        return dialog
      }
      return new Element()
    },
  }
}

test('a rejected lazy quote chunk leaves the main page intact and offers contact without cached-error retries', async () => {
  const f = fixture()
  let rejectImport
  let imports = 0
  let failures = 0
  const LazyQuote = React.lazy(() => {
    imports += 1
    return new Promise((_resolve, reject) => { rejectImport = reject })
  })
  function Page() {
    const [open, setOpen] = React.useState(false)
    const [unavailable, setUnavailable] = React.useState(false)
    const close = () => setOpen(false)
    const recovery = React.createElement(f.QuoteContactDialog, { onClose: close })
    return React.createElement(React.Fragment, null,
      React.createElement('h1', null, 'Bestehender Seiteninhalt'),
      React.createElement('button', { id: 'open-quote', onClick: () => setOpen(true) }, 'Angebot anfragen'),
      open && React.createElement(f.default, { fallback: recovery, onFailure: () => { failures += 1; setUnavailable(true) } },
        unavailable ? recovery : React.createElement(React.Suspense, {
          fallback: React.createElement(f.QuoteContactDialog, { loading: true, onClose: close }),
        }, React.createElement(LazyQuote))),
    )
  }
  let renderer
  await TestRenderer.act(async () => { renderer = TestRenderer.create(React.createElement(Page), { createNodeMock: f.createNodeMock }) })
  await TestRenderer.act(async () => { renderer.root.findByProps({ id: 'open-quote' }).props.onClick() })
  assert.equal(imports, 1)
  assert.equal(f.dialogs.at(-1).open, true)
  assert.equal(f.document.body.style.overflow, 'hidden')
  assert.notEqual(f.document.activeElement, f.opener)
  assert.equal(renderer.root.findAllByProps({ role: 'status' }).length, 1)

  const previousError = console.error
  console.error = () => {} // React intentionally reports the caught test failure.
  try {
    await TestRenderer.act(async () => { rejectImport(new Error('Failed to fetch private-test-chunk.js')); await Promise.resolve() })
  } finally { console.error = previousError }

  assert.equal(renderer.root.findByType('h1').children.join(''), 'Bestehender Seiteninhalt')
  assert.equal(failures, 1)
  assert.equal(renderer.root.findAllByProps({ role: 'alert' }).length, 1)
  const links = renderer.root.findAllByType('a').map(link => link.props.href)
  assert.deepEqual(links, ['/kontakt/', 'tel:+491776867145', 'mailto:mail@perlas.de'])
  assert.equal(JSON.stringify(renderer.toJSON()).includes('private-test-chunk'), false)

  let prevented = false
  await TestRenderer.act(async () => { renderer.root.findByType('dialog').props.onCancel({ preventDefault() { prevented = true } }) })
  assert.equal(prevented, true)
  assert.equal(renderer.root.findAllByType('dialog').length, 0)
  assert.equal(f.document.body.style.overflow, 'auto')
  assert.equal(f.document.activeElement, f.opener)

  await TestRenderer.act(async () => { renderer.root.findByProps({ id: 'open-quote' }).props.onClick() })
  assert.equal(imports, 1, 'reopening uses the contact alternative instead of retrying a cached lazy rejection')
  assert.equal(failures, 1, 'the cached lazy error is not thrown into another boundary on reopening')
  assert.equal(renderer.root.findAllByProps({ role: 'alert' }).length, 1)
  await TestRenderer.act(async () => { renderer.root.findByProps({ 'aria-label': 'Anfrage schließen' }).props.onClick() })
  assert.equal(renderer.root.findAllByType('dialog').length, 0)
  assert.equal(f.document.activeElement, f.opener)
  assert.equal(renderer.root.findByType('h1').children.join(''), 'Bestehender Seiteninhalt')
  await TestRenderer.act(async () => renderer.unmount())
})

test('a successful lazy load removes the temporary contact dialog without closing the requested view', async () => {
  const f = fixture()
  let resolveImport
  let closes = 0
  const LazyQuote = React.lazy(() => new Promise(resolve => { resolveImport = resolve }))
  const close = () => { closes += 1 }
  let renderer
  await TestRenderer.act(async () => {
    renderer = TestRenderer.create(React.createElement(f.default, {
      onFailure: () => assert.fail('successful module must not trip the boundary'),
      fallback: React.createElement(f.QuoteContactDialog, { onClose: close }),
    }, React.createElement(React.Suspense, {
      fallback: React.createElement(f.QuoteContactDialog, { loading: true, onClose: close }),
    }, React.createElement(LazyQuote))), { createNodeMock: f.createNodeMock })
  })
  assert.equal(renderer.root.findAllByType('dialog').length, 1)
  await TestRenderer.act(async () => { resolveImport({ default: () => React.createElement('section', { id: 'loaded-quote' }, 'Angebotsformular') }); await Promise.resolve() })
  assert.equal(renderer.root.findAllByType('dialog').length, 0)
  assert.equal(renderer.root.findByProps({ id: 'loaded-quote' }).children.join(''), 'Angebotsformular')
  assert.equal(closes, 0)
  assert.equal(f.document.body.style.overflow, 'auto')
  await TestRenderer.act(async () => renderer.unmount())
})
