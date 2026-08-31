export type BlogSection = {
  title: string
  paragraphs: string[]
  points?: string[]
}

export type BlogPostContent = {
  slug: string
  title: string
  category: string
  excerpt: string
  seoTitle: string
  seoDescription: string
  image: string
  alt: string
  readTime: string
  updated: string
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

