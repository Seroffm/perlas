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
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
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
  else if (/tiefgarage|parkhaus|parkplatzreinigung|garagenreinigung/.test(k)) aliases = ['tiefgaragenreinigung', 'parkhausreinigung', 'parkplatzreinigung', 'tiefgarage', 'parkflachen']
  else if (/praxisreinigung|arztpraxis/.test(k)) aliases = ['praxisreinigung', 'praxisraume', 'praxis']
  else if (/glasreinigung|fensterreinigung|fensterputzer|fenster putzen|schaufenster/.test(k)) aliases = ['glasreinigung', 'fensterreinigung', 'fenster']
  else if (/mull|tonnenbereitstellung/.test(k)) aliases = ['mulltonnenservice', 'mulltonnen', 'mullplatzreinigung', 'mullplatze', 'mulltonnenbereitstellung']
  else if (/spielplatz/.test(k)) aliases = ['spielplatzbetreuung', 'spielplatzpflege', 'spielplatzreinigung', 'sichtkontrollen']
  else if (/winterdienst/.test(k)) aliases = ['winterdienst']
  else if (/heckenschnitt|hecke schneiden/.test(k)) aliases = ['heckenschnitt', 'hecke schneiden']
  else if (/gartenpflege|rasen|grunanlagen|aussenanlagen/.test(k)) aliases = ['gartenpflege', 'aussenanlagenpflege', 'rasenpflege']
  else if (/baumpflege|baumfallung/.test(k)) aliases = ['baumpflege', 'baumfallung']
  else if (/facility management/.test(k)) aliases = ['facility management']
  else if (/buroreinigung|buro reinigen|reinigungsfirma fur buros/.test(k)) aliases = ['buroreinigung', 'buro', 'buros', 'buroflachen', 'burobereiche']
  else if (/unterhaltsreinigung/.test(k)) aliases = ['unterhaltsreinigung']
  else if (/treppenhaus|reinigung mehrfamilienhaus/.test(k)) aliases = ['treppenhausreinigung', 'treppenhaus']
  else if (/grundreinigung|bodenreinigung|boden grundreinigung/.test(k)) aliases = ['grundreinigung', 'bodenreinigung']
  else aliases = ['gebaudereinigung', 'reinigungsfirma', 'reinigungsunternehmen']
  const locality = normalize(row.queryLocality).replace(/(?: am)? taunus$/, '')
  const localityVariants = locality.includes('main taunus') ? ['main taunus kreis', 'main taunus']
    : ['frankfurt', 'frankfurt am main'].includes(locality) ? ['frankfurt', 'frankfurt am main']
    : /russelsheim|ruesselsheim/.test(locality) ? ['russelsheim', 'ruesselsheim', 'russelsheim am main', 'ruesselsheim am main'] : [locality]
  const hasLocality = !locality || localityVariants.some(value => phraseIn(body, value))
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
  if (url == null) return { exists: false, valid: false, title: '', h1: '', mainText: '', canonical: null }
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
  const researchDisposition = item.researchDisposition ?? 'active'
  if (!['active', 'excluded_example'].includes(researchDisposition)) {
    throw new Error(`Unsupported research disposition for ${item.keyword}: ${researchDisposition}`)
  }
  const excludedExample = researchDisposition === 'excluded_example'
  const dispositionNote = typeof item.dispositionNote === 'string' ? item.dispositionNote.trim() : null
  const growthFocusRank = item.growthFocusRank ?? null
  const growthFocusReason = typeof item.growthFocusReason === 'string' ? item.growthFocusReason.trim() : null
  if (growthFocusRank !== null && (!Number.isInteger(growthFocusRank) || growthFocusRank < 1
    || excludedExample || !growthFocusReason || item.estimatedMonthlyVolume <= 0
    || item.measurementStatus !== 'positive_estimate' || !item.queryLocality || !item.targetURL)) {
    throw new Error(`Growth focus requires a ranked, positive local keyword and a target: ${item.keyword}`)
  }
  if (excludedExample && (!dispositionNote || item.targetURL != null)) {
    throw new Error(`Excluded example requires a disposition note and no advertised target URL: ${item.keyword}`)
  }
  if (item.targetURL == null && item.scopeApprovalRequired !== true) {
    throw new Error(`Missing target URL without an explicit scope approval requirement: ${item.keyword}`)
  }
  if (item.scopeApprovalRequired === true && item.targetURL != null) {
    throw new Error(`Unconfirmed service must not have an advertised target URL: ${item.keyword}`)
  }
  const publication = readState(item.publication, 'publication', item.keyword)
  const googleIndex = readState(item.googleIndex, 'googleIndex', item.keyword)
  if (item.targetURL == null && (['live_verified', 'local_only_pending_push'].includes(publication.status)
    || ['indexed', 'not_indexed'].includes(googleIndex.status))) {
    throw new Error(`Target-specific publication/index evidence requires a target URL: ${item.keyword}`)
  }
  const targetState = JSON.stringify({ publication, googleIndex })
  if (item.targetURL != null && stateByTarget.has(item.targetURL) && stateByTarget.get(item.targetURL) !== targetState) {
    throw new Error(`Conflicting publication/index evidence for target URL: ${item.targetURL}`)
  }
  if (item.targetURL != null) stateByTarget.set(item.targetURL, targetState)
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
  const covered = page.valid && !item.scopeApprovalRequired && !item.ambiguousScope && !item.optionalUnbuiltPage && (exactPhrasePresent || themeCovered)
  const implementation = excludedExample ? 'Nicht eingeplant – Beispielthema'
    : !covered ? 'Offen' : item.newLocalPagePlanned ? 'Neu lokal umgesetzt' : 'Bestehende Seite vorhanden'
  rows.push({
    id: item.id, keyword: item.keyword, priority: item.priority,
    growthFocusRank, growthFocusReason,
    researchDisposition, dispositionNote,
    planningStatus: excludedExample ? 'Nicht eingeplant – Beispielthema' : 'Aktiver Leistungsplan',
    estimatedMonthlyVolume: item.estimatedMonthlyVolume, measurementStatus: item.measurementStatus,
    cpcUsd: item.cpcUsd, commercialIntent: item.commercialIntent, queryLocality: item.queryLocality,
    cluster: item.cluster, targetURL: item.targetURL, coverageEvidence: evidence.length ? evidence.join(' + ') : 'Keine',
    scopeApprovalRequired: item.scopeApprovalRequired === true,
    serviceApproval: excludedExample ? 'Nicht im aktiven Leistungsplan'
      : item.scopeApprovalRequired ? 'Leistungsbestätigung ausstehend' : 'Leistungsumfang freigegeben',
    targetLabel: excludedExample ? 'Nicht im aktiven Leistungsplan'
      : item.targetURL == null ? 'Kein freigegebenes Angebot' : new URL(item.targetURL).pathname,
    exactPhrasePresent, thematicCoverageOnly: evidence.includes('Thema'), implementation,
    publication: publication.label, publicationStatus: publication.status, publicationCheckedOn: publication.checkedOn,
    googleIndex: googleIndex.label, googleIndexStatus: googleIndex.status, googleIndexCheckedOn: googleIndex.checkedOn, indexEvidence: googleIndex.evidence,
    sourcePeriod: item.sourcePeriod, measuredOn: item.measuredOn,
    sourceTaskId: item.sourceTaskId, sourceURL: item.sourceId ? registry.sources.find(source => source.id === item.sourceId)?.documentation ?? null : null,
    targetBuilt: page.exists, canonicalSelfReference: page.valid,
    ambiguity: item.ambiguousScope ? 'Orts-/Leistungsbegriff mehrdeutig' : '',
  })
}
const priorityOrder = { P1: 1, P2: 2, P3: 3, Prüfen: 4 }
rows.sort((a, b) => Number(a.researchDisposition === 'excluded_example') - Number(b.researchDisposition === 'excluded_example')
  || (a.growthFocusRank ?? Infinity) - (b.growthFocusRank ?? Infinity)
  || (priorityOrder[a.priority] ?? 5) - (priorityOrder[b.priority] ?? 5)
  || (b.estimatedMonthlyVolume ?? -1) - (a.estimatedMonthlyVolume ?? -1) || a.keyword.localeCompare(b.keyword, 'de'))
