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

