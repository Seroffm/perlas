import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { validateLegacyRedirects } from './prepare-legacy-redirects.mjs'

const manifest = JSON.parse(await readFile(new URL('../src/legacy-redirects.json', import.meta.url), 'utf8'))
const site = new URL('https://perlas.de/')
const services = JSON.parse(await readFile(new URL('../src/service-data.json', import.meta.url), 'utf8'))
const canonicals = [
  '', 'ueber-uns/', 'blog/', 'karriere/', 'datenschutz/', 'facility-management/gewerbeimmobilien/',
  'einsatzgebiete/hausmeisterservice-frankfurt/',
  'einsatzgebiete/objektbetreuung-eschborn/',
  'einsatzgebiete/hausmeisterservice-kelkheim/',
  'einsatzgebiete/hausmeisterservice-wiesbaden/',
  'einsatzgebiete/hausmeisterservice-niedernhausen/',
  'einsatzgebiete/hausmeisterservice-kelsterbach/',
  'leistungen/hausmeisterservice-gewerbe/',
  'blog/hausmeisterservice-objektbetreuung-frankfurt-umgebung/',
  ...services.map(({ slug }) => `leistungen/${slug}/`),
].map((relative) => new URL(relative, site).href)

test('twenty-one exact old paths resolve to commissioned canonical content with no chains', () => {
  const redirects = validateLegacyRedirects(manifest, site, canonicals)
  assert.equal(redirects.length, 21)
  const targets = new Map(redirects.map(({ from, target }) => [from.pathname, target.pathname]))
  assert.deepEqual(Object.fromEntries(targets), {
    '/regelmaessige-objektpflege-in-sulzbach-frankfurt/': '/leistungen/objektpflege/',
    '/gewerbliche-gebaeudewartung-rhein-main/': '/facility-management/gewerbeimmobilien/',
    '/wartung-instandhaltung/': '/leistungen/wartung-instandhaltung/',
    '/gebaudereinigung-in-sulzbach-frankfurt/': '/leistungen/gebaeudereinigung/',
    '/gartenpflege-in-sulzbach-frankfurt/': '/leistungen/gartenpflege/',
    '/uber-uns/': '/ueber-uns/',
    '/unser-blog/': '/blog/',
    '/offene-stellen/': '/karriere/',
    '/hausmeisterservice-bad-soden-am-taunus/': '/leistungen/objektpflege/',
    '/hausmeisterservice-frankfurt-am-main/': '/einsatzgebiete/hausmeisterservice-frankfurt/',
    '/hausmeisterservice-eschborn/': '/einsatzgebiete/objektbetreuung-eschborn/',
    '/hausmeisterservice-kelkheim-am-taunus/': '/einsatzgebiete/hausmeisterservice-kelkheim/',
    '/hausmeisterservice-wiesbaden/': '/einsatzgebiete/hausmeisterservice-wiesbaden/',
    '/hausmeisterservice-schwalbach-am-taunus/': '/leistungen/objektpflege/',
    '/category/unser-blog/': '/blog/',
    '/cookie-richtlinie-eu/': '/datenschutz/',
    '/hausmeisterservice-fuer-gewerbeimmobilien-das-ist-wichtig/': '/leistungen/hausmeisterservice-gewerbe/',
    '/den-richtigen-hausmeisterservice-finden-tipps-und-hinweise/': '/blog/hausmeisterservice-objektbetreuung-frankfurt-umgebung/',
    '/regelmaessige-objektpflege-der-schluessel-zum-werterhalt/': '/leistungen/objektpflege/',
    '/hausmeisterservice-niedernhausen/': '/einsatzgebiete/hausmeisterservice-niedernhausen/',
    '/hausmeisterservice-kelsterbach/': '/einsatzgebiete/hausmeisterservice-kelsterbach/',
  })
})

test('unsafe paths, external targets, collisions, duplicates and missing targets are rejected', () => {
  for (const change of [
    { oldPath: '/../outside/' }, { oldPath: '//evil.example/' },
    { oldPath: '/%2e%2e/outside/' }, { oldPath: '/old\\path/' },
    { newPath: 'https://evil.example/' }, { newPath: '//evil.example/' },
    { newPath: '/missing/' }, { oldPath: '/leistungen/objektpflege/' },
    { oldPath: manifest.redirects[1].oldPath },
  ]) {
    const invalid = structuredClone(manifest)
    Object.assign(invalid.redirects[0], change)
    assert.throws(() => validateLegacyRedirects(invalid, site, canonicals))
  }
})
