import { Fragment, useMemo, useState, type CSSProperties, type MouseEvent } from 'react'
import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Clock3 } from 'lucide-react'
import type { BlogPostContent } from './content-types'
import ResponsiveImage from './ResponsiveImage'

const BASE_PATH = import.meta.env.BASE_URL
const BLOG_PATH = `${BASE_PATH}blog/`
const CONTACT_PATH = `${BASE_PATH}kontakt/`
const FEATURED_POST_SLUG = 'hausmeisterservice-sulzbach-weg-leistungen'

type BlogPageProps = {
  posts: BlogPostContent[]
}

export type BlogServiceLink = {
  slug: string
  title: string
  text: string
}

export default function BlogPage({ posts }: BlogPageProps) {
  const [activeCategory, setActiveCategory] = useState('Alle')
  const categories = ['Alle', ...Array.from(new Set(posts.map((post) => post.category)))]
  const featuredPost = posts.find((post) => post.slug === FEATURED_POST_SLUG) ?? posts[0]
  const visiblePosts = useMemo(
    () => activeCategory === 'Alle' ? posts : posts.filter((post) => post.category === activeCategory),
    [activeCategory, posts],
  )

  return (
    <main className="blog-page">
      <section className="blog-hero" aria-labelledby="blog-heading">
        <div className="blog-hero-copy" data-reveal="left">
          <a className="page-breadcrumb" href={BASE_PATH}>Startseite / Blog</a>
          <span className="eyebrow">Wissen aus der Objektbetreuung</span>
          <h1 id="blog-heading">Praxiswissen für den laufenden Immobilienbetrieb.</h1>
          <p>
            Verständliche Beiträge zu Facility Management, Gebäudereinigung, Außenanlagen,
            saisonaler Planung und den Abläufen hinter einer verlässlichen Objektbetreuung.
          </p>
        </div>
        <a className="blog-featured" href={`${BLOG_PATH}${featuredPost.slug}/`} data-reveal="up">
          <span className="blog-featured-media">
            <ResponsiveImage
              asset={featuredPost.image}
              alt={featuredPost.alt}
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 767px) calc(100vw - 40px), 900px"
            />
          </span>
          <div className="blog-featured-copy">
            <span className="blog-featured-category">{featuredPost.category}</span>
            <div className="blog-featured-meta">
              <span><CalendarDays aria-hidden="true" /> Aktualisiert am {featuredPost.updated}</span>
              <span><Clock3 aria-hidden="true" /> {featuredPost.readTime}</span>
            </div>
            <h2>{featuredPost.title}</h2>
            <p>{featuredPost.excerpt}</p>
            <strong>Artikel lesen <ArrowUpRight aria-hidden="true" /></strong>
          </div>
        </a>
      </section>

      <section className="blog-index" aria-labelledby="blog-index-heading">
        <div className="blog-index-heading" data-reveal="up">
          <div>
            <span className="eyebrow">Alle Beiträge</span>
            <h2 id="blog-index-heading">Wissen, das im Alltag weiterhilft.</h2>
          </div>
          <div className="blog-filters" role="group" aria-label="Blogbeiträge nach Kategorie filtern">
            {categories.map((category) => (
              <button
                className={category === activeCategory ? 'is-active' : ''}
                type="button"
                aria-pressed={category === activeCategory}
                onClick={() => setActiveCategory(category)}
                key={category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="blog-grid" aria-live="polite">
          {visiblePosts.map((post, index) => (
            <article className="blog-card" data-reveal="up" style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties} key={post.slug}>
              <a className="blog-card-image" href={`${BLOG_PATH}${post.slug}/`}>
                <ResponsiveImage
                  asset={post.image}
                  alt={post.alt}
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1100px) 50vw, 380px"
                />
                <span>{post.category}</span>
              </a>
              <div className="blog-card-copy">
                <div className="blog-meta">
                  <span><CalendarDays aria-hidden="true" /> Aktualisiert am {post.updated}</span>
                  <span><Clock3 aria-hidden="true" /> {post.readTime}</span>
                </div>
                <h3><a href={`${BLOG_PATH}${post.slug}/`}>{post.title}</a></h3>
                <p>{post.excerpt}</p>
                <a className="blog-card-link" href={`${BLOG_PATH}${post.slug}/`}>
                  Weiterlesen <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="blog-contact" data-reveal="up">
        <BookOpen aria-hidden="true" />
        <div>
          <span className="eyebrow">Ihr Thema fehlt?</span>
          <h2>Fragen zu Ihrem Objekt klären wir persönlich.</h2>
          <p>Beschreiben Sie kurz die Immobilie und die Aufgabe, für die Sie eine Lösung suchen.</p>
        </div>
        <a className="button button--outline-light" href={CONTACT_PATH}>
          Kontakt aufnehmen <ArrowUpRight aria-hidden="true" />
        </a>
      </section>
    </main>
  )
}

export function BlogArticlePage({
  post,
  relatedPosts,
  services,
  onQuoteOpen,
}: {
  post: BlogPostContent
  relatedPosts: BlogPostContent[]
  services: BlogServiceLink[]
  onQuoteOpen?: () => void
}) {
  const cta = post.cta ?? {
    title: 'Den Bedarf Ihrer Immobilie persönlich klären.',
    text: 'Nennen Sie uns Standort, Objektart und gewünschten Umfang. Gemeinsam klären wir die passende Leistung.',
    label: 'Unverbindlich anfragen',
  }
  const requestQuote = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onQuoteOpen) return
    event.preventDefault()
    onQuoteOpen()
  }
  const matchingServices = post.relatedServices
    .map((slug) => services.find((service) => service.slug === slug))
    .filter((service): service is BlogServiceLink => Boolean(service))
  const relevantPosts = [...relatedPosts].sort((a, b) => {
    const score = (entry: BlogPostContent) => entry.relatedServices.filter((slug) => post.relatedServices.includes(slug)).length + Number(entry.category === post.category)
    return score(b) - score(a)
  }).slice(0, 2)

  return (
    <main className="blog-article-page">
      <article>
        <header className="blog-article-hero">
          <div className="blog-article-hero-copy" data-reveal="left">
            <nav className="page-breadcrumb" aria-label="Brotkrümeln">
              <a href={BASE_PATH}>Startseite</a> / <a href={BLOG_PATH}>Blog</a> / {post.category}
            </nav>
            <span className="eyebrow">{post.category}</span>
            <h1>{post.title}</h1>
            <p>{post.intro}</p>
            <div className="blog-meta">
              <span><CalendarDays aria-hidden="true" /> Veröffentlicht am <time dateTime={(post.published ?? '31.08.2026').split('.').reverse().join('-')}>{post.published ?? '31.08.2026'}</time></span>
              <span><Clock3 aria-hidden="true" /> {post.readTime}</span>
            </div>
            <p className="blog-byline">Von <a href={`${BASE_PATH}ueber-uns/`}>Perla’s Objektbetreuung</a> · Aktualisiert am <time dateTime={post.updated.split('.').reverse().join('-')}>{post.updated}</time></p>
            <a className="button button--yellow blog-hero-cta" href={CONTACT_PATH} onClick={requestQuote}>{cta.label} <ArrowUpRight aria-hidden="true" /></a>
          </div>
          <figure data-reveal="right">
            <ResponsiveImage
              asset={post.image}
              alt={post.alt}
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 767px) calc(100vw - 40px), 900px"
            />
          </figure>
        </header>

        <div className="blog-article-layout">
          <aside>
            <a href={BLOG_PATH}><ArrowLeft aria-hidden="true" /> Alle Beiträge</a>
            <strong>In diesem Beitrag</strong>
            <ol>
              {post.sections.map((section, index) => (
                <li key={section.title}><a href={`#abschnitt-${index + 1}`}>{section.title}</a></li>
              ))}
            </ol>
          </aside>
          <div className="blog-article-content">
            {post.takeaways && (
              <section className="blog-takeaways" aria-labelledby="blog-takeaways-heading">
                <h2 id="blog-takeaways-heading">Das Wichtigste vorab</h2>
                <ul>{post.takeaways.map((point) => <li key={point}>{point}</li>)}</ul>
              </section>
            )}
            {post.sections.map((section, index) => (
              <section id={`abschnitt-${index + 1}`} key={section.title}>
                <span>0{index + 1}</span>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.points && (
                  <ul>
                    {section.points.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                )}
                {section.table && (
                  <Fragment>
                  <p className="blog-table-hint">Tabelle bei Bedarf seitlich scrollen.</p>
                  <div className="blog-table-wrap" tabIndex={0} role="region" aria-label={`Tabelle: ${section.title}`}>
                    <table>
                      <caption>{section.title} – Übersicht</caption>
                      <thead><tr>{section.table.headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
                      <tbody>
                        {section.table.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => cellIndex === 0
                              ? <th scope="row" key={cellIndex}>{cell}</th>
                              : <td key={cellIndex}>{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </Fragment>
                )}
              </section>
            ))}
            {post.faqs && (
              <section id="fragen" className="blog-faqs" aria-labelledby="blog-faq-heading">
                <h2 id="blog-faq-heading">Häufige Fragen</h2>
                {post.faqs.map((faq) => (
                  <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>
                ))}
              </section>
            )}
            {post.sources && (
              <section className="blog-sources" aria-labelledby="blog-sources-heading">
                <h2 id="blog-sources-heading">Quellen & weiterführende Hinweise</h2>
                <ul>
                  {post.sources.map((source) => (
                    <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </article>

      <section className="blog-article-cta">
        <BookOpen aria-hidden="true" />
        <div>
          <span className="eyebrow">Ihr nächster Schritt</span>
          <h2>{cta.title}</h2>
          <p>{cta.text}</p>
        </div>
        <div className="blog-cta-actions">
          <a className="button button--outline-light" href={CONTACT_PATH} onClick={requestQuote}>
            {cta.label} <ArrowUpRight aria-hidden="true" />
          </a>
          <a href="tel:+491776867145">Oder anrufen: 0177 68 67 145</a>
        </div>
      </section>

      <section className="blog-related" aria-labelledby="blog-related-heading">
        <div>
          <span className="eyebrow">Weiterlesen</span>
          <h2 id="blog-related-heading">Weitere Beiträge.</h2>
        </div>
        <div className="blog-related-grid">
          {relevantPosts.map((related) => (
            <a href={`${BLOG_PATH}${related.slug}/`} key={related.slug}>
              <ResponsiveImage
                asset={related.image}
                alt=""
                sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1100px) 50vw, 380px"
              />
              <span>{related.category}</span>
              <h3>{related.title}</h3>
              <strong>Beitrag lesen <ArrowUpRight aria-hidden="true" /></strong>
            </a>
          ))}
        </div>
      </section>

      <section className="blog-article-services" aria-labelledby="blog-article-services-heading">
        <div>
          <span className="eyebrow">Passende Leistungen</span>
          <h2 id="blog-article-services-heading">Das passt zu diesem Thema.</h2>
          <p>Diese konkreten Leistungen können den beschriebenen Bedarf an Ihrer Immobilie abdecken.</p>
        </div>
        <div className="blog-article-services-grid">
          {matchingServices.map((service) => (
            <a href={`${BASE_PATH}leistungen/${service.slug}/`} key={service.slug}>
              <span>Leistung</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <strong>Leistung ansehen <ArrowUpRight aria-hidden="true" /></strong>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}

