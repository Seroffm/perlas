import { useRef, useState, type CSSProperties, type FormEvent } from 'react'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { careerApplicationMailto, submitCareerApplication } from './backend'
import type { JobOpeningContent } from './content-types'

const BASE_PATH = import.meta.env.BASE_URL
const ASSETS_PATH = `${BASE_PATH}assets/`
const PRIVACY_PATH = `${BASE_PATH}datenschutz/`

type CareerPageProps = {
  jobs: JobOpeningContent[]
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'email' | 'error'

export default function CareerPage({ jobs }: CareerPageProps) {
  const [selectedRole, setSelectedRole] = useState('Initiativbewerbung')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [feedback, setFeedback] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const chooseRole = (role: string) => {
    setSelectedRole(role)
    window.requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const file = formData.get('attachment')
    const attachment = file instanceof File && file.size > 0 ? file : undefined

    if (attachment && attachment.size > 5 * 1024 * 1024) {
      setStatus('error')
      setFeedback('Die ausgewählte Datei ist größer als 5 MB. Bitte wählen Sie eine kleinere Datei.')
      return
    }

    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      role: String(formData.get('role') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
      file: attachment,
    }

    setStatus('submitting')
    setFeedback('')

    try {
      const result = await submitCareerApplication(payload)

      if (result.mode === 'email') {
        setStatus('email')
        setFeedback('Ihr E-Mail-Programm wird mit den eingetragenen Angaben geöffnet.')
        window.location.href = careerApplicationMailto(payload)
        return
      }

      setStatus('success')
      setFeedback('Vielen Dank. Ihre Bewerbung wurde erfolgreich übermittelt.')
      form.reset()
      setSelectedRole('Initiativbewerbung')
    } catch {
      setStatus('error')
      setFeedback('Die Übermittlung war nicht möglich. Bitte senden Sie Ihre Bewerbung direkt an mail@perlas.de.')
    }
  }

  return (
    <main className="career-page">
      <section className="career-hero" aria-labelledby="career-heading">
        <div className="career-hero-copy" data-reveal="left">
          <a className="page-breadcrumb" href={BASE_PATH}>Startseite / Karriere</a>
          <span className="eyebrow">Mitarbeiter gesucht</span>
          <h1 id="career-heading">Gute Objektbetreuung entsteht im Team.</h1>
          <p>
            Wir suchen zuverlässige Menschen, die gerne praktisch arbeiten, Verantwortung übernehmen
            und unsere Kunden im Rhein-Main-Gebiet freundlich unterstützen.
          </p>
          <div className="button-row">
            <a className="button button--yellow" href="#stellen">Offene Bereiche ansehen <ArrowUpRight aria-hidden="true" /></a>
            <a className="button button--outline" href="#bewerbung">Initiativ bewerben</a>
          </div>
        </div>
        <figure className="career-hero-image" data-reveal="right">
          <img src={`${ASSETS_PATH}perlas-team.png`} alt="Team von Perla’s Objektbetreuung vor einer betreuten Wohnanlage" />
          <figcaption><Users aria-hidden="true" /><span><strong>Gemeinsam anpacken</strong><small>Persönlich, zuverlässig und nah am Objekt</small></span></figcaption>
        </figure>
      </section>

      <section className="career-values" aria-labelledby="career-values-heading">
        <div className="career-section-heading" data-reveal="up">
          <span className="eyebrow">Arbeiten bei Perla’s</span>
          <h2 id="career-values-heading">Was uns in der Zusammenarbeit wichtig ist.</h2>
        </div>
        <div className="career-value-grid">
          {[
            [HeartHandshake, 'Verlässlichkeit', 'Absprachen gelten. Im Team und gegenüber unseren Kunden.'],
            [ShieldCheck, 'Verantwortung', 'Wir gehen sorgfältig mit Immobilien, Ausstattung und Informationen um.'],
            [Users, 'Direkte Abstimmung', 'Kurze Wege und persönliche Ansprechpartner erleichtern den Arbeitsalltag.'],
          ].map(([Icon, title, text], index) => {
            const ValueIcon = Icon as typeof Users
            return (
              <article data-reveal="up" style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties} key={String(title)}>
                <ValueIcon aria-hidden="true" />
                <h3>{String(title)}</h3>
                <p>{String(text)}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="career-jobs" id="stellen" aria-labelledby="career-jobs-heading">
        <div className="career-section-heading" data-reveal="up">
          <span className="eyebrow">Einsatzbereiche</span>
          <h2 id="career-jobs-heading">Hier suchen wir Verstärkung.</h2>
          <p>Die genaue Einsatzplanung und der mögliche Umfang werden persönlich abgestimmt.</p>
        </div>
        <div className="career-job-list">
          {jobs.map((job, index) => (
            <article data-reveal="up" style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties} key={job.id}>
              <div className="career-job-number">0{index + 1}</div>
              <div className="career-job-main">
                <span>{job.department}</span>
                <h3>{job.title}</h3>
                <p>{job.intro}</p>
                <div className="career-job-meta">
                  <span><MapPin aria-hidden="true" /> {job.location}</span>
                  <span><BriefcaseBusiness aria-hidden="true" /> {job.type}</span>
                </div>
              </div>
              <details>
                <summary>Aufgaben &amp; Voraussetzungen</summary>
                <div>
                  <strong>Typische Aufgaben</strong>
                  <ul>{job.tasks.map((task) => <li key={task}>{task}</li>)}</ul>
                  <strong>Das ist uns wichtig</strong>
                  <ul>{job.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
                </div>
              </details>
              <button type="button" onClick={() => chooseRole(job.title)}>Für diesen Bereich bewerben <ArrowUpRight aria-hidden="true" /></button>
            </article>
          ))}
        </div>
      </section>

      <section className="career-application" id="bewerbung" aria-labelledby="career-application-heading">
        <div className="career-application-copy" data-reveal="left">
          <span className="eyebrow">Kurzbewerbung</span>
          <h2 id="career-application-heading">Lernen wir uns kennen.</h2>
          <p>
            Schicken Sie uns Ihre wichtigsten Kontaktdaten und den gewünschten Einsatzbereich.
            Ein Lebenslauf ist hilfreich, für den ersten Kontakt aber nicht zwingend erforderlich.
          </p>
          <ul>
            <li><CheckCircle2 aria-hidden="true" /> Direkter Kontakt mit Perla’s</li>
            <li><CheckCircle2 aria-hidden="true" /> Einsatzmöglichkeiten im Rhein-Main-Gebiet</li>
            <li><CheckCircle2 aria-hidden="true" /> Persönliche Abstimmung der nächsten Schritte</li>
          </ul>
          <a href="mailto:mail@perlas.de?subject=Bewerbung%20bei%20Perla%27s">Oder direkt an mail@perlas.de schreiben <ArrowUpRight aria-hidden="true" /></a>
        </div>

        <form className="career-form" ref={formRef} onSubmit={handleSubmit} data-reveal="right">
          <div className="career-form-heading">
            <FileText aria-hidden="true" />
            <div><span>Bewerbung vorbereiten</span><strong>Wenige Angaben genügen für den ersten Kontakt.</strong></div>
          </div>
          <div className="career-form-grid">
            <label>
              <span>Name *</span>
              <input type="text" name="name" autoComplete="name" required />
            </label>
            <label>
              <span>E-Mail *</span>
              <input type="email" name="email" autoComplete="email" required />
            </label>
            <label>
              <span>Telefon</span>
              <input type="tel" name="phone" autoComplete="tel" />
            </label>
            <label>
              <span>Gewünschter Bereich *</span>
              <select name="role" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} required>
                <option>Initiativbewerbung</option>
                {jobs.map((job) => <option key={job.id}>{job.title}</option>)}
              </select>
            </label>
            <label className="career-form-wide">
              <span>Kurze Nachricht *</span>
              <textarea name="message" rows={5} placeholder="Erzählen Sie uns kurz etwas über Ihre Erfahrung und Ihren gewünschten Einsatzbereich." required />
            </label>
            <label className="career-form-wide career-file-field">
              <span>Lebenslauf oder Unterlagen (optional, max. 5 MB)</span>
              <input type="file" name="attachment" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
            </label>
          </div>
          <label className="career-form-consent">
            <input type="checkbox" name="privacy" required />
            <span>Ich habe die <a href={PRIVACY_PATH}>Datenschutzhinweise</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung der Bewerbung zu.</span>
          </label>
          <button className="button button--purple" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Wird übermittelt …' : 'Bewerbung absenden'} <ArrowUpRight aria-hidden="true" />
          </button>
          {feedback && <p className={`career-form-feedback is-${status}`} role="status">{feedback}</p>}
          <small>Bis zur Backend-Anbindung öffnet sich beim Absenden Ihr E-Mail-Programm. Danach erfolgt die Übermittlung direkt und verschlüsselt an die konfigurierte API.</small>
        </form>
      </section>
    </main>
  )
}

export function HomeCareerTeaser() {
  return (
    <section className="home-career-teaser" aria-labelledby="home-career-heading">
      <figure data-reveal="left">
        <img src={`${ASSETS_PATH}perlas-team.png`} alt="Team von Perla’s Objektbetreuung" loading="lazy" />
      </figure>
      <div data-reveal="right">
        <span className="eyebrow">Mitarbeiter gesucht</span>
        <h2 id="home-career-heading">Verstärkung für unser Team im Rhein-Main-Gebiet.</h2>
        <p>Sie arbeiten zuverlässig, packen gerne mit an und möchten Immobilien im Alltag professionell betreuen? Dann sollten wir uns kennenlernen.</p>
        <a className="button button--outline-light" href={`${BASE_PATH}karriere/`}>Karriere bei Perla’s <ArrowUpRight aria-hidden="true" /></a>
      </div>
    </section>
  )
}