const count = predicate => rows.filter(predicate).length
const focusRows = rows.filter(row => row.growthFocusRank !== null)
if (registry.growthFocus) {
  const expected = registry.growthFocus.requiredKeywordCount
  if (focusRows.length !== expected || focusRows.some((row, index) => row.growthFocusRank !== index + 1)
    || new Set(focusRows.map(row => row.targetURL)).size !== registry.growthFocus.requiredTargetCount) {
    throw new Error('Growth focus must have the complete consecutive ranks and required number of targets.')
  }
}
const summary = {
  total: rows.length,
  activeTotal: count(row => row.researchDisposition === 'active'),
  excludedExamples: count(row => row.researchDisposition === 'excluded_example'),
  growthFocusKeywords: focusRows.length,
  growthFocusTargets: new Set(focusRows.map(row => row.targetURL)).size,
  growthFocusCovered: focusRows.filter(row => row.implementation !== 'Offen').length,
  newLocal: count(row => row.implementation === 'Neu lokal umgesetzt'),
  existing: count(row => row.implementation === 'Bestehende Seite vorhanden'),
  open: count(row => row.researchDisposition === 'active' && row.implementation === 'Offen'),
  positiveVolume: count(row => row.measurementStatus === 'positive_estimate'),
  unknownVolume: count(row => row.measurementStatus === 'unknown'),
  reportedZero: count(row => row.measurementStatus === 'reported_zero'),
  scopeApprovalRequired: count(row => row.researchDisposition === 'active' && row.scopeApprovalRequired),
  notMeasured: count(row => row.measurementStatus === 'not_requested'),
  exactPhrase: count(row => row.exactPhrasePresent),
  themeOnly: count(row => row.thematicCoverageOnly),
  newBuiltPages: registry.newLocalPagePaths.filter(p => pageCache.get(`https://perlas.de${p}`)?.valid).length,
  targetURLs: stateByTarget.size,
  liveVerifiedTargets: new Set(rows.filter(row => row.publicationStatus === 'live_verified').map(row => row.targetURL)).size,
  newLiveVerifiedPages: registry.newLocalPagePaths.filter(p => rows.some(row => row.targetURL === `https://perlas.de${p}` && row.publicationStatus === 'live_verified')).length,
  indexEvidenceTargets: new Set(rows.filter(row => ['indexed', 'not_indexed'].includes(row.googleIndexStatus)).map(row => row.targetURL)).size,
}
const headers = ['ID', 'Keyword', 'Priorität', 'Suchvolumen geschätzt / Monat', 'Messstatus', 'CPC USD', 'Suchabsicht (abgeleitet)', 'Ort im Suchbegriff', 'Cluster', 'Ziel-URL', 'Abdeckung im Build', 'Exakte Phrase vorhanden', 'Umsetzungsstatus', 'Veröffentlichung', 'Google-Indexierung', 'Datenzeitraum', 'Abfragedatum', 'Quellen-Task-ID', 'Quelle', 'Mehrdeutigkeit', 'Veröffentlichungsstatus Code', 'Veröffentlichung geprüft am', 'Indexstatus Code', 'Indexierung geprüft am', 'Indexierungsnachweis', 'Leistungsfreigabe', 'Zielangebot', 'Leistungsbestätigung erforderlich', 'Nur thematisch abgedeckt', 'Planungsstatus Code', 'Planungsstatus', 'Planungshinweis', 'Fokus Rang', 'Fokus Auswahlgrund']
const csvRows = rows.map(row => [row.id, row.keyword, row.priority, row.estimatedMonthlyVolume, row.measurementStatus, row.cpcUsd, row.commercialIntent, row.queryLocality, row.cluster, row.targetURL, row.coverageEvidence, row.exactPhrasePresent, row.implementation, row.publication, row.googleIndex, row.sourcePeriod, row.measuredOn, row.sourceTaskId, row.sourceURL, row.ambiguity, row.publicationStatus, row.publicationCheckedOn, row.googleIndexStatus, row.googleIndexCheckedOn, row.indexEvidence, row.serviceApproval, row.targetLabel, row.scopeApprovalRequired, row.thematicCoverageOnly, row.researchDisposition, row.planningStatus, row.dispositionNote, row.growthFocusRank, row.growthFocusReason])
const csv = '\uFEFF' + [headers, ...csvRows].map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n') + '\n'
await fs.writeFile(path.join(root, 'docs/keyword-overview.csv'), csv)
const displayVolume = row => row.estimatedMonthlyVolume === null ? row.measurementStatus === 'not_requested' ? 'nicht erhoben' : 'unbekannt' : String(row.estimatedMonthlyVolume)
const measurementDates = [...new Set(rows.map(row => row.measuredOn).filter(Boolean))].sort()
const formatMeasurementDate = date => date.split('-').reverse().join('.')
const measurementDateLabel = measurementDates.length > 1
  ? `${formatMeasurementDate(measurementDates[0])} bis ${formatMeasurementDate(measurementDates.at(-1))}`
  : formatMeasurementDate(measurementDates[0] ?? registry.researchDate)
