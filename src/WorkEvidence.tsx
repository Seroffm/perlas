import { ArrowUpRight } from 'lucide-react'
import ResponsiveImage from './ResponsiveImage'

// Only existing customer-supplied photographs. They document the company's work,
// not a job in the locality of the page on which this component is displayed.
const examples = {
  objektpflege: {
    title: 'Objektbetreuung im Alltag.',
    text: 'Zugänge, Gemeinschaftsflächen und Außenbereiche gehören zusammen. Wir erfassen den Zustand Ihres Objekts und vereinbaren, welche Pflegeaufgaben regelmäßig anstehen und wie Auffälligkeiten zurückgemeldet werden.',
    path: '/leistungen/objektpflege/',
    label: 'Objektbetreuung im Detail',
    images: [
      { asset: 'kundenbilder/leistungen/projektfotos/Objektbetreuung_Innenhof_Arbeitseinsatz.jpg', alt: 'Arbeitseinsatz von Perla’s in einem Innenhof', caption: 'Im Einsatz am Wohnobjekt.' },
      { asset: 'kundenbilder/leistungen/projektfotos/Objektbetreuung_Gepflegter_Eingangsbereich.jpg', alt: 'Gepflegter Eingangsbereich einer betreuten Immobilie', caption: 'Zugänge und Gemeinschaftsflächen im Blick.' },
    ],
  },
  gebaeudereinigung: {
    title: 'Menschen, die sich um Ihre Räume kümmern.',
    text: 'Unsere Mitarbeitenden reinigen vereinbarte Innenbereiche nach einem abgestimmten Plan. Räume, Materialien und zugängliche Flächen werden vor Beginn aufgenommen. So wird aus einer allgemeinen Reinigungsanfrage ein konkreter Auftrag.',
    path: '/leistungen/gebaeudereinigung/',
    label: 'Unsere Reinigungsleistungen',
    images: [
      { asset: 'kundenbilder/leistungen/gebaeudereinigung_flur.png', alt: 'Perla’s Mitarbeiter bei der Reinigung eines Flurs', caption: 'Reinigung im Innenbereich.' },
      { asset: 'kundenbilder/team/update-2026-09-23/mitarbeiter_reinigung_weiblich_01.png', alt: 'Mitarbeiterin von Perla’s mit Reinigungsgerät', caption: 'Ein persönliches Team für die vereinbarten Aufgaben.' },
    ],
  },
  tiefgaragenreinigung: {
    title: 'Maschineneinsatz und gereinigte Parkflächen.',
    text: 'Diese Aufnahmen geben Einblick in unsere Reinigung von Parkflächen. Für Ihren Auftrag klären wir Belag, Verschmutzung und Zugang. Auch die Freigabe von Stellplätzen und die Nutzung während der Arbeiten gehören in die Vorbereitung.',
    path: '/leistungen/tiefgaragenreinigung/',
    label: 'Tiefgaragenreinigung im Detail',
    images: [
      { asset: 'kundenbilder/vorher_nachher/parkhaus_reinigung_geraet.png', alt: 'Reinigungsgerät bei einem Perla’s Einsatz auf einer Parkfläche', caption: 'Reinigungsgerät im Einsatz.' },
      { asset: 'kundenbilder/vorher_nachher/parkhaus_gereinigt.png', alt: 'Gereinigte Parkfläche aus dem Perla’s Bildbestand', caption: 'Einblick in eine gereinigte Fläche.' },
    ],
  },
  gartenpflege: {
    title: 'Ein Außenbereich vor und nach der Pflege.',
    text: 'Der Vergleich zeigt denselben Außenbereich vor und nach unserem Einsatz. Welche Arbeiten an Ihrem Objekt sinnvoll sind, richtet sich nach Bewuchs, Flächen und gewünschtem Pflegezustand. Umfang und Wiederholung stimmen wir passend dazu ab.',
    path: '/leistungen/gartenpflege/',
    label: 'Garten- und Außenanlagenpflege',
    images: [
      { asset: 'kundenbilder/vorher_nachher/aussenbereich_vorher.png', alt: 'Außenbereich vor dem Pflegeeinsatz von Perla’s', caption: 'Vor der Pflege.' },
      { asset: 'kundenbilder/vorher_nachher/aussenbereich_nachher.png', alt: 'Derselbe Außenbereich nach dem Pflegeeinsatz von Perla’s', caption: 'Nach dem Pflegeeinsatz.' },
    ],
  },
} as const

export default function WorkEvidence({ serviceSlug, id, className = '' }: {
  serviceSlug: string
  id: string
  className?: string
}) {
  const example = examples[serviceSlug as keyof typeof examples]
  if (!example) return null

  return (
    <section className={`work-evidence ${className}`} aria-labelledby={`${id}-heading`}>
      <div className="work-evidence-copy">
        <p className="work-evidence-eyebrow">Einblicke in unsere Arbeit</p>
        <h2 id={`${id}-heading`}>{example.title}</h2>
        <p>{example.text}</p>
        <a href={`${import.meta.env.BASE_URL}${example.path.replace(/^\//, '')}`}>
          {example.label}<ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div className="work-evidence-images">
        {example.images.map(photo => <figure key={photo.asset}>
          <ResponsiveImage asset={photo.asset} alt={photo.alt} sizes="(max-width: 599px) calc(100vw - 40px), (max-width: 959px) 44vw, 350px" />
          <figcaption>{photo.caption}</figcaption>
        </figure>)}
      </div>
    </section>
  )
}
