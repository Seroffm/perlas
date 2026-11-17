import { ArrowUpRight, Mail, Phone } from 'lucide-react'
import footerLinks from './footer-links.json'
import './site-footer.css'

type FooterLink = { label: string; path: string; emphasis?: boolean }
type FooterLinkGroup = { id: string; title: string; links: FooterLink[] }
export type SiteFooterProps = { staticMode?: boolean }

const BASE_PATH = import.meta.env.BASE_URL
const groups = footerLinks.groups as FooterLinkGroup[]
const TRUSTLOCAL_URL = 'https://trustlocal.de/hessen/sulzbach/entrumpelung/perlas-objektbetreuung-gmbh-co-kg/'

function sitePath(path = '') {
  return `${BASE_PATH}${path.replace(/^\/+/, '')}`
}

export default function SiteFooter({ staticMode = false }: SiteFooterProps) {
  return (
    <footer className="sf-footer" id="seitenende" lang="de" aria-label="Kontakt und weitere Seiten">
      <div className="sf-container">
        <div className="sf-top">
          <a className="sf-logo" href={sitePath()} aria-label="Perla’s Objektbetreuung Startseite">
            <img src={sitePath('assets/perlas-logo.svg')} width={1683} height={368} alt="Perla’s Objektbetreuung" />
          </a>
          <div className="sf-intro">
            <h2>Persönlich für Ihr Objekt da.</h2>
            <p>Objektbetreuung und Reinigung aus Sulzbach für das Rhein-Main-Gebiet.</p>
          </div>
          <a className="sf-contact-cta" href={sitePath('kontakt/')}>
            Kontakt aufnehmen<ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <div className="sf-grid">
          <section className="sf-contact" aria-labelledby="sf-contact-heading">
            <h3 id="sf-contact-heading">Ihr direkter Kontakt</h3>
            <a className="sf-contact-link" href="tel:+491776867145"><Phone aria-hidden="true" /><span>0177 68 67 145</span></a>
            <a className="sf-contact-link" href="mailto:mail@perlas.de"><Mail aria-hidden="true" /><span>mail@perlas.de</span></a>
            <address>
              <span>Perla’s Objektbetreuung</span>
              <span>Hauptstraße 1</span>
              <span>65843 Sulzbach (Taunus)</span>
            </address>
            <a className="sf-profile" href={TRUSTLOCAL_URL} target="_blank" rel="noreferrer">
              Profil auf Trustlocal<ArrowUpRight aria-hidden="true" />
            </a>
            <nav className="sf-social" aria-label="Perla’s in sozialen Netzwerken">
              <a href="https://www.linkedin.com/company/97661595/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://www.instagram.com/perlas_objektbetreuung/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.youtube.com/@perlasobjektbetreuung" target="_blank" rel="noopener noreferrer">YouTube</a>
            </nav>
          </section>

          {groups.map((group) => (
            <nav className={`sf-nav sf-nav--${group.id}`} aria-labelledby={`sf-${group.id}-heading`} key={group.id}>
              <h3 id={`sf-${group.id}-heading`}>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.path}>
                    <a className={link.emphasis ? 'sf-more' : undefined} href={sitePath(link.path)}>
                      <span>{link.label}</span>{link.emphasis && <ArrowUpRight aria-hidden="true" />}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="sf-bottom">
          <p>© 2026 Perla’s Objektbetreuung GmbH &amp; Co. KG</p>
          <nav className="sf-legal" aria-label="Rechtliches und Datenschutz">
            <a href={sitePath('impressum/')}>Impressum</a>
            <a href={sitePath('datenschutz/')}>Datenschutz</a>
            {staticMode
              ? <a href={sitePath('datenschutz/#einwilligung')}>Cookies &amp; Einwilligung</a>
              : <button type="button" onClick={() => window.dispatchEvent(new Event('perlas:open-cookie-settings'))}>Cookie-Einstellungen</button>}
          </nav>
        </div>
      </div>
    </footer>
  )
}
