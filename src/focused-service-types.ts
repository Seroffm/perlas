import type { CommercialLandingContent } from './commercial-landing-types'

export type FocusedServiceContent = CommercialLandingContent & {
  path: `/leistungen/${string}/` | `/einsatzgebiete/${string}/`
  eyebrow: string
  parentLabel: string
}

export function isFocusedLanding(page: CommercialLandingContent): page is FocusedServiceContent {
  return page.layout === 'focused'
    && typeof page.path === 'string'
    && (page.path.startsWith('/leistungen/') || page.path.startsWith('/einsatzgebiete/'))
    && typeof page.eyebrow === 'string' && page.eyebrow.trim().length > 0
    && typeof page.parentLabel === 'string' && page.parentLabel.trim().length > 0
}
