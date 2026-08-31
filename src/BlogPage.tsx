import { useMemo, useState, type CSSProperties } from 'react'
import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Clock3 } from 'lucide-react'
import type { BlogPostContent } from './content-types'

const BASE_PATH = import.meta.env.BASE_URL
const ASSETS_PATH = `${BASE_PATH}assets/`
const BLOG_PATH = `${BASE_PATH}blog/`
const CONTACT_PATH = `${BASE_PATH}kontakt/`

type BlogPageProps = {
  posts: BlogPostContent[]
}

export default function BlogPage({ posts }: BlogPageProps) {
  const [activeCategory, setActiveCategory] = useState('Alle')
  const categories = ['Alle', ...Array.from(new Set(posts.map((post) => post.category)))]
  const featuredPost = posts[0]
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
        <a className="blog-featured" href={`${BLOG_PATH}${featuredPost.slug}/`} data-reveal="right">
          <img src={`${ASSETS_PATH}${featuredPost.image}`} alt={featuredPost.alt} />
          <span className="blog-featured-overlay" />
          <div>
            <span>{featuredPost.category}</span>
            <h2>{featuredPost.title}</h2>
            <p>{featuredPost.excerpt}</p>
            <strong>Beitrag lesen <ArrowUpRight aria-hidden="true" /></strong>
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
                <img src={`${ASSETS_PATH}${post.image}`} alt={post.alt} loading="lazy" decoding="async" />
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

export function BlogArticlePage({ post, relatedPosts }: { post: BlogPostContent; relatedPosts: BlogPostContent[] }) {
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
              <span><CalendarDays aria-hidden="true" /> Aktualisiert am {post.updated}</span>
              <span><Clock3 aria-hidden="true" /> {post.readTime}</span>
            </div>
          </div>
          <figure data-reveal="right">
            <img src={`${ASSETS_PATH}${post.image}`} alt={post.alt} />
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
              </section>
            ))}
          </div>
        </div>
      </article>

      <section className="blog-related" aria-labelledby="blog-related-heading">
        <div>
          <span className="eyebrow">Weiterlesen</span>
          <h2 id="blog-related-heading">Weitere Beiträge.</h2>
        </div>
        <div className="blog-related-grid">
          {relatedPosts.slice(0, 2).map((related) => (
            <a href={`${BLOG_PATH}${related.slug}/`} key={related.slug}>
              <img src={`${ASSETS_PATH}${related.image}`} alt="" loading="lazy" />
              <span>{related.category}</span>
              <h3>{related.title}</h3>
              <strong>Beitrag lesen <ArrowUpRight aria-hidden="true" /></strong>
            </a>
          ))}
        </div>
      </section>

      <section className="blog-article-cta" data-reveal="up">
        <div>
          <span className="eyebrow">Konkreten Bedarf besprechen</span>
          <h2>Was braucht Ihre Immobilie?</h2>
          <p>Wir ordnen Aufgaben, Zuständigkeiten und sinnvolle Intervalle gemeinsam mit Ihnen ein.</p>
        </div>
        <a className="button button--outline-light" href={CONTACT_PATH}>Kontakt aufnehmen <ArrowUpRight aria-hidden="true" /></a>
      </section>
    </main>
  )
}

