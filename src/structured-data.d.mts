export type StructuredDataNode = Record<string, unknown> & { '@type': string; '@id': string }

export type PageStructuredDataOptions = {
  siteUrl: string | URL
  pageUrl?: string | URL
  title: string
  description: string
  imageUrl?: string | URL
  pageType?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage'
  areaServed: readonly string[]
  modified?: string
  breadcrumbs?: ReadonlyArray<{ name: string; url: string | URL }>
  service?: {
    name: string
    description: string
    areaServed: readonly string[] | { '@type': 'Place'; name: string }
    audienceType?: string
  }
  article?: {
    headline: string
    datePublished: string
    dateModified: string
    image: string | URL
  }
}

export function buildPageStructuredData(options: PageStructuredDataOptions): {
  '@context': 'https://schema.org'
  '@graph': StructuredDataNode[]
}
