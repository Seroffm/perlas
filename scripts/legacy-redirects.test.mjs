import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { validateLegacyRedirects } from './prepare-legacy-redirects.mjs'

const manifest = JSON.parse(await readFile(new URL('../src/legacy-redirects.json', import.meta.url), 'utf8'))
const site = new URL('https://perlas.de/')
const services = JSON.parse(await readFile(new URL('../src/service-data.json', import.meta.url), 'utf8'))
const canonicals = ['', 'ueber-uns/', 'blog/', 'karriere/', 'facility-management/gewerbeimmobilien/', ...services.map(({ slug }) => `leistungen/${slug}/`)].map((relative) => new URL(relative, site).href)

test('nine exact old paths resolve to existing canonical content with no chains', () => {
  const redirects = validateLegacyRedirects(manifest, site, canonicals)
  assert.equal(redirects.length, 9)
  assert.equal(redirects.find(({ from }) => from.pathname === '/hausmeisterservice-bad-soden-am-taunus/').target.pathname, '/leistungen/objektpflege/')
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
