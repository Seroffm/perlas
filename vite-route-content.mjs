import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const publicId = 'virtual:perlas-route-content'
const resolvedId = `\0${publicId}`
const dataPrefix = 'virtual:perlas-route-data/'
const catalogueId = 'virtual:perlas-catalogue'
const sourceFiles = {
  posts: 'blog-data.json',
  jobs: 'job-data.json',
  local: 'local-landing-data.json',
  commercial: 'commercial-landing-data.json',
  focused: 'focused-service-data.json',
  services: 'service-data.json',
  audiences: 'audience-data.json',
  imprint: 'imprint-content.json',
  privacy: 'privacy-content.json',
}

const pick = (value, keys) => Object.fromEntries(keys.map(key => [key, value[key]]))
const postSummary = post => pick(post, ['slug', 'title', 'category', 'relatedServices', 'excerpt', 'image', 'alt', 'readTime', 'updated'])
const regionalSummary = page => pick(page, ['slug', 'serviceSlug', 'heading', 'locality', 'scopeIntro', 'heroImage', 'ctaText'])
const focusedSummary = page => pick(page, ['slug', 'serviceSlug', 'path', 'eyebrow', 'heading', 'heroPromise'])

export function readContentSources(root = process.cwd()) {
  return Object.fromEntries(Object.entries(sourceFiles).map(([key, filename]) => [key,
    JSON.parse(readFileSync(resolve(root, 'src', filename), 'utf8')),
  ]))
}

export function contentRoutes(sources) {
  return [
    '/', '/kontakt/', '/facility-management/', '/leistungen/', '/ueber-uns/',
    '/blog/', '/karriere/', '/impressum/', '/datenschutz/', '/einsatzgebiete/',
    ...sources.services.map(page => `/leistungen/${page.slug}/`),
    ...sources.audiences.map(page => `/facility-management/${page.id}/`),
    ...sources.posts.map(page => `/blog/${page.slug}/`),
    ...sources.local.map(page => `/einsatzgebiete/${page.slug}/`),
    ...sources.commercial.map(page => `/einsatzgebiete/${page.slug}/`),
    ...sources.focused.map(page => page.path),
  ]
}

export function contentCatalogue(sources) {
  return {
    services: sources.services.map(page => pick(page, ['slug', 'title', 'text', 'image'])),
    audiences: sources.audiences.map(page => pick(page, ['id', 'title', 'navLabel', 'text', 'requirements', 'approach', 'services', 'image'])),
  }
}

/** Browser payloads use the original content sources; unrelated full texts stay out. */
export function routePayload(path, sources) {
  const local = sources.local.find(page => path === `/einsatzgebiete/${page.slug}/`)
  const commercial = sources.commercial.find(page => path === `/einsatzgebiete/${page.slug}/`)
  const focused = sources.focused.find(page => path === page.path)
  const post = sources.posts.find(page => path === `/blog/${page.slug}/`)
  const service = sources.services.find(page => path === `/leistungen/${page.slug}/`)
  const audience = sources.audiences.find(page => path === `/facility-management/${page.id}/`)
  const regional = [...sources.local, ...sources.commercial]
  let view = 'standard'
  if (focused || commercial?.layout === 'focused') view = 'focused'
  else if (commercial) view = 'commercial'
  else if (local?.slug === 'hausmeisterservice-frankfurt') view = 'frankfurt'
  else if (local) view = 'local'
  else if (post) view = 'article'
  else if (path === '/einsatzgebiete/') view = 'regions'
  else if (path === '/kontakt/') view = 'contact'
  else if (path === '/blog/') view = 'blog'
  else if (path === '/karriere/') view = 'career'

  const guideSlugs = local?.guideSlugs ?? service?.guideSlugs ?? []
  const posts = path === '/blog/' || post
    ? sources.posts
    : sources.posts.filter(page => guideSlugs.includes(page.slug))
  return {
    path,
    view,
    blogPosts: posts.map(postSummary),
    jobOpenings: path === '/karriere/' ? sources.jobs : [],
    regionalLandings: (path === '/einsatzgebiete/' ? regional : service
      ? regional.filter(page => page.serviceSlug === service.slug) : []).map(regionalSummary),
    focusedServices: (path === '/leistungen/' ? sources.focused : service
      ? sources.focused.filter(page => page.serviceSlug === service.slug) : []).map(focusedSummary),
    localOffers: post ? regional.filter(page => page.guideSlugs?.includes(post.slug)).map(regionalSummary) : [],
    ...(post ? { activeBlogPost: post } : {}),
    ...(local ? { activeLocalLanding: local } : {}),
    ...(commercial ? { activeCommercialLanding: commercial } : {}),
    ...(focused ? { activeFocusedService: focused } : {}),
    ...(service ? { activeService: service } : {}),
    ...(audience ? { activeAudience: audience } : {}),
    ...(path === '/impressum/' ? { imprint: sources.imprint } : {}),
    ...(path === '/datenschutz/' ? { privacy: sources.privacy } : {}),
  }
}

export default function routeContentPlugin() {
  let root = process.cwd()
  const read = () => readContentSources(root)
  return {
    name: 'perlas-route-content',
    configResolved(config) { root = config.root },
    resolveId(id) {
      if (id === publicId || id === catalogueId || id.startsWith(dataPrefix)) return `\0${id}`
    },
    load(id) {
      if (id !== resolvedId && id !== `\0${catalogueId}` && !id.startsWith(`\0${dataPrefix}`)) return
      Object.values(sourceFiles).forEach(filename => this.addWatchFile(resolve(root, 'src', filename)))
      const sources = read()
      if (id === `\0${catalogueId}`) {
        const catalogue = contentCatalogue(sources)
        return `export const services = ${JSON.stringify(catalogue.services)};\nexport const audiences = ${JSON.stringify(catalogue.audiences)};`
      }
      if (id === resolvedId) {
        const entries = contentRoutes(sources).map(path => `${JSON.stringify(path)}: () => import(${JSON.stringify(`${dataPrefix}${encodeURIComponent(path)}`)})`)
        const empty = routePayload('/not-found/', sources)
        return `const routes = {${entries.join(',\n')}};
export function loadRouteContent(path) {
  const load = routes[path];
  return load ? load().then(module => module.default) : Promise.resolve({...${JSON.stringify(empty)}, path});
}`
      }
      const path = decodeURIComponent(id.slice(`\0${dataPrefix}`.length))
      if (!contentRoutes(sources).includes(path)) return
      return `export default ${JSON.stringify(routePayload(path, sources))};`
    },
    handleHotUpdate(context) {
      if (!Object.values(sourceFiles).some(filename => context.file === resolve(root, 'src', filename))) return
      // Content is injected into route modules. Reload rather than retaining stale props.
      context.server.moduleGraph.invalidateAll()
      context.server.ws.send({ type: 'full-reload' })
      return []
    },
  }
}
