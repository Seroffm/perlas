/** Normalize the site's documented HTML aliases, without accepting arbitrary paths. */
export function getPagePath(pathname: string, basePath: string) {
  const base = basePath.replace(/\/$/, '')
  const path = base && (pathname === base || pathname.startsWith(`${base}/`))
    ? pathname.slice(base.length) || '/'
    : pathname
  const withoutIndex = path.replace(/\/index\.html$/, '/')
  return `${withoutIndex.replace(/\/+$/, '')}/`
}

/** Ignore malformed external fragments; valid encoded section IDs still work. */
export function getHashTarget(hash: string) {
  try { return decodeURIComponent(hash.replace(/^#/, '')) || undefined }
  catch { return undefined }
}
