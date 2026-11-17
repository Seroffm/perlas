import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { contentCatalogue, contentRoutes, readContentSources, routePayload } from '../vite-route-content.mjs'

const sources = readContentSources()
const paths = contentRoutes(sources)

test('every approved content route has one exact payload and preserves its active full content', () => {
  assert.equal(paths.length, 77)
  assert.equal(new Set(paths).size, paths.length)
  for (const path of paths) {
    const payload = routePayload(path, sources)
    assert.equal(payload.path, path)
    const regional = [...sources.local, ...sources.commercial].find(page => `/einsatzgebiete/${page.slug}/` === path)
    const focused = sources.focused.find(page => page.path === path)
    const post = sources.posts.find(page => `/blog/${page.slug}/` === path)
    const service = sources.services.find(page => `/leistungen/${page.slug}/` === path)
    const audience = sources.audiences.find(page => `/facility-management/${page.id}/` === path)
    if (regional) assert.deepEqual(payload.activeLocalLanding ?? payload.activeCommercialLanding, regional, path)
    if (focused) assert.deepEqual(payload.activeFocusedService, focused, path)
    if (post) assert.deepEqual(payload.activeBlogPost, post, path)
    if (service) assert.deepEqual(payload.activeService, service, path)
    if (audience) assert.deepEqual(payload.activeAudience, audience, path)
  }
})

test('shared service and audience catalogues retain visible card values without detail texts', () => {
  const catalogue = contentCatalogue(sources)
  assert.equal(catalogue.services.length, 11)
  assert.equal(catalogue.audiences.length, 4)
  for (const [collection, keys] of [
    ['services', ['slug', 'title', 'text', 'image']],
    ['audiences', ['id', 'title', 'navLabel', 'text', 'requirements', 'approach', 'services', 'image']],
  ]) {
    for (const [index, summary] of catalogue[collection].entries()) {
      assert.deepEqual(Object.keys(summary), keys)
      for (const key of keys) assert.deepEqual(summary[key], sources[collection][index][key])
      assert.equal('faqs' in summary, false)
      assert.equal('scopeCards' in summary, false)
      assert.equal('seoDescription' in summary, false)
    }
  }
})

test('summaries retain every intentional service, region and article connection', () => {
  for (const service of sources.services) {
    const payload = routePayload(`/leistungen/${service.slug}/`, sources)
    assert.deepEqual(payload.regionalLandings.map(page => page.slug),
      [...sources.local, ...sources.commercial].filter(page => page.serviceSlug === service.slug).map(page => page.slug))
    assert.deepEqual(payload.focusedServices.map(page => page.slug),
      sources.focused.filter(page => page.serviceSlug === service.slug).map(page => page.slug))
    assert.deepEqual(payload.blogPosts.map(page => page.slug), sources.posts.filter(page => service.guideSlugs?.includes(page.slug)).map(page => page.slug))
  }
  for (const post of sources.posts) {
    const payload = routePayload(`/blog/${post.slug}/`, sources)
    assert.deepEqual(payload.localOffers.map(page => page.slug),
      [...sources.local, ...sources.commercial].filter(page => page.guideSlugs?.includes(post.slug)).map(page => page.slug))
    assert.equal(payload.blogPosts.length, sources.posts.length)
  }
  assert.equal(routePayload('/einsatzgebiete/', sources).regionalLandings.length, 38)
  assert.equal(routePayload('/leistungen/', sources).focusedServices.length, 4)
})

test('unrelated full texts are absent and legal details are route-scoped', () => {
  assert.ok(JSON.stringify(routePayload('/', sources)).length < 1000)
  for (const path of paths) {
    const payload = routePayload(path, sources)
    assert.equal(Boolean(payload.privacy), path === '/datenschutz/')
    assert.equal(Boolean(payload.imprint), path === '/impressum/')
    assert.equal(Boolean(payload.activeService), sources.services.some(page => `/leistungen/${page.slug}/` === path))
    assert.equal(Boolean(payload.activeAudience), sources.audiences.some(page => `/facility-management/${page.id}/` === path))
    assert.equal(payload.jobOpenings.length > 0, path === '/karriere/')
    for (const summary of payload.blogPosts) assert.equal('sections' in summary, false)
    for (const summary of payload.regionalLandings) assert.equal('faqs' in summary, false)
    for (const summary of payload.focusedServices) assert.equal('planning' in summary, false)
  }
  const unknown = routePayload('/einsatzgebiete/unapproved-private-id/', sources)
  assert.equal(unknown.activeLocalLanding, undefined)
  assert.equal(unknown.activeCommercialLanding, undefined)
  assert.equal(unknown.activeFocusedService, undefined)
  assert.deepEqual(unknown.regionalLandings, [])
})

const compiled = ts.transpileModule(readFileSync(new URL('../src/route-path.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText
const exported = {}
vm.runInNewContext(compiled, { exports: exported })

test('HTML aliases normalize without widening the base-path boundary or inventing routes', () => {
  for (const [input, base, expected] of [
    ['/index.html', '/', '/'],
    ['/leistungen/index.html', '/', '/leistungen/'],
    ['/einsatzgebiete/glasreinigung-frankfurt/index.html', '/', '/einsatzgebiete/glasreinigung-frankfurt/'],
    ['/perlas/index.html', '/perlas/', '/'],
    ['/perlas/leistungen/index.html', '/perlas/', '/leistungen/'],
    ['/perlas-other/leistungen/', '/perlas/', '/perlas-other/leistungen/'],
    ['/unknown/index.html', '/', '/unknown/'],
  ]) assert.equal(exported.getPagePath(input, base), expected)
})

test('malformed external hashes cannot throw while valid section targets remain unchanged', () => {
  for (const hash of ['#%', '#%E0%A4%A', '#%FF', '#a%2', '#%C0%AF']) {
    assert.doesNotThrow(() => exported.getHashTarget(hash))
    assert.equal(exported.getHashTarget(hash), undefined)
  }
  for (const [hash, expected] of [
    ['', undefined], ['#', undefined], ['#anfrage', 'anfrage'],
    ['#f%C3%BCr-ihr-objekt', 'für-ihr-objekt'], ['#abschnitt-1', 'abschnitt-1'],
  ]) assert.equal(exported.getHashTarget(hash), expected)
})
