export type CareerApplicationPayload = {
  name: string
  email: string
  phone: string
  role: string
  message: string
  file?: File
}

export type CareerSubmissionResult = {
  mode: 'api' | 'email'
}

export type QuoteRequestPayload = {
  propertyType: string
  street: string
  location: string
  services: string[]
  preferredStart: string
  details: string
  name: string
  company: string
  email: string
  phone: string
}

export type QuoteSubmissionResult = {
  confirmationEmailSent: boolean
}

const apiBaseUrl = import.meta.env.VITE_PERLAS_API_URL?.trim().replace(/\/$/, '')

export async function submitCareerApplication(
  payload: CareerApplicationPayload,
): Promise<CareerSubmissionResult> {
  if (!apiBaseUrl) return { mode: 'email' }

  const formData = new FormData()
  formData.set('name', payload.name)
  formData.set('email', payload.email)
  formData.set('phone', payload.phone)
  formData.set('role', payload.role)
  formData.set('message', payload.message)
  formData.set('source', window.location.href)
  formData.set('privacyConsent', 'true')
  if (payload.file) formData.set('attachment', payload.file)

  const response = await fetch(`${apiBaseUrl}/career-applications`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Bewerbung konnte nicht übermittelt werden (${response.status}).`)
  }

  return { mode: 'api' }
}

export async function submitQuoteRequest(
  payload: QuoteRequestPayload,
): Promise<QuoteSubmissionResult> {
  if (!apiBaseUrl) {
    throw new Error('Die Online-Übermittlung ist derzeit noch nicht verfügbar. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt.')
  }

  const formData = new FormData()
  formData.set('propertyType', payload.propertyType)
  formData.set('street', payload.street)
  formData.set('location', payload.location)
  formData.set('services', JSON.stringify(payload.services))
  formData.set('preferredStart', payload.preferredStart)
  formData.set('details', payload.details)
  formData.set('name', payload.name)
  formData.set('company', payload.company)
  formData.set('email', payload.email)
  formData.set('phone', payload.phone)
  formData.set('source', window.location.href)
  formData.set('privacyConsent', 'true')

  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}/quote-requests`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })
  } catch {
    throw new Error('Die Anfrage konnte wegen einer Verbindungsstörung nicht übermittelt werden. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es erneut.')
  }

  if (!response.ok) {
    throw new Error(`Die Anfrage konnte nicht übermittelt werden (${response.status}). Ihre Eingaben bleiben erhalten.`)
  }

  const responseType = response.headers.get('content-type') ?? ''
  let confirmationEmailSent = false
  if (responseType.includes('application/json')) {
    try {
      const responseData = await response.json() as { confirmationEmailSent?: boolean }
      confirmationEmailSent = responseData.confirmationEmailSent === true
    } catch {
      confirmationEmailSent = false
    }
  }

  return {
    confirmationEmailSent,
  }
}

export function careerApplicationMailto(payload: CareerApplicationPayload) {
  const subject = `Bewerbung: ${payload.role}`
  const body = [
    'Guten Tag liebes Perla’s Team,',
    '',
    `ich interessiere mich für den Bereich: ${payload.role}`,
    '',
    `Name: ${payload.name}`,
    `E-Mail: ${payload.email}`,
    `Telefon: ${payload.phone || 'Nicht angegeben'}`,
    '',
    'Nachricht:',
    payload.message,
    '',
    payload.file
      ? `Hinweis: Die ausgewählte Datei „${payload.file.name}“ bitte ich nach dem Öffnen dieser E-Mail manuell anzuhängen.`
      : '',
  ].filter(Boolean).join('\n')

  return `mailto:mail@perlas.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

