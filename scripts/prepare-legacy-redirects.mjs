import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const safePath = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)+$/
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character])

/** Validate exact local mappings before any generated file can be overwritten. */
export function validateLegacyRedirects(manifest, site, canonicalUrls) {
  assert.equal(manifest.schemaVersion, 1)
  assert.equal(manifest.state, 'active-static-refresh')
  assert.equal(manifest.origin, site.origin, 'Legacy redirects must use the configured site origin')
  const canonical = new Set(canonicalUrls)
  const oldPaths = new Set()
  const mappings = manifest.redirects.map((redirect) => {
    assert.equal(redirect.status, 'active-static-refresh')
    assert(safePath.test(redirect.oldPath) && safePath.test(redirect.newPath), 'Only safe exact local directory paths are allowed')
    assert(!oldPaths.has(redirect.oldPath), `Duplicate legacy path: ${redirect.oldPath}`)
    oldPaths.add(redirect.oldPath)
    const from = new URL(redirect.oldPath.slice(1), site)
    const target = new URL(redirect.newPath.slice(1), site)
    assert(!canonical.has(from.href), `Cannot overwrite a canonical page: ${from.href}`)
    assert(canonical.has(target.href), `Legacy target must be an existing canonical: ${target.href}`)
    assert.notEqual(from.href, target.href, 'Self redirects are not allowed')
    return { from, target, relativeDirectory: redirect.oldPath.slice(1) }
  })
  for (const mapping of mappings) {
    assert(!oldPaths.has(`/${mapping.target.pathname.slice(site.pathname.length)}`), 'Redirect chains are not allowed')
  }
  return mappings
}

export async function prepareLegacyRedirects({ manifest, site, canonicalUrls, dist }) {
  const mappings = validateLegacyRedirects(manifest, site, canonicalUrls)
  for (const { target, relativeDirectory } of mappings) {
    const destination = escapeHtml(target.href)
    const html = `<!doctype html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=${destination}">
  <link rel="canonical" href="${destination}">
  <title>Neue Adresse | Perla’s Objektbetreuung</title>
</head>
<body>
  <main><h1>Diese Seite hat eine neue Adresse.</h1>
  <p>Sie werden direkt zum passenden aktuellen Inhalt weitergeleitet.</p>
  <p><a href="${destination}">Aktuelle Seite bei Perla’s öffnen</a></p></main>
</body>
</html>
`
    const directory = path.resolve(dist, relativeDirectory)
    assert(directory.startsWith(`${path.resolve(dist)}${path.sep}`), 'Redirect output must remain within dist')
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, 'index.html'), html, 'utf8')
  }
  return mappings.length
}
