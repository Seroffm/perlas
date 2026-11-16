import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const registryPath = path.join(root, 'docs/keyword-research-2026-11-16.json')
const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'))
if (!registry.keywords.length || new Set(registry.keywords.map(row => row.keyword)).size !== registry.keywords.length) {
  throw new Error('Expected a nonempty list of unique researched keywords.')
}
const dist = path.join(root, 'dist')
await fs.access(path.join(dist, 'index.html')).catch(() => {
  throw new Error('Missing production build. Run npm run build:pages before this report.')
})

function text(html = '') {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[^]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|apos|lt|gt);|&#(?:\d+|x[0-9a-f]+);/gi, entity => {
      const named = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' }
      if (named[entity.toLowerCase()]) return named[entity.toLowerCase()]
      const hex = entity.slice(0, 3).toLowerCase() === '&#x'
      return String.fromCodePoint(parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10))
    }).replace(/\s+/g, ' ').trim()
}
function normalize(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, ' ').trim()
}
function phraseIn(haystack, needle) {
  return (` ${normalize(haystack)} `).includes(` ${normalize(needle)} `)
}
function themePresent(row, mainText) {
  const k = normalize(row.keyword)
  const body = normalize(mainText)
  let aliases
  if (/hausmeister|objektbetreuung/.test(k)) aliases = ['hausmeisterservice', 'hausmeisterdienst', 'objektbetreuung']
  else if (/tiefgarage|parkhaus|garagenreinigung/.test(k)) aliases = ['tiefgaragenreinigung', 'parkhausreinigung', 'tiefgarage']
  else if (/winterdienst/.test(k)) aliases = ['winterdienst']
  else if (/gartenpflege/.test(k)) aliases = ['gartenpflege', 'aussenanlagenpflege']
  else if (/baumpflege|baumfallung/.test(k)) aliases = ['baumpflege', 'baumfallung']
  else if (/facility management/.test(k)) aliases = ['facility management']
  else if (/buroreinigung/.test(k)) aliases = ['buroreinigung']
  else if (/unterhaltsreinigung/.test(k)) aliases = ['unterhaltsreinigung']
  else if (/treppenhaus/.test(k)) aliases = ['treppenhausreinigung', 'treppenhaus']
  else aliases = ['gebaudereinigung', 'reinigungsfirma', 'reinigungsunternehmen']
  const locality = normalize(row.queryLocality).replace(/(?: am)? taunus$/, '')
  const localityVariants = locality.includes('main taunus') ? ['main taunus kreis', 'main taunus']
    : locality.startsWith('frankfurt') ? ['frankfurt', 'frankfurt am main'] : [locality]
  const hasLocality = localityVariants.some(value => phraseIn(body, value))
  return aliases.some(alias => phraseIn(body, alias)) && hasLocality
}

