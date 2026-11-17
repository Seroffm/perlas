export type CommercialLandingImage = {
  src: string
  alt: string
  position?: string
  caption?: string
}

export type CommercialLandingContent = {
  slug: string
  layout?: 'focused'
  path?: `/leistungen/${string}/` | `/einsatzgebiete/${string}/`
  eyebrow?: string
  parentLabel?: string
  serviceSlug: string
  locality: string
  region?: string
  guideSlugs?: string[]
  primaryKeyword?: string
  seoTitle: string
  seoDescription: string
  heading: string
  heroPromise?: string
  heroHighlights?: string[]
  intro: string
  ctaText: string
  updatedOn: string
  heroImage: CommercialLandingImage
  scopeTitle: string
  scopeIntro: string
  scopeCards: Array<{ title: string; text: string; items: string[] }>
  planning: {
    title: string
    intro: string
    headers: string[]
    rows: string[][]
    note?: string
  }
  detail: {
    title: string
    text: string
    image: CommercialLandingImage
    points: string[]
  }
  processSteps: Array<{ title: string; text: string }>
  cost: { title: string; text: string; factors: string[] }
  faqs: Array<{ question: string; answer: string }>
  inquiry: { title: string; text: string; checklist: string[]; topic?: string }
  serviceAreaText: string
  relatedLinks: Array<{ label: string; path: string }>
}
