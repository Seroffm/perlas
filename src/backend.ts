import { DEMO_FORM_SUBMIT_DELAY_MS, DEMO_FORM_SUCCESS } from './config'

export type CareerApplicationPayload = {
  name: string
  email: string
  phone: string
  role: string
  message: string
  file?: File
  website?: string
}

export type CareerSubmissionResult = {
  mode: 'api' | 'email'
  confirmationEmailSent?: boolean
  requestId?: string
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
  website?: string
}

export type ContactRequestPayload = {
  subject: string
  name: string
  company: string
  email: string
  phone: string
  street: string
  location: string
  message: string
  website?: string
}

type ApiSubmissionResult = {
  ok: true
  requestId: string
  confirmationEmailSent: boolean
}

export type QuoteSubmissionResult = {
  confirmationEmailSent: boolean
  mode: 'demo' | 'api'
  requestId?: string
}

const apiBaseUrl = import.meta.env.VITE_PERLAS_API_URL?.trim().replace(/\/$/, '')
export const FORM_API_CONFIGURED = Boolean(apiBaseUrl)
export const MAX_APPLICATION_FILE_SIZE = 5 * 1024 * 1024
export const FORM_LIMITS = {
  name: 160,
  email: 254,
  phone: 60,
  company: 200,
  street: 200,
  location: 200,
  subject: 200,
  role: 200,
  message: 6000,
  details: 6000,
} as const

const retryRequests = new Map<string, { fingerprint: string; requestId: string }>()

function newRequestId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

async function digest(value: BufferSource) {
  const hash = await crypto.subtle.digest('SHA-256', value)
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function requestIdFor(endpoint: string, formData: FormData) {
  const fields: [string, string][] = []
  for (const [key, value] of formData.entries()) {
    fields.push([key, typeof value === 'string'
      ? value
      : JSON.stringify([value.name, value.type, value.size, await digest(await value.arrayBuffer())])])
  }
  fields.sort(([left], [right]) => left.localeCompare(right))
  const fingerprint = await digest(new TextEncoder().encode(JSON.stringify(fields)))
  const previous = retryRequests.get(endpoint)
  if (previous?.fingerprint === fingerprint) return previous.requestId
  const requestId = newRequestId()
  retryRequests.set(endpoint, { fingerprint, requestId })
  return requestId
}

function requestForm(fields: Record<string, string>) {
  const formData = new FormData()
  Object.entries(fields).forEach(([name, value]) => formData.set(name, value))
  formData.set('source', `${window.location.origin}${window.location.pathname}`)
  formData.set('privacyConsent', 'true')
  return formData
}

async function submitForm(endpoint: string, formData: FormData): Promise<ApiSubmissionResult> {
  if (!apiBaseUrl) {
    throw new Error('Die Online-Übermittlung ist derzeit nicht verfügbar. Ihre Eingaben bleiben erhalten. Bitte kontaktieren Sie uns direkt.')
  }

  const requestId = await requestIdFor(endpoint, formData)
  formData.set('requestId', requestId)
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 25_000)

  try {
    const response = await fetch(`${apiBaseUrl}/${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      credentials: 'omit',
    })

    let result: unknown
    if ((response.headers.get('content-type') ?? '').includes('application/json')) {
      try {
        result = await response.json()
      } catch {
        result = undefined
      }
    }

    if (!response.ok) {
      const serverMessage = result && typeof result === 'object' && 'message' in result
        && typeof result.message === 'string' ? result.message.trim().slice(0, 500) : ''
      throw new Error(serverMessage || (response.status === 429
        ? 'Es wurden zu viele Anfragen gesendet. Bitte warten Sie einige Minuten und versuchen Sie es erneut.'
        : 'Die Übermittlung war nicht möglich. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es erneut.'))
    }

    if (!result || typeof result !== 'object'
      || !('ok' in result) || result.ok !== true
      || !('requestId' in result) || result.requestId !== requestId
      || !('confirmationEmailSent' in result) || typeof result.confirmationEmailSent !== 'boolean') {
      throw new Error('Der Eingang konnte nicht bestätigt werden. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es erneut.')
    }

    retryRequests.delete(endpoint)
    return result as ApiSubmissionResult
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Die Übermittlung dauert zu lange. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es erneut.')
    }
    if (error instanceof TypeError) {
      throw new Error('Die Verbindung konnte nicht hergestellt werden. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es erneut.')
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function submitContactRequest(payload: ContactRequestPayload): Promise<ApiSubmissionResult> {
  return submitForm('contact-requests', requestForm({
    subject: payload.subject,
    name: payload.name,
    company: payload.company,
    email: payload.email,
    phone: payload.phone,
    street: payload.street,
    location: payload.location,
    message: payload.message,
    website: payload.website ?? '',
  }))
}

export async function submitCareerApplication(
  payload: CareerApplicationPayload,
): Promise<CareerSubmissionResult> {
  if (!apiBaseUrl) return { mode: 'email' }

  const formData = requestForm({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    message: payload.message,
    website: payload.website ?? '',
  })
  if (payload.file) formData.set('attachment', payload.file)
  const result = await submitForm('career-applications', formData)
  return { mode: 'api', requestId: result.requestId, confirmationEmailSent: result.confirmationEmailSent }
}

export async function submitQuoteRequest(
  payload: QuoteRequestPayload,
): Promise<QuoteSubmissionResult> {
  if (DEMO_FORM_SUCCESS) {
    await new Promise<void>((resolve) => window.setTimeout(resolve, DEMO_FORM_SUBMIT_DELAY_MS))
    return {
      confirmationEmailSent: true,
      mode: 'demo',
    }
  }

  const result = await submitForm('quote-requests', requestForm({
    propertyType: payload.propertyType,
    street: payload.street,
    location: payload.location,
    services: JSON.stringify(payload.services),
    preferredStart: payload.preferredStart,
    details: payload.details,
    name: payload.name,
    company: payload.company,
    email: payload.email,
    phone: payload.phone,
    website: payload.website ?? '',
  }))

  return {
    confirmationEmailSent: result.confirmationEmailSent,
    mode: 'api',
    requestId: result.requestId,
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

