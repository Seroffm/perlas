import type { CommercialLandingContent } from './commercial-landing-types'

export type FocusedServiceContent = CommercialLandingContent & {
  path: `/leistungen/${string}/`
  eyebrow: string
  parentLabel: string
}
