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
import { careerApplicationMailto, FORM_API_CONFIGURED, FORM_LIMITS, MAX_APPLICATION_FILE_SIZE, submitCareerApplication } from './backend'
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
  const submittingRef = useRef(false)

  const chooseRole = (role: string) => {
    if (submittingRef.current) return
    setSelectedRole(role)
    window.requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) return
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const formData = new FormData(form)
    const file = formData.get('attachment')
    const attachment = file instanceof File && file.size > 0 ? file : undefined

    if (attachment && attachment.size > MAX_APPLICATION_FILE_SIZE) {
      setStatus('error')
      setFeedback('Die ausgewählte Datei ist größer als 5 MB. Bitte wähle eine kleinere Datei.')
      return
    }

    if (attachment && !/\.(pdf|doc|docx|jpe?g|png)$/i.test(attachment.name)) {
      setStatus('error')
      setFeedback('Bitte lade eine PDF-, Word- oder Bilddatei im Format JPG oder PNG hoch.')
      return
    }

    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      role: String(formData.get('role') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
      file: attachment,
      website: String(formData.get('website') ?? ''),
    }

    submittingRef.current = true
    setStatus('submitting')
    setFeedback('')

    try {
      const result = await submitCareerApplication(payload)

      if (result.mode === 'email') {
        setStatus('email')
        setFeedback('Dein E-Mail-Programm wird mit den eingetragenen Angaben geöffnet.')
        window.location.href = careerApplicationMailto(payload)
        return
      }

      setStatus('success')
      setFeedback(result.confirmationEmailSent
        ? `Vielen Dank. Deine Bewerbung wurde angenommen. Vorgang ${result.reference}. Die Eingangsbestätigung wurde per E-Mail gesendet.`
        : `Deine Bewerbung wurde angenommen. Vorgang ${result.reference}. Die Bestätigung konnte nicht versendet werden. Bitte prüfe deine E-Mail-Adresse. Bei Fragen: mail@perlas.de.`)
      form.reset()
      setSelectedRole('Initiativbewerbung')
    } catch (error) {
      setStatus('error')
      setFeedback(error instanceof Error ? error.message : 'Die Übermittlung war nicht möglich. Deine Eingaben bleiben erhalten. Bitte versuche es erneut.')
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <main className="career-page">
      <section className="career-hero" aria-labelledby="career-heading">
        <div className="career-hero-copy" data-reveal="left">
          <a className="page-breadcrumb" href={BASE_PATH}>Startseite / Karriere</a>
          <span className="eyebrow">Komm ins Team</span>
          <h1 id="career-heading">Du hast Lust, anzupacken und Verantwortung zu übernehmen?</h1>
          <p>
            Bei Perla’s arbeitest du an echten Wohn- und Gewerbeobjekten im Rhein-Main-Gebiet.
            Dich erwarten praktische, abwechslungsreiche Aufgaben, klare Absprachen und ein Team,
            das sich im Alltag gegenseitig unterstützt.
          </p>
          <div className="button-row">
            <a className="button button--yellow" href="#stellen">Offene Bereiche ansehen <ArrowUpRight aria-hidden="true" /></a>
            <a className="button button--outline" href="#bewerbung">Initiativ bewerben</a>
          </div>
        </div>
        <figure className="career-hero-image" data-reveal="right">
          <img src={`${ASSETS_PATH}kundenbilder/team/team_aussenbereich_01.png`} alt="Mitarbeiterin von Perla’s bei einem Außeneinsatz" />
          <figcaption><Users aria-hidden="true" /><span><strong>Gemeinsam anpacken</strong><small>Direkt, verlässlich und nah am Objekt</small></span></figcaption>
        </figure>
      </section>

      <section className="career-values" aria-labelledby="career-values-heading">
        <div className="career-section-heading" data-reveal="up">
          <span className="eyebrow">Dein Arbeitsalltag bei Perla’s</span>
          <h2 id="career-values-heading">Praktische Aufgaben. Klare Absprachen. Ein Team, das anpackt.</h2>
          <p>Du siehst, was du geschafft hast, übernimmst Verantwortung für deinen Bereich und kannst dich mit deiner Erfahrung Schritt für Schritt weiterentwickeln.</p>
        </div>
        <div className="career-value-grid">
          {[
            [HeartHandshake, 'Abwechslungsreiche Einsätze', 'Du arbeitest in Wohnanlagen, Gewerbeobjekten und Außenbereichen, passend zu deinem Einsatzbereich und deiner Erfahrung.'],
            [Users, 'Ein Team, kurze Wege', 'Du bekommst klare Absprachen, erreichbare Ansprechpartner und Unterstützung, wenn vor Ort etwas ungeklärt ist.'],
            [ShieldCheck, 'Verantwortung und Entwicklung', 'Du arbeitest selbstständig im vereinbarten Bereich und kannst weitere Aufgaben übernehmen, wenn du dich entwickeln möchtest.'],
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
          <p>Gemeinsam klären wir, welcher Bereich zu dir passt und in welchem Umfang du einsteigen möchtest.</p>
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
                  <strong>Das bringst du mit</strong>
                  <ul>{job.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
                </div>
              </details>
              <button type="button" disabled={status === 'submitting'} onClick={() => chooseRole(job.title)}>Für diesen Bereich bewerben <ArrowUpRight aria-hidden="true" /></button>
            </article>
          ))}
        </div>
      </section>

      <section className="career-application" id="bewerbung" aria-labelledby="career-application-heading">
        <div className="career-application-copy" data-reveal="left">
          <span className="eyebrow">Kurzbewerbung</span>
          <h2 id="career-application-heading">Lass uns einander kennenlernen.</h2>
          <p>
            Schick uns deine wichtigsten Kontaktdaten und den gewünschten Einsatzbereich.
            Ein Lebenslauf ist hilfreich, für den ersten Kontakt aber nicht zwingend erforderlich.
          </p>
          <ul>
            <li><CheckCircle2 aria-hidden="true" /> Dein direkter Kontakt mit Perla’s</li>
            <li><CheckCircle2 aria-hidden="true" /> Einsatzmöglichkeiten im Rhein-Main-Gebiet</li>
            <li><CheckCircle2 aria-hidden="true" /> Persönliche Abstimmung der nächsten Schritte</li>
          </ul>
          <a href="mailto:mail@perlas.de?subject=Bewerbung%20bei%20Perla%27s">Oder direkt an mail@perlas.de schreiben <ArrowUpRight aria-hidden="true" /></a>
        </div>

        <form className="career-form" ref={formRef} onSubmit={handleSubmit} data-reveal="right" aria-busy={status === 'submitting'}>
          <label className="form-honeypot" aria-hidden="true">
            Website
            <input type="text" name="website" autoComplete="off" tabIndex={-1} maxLength={200} />
          </label>
          <div className="career-form-heading">
            <FileText aria-hidden="true" />
            <div><span>Bewerbung vorbereiten</span><strong>Wenige Angaben genügen für deinen ersten Kontakt.</strong></div>
          </div>
          <div className="career-form-grid">
            <label>
              <span>Name *</span>
              <input type="text" name="name" autoComplete="name" maxLength={FORM_LIMITS.name} disabled={status === 'submitting'} required />
            </label>
            <label>
              <span>E-Mail *</span>
              <input type="email" name="email" autoComplete="email" maxLength={FORM_LIMITS.email} disabled={status === 'submitting'} required />
            </label>
            <label>
              <span>Telefon</span>
              <input type="tel" name="phone" autoComplete="tel" maxLength={FORM_LIMITS.phone} disabled={status === 'submitting'} />
            </label>
            <label>
              <span>Gewünschter Bereich *</span>
              <select name="role" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} disabled={status === 'submitting'} required>
                <option>Initiativbewerbung</option>
                {jobs.map((job) => <option key={job.id}>{job.title}</option>)}
              </select>
            </label>
            <label className="career-form-wide">
              <span>Kurze Nachricht *</span>
              <textarea name="message" rows={5} placeholder="Erzähl uns kurz etwas über deine Erfahrung und deinen gewünschten Einsatzbereich." maxLength={FORM_LIMITS.message} disabled={status === 'submitting'} required />
            </label>
            <label className="career-form-wide career-file-field">
              <span>Lebenslauf oder Unterlagen (optional, max. 5 MB)</span>
              <input type="file" name="attachment" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" disabled={status === 'submitting'} />
            </label>
          </div>
          <label className="career-form-consent">
            <input type="checkbox" name="privacy" disabled={status === 'submitting'} required />
            <span>Ich habe die <a href={PRIVACY_PATH}>Datenschutzhinweise</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung der Bewerbung zu.</span>
          </label>
          <button className="button button--purple" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Wird übermittelt …' : 'Bewerbung absenden'} <ArrowUpRight aria-hidden="true" />
          </button>
          {feedback && <p className={`career-form-feedback is-${status}`} role={status === 'error' ? 'alert' : 'status'}>{feedback}</p>}
          <small>{FORM_API_CONFIGURED
            ? 'Deine Angaben und Unterlagen werden ausschließlich zur Bearbeitung deiner Bewerbung verwendet.'
            : 'Beim Absenden öffnet sich dein E-Mail-Programm. Bitte füge ausgewählte Unterlagen dort als Anhang hinzu.'}</small>
        </form>
      </section>
    </main>
  )
}

export function HomeCareerTeaser() {
  return (
    <section className="home-career-teaser" aria-labelledby="home-career-heading">
      <figure data-reveal="left">
        <img src={`${ASSETS_PATH}kundenbilder/team/team_aussenbereich_01.png`} alt="Mitarbeiterin von Perla’s bei einem Außeneinsatz" loading="lazy" />
      </figure>
      <div data-reveal="right">
        <span className="eyebrow">Komm ins Team</span>
        <h2 id="home-career-heading">Praktische Arbeit im Rhein-Main-Gebiet.</h2>
        <p>Du packst gerne mit an, arbeitest zuverlässig und möchtest Verantwortung an echten Immobilien übernehmen? Dann sollten wir uns kennenlernen.</p>
        <a className="button button--outline-light" href={`${BASE_PATH}karriere/`}>Jobs bei Perla’s <ArrowUpRight aria-hidden="true" /></a>
      </div>
    </section>
  )
}

