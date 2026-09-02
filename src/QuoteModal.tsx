import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, X } from 'lucide-react'

type QuoteModalProps = {
  isOpen: boolean
  initialService?: string
  serviceNames: string[]
  onClose: () => void
}

const propertyTypes = ['Wohnanlage', 'Gewerbeimmobilie', 'Büro / Praxis', 'Institutionelles Gebäude']
const startOptions = ['So bald wie möglich', 'In 1–3 Monaten', 'Später / noch offen']

export default function QuoteModal({ isOpen, initialService, serviceNames, onClose }: QuoteModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const [step, setStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [location, setLocation] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [start, setStart] = useState('')
  const [details, setDetails] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setStep(0)
    setIsSubmitted(false)
    setError('')
    setSelectedServices(initialService ? [initialService] : [])

    const scrollPosition = window.scrollY
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    }
    const previousHtmlOverflow = document.documentElement.style.overflow
    const backgroundElements = Array.from(document.getElementById('root')?.children ?? [])
      .filter((element) => !element.classList.contains('quote-overlay')) as HTMLElement[]
    const previousAriaHidden = backgroundElements.map((element) => element.getAttribute('aria-hidden'))

    document.body.classList.add('quote-is-open')
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollPosition}px`
    document.body.style.width = '100%'
    document.body.style.paddingRight = scrollbarGap > 0 ? `${scrollbarGap}px` : previousBodyStyles.paddingRight
    document.documentElement.style.overflow = 'hidden'

    backgroundElements.forEach((element) => {
      element.inert = true
      element.setAttribute('aria-hidden', 'true')
    })

    window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusableElements = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => !element.inert && element.offsetParent !== null)

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) return

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('quote-is-open')
      document.body.style.overflow = previousBodyStyles.overflow
      document.body.style.position = previousBodyStyles.position
      document.body.style.top = previousBodyStyles.top
      document.body.style.width = previousBodyStyles.width
      document.body.style.paddingRight = previousBodyStyles.paddingRight
      document.documentElement.style.overflow = previousHtmlOverflow

      backgroundElements.forEach((element, index) => {
        element.inert = false
        const previousValue = previousAriaHidden[index]
        if (previousValue === null) element.removeAttribute('aria-hidden')
        else element.setAttribute('aria-hidden', previousValue)
      })

      window.scrollTo(0, scrollPosition)
      openerRef.current?.focus({ preventScroll: true })
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [initialService, isOpen, onClose])

  if (!isOpen) return null

  const toggleService = (service: string) => {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    )
  }

  const validateStep = () => {
    if (step === 0 && (!propertyType || !location.trim())) {
      setError('Bitte wählen Sie den Objekttyp und geben Sie den Standort an.')
      return false
    }

    if (step === 1 && (!selectedServices.length || !start)) {
      setError('Bitte wählen Sie mindestens eine Leistung und einen gewünschten Startzeitpunkt.')
      return false
    }

    if (step === 2 && (!name.trim() || !email.includes('@') || !consent)) {
      setError('Bitte ergänzen Sie Name, eine gültige E-Mail-Adresse und die Datenschutzzustimmung.')
      return false
    }

    setError('')
    return true
  }

  const nextStep = () => {
    if (!validateStep()) return
    setStep((current) => Math.min(2, current + 1))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (step < 2) {
      nextStep()
      return
    }

    if (validateStep()) setIsSubmitted(true)
  }

  return (
    <div className="quote-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="quote-title" ref={dialogRef}>
        <button
          className="quote-close"
          type="button"
          aria-label="Angebotsformular schließen"
          onClick={onClose}
          ref={closeButtonRef}
        >
          <X aria-hidden="true" />
        </button>

        <div className="quote-visual">
          <span className="quote-kicker">Ihr individuelles Angebot</span>
          <h2 id="quote-title">In drei kurzen Schritten zur passenden Objektbetreuung.</h2>
          <p>Kein Standardpaket. Wir stellen die Leistungen passend zu Ihrem Objekt zusammen.</p>
          <div className="quote-benefits">
            <span><CheckCircle2 aria-hidden="true" /> Unverbindlich</span>
            <span><CheckCircle2 aria-hidden="true" /> Angaben strukturiert vorbereiten</span>
            <span><CheckCircle2 aria-hidden="true" /> Persönlicher Ansprechpartner</span>
          </div>
        </div>

        <div className="quote-form-wrap">
          {isSubmitted ? (
            <div className="quote-success" aria-live="polite">
              <div className="quote-success-icon"><Check aria-hidden="true" /></div>
              <span>Angaben vorbereitet</span>
              <h3>Vielen Dank, {name.split(' ')[0]}.</h3>
              <p>
                Ihre Angaben wurden nur in dieser Browseransicht vorbereitet und noch nicht
                übermittelt. Die technische Übermittlung wird derzeit eingerichtet. Bitte senden
                Sie Ihre Anfrage per E-Mail an <a href="mailto:mail@perlas.de">mail@perlas.de</a> oder
                rufen Sie uns unter <a href="tel:+491776867145">0177 68 67 145</a> an.
              </p>
              <button className="button button--yellow" type="button" onClick={onClose}>Fertig</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="quote-progress" aria-label={`Schritt ${step + 1} von 3`}>
                {['Objekt', 'Leistungen', 'Kontakt'].map((label, index) => (
                  <div className={index <= step ? 'is-active' : ''} key={label}>
                    <span>{index + 1}</span>
                    <strong>{label}</strong>
                  </div>
                ))}
              </div>

              <div className="quote-step" key={step}>
                {step === 0 && (
                  <>
                    <span className="quote-step-label">Schritt 1 von 3</span>
                    <h3>Um welches Objekt geht es?</h3>
                    <p>Damit wir Umfang und Team realistisch einschätzen können.</p>
                    <fieldset className="choice-grid">
                      <legend className="sr-only">Objekttyp auswählen</legend>
                      {propertyTypes.map((type) => (
                        <button
                          type="button"
                          className={propertyType === type ? 'choice-card is-selected' : 'choice-card'}
                          aria-pressed={propertyType === type}
                          onClick={() => setPropertyType(type)}
                          key={type}
                        >
                          <span>{type}</span>
                          {propertyType === type && <Check aria-hidden="true" />}
                        </button>
                      ))}
                    </fieldset>
                    <label className="field-label">
                      <span className="field-label-copy">Standort des Objekts</span>
                      <input
                        type="text"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        placeholder="z. B. 65843 Sulzbach"
                        autoComplete="postal-code"
                      />
                    </label>
                  </>
                )}

                {step === 1 && (
                  <>
                    <span className="quote-step-label">Schritt 2 von 3</span>
                    <h3>Was dürfen wir Ihnen abnehmen?</h3>
                    <p>Mehrfachauswahl möglich — wir bündeln die Leistungen sinnvoll.</p>
                    <fieldset className="service-choice-grid">
                      <legend className="sr-only">Leistungen auswählen</legend>
                      {serviceNames.map((service) => (
                        <label className={selectedServices.includes(service) ? 'service-choice is-selected' : 'service-choice'} key={service}>
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service)}
                            onChange={() => toggleService(service)}
                          />
                          <span>{service}</span>
                          <Check aria-hidden="true" />
                        </label>
                      ))}
                    </fieldset>
                    <fieldset className="start-options">
                      <legend>Gewünschter Start</legend>
                      {startOptions.map((option) => (
                        <label key={option}>
                          <input type="radio" name="start" value={option} checked={start === option} onChange={() => setStart(option)} />
                          <span>{option}</span>
                        </label>
                      ))}
                    </fieldset>
                    <label className="field-label">
                      <span className="field-label-copy">
                        Was sollten wir noch wissen? <small>Optional</small>
                      </span>
                      <textarea value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Besonderheiten, Flächen, aktueller Bedarf …" rows={3} />
                    </label>
                  </>
                )}

                {step === 2 && (
                  <>
                    <span className="quote-step-label">Schritt 3 von 3</span>
                    <h3>Wie erreichen wir Sie?</h3>
                    <p>Ihre Angaben werden für eine direkte Kontaktaufnahme vorbereitet.</p>
                    <div className="field-grid">
                      <label className="field-label">
                        <span className="field-label-copy">Vor- und Nachname</span>
                        <input type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
                      </label>
                      <label className="field-label">
                        <span className="field-label-copy">Unternehmen <small>Optional</small></span>
                        <input type="text" value={company} onChange={(event) => setCompany(event.target.value)} autoComplete="organization" />
                      </label>
                      <label className="field-label">
                        <span className="field-label-copy">E-Mail-Adresse</span>
                        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
                      </label>
                      <label className="field-label">
                        <span className="field-label-copy">Telefonnummer <small>Optional</small></span>
                        <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
                      </label>
                    </div>
                    <label className="consent-check">
                      <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                      <span>
                        Ich stimme zu, dass meine Angaben zur Bearbeitung der Anfrage verwendet
                        werden. Weitere Informationen stehen im Datenschutz.
                      </span>
                    </label>
                  </>
                )}
              </div>

              {error && <p className="quote-error" role="alert">{error}</p>}

              <div className="quote-actions">
                {step > 0 ? (
                  <button className="quote-back" type="button" onClick={() => { setError(''); setStep((current) => current - 1) }}>
                    <ArrowLeft aria-hidden="true" /> Zurück
                  </button>
                ) : <span />}
                <button className="quote-next" type="submit">
                  {step === 2 ? 'Anfrage abschließen' : 'Weiter'} <ArrowRight aria-hidden="true" />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