const focusMarkdown = focusRows.length ? `## ${summary.growthFocusKeywords} ausgewählte lokale Fokusbegriffe\n\nPlanungsstand: ${registry.growthFocus.selectedOn}. Die ${summary.growthFocusKeywords} positiv gemessenen Begriffe sind ${summary.growthFocusTargets} fachlich abgegrenzten Zielseiten zugeordnet. Die Reihenfolge gruppiert passende Varianten; sie ist keine Rangliste gemessener Abschlusswahrscheinlichkeit. Die Auswahl verbindet lokalen Anbieter-/Leistungsbezug, Nachfrage und einen eigenständigen Seitennutzen. Varianten werden nicht summiert. CPC in USD und Anzeigenwettbewerb sind keine organische SEO-Schwierigkeit. Messzeitraum: November 2025 bis Oktober 2026; genaue Abfrage-/Task-Nachweise stehen je Zeile im CSV und in der Registry.\n\n| Nr. | Suchbegriff | Ø / Monat | CPC USD | Gemeinsame Zielseite | Abdeckung im Build | Veröffentlichung | Auswahlgrund |\n| ---: | --- | ---: | ---: | --- | --- | --- | --- |\n${focusRows.map(row => `| ${row.growthFocusRank} | ${row.keyword} | ${displayVolume(row)} | ${row.cpcUsd === null ? 'unbekannt' : row.cpcUsd.toFixed(2)} | [${row.targetLabel}](${row.targetURL}) | ${row.coverageEvidence} | ${row.publication} | ${row.growthFocusReason} |`).join('\n')}\n\n` : ''
const md = `# Keyword-Übersicht\n\nRecherche: ${registry.researchDate}. Markt: Deutschland, Deutsch, Google ohne Suchpartner.\nSuchvolumen: geschätzter Monatsdurchschnitt November 2025 bis Oktober 2026. CPC: USD, Google Ads.\nPlanung zuletzt aktualisiert: ${registry.planningUpdatedOn ?? registry.researchDate}.\n\n${focusMarkdown}## Stand der Umsetzung\n\n- ${summary.total} eindeutige Keywords; ${summary.positiveVolume} positive Schätzwerte, ${summary.unknownVolume} unbekannte Werte, ${summary.reportedZero} ausdrücklich gemeldete Nullwerte, ${summary.notMeasured} noch nicht erhoben.\n- ${summary.activeTotal} Keywords gehören zum aktiven Leistungsplan; ${summary.excludedExamples} Beispielthemen sind separat archiviert und zählen nicht zum offenen Arbeitsvorrat.\n- Im aktiven Plan sind ${summary.newLocal} Keywords einer neu lokal umgesetzten Seite zugeordnet; ${summary.existing} einer bestehenden Seite; ${summary.open} bleiben offen.\n- ${summary.scopeApprovalRequired} aktive Keywords benötigen eine Leistungsbestätigung und haben bewusst keine Angebots-Zielseite.\n- ${summary.exactPhrase} Begriffe stehen als exakte normalisierte Phrase in Title, H1 oder Hauptinhalt. ${summary.themeOnly} sind nur thematisch abgedeckt.\n- ${summary.newBuiltPages} von ${registry.newLocalPagePaths.length} neuen Zielseiten im lokalen Build vorhanden und mit selbstreferenzierendem Canonical geprüft.\n\nUmsetzung bezieht sich auf die zugeordnete Zielseite. Eine thematische Zuordnung ist keine Aussage, dass jede Keywordvariante wörtlich verwendet wird. Orts-/Leistungsvarianten mit unbekannter Nachfrage bleiben unbekannt; ähnliche Varianten werden nicht summiert. Ein vorhandenes allgemeines Leistungsthema deckt nicht automatisch eine eigenständige Ortsanfrage ab.\n\nVeröffentlichung und Google-Indexierung werden separat geführt. ${summary.liveVerifiedTargets} von ${summary.targetURLs} Ziel-URLs sind laut Registry live geprüft; ${summary.newLiveVerifiedPages} davon sind neue Angebotsseiten. Das Prüfdatum steht bei jeder Zuordnung. Für ${summary.indexEvidenceTargets} Ziel-URLs liegt ein datierter Indexierungsnachweis vor. Die Tabelle enthält keine privaten Search-Console-Leistungsdaten und keine Ranking- oder Abschlussgarantie.\n\n## Pflege\n\nDatenquelle: [Keyword-Registry](keyword-research-2026-11-16.json). Nach einem vollständigen Seitenbuild mit \`node scripts/build-keyword-overview.mjs\` neu erzeugen. CSV: [keyword-overview.csv](keyword-overview.csv). Veröffentlichungs- und Indexzustände werden mit Datum in der Registry gepflegt; zulässige Codes und Nachweise beschreibt [KEYWORD_WORKFLOW.md](KEYWORD_WORKFLOW.md). Die Auswertung prüft sichtbaren Hauptinhalt; Navigation und Footer zählen nicht als Bodyphrase.\n\nPriorität und Suchabsicht sind redaktionell abgeleitet. CPC/Anzeigenwettbewerb sind keine organische Keyword-Schwierigkeit. Die Quellen-Task-ID und Messstatus stehen für alle abgefragten Werte im CSV und in der Registry.\n\nArchivierte Beispielthemen stehen als „Nicht eingeplant – Beispielthema“ und „Nicht im aktiven Leistungsplan“ in der Übersicht. Sie erfordern keine Rückmeldung des Nutzers und sind kein vorgesehener Ausbauauftrag. Ihre bereits erhobenen Suchdaten bleiben zur Nachvollziehbarkeit im Archiv und im CSV erhalten. Aktive Kandidaten ohne bestätigten Leistungsumfang stehen weiterhin als „Kein freigegebenes Angebot“ und „Leistungsbestätigung ausstehend“. Die dokumentierten Rechercheabschnitte und tatsächlichen Task-Kosten stehen in der Registry.\n\n## Aktiver Leistungsplan\n\n| Keyword | Prio | Ø / Monat | CPC USD | Zielseite | Abdeckung | Umsetzung | Veröffentlichung | Indexierung | Leistungsfreigabe |\n| --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- |\n${rows.filter(row => row.researchDisposition === 'active').map(row => `| ${row.keyword} | ${row.priority} | ${displayVolume(row)} | ${row.cpcUsd === null ? 'unbekannt' : row.cpcUsd.toFixed(2)} | ${row.targetURL ? `[${row.targetLabel}](${row.targetURL})` : row.targetLabel} | ${row.coverageEvidence} | ${row.implementation} | ${row.publication} | ${row.googleIndex} | ${row.serviceApproval} |`).join('\n')}\n\n## Archivierte Beispielthemen\n\nDiese Begriffe werden nicht als Leistungen beworben und zählen nicht zum offenen Arbeitsvorrat.\n\n| Keyword | Ø / Monat | Planungsstatus | Grund |\n| --- | ---: | --- | --- |\n${rows.filter(row => row.researchDisposition === 'excluded_example').map(row => `| ${row.keyword} | ${displayVolume(row)} | ${row.planningStatus} | ${row.dispositionNote.replaceAll('|', '\\|')} |`).join('\n')}\n\nQuelle der Suchmetriken: [DataForSEO Google Ads Search Volume](https://docs.dataforseo.com/v3/keywords_data/google_ads/search_volume/live/), Abfragen vom ${measurementDateLabel}; Planungsstand ${registry.planningUpdatedOn ?? registry.researchDate}. Ortsname im Suchbegriff bedeutet nicht, dass die Suchen aus diesem Ort stammen.\n`
await fs.writeFile(path.join(root, 'docs/KEYWORD_OVERVIEW.md'), md)
const temporary = path.join(root, '.tmp-keyword-workbook')
await fs.mkdir(temporary, { recursive: true })
await fs.writeFile(path.join(temporary, 'overview-rows.json'), JSON.stringify({ registryDate: registry.researchDate, summary, rows }, null, 2) + '\n')
console.log(JSON.stringify(summary, null, 2))
