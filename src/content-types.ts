export type BlogSection = {
  title: string
  paragraphs: string[]
  points?: string[]
  table?: { headers: string[]; rows: string[][] }
}

export type BlogPostContent = {
  slug: string
  title: string
  category: string
  relatedServices: string[]
  excerpt: string
  seoTitle: string
  seoDescription: string
  image: string
  alt: string
  readTime: string
  updated: string
  published?: string
  takeaways?: string[]
  faqs?: { question: string; answer: string }[]
  sources?: { title: string; url: string }[]
  cta?: { title: string; text: string; label: string }
  intro: string
  sections: BlogSection[]
}

export type JobOpeningContent = {
  id: string
  title: string
  department: string
  location: string
  type: string
  intro: string
  tasks: string[]
  requirements: string[]
}

export type LocalLandingContent = {
  slug: string
  serviceSlug: string
  locality: string
  region: string
  seoTitle: string
  seoDescription: string
  heading: string
  intro: string
  heroImage: { src: string; alt: string; position?: string }
  audience: string
  scopeIntro: string
  scopeCards: Array<{ title: string; text: string; items: string[] }>
  processSteps: Array<{ title: string; text: string }>
  costTitle: string
  costText: string
  faqs: Array<{ question: string; answer: string }>
  guideSlugs: string[]
  updatedOn: string
  ctaText: string
}

