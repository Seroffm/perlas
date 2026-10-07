import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { FORM_LIMITS, submitContactRequest } from './backend'
import './QuickContactForm.css'

type QuickContactFormProps = {
  topic?: string
  onBusyChange?: (busy: boolean) => void
}

type Status = 'idle' | 'submitting' | 'success' | 'error'
type FieldErrors = Partial<Record<'name' | 'email' | 'privacy', string>>
type SubmissionResult = Awaited<ReturnType<typeof submitContactRequest>>

const BASE_PATH = import.meta.env.BASE_URL
const roles = ['Hausverwaltung', 'WEG-Beirat / Eigentümervertretung', 'Unternehmen / Gewerbe', 'Privater Eigentümer', 'Andere / noch offen']

export default function QuickContactForm({ topic, onBusyChange }: QuickContactFormProps) {
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const feedbackRef = useRef<HTMLParagraphElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)
  const submittingRef = useRef(false)
  const mountedRef = useRef(true)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<SubmissionResult | null>(null)
  const [feedback, setFeedback] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [role, setRole] = useState('')
  const [message, setMessage] = useState('')
  const [privacy, setPrivacy] = useState(false)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
    else if (feedback) {
      const invalidField = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ;(invalidField ?? feedbackRef.current)?.focus()
    }
  }, [feedback, status])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) return

    const nextErrors: FieldErrors = {}
    if (!name.trim()) nextErrors.name = 'Bitte geben Sie Ihren Namen an.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
    if (!privacy) nextErrors.privacy = 'Bitte bestätigen Sie die Datenschutzhinweise.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setStatus('idle')
      setFeedback('Bitte prüfen Sie die markierten Angaben.')
      // A second invalid submission must move focus again even if the error text is unchanged.
      window.requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }

    const website = String(new FormData(event.currentTarget).get('website') ?? '')
    submittingRef.current = true
    onBusyChange?.(true)
    setStatus('submitting')
    setFeedback('')
    setResult(null)

    try {
      const response = await submitContactRequest({
        subject: (topic?.trim() ? `Kurze Anfrage: ${topic.trim()}` : 'Kurze Anfrage zur Objektbetreuung').slice(0, FORM_LIMITS.subject),
        name: name.trim(),
        company: '',
        email: email.trim(),
        phone: phone.trim(),
        street: '',
        location: location.trim(),
        message: [
          'Kurze Anfrage – bitte nehmen Sie Kontakt mit mir auf.',
          role ? `Ich frage an als: ${role}` : '',
          message.trim() ? `Mein Anliegen: ${message.trim()}` : '',
        ].filter(Boolean).join('\n'),
        website,
      }, 'quick_contact')

      if (!mountedRef.current) return
      setResult(response)
      setStatus('success')
    } catch (error) {
      if (!mountedRef.current) return
      setStatus('error')
      setFeedback(error instanceof Error
        ? error.message
        : 'Die Anfrage konnte nicht übermittelt werden. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es erneut.')
    } finally {
      submittingRef.current = false
      onBusyChange?.(false)
    }
  }

  const startAnotherRequest = () => {
    setStatus('idle')
    setResult(null)
    setFeedback('')
    setErrors({})
    setName('')
    setEmail('')
    setPhone('')
    setLocation('')
    setRole('')
    setMessage('')
    setPrivacy(false)
    window.requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus())
  }

  if (status === 'success' && result) {
    return (
      <section className="quick-contact-success" aria-labelledby={`${id}-success`}>
        <p className="quick-contact-reference">Vorgang {result.reference}</p>
        <h3 id={`${id}-success`} tabIndex={-1} ref={successRef}>Vielen Dank für Ihre Anfrage.</h3>
        <p>Ihre Anfrage ist bei uns eingegangen. Wir prüfen Ihr Anliegen und melden uns persönlich bei Ihnen.</p>
        <p>{result.confirmationEmailSent
          ? `Eine Eingangsbestätigung wurde an ${email.trim()} gesendet.`
          : 'Ihre Anfrage wurde angenommen, eine E-Mail-Bestätigung konnte jedoch nicht gesendet werden. Bitte speichern Sie die Vorgangsnummer.'}</p>
        <p>Bei Fragen erreichen Sie uns unter <a href="tel:+491776867145">0177 68 67 145</a> oder <a href="mailto:mail@perlas.de">mail@perlas.de</a>.</p>
        <button type="button" className="quick-contact-submit" onClick={startAnotherRequest}>Weitere kurze Anfrage stellen</button>
      </section>
    )
  }

  return (
    <form className="quick-contact-form" ref={formRef} onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-heading`} aria-busy={status === 'submitting'}>
      <div className="quick-contact-heading">
        <h3 id={`${id}-heading`}>Kurze Anfrage</h3>
        <p>Name und E-Mail reichen für den ersten Kontakt. Die genaue Objektadresse und weitere Details klären wir anschließend persönlich.</p>
        {topic?.trim() && <p className="quick-contact-topic"><strong>Thema:</strong> {topic.trim()}</p>}
      </div>
      <label className="quick-contact-honeypot" aria-hidden="true">
        Website
        <input type="text" name="website" autoComplete="off" tabIndex={-1} maxLength={200} />
      </label>
      <fieldset className="quick-contact-fields" disabled={status === 'submitting'}>
        <legend className="sr-only">Ihre Kontaktangaben</legend>
        <div className="quick-contact-grid">
          <label className="quick-contact-field" htmlFor={`${id}-name`}>
            <span>Name *</span>
            <input id={`${id}-name`} name="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={FORM_LIMITS.name} required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${id}-name-error` : undefined} />
            {errors.name && <span className="quick-contact-field-error" id={`${id}-name-error`}>{errors.name}</span>}
          </label>
          <label className="quick-contact-field" htmlFor={`${id}-email`}>
            <span>E-Mail *</span>
            <input id={`${id}-email`} name="email" type="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={FORM_LIMITS.email} required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${id}-email-error` : undefined} />
            {errors.email && <span className="quick-contact-field-error" id={`${id}-email-error`}>{errors.email}</span>}
          </label>
          <label className="quick-contact-field quick-contact-field--wide" htmlFor={`${id}-phone`}>
            <span>Telefon <small>(optional, für einen Rückruf)</small></span>
            <input id={`${id}-phone`} name="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" maxLength={FORM_LIMITS.phone} />
          </label>
        </div>
        <details className="quick-contact-optional">
          <summary>Objekt und Nachricht ergänzen <span>(optional)</span></summary>
          <div className="quick-contact-grid">
            <label className="quick-contact-field" htmlFor={`${id}-location`}>
              <span>PLZ und Ort des Objekts <small>(optional)</small></span>
              <input id={`${id}-location`} name="location" value={location} onChange={(event) => setLocation(event.target.value)} autoComplete="off" maxLength={FORM_LIMITS.location} placeholder="z. B. 65843 Sulzbach" />
            </label>
            <label className="quick-contact-field" htmlFor={`${id}-role`}>
              <span>Ich frage an als <small>(optional)</small></span>
              <select id={`${id}-role`} name="role" value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="">Bitte auswählen</option>
                {roles.map((option) => <option value={option} key={option}>{option}</option>)}
              </select>
            </label>
            <label className="quick-contact-field quick-contact-field--wide" htmlFor={`${id}-message`}>
              <span>Ihr Anliegen <small>(optional)</small></span>
              <textarea id={`${id}-message`} name="message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={FORM_LIMITS.message - 300} rows={3} placeholder="z. B. regelmäßige Betreuung für eine Wohnanlage" />
            </label>
          </div>
        </details>
        <label className="quick-contact-consent" htmlFor={`${id}-privacy`}>
          <input id={`${id}-privacy`} name="privacy" type="checkbox" checked={privacy} onChange={(event) => setPrivacy(event.target.checked)} required aria-invalid={Boolean(errors.privacy)} aria-describedby={errors.privacy ? `${id}-privacy-error` : undefined} />
          <span>Ich habe die <a href={`${BASE_PATH}datenschutz/`}>Datenschutzhinweise</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung dieser Anfrage zu. *</span>
        </label>
        {errors.privacy && <p className="quick-contact-field-error" id={`${id}-privacy-error`}>{errors.privacy}</p>}
        {feedback && <p className="quick-contact-feedback" role="alert" tabIndex={-1} ref={feedbackRef}>{feedback}{!feedback.includes('Ihre Eingaben bleiben erhalten') && ' Ihre Eingaben bleiben erhalten.'}</p>}
        <button className="quick-contact-submit" type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'Anfrage wird gesendet …' : 'Kurze Anfrage senden'}</button>
      </fieldset>
      <p className="quick-contact-note">Unverbindlich. Kein Auftrag durch das Absenden.</p>
    </form>
  )
}
