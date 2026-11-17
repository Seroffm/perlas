import type serviceData from './service-data.json'

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

export type BlogPostSummary = Pick<BlogPostContent,
  'slug' | 'title' | 'category' | 'relatedServices' | 'excerpt' | 'image' | 'alt' | 'readTime' | 'updated'>

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

export type RegionalLandingSummary = Pick<LocalLandingContent,
  'slug' | 'serviceSlug' | 'heading' | 'locality' | 'scopeIntro' | 'heroImage' | 'ctaText'>

export type ServiceContent = (typeof serviceData)[number]
export type ServiceSummary = Pick<ServiceContent, 'slug' | 'title' | 'text' | 'image'>

export type AudienceContent = {
  id: string
  title: string
  navLabel: string
  text: string
  seoTitle: string
  seoDescription: string
  heroTitle: string
  heroText: string
  introTitle: string
  introText: string
  requirements: string[]
  approach: string
  services: string[]
  image: { src: string; alt: string; position?: string }
  detailImage?: { src: string; alt: string; position?: string }
  scopeCards: Array<{ title: string; text: string }>
  process: Array<{ title: string; text: string }>
  faqs: Array<{ question: string; answer: string }>
}

export type AudienceSummary = Pick<AudienceContent,
  'id' | 'title' | 'navLabel' | 'text' | 'requirements' | 'approach' | 'services' | 'image'>
