import type { AudienceContent, BlogPostContent, BlogPostSummary, JobOpeningContent, LocalLandingContent, RegionalLandingSummary, ServiceContent } from './content-types'
import type { CommercialLandingContent } from './commercial-landing-types'
import type { FocusedServiceContent } from './focused-service-types'

export type FocusedServiceSummary = Pick<FocusedServiceContent, 'slug' | 'serviceSlug' | 'path' | 'eyebrow' | 'heading' | 'heroPromise'>

export type ImprintBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'details'; items: Array<{ label: string; value: string }> }
  | { type: 'address'; heading: string; company: string; address: string; phone: string; phoneHref: string; email: string }

export type ImprintContent = {
  lead: string
  sections: Array<{ id: string; title: string; blocks: ImprintBlock[] }>
}

export type PrivacyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'link'; text: string; href: string }
  | { type: 'contact'; company: string; address: string; phone: string; phoneHref: string; email: string }

export type PrivacyContent = {
  updated: string
  lead: string
  sections: Array<{ id: string; title: string; blocks: PrivacyBlock[] }>
}

export type RouteContent = {
  path: string
  view: 'standard' | 'focused' | 'commercial' | 'frankfurt' | 'local' | 'article' | 'regions' | 'contact' | 'blog' | 'career'
  blogPosts: BlogPostSummary[]
  jobOpenings: JobOpeningContent[]
  regionalLandings: RegionalLandingSummary[]
  focusedServices: FocusedServiceSummary[]
  localOffers: RegionalLandingSummary[]
  activeService?: ServiceContent
  activeAudience?: AudienceContent
  activeBlogPost?: BlogPostContent
  activeLocalLanding?: LocalLandingContent
  activeCommercialLanding?: CommercialLandingContent
  activeFocusedService?: FocusedServiceContent
  imprint?: ImprintContent
  privacy?: PrivacyContent
}
