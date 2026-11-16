# Keyword-Übersicht pflegen

Die [Registry](keyword-research-2026-11-16.json) enthält Suchdaten und die Zuordnung
der Keywords zu Zielseiten. Nach einem vollständigen Seitenbuild erzeugt
`npm run report:keywords` daraus [Markdown](KEYWORD_OVERVIEW.md) und
[CSV](keyword-overview.csv). Der Bericht prüft Title, H1 und sichtbaren Hauptinhalt
im Build. Eine fehlende exakte Phrase verlangt nicht automatisch eine neue Seite.

Die Registry enthält 393 eindeutige Begriffe mit dauerhaften IDs `KW-001` bis
`KW-393`. Die ursprünglichen 197 Zeilen bleiben erhalten. Der Erweiterungsabschnitt
vom 16.11.2026 ergänzt 196 neue Begriffe für vier Städte, Grundreinigung und
ausdrücklich noch unbestätigte Spezialbodenleistungen. Die getrennten
Rechercheabschnitte, Mess-Tasks und tatsächlich gemeldeten Kosten stehen unter
`provenance.researchSections`. Unbekannte Suchdaten bleiben `null`/`unknown`;
ein ausdrücklicher Anbieterwert 0 hat den Status `reported_zero`. Ähnliche Varianten
werden nicht summiert. CPC und Anzeigenwettbewerb sind Google-Ads-Metriken.

## Leistungsbestätigung und fehlendes Ziel

96 Spezialmaterial-/Verfahrensbegriffe sind Recherchekandidaten. Sie belegen kein
angebotenes Verfahren. Allgemeine Grund-/Übergabereinigung bestätigt beispielsweise
keine Fähigkeit zum Marmorschleifen, Polieren, Kristallisieren oder zur Behandlung
jedes Bodenmaterials.

Solche Zeilen führen `scopeApprovalRequired: true`, `targetURL: null` und einen
erläuternden `scopeApprovalNote`. Der Bericht zeigt „Offen“, „Kein freigegebenes
Angebot“ und „Leistungsbestätigung ausstehend“. Es gibt keinen Link und keine
erfundene Route. Zeilen ohne Ziel zählen nicht als Ziel-URL und werden nicht mit
anderen fehlenden Zielen zu einem gemeinsamen Veröffentlichungsbefund vermischt.

Erst nach Bestätigung des tatsächlichen Leistungsumfangs und Prüfung geeigneter
Seiteninhalte ein Ziel zuordnen, `scopeApprovalRequired` auf `false` setzen und
den Hinweis aktualisieren. Danach den Bericht erneut erzeugen. Ohne Ziel ist das
Freigabefeld Pflicht; ein nicht bestätigtes Angebot mit Ziel-URL stoppt den Bericht.
Wörtliche Phrase und rein thematische Abdeckung bleiben von der Freigabe,
Umsetzung, Veröffentlichung und Indexierung getrennt.

## Veröffentlichung

`publication` wird in der Registry gepflegt und vom Berichts-Skript gelesen:

| `status` | Anzeige | Bedeutung |
| --- | --- | --- |
| `not_checked_per_keyword` | Separat prüfen | Veröffentlichung dieser Ziel-URL noch nicht belegt. |
| `local_only_pending_push` | Nur lokal, Push offen | Lokale Umsetzung, noch kein geprüfter Live-Stand. |
| `live_verified` | Live geprüft | Die exakte Ziel-URL wurde live geprüft; `checkedOn` ist Pflicht. |
| `not_live` | Nicht live | Als nicht veröffentlicht dokumentiert; keine Indexierungs-Aussage. |

`checkedOn` ist ein echtes Kalenderdatum im Format `YYYY-MM-DD`. Ein erfolgreicher
Build oder ein Git-Push setzt nicht automatisch `live_verified`. Nach Veröffentlichung
die echte URL, Statuscode, Canonical und den ausgelieferten Inhalt prüfen. Nur die
belegten Ziel-URLs aktualisieren. Alle Keywords derselben Ziel-URL führen denselben
Veröffentlichungsstand.

Am 16.11.2026 wurden alle 46 kanonischen URLs mit HTTP 200 und identischem Inhalt
gegen den geprüften Build bestätigt. Veröffentlichung: Pages-Release `8115f7d`,
Quellenstand `6c963e1`. Die vier neuen Angebotsseiten gehören zu diesem Live-Stand.
Diese Prüfung bestätigt keine Aufnahme in den Google-Index.

Die zusätzlichen neun Zielseiten (Hausmeisterservice und Gebäudereinigung in
Wiesbaden, Hanau, Taunusstein und Rüsselsheim sowie Grundreinigung Frankfurt)
wurden anschließend ebenfalls am 16.11.2026 live geprüft. Pages-Release `efdfa5d`
aus Quellenstand `ff36fa2`, erfolgreicher Lauf `43886695024`: alle 55 kanonischen
URLs lieferten HTTP 200 und bytegleichen Inhalt zum geprüften Build. Die neun
Zielseiten führen jetzt `live_verified`. Zusammen mit den vier vorherigen
Angebotsseiten enthält `newLocalPagePaths` 13 belegte Live-Pfade. Die Registry hat
26 zugeordnete Live-Ziel-URLs. Die bereits belegten 17 Ziel-URLs der ursprünglichen
Keywordzuordnungen behalten ihren datierten Status; der vorherige Prüfstand bleibt
unter `previousPublicationVerifications` dokumentiert. Die 96 Kandidaten ohne
freigegebenes Angebot behalten ihr fehlendes Ziel und die ausstehende
Leistungsbestätigung. Keine dieser Veröffentlichungsprüfungen bestätigt eine
Google-Indexierung.

## Google-Indexierung

`googleIndex` ist unabhängig von Veröffentlichung und lokalem Inhalt:

| `status` | Anzeige | Voraussetzung |
| --- | --- | --- |
| `not_checked_per_keyword` | Separat prüfen | Kein verifizierter Indexierungsbefund für diese Ziel-URL. |
| `indexed` | Indexiert | `checkedOn` und ein konkreter `evidence`-Text sind Pflicht. |
| `not_indexed` | Nicht indexiert | `checkedOn` und ein konkreter `evidence`-Text sind Pflicht. |

Ein Nachweis beschreibt die Quelle und die exakte geprüfte Ziel-URL, etwa die
Search-Console-URL-Prüfung. Keine privaten Leistungsdaten, Zugangsdaten oder
personenbezogenen Angaben in der öffentlichen Registry speichern. HTTP 200,
Sitemap-Eintrag und erfolgreiche Live-Auslieferung sind kein Indexierungsnachweis.

Beispiel für einen weiterhin offenen Befund:

```json
{
  "publication": {
    "status": "live_verified",
    "checkedOn": "2026-11-16"
  },
  "googleIndex": {
    "status": "not_checked_per_keyword",
    "checkedOn": null
  }
}
```

Unbekannte Statuscodes, ungültige Daten, widersprüchliche Angaben zur selben
Ziel-URL sowie bestätigte Indexzustände ohne datierten Nachweis stoppen den Bericht.
Die Registry wird nicht durch den Build überschrieben. Der Veröffentlichungs- und
Indexierungsstand der Arbeitsmappe stammt aus denselben Berichtszeilen.
