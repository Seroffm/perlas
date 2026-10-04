// Read-only checks for the published static output, independent of JavaScript rendering.
import { readFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'
import { loadEnv } from 'vite'

const workspace = fileURLToPath(new URL('../', import.meta.url))
const dist = path.join(workspace, 'dist')
const env = loadEnv('production', workspace, '')
const site = new URL(env.PERLAS_SITE_URL ?? 'https://seroffm.github.io/perlas/')
if (!site.pathname.endsWith('/')) site.pathname += '/'
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8')
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]))
assert(urls.length > 20, 'The sitemap must include all published detail pages')
const pages = new Map()
const titles = new Set()
const descriptions = new Set()
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)=["']([^"']*)["']/g)].map((match) => [match[1], match[2]]))
const markup = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map((match) => attributes(match[0]))
const fileForUrl = (url) => {
  const relative = decodeURIComponent(url.pathname.slice(site.pathname.length))
  return path.join(dist, relative, relative.endsWith('/') || !relative ? 'index.html' : '')
}

for (const url of urls) {
  assert.equal(url.origin, site.origin, `Sitemap origin: ${url}`)
  const html = await readFile(fileForUrl(url), 'utf8')
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]
  const description = markup(html, 'meta').find((meta) => meta.name === 'description')?.content
  const canonical = markup(html, 'link').filter((link) => link.rel === 'canonical')
  assert(title && !titles.has(title), `Missing or duplicated title: ${url}`)
  assert(description && !descriptions.has(description), `Missing or duplicated description: ${url}`)
  titles.add(title)
  descriptions.add(description)
  assert.equal(canonical.length, 1, `One canonical required: ${url}`)
  assert.equal(canonical[0].href, url.href, `Canonical differs from sitemap: ${url}`)
  assert.equal(markup(html, 'meta').find((meta) => meta.property === 'og:url')?.content, url.href)
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `One H1 required: ${url}`)
  assert(html.includes('class="seo-static-footer"'), `Static footer absent: ${url}`)
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? ''
  assert(main.replace(/<[^>]*>/g, '').trim().length > 300, `Empty initial page: ${url}`)
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]))
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1])
  const links = markup(html, 'a').map((link) => link.href).filter(Boolean)
  assert(links.includes(`${site.pathname}impressum/`), `Impressum link absent: ${url}`)
  assert(links.includes(`${site.pathname}datenschutz/`), `Privacy link absent: ${url}`)
  pages.set(url.href, { html, ids, links })
  for (const image of markup(html, 'img')) {
    if (image.src?.includes('/optimized/')) {
      assert(image.width && image.height && image.srcset && image.sizes, `Responsive attributes absent: ${url}`)
      assert(['lazy', 'eager'].includes(image.loading), `Image loading mode absent: ${url}`)
      for (const candidate of [image.src, ...image.srcset.split(', ').map((entry) => entry.split(' ')[0])]) {
        const imageUrl = new URL(candidate, url)
        assert.equal(imageUrl.origin, site.origin)
        await access(path.join(dist, decodeURIComponent(imageUrl.pathname.slice(site.pathname.length))))
      }
    }
  }
}

for (const [pageUrl, page] of pages) {
  for (const href of page.links) {
    const target = new URL(href, pageUrl)
    if (target.origin !== site.origin || !target.pathname.startsWith(site.pathname)) continue
    const hash = decodeURIComponent(target.hash.slice(1))
    target.hash = ''
    target.search = ''
    if (pages.has(target.href)) {
      if (hash) assert(pages.get(target.href).ids.has(hash), `Broken fragment: ${pageUrl} -> ${href}`)
    } else {
      await access(fileForUrl(target)).catch(() => { throw new Error(`Broken internal link: ${pageUrl} -> ${href}`) })
    }
  }
}

const home = pages.get(site.href).html
assert(!/<iframe\b[^>]*src=["'][^"']*youtube/i.test(home), 'YouTube must not load before consent')
assert(/fetchpriority="high"/.test(home), 'The first hero image needs priority')
assert(!/<img\b[^>]*src=["'][^"']*kundenbilder\//.test(home), 'Home photos must use optimized variants')
const notFound = await readFile(path.join(dist, '404.html'), 'utf8')
assert(markup(notFound, 'meta').some((meta) => meta.name === 'robots' && meta.content.includes('noindex')))
assert(!markup(notFound, 'link').some((link) => link.rel === 'canonical'))
console.log(`SEO build checks passed: ${urls.length} pages, unique metadata, canonical/OG URLs, visible initial HTML, static navigation, internal links, responsive assets and 404.`)
