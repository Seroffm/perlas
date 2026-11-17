import { Component, useEffect, useId, useRef, type ReactNode } from 'react'
import './quote-recovery.css'

type BoundaryProps = {
  children: ReactNode
  fallback: ReactNode
  onFailure: () => void
}

/** A failed optional quote view must never remove the page around it. */
export default class QuoteDialogBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() { return { failed: true } }

  componentDidCatch() { this.props.onFailure() }

  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export function QuoteContactDialog({ loading = false, onClose }: { loading?: boolean; onClose: () => void }) {
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!dialog.open) dialog.showModal()
    closeRef.current?.focus()

    return () => {
      if (dialog.open) dialog.close()
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog
      className="quote-recovery-dialog"
      aria-labelledby={`${id}-heading`}
      aria-describedby={`${id}-description`}
      ref={dialogRef}
      onCancel={event => { event.preventDefault(); onClose() }}
    >
      <button className="quote-close" type="button" aria-label="Anfrage schließen" onClick={onClose} ref={closeRef}>
        <span aria-hidden="true">×</span>
      </button>
      <p className="eyebrow">Ihre Anfrage an Perla’s</p>
      <h2 id={`${id}-heading`}>{loading ? 'Anfrage wird geöffnet.' : 'Wir sind direkt für Sie da.'}</h2>
      <p id={`${id}-description`} role={loading ? 'status' : 'alert'}>
        {loading
          ? 'Sie erreichen uns auch direkt per Telefon, E-Mail oder über die Kontaktseite.'
          : 'Das Angebotsformular konnte nicht geöffnet werden. Sie erreichen uns per Telefon, E-Mail oder über die Kontaktseite.'}
      </p>
      <div className="quote-recovery-actions">
        <a className="button button--purple" href={`${import.meta.env.BASE_URL}kontakt/`}>Kontaktseite öffnen</a>
        <a className="button button--outline" href="tel:+491776867145">0177 68 67 145</a>
        <a className="button button--outline" href="mailto:mail@perlas.de">mail@perlas.de</a>
        <button className="button button--outline" type="button" onClick={onClose}>Zurück zur Seite</button>
      </div>
    </dialog>
  )
}