const pageCache = new Map()
const publicationLabels = {
  not_checked_per_keyword: 'Separat prüfen',
  local_only_pending_push: 'Nur lokal, Push offen',
  live_verified: 'Live geprüft',
  not_live: 'Nicht live',
}
const indexLabels = {
  not_checked_per_keyword: 'Separat prüfen',
  indexed: 'Indexiert',
  not_indexed: 'Nicht indexiert',
}
function checkedDate(value, required, context) {
  if (value == null) {
    if (required) throw new Error(`Missing checkedOn date for ${context}`)
    return null
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)
    || Number.isNaN(Date.parse(value + 'T00:00:00Z'))
    || new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid checkedOn date for ${context}: ${value}`)
  }
  return value
}
function readState(state, type, keyword) {
  const labels = type === 'publication' ? publicationLabels : indexLabels
  const context = `${type} (${keyword})`
  if (!state || !Object.hasOwn(labels, state.status)) throw new Error(`Unsupported status for ${context}: ${state?.status}`)
  const confirmed = type === 'publication' ? state.status === 'live_verified' : ['indexed', 'not_indexed'].includes(state.status)
  const date = checkedDate(state.checkedOn, confirmed, context)
  const evidence = typeof state.evidence === 'string' ? state.evidence.trim() : null
  if (type === 'googleIndex' && confirmed && !evidence) throw new Error(`Missing dated index evidence for ${context}`)
  return { status: state.status, checkedOn: date, evidence, label: labels[state.status] + (date ? ` (${date})` : '') }
}
async function inspectPage(url) {
  if (pageCache.has(url)) return pageCache.get(url)
  const parsed = new URL(url)
  if (parsed.origin !== 'https://perlas.de' || parsed.search || parsed.hash) throw new Error(`Unsupported target URL: ${url}`)
  const filename = path.join(dist, parsed.pathname, 'index.html')
  let result
  try {
    const html = await fs.readFile(filename, 'utf8')
    const mainHtml = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? ''
    const title = text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1])
    const h1 = text(mainHtml.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1])
    const link = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0]
    const canonical = link?.match(/href=["']([^"']+)["']/i)?.[1]
    result = { exists: true, valid: Boolean(title && h1 && canonical === url), title, h1, mainText: text(mainHtml), canonical }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    result = { exists: false, valid: false, title: '', h1: '', mainText: '', canonical: null }
  }
  pageCache.set(url, result)
  return result
}

const rows = []
const stateByTarget = new Map()
for (const item of registry.keywords) {
  const publication = readState(item.publication, 'publication', item.keyword)
  const googleIndex = readState(item.googleIndex, 'googleIndex', item.keyword)
  const targetState = JSON.stringify({ publication, googleIndex })
  if (stateByTarget.has(item.targetURL) && stateByTarget.get(item.targetURL) !== targetState) {
    throw new Error(`Conflicting publication/index evidence for target URL: ${item.targetURL}`)
  }
  stateByTarget.set(item.targetURL, targetState)
  const page = await inspectPage(item.targetURL)
  const evidence = []
  if (phraseIn(page.title, item.keyword)) evidence.push('Title')
  if (phraseIn(page.h1, item.keyword)) evidence.push('H1')
  if (phraseIn(page.mainText, item.keyword)) evidence.push('Bodyphrase')
  const exactPhrasePresent = evidence.length > 0
  if (!exactPhrasePresent && themePresent(item, page.mainText)) evidence.push('Thema')
  // A useful existing topic can cover a wording variant without the exact phrase.
  // Missing verbatim wording alone is not an SEO gap or a reason for another URL.
  const themeCovered = evidence.includes('Thema')
  const covered = page.valid && !item.ambiguousScope && !item.optionalUnbuiltPage && (exactPhrasePresent || themeCovered)
  const implementation = !covered ? 'Offen' : item.newLocalPagePlanned ? 'Neu lokal umgesetzt' : 'Bestehende Seite vorhanden'
  rows.push({
    id: item.id, keyword: item.keyword, priority: item.priority,
    estimatedMonthlyVolume: item.estimatedMonthlyVolume, measurementStatus: item.measurementStatus,
    cpcUsd: item.cpcUsd, commercialIntent: item.commercialIntent, queryLocality: item.queryLocality,
    cluster: item.cluster, targetURL: item.targetURL, coverageEvidence: evidence.length ? evidence.join(' + ') : 'Keine',
    exactPhrasePresent, thematicCoverageOnly: evidence.includes('Thema'), implementation,
    publication: publication.label, publicationStatus: publication.status, publicationCheckedOn: publication.checkedOn,
    googleIndex: googleIndex.label, googleIndexStatus: googleIndex.status, googleIndexCheckedOn: googleIndex.checkedOn, indexEvidence: googleIndex.evidence,
    sourcePeriod: item.sourcePeriod, measuredOn: item.measuredOn,
    sourceTaskId: item.sourceTaskId, sourceURL: item.sourceId ? registry.sources[0].documentation : null,
    targetBuilt: page.exists, canonicalSelfReference: page.valid,
    ambiguity: item.ambiguousScope ? 'Orts-/Leistungsbegriff mehrdeutig' : '',
  })
}
rows.sort((a, b) => a.priority.localeCompare(b.priority) || (b.estimatedMonthlyVolume ?? -1) - (a.estimatedMonthlyVolume ?? -1) || a.keyword.localeCompare(b.keyword, 'de'))
const count = predicate => rows.filter(predicate).length
const summary = {
  total: rows.length,
  newLocal: count(row => row.implementation === 'Neu lokal umgesetzt'),
  existing: count(row => row.implementation === 'Bestehende Seite vorhanden'),
  open: count(row => row.implementation === 'Offen'),
  positiveVolume: count(row => row.measurementStatus === 'positive_estimate'),
  unknownVolume: count(row => row.measurementStatus === 'unknown'),
  notMeasured: count(row => row.measurementStatus === 'not_requested'),
  exactPhrase: count(row => row.exactPhrasePresent),
  themeOnly: count(row => row.thematicCoverageOnly),
  newBuiltPages: registry.newLocalPagePaths.filter(p => pageCache.get(`https://perlas.de${p}`)?.valid).length,
  targetURLs: stateByTarget.size,
  liveVerifiedTargets: new Set(rows.filter(row => row.publicationStatus === 'live_verified').map(row => row.targetURL)).size,
  newLiveVerifiedPages: registry.newLocalPagePaths.filter(p => rows.some(row => row.targetURL === `https://perlas.de${p}` && row.publicationStatus === 'live_verified')).length,
  indexEvidenceTargets: new Set(rows.filter(row => ['indexed', 'not_indexed'].includes(row.googleIndexStatus)).map(row => row.targetURL)).size,
}
const headers = ['ID', 'Keyword', 'Priorität', 'Suchvolumen geschätzt / Monat', 'Messstatus', 'CPC USD', 'Suchabsicht (abgeleitet)', 'Ort im Suchbegriff', 'Cluster', 'Ziel-URL', 'Abdeckung im Build', 'Exakte Phrase vorhanden', 'Umsetzungsstatus', 'Veröffentlichung', 'Google-Indexierung', 'Datenzeitraum', 'Abfragedatum', 'Quellen-Task-ID', 'Quelle', 'Mehrdeutigkeit', 'Veröffentlichungsstatus Code', 'Veröffentlichung geprüft am', 'Indexstatus Code', 'Indexierung geprüft am', 'Indexierungsnachweis']
const csvRows = rows.map(row => [row.id, row.keyword, row.priority, row.estimatedMonthlyVolume, row.measurementStatus, row.cpcUsd, row.commercialIntent, row.queryLocality, row.cluster, row.targetURL, row.coverageEvidence, row.exactPhrasePresent, row.implementation, row.publication, row.googleIndex, row.sourcePeriod, row.measuredOn, row.sourceTaskId, row.sourceURL, row.ambiguity, row.publicationStatus, row.publicationCheckedOn, row.googleIndexStatus, row.googleIndexCheckedOn, row.indexEvidence])
const csv = '\uFEFF' + [headers, ...csvRows].map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n') + '\n'
await fs.writeFile(path.join(root, 'docs/keyword-overview.csv'), csv)
const displayVolume = row => row.estimatedMonthlyVolume === null ? row.measurementStatus === 'not_requested' ? 'nicht erhoben' : 'unbekannt' : String(row.estimatedMonthlyVolume)
const md = `# Keyword-Übersicht\n\nRecherche: ${registry.researchDate}. Markt: Deutschland, Deutsch, Google ohne Suchpartner.\nSuchvolumen: geschätzter Monatsdurchschnitt November 2025 bis Oktober 2026. CPC: USD, Google Ads.\n\n## Stand der Umsetzung\n\n- ${summary.total} eindeutige Keywords; ${summary.positiveVolume} positive Schätzwerte, ${summary.unknownVolume} unbekannte Werte, ${summary.notMeasured} noch nicht erhoben.\n- ${summary.newLocal} Keywords sind einer neu lokal umgesetzten Seite zugeordnet; ${summary.existing} einer bestehenden Seite; ${summary.open} bleiben offen.\n- ${summary.exactPhrase} Begriffe stehen als exakte normalisierte Phrase in Title, H1 oder Hauptinhalt. ${summary.themeOnly} sind nur thematisch abgedeckt.\n- ${summary.newBuiltPages} von ${registry.newLocalPagePaths.length} neuen Zielseiten im lokalen Build vorhanden und mit selbstreferenzierendem Canonical geprüft.\n\nUmsetzung bezieht sich auf die zugeordnete Zielseite. Eine thematische Zuordnung ist keine Aussage, dass jede Keywordvariante wörtlich verwendet wird. Orts-/Leistungsvarianten mit unbekannter Nachfrage bleiben unbekannt; ähnliche Varianten werden nicht summiert. Ein vorhandenes allgemeines Leistungsthema deckt nicht automatisch eine eigenständige Ortsanfrage ab.\n\nVeröffentlichung und Google-Indexierung werden separat geführt. ${summary.liveVerifiedTargets} von ${summary.targetURLs} Ziel-URLs sind laut Registry live geprüft; ${summary.newLiveVerifiedPages} davon sind neue Angebotsseiten. Das Prüfdatum steht bei jeder Zuordnung. Für ${summary.indexEvidenceTargets} Ziel-URLs liegt ein datierter Indexierungsnachweis vor. Die Tabelle enthält keine privaten Search-Console-Leistungsdaten und keine Ranking- oder Abschlussgarantie.\n\n## Pflege\n\nDatenquelle: [Keyword-Registry](keyword-research-2026-11-16.json). Nach einem vollständigen Seitenbuild mit \`node scripts/build-keyword-overview.mjs\` neu erzeugen. CSV: [keyword-overview.csv](keyword-overview.csv). Veröffentlichungs- und Indexzustände werden mit Datum in der Registry gepflegt; zulässige Codes und Nachweise beschreibt [KEYWORD_WORKFLOW.md](KEYWORD_WORKFLOW.md). Die Auswertung prüft sichtbaren Hauptinhalt; Navigation und Footer zählen nicht als Bodyphrase.\n\nPriorität und Suchabsicht sind redaktionell abgeleitet. CPC/Anzeigenwettbewerb sind keine organische Keyword-Schwierigkeit. Die Quellen-Task-ID und Messstatus stehen für alle abgefragten Werte im CSV und in der Registry.\n\n## Alle Keywords\n\n| Keyword | Prio | Ø / Monat | CPC USD | Zielseite | Abdeckung | Umsetzung | Veröffentlichung | Indexierung |\n| --- | --- | ---: | ---: | --- | --- | --- | --- | --- |\n${rows.map(row => `| ${row.keyword} | ${row.priority} | ${displayVolume(row)} | ${row.cpcUsd === null ? 'unbekannt' : row.cpcUsd.toFixed(2)} | [${new URL(row.targetURL).pathname}](${row.targetURL}) | ${row.coverageEvidence} | ${row.implementation} | ${row.publication} | ${row.googleIndex} |`).join('\n')}\n\nQuelle der Suchmetriken: [DataForSEO Google Ads Search Volume](https://docs.dataforseo.com/v3/keywords_data/google_ads/search_volume/live/), Abfragen vom 16.11.2026. Ortsname im Suchbegriff bedeutet nicht, dass die Suchen aus diesem Ort stammen.\n`
await fs.writeFile(path.join(root, 'docs/KEYWORD_OVERVIEW.md'), md)
const temporary = path.join(root, '.tmp-keyword-workbook')
await fs.mkdir(temporary, { recursive: true })
await fs.writeFile(path.join(temporary, 'overview-rows.json'), JSON.stringify({ registryDate: registry.researchDate, summary, rows }, null, 2) + '\n')
console.log(JSON.stringify(summary, null, 2))
