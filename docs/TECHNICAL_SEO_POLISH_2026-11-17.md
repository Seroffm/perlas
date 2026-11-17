# Technische SEO-Verbesserungen vom 17.11.2026

Die Website umfasst nach der Wiederanbindung von Niedernhausen und Kelsterbach
77 kanonische Seiten, 38 regionale und vier allgemeine Angebotsseiten. Der Betrieb
hat die fortbestehende Hausmeisterleistung in beiden Orten ausdrücklich bestätigt.

## Seitenstart und Seitendaten

Das erzeugte HTML bleibt sichtbar, während App, aktive Seitendaten und die
benötigte React-Ansicht laden. Erst danach übernimmt React. Der bisherige kurze
Austausch des Hauptinhalts gegen „Seite wird geladen …“ entfällt. Sichtbare
Desktop-Inhalte werden beim Start auch nicht mehr durch Einblendanimationen
vorübergehend versteckt. Bei einem fehlgeschlagenen ersten App-Download bleiben
Leistungsbeschreibung und direkte Kontaktalternativen erhalten.

`vite-route-content.mjs` erzeugt kleine Datenmodule aus den bestehenden
JSON-Dateien. Es gibt keine zweite redaktionelle Inhaltsquelle. Globale Karten
erhalten Zusammenfassungen; nur die aktive Leistungs-, Zielgruppen-, Orts-,
Artikel- oder Rechtsseite lädt ihren vollständigen Text. Analytics importiert
keine Inhaltsvolltexte mehr. Normale Links bleiben echte URL-Navigationen.

Die gemeinsamen Einstiegspakete enthalten jetzt zusammen rund 353 kB JavaScript
statt zuvor 789 kB; gzip rund 98 statt 205 kB. Zusätzliche aktive Daten-/Ansichtschunks
werden getrennt geladen. Dies ist ein Paketvergleich, keine gemessene
Verbesserung der Besuchergeschwindigkeit. Das gemeinsame Stylesheet bleibt
absichtlich initial verfügbar, damit auch das HTML vor JavaScript gestaltet ist.

## Robustheit und Darstellung

- Dokumentierte `index.html`-Aliasse behalten nach JavaScript ihre tatsächliche
  Seite, den Canonical und die Indexierbarkeit. Sie werden nicht mehr zur
  clientseitigen Fehlerseite.
- Ungültig codierte Sprungmarken werden ignoriert; gültige Anker funktionieren
  weiter.
- Eine lokale Fehlergrenze schützt die Hauptseite bei einem fehlgeschlagenen
  Download des Angebotsdialogs. Die Kontaktalternative unterstützt Schließen,
  Escape, Fokus- und Scrollwiederherstellung sowie erneutes Öffnen.
- Die mobile Überschrift des Tiefgaragen-Ratgebers bricht korrekt um.
- Die drei Leistungsargumente der älteren Commercial-Landingpages bleiben auch
  mobil sichtbar. Hauptinhalte werden nicht für kleine Bildschirme entfernt.
- Kleine Beschriftungen, Breadcrumbs und Tabellenhinweise im fokussierten
  Angebotslayout erhalten ausreichenden Farbkontrast.

## Strukturierte Daten und Entdeckung

`src/structured-data.mjs` ist die gemeinsame Quelle für Browser und initiales
HTML. Jede kanonische Seite besitzt eine passende Seiteneinheit mit stabiler
Identität; die 76 Nicht-Startseiten haben echte Breadcrumbs. Leistungen und
Artikel bleiben mit dem tatsächlichen Sulzbacher Unternehmen verbunden.

Bestätigte Google-/Trustlocal-/YouTube-/LinkedIn-/Instagramprofile unterstützen
die Unternehmensidentität. Aus Bildern oder Ortsseiten entstehen keine
erfundenen Niederlassungen, Bewertungen, Kundenaufträge oder Qualifikationen.
Die öffentlich überprüfte Google-Angabe ist 5,0 aus 42 Rezensionen, Stand 17.11.2026.
Nicht belegte relative Rezensionsalter, Projekt-/Mieter-/Teamzahlen und eine
vorläufige Jahrzehnt-Timeline wurden bereinigt.

Robots erlaubt weiterhin den bisherigen öffentlichen Abruf. Such-/Retrievalbots
werden ausdrücklich genannt; der bestehende Zugang für Trainingscrawler bleibt
über die Wildcard unverändert. Dies ist eine dokumentierte Zugangsentscheidung,
kein zusätzlicher Google-Rankingfaktor und keine Indexierungsgarantie.

## Alte URLs und tatsächliche Leistungen

21 genaue Altpfadzuordnungen ersetzen die zuvor 13 Zuordnungen. Zusätzliche
Ratgeberziele wurden anhand archivierter Originalinhalte geprüft; nützliche
Auswahlkriterien wurden in den vorhandenen Frankfurt-Ratgeber integriert. Das
Gewerbeangebot erläutert Erreichbarkeit ohne unbelegtes Notdienstversprechen.

Die alten Hausmeisteradressen für Niedernhausen und Kelsterbach führen zu
vollständigen neuen Angeboten. Niedernhausen unterstützt die geordnete Übernahme
von Aufgaben, Schlüsseln und offenen Maßnahmen; Kelsterbach die Abgrenzung von
Gemeinschaftsflächen, Nutzungseinheiten und Zuständigkeiten. Beide Seiten
enthalten eigene Planungshilfen, Ablauf/Kosten, FAQs und Themenkontaktformulare.

Das bestehende GitHub-Pages-Verfahren liefert diese Altpfade mit sofortigem
Meta-Refresh, Ziel-Canonical und Ersatzlink aus. Es sind HTTP 200-Antworten und
keine serverseitigen 301. Unbekannte oder fachlich nicht ersetzbare Adressen
bleiben echte Fehlerseiten. Es gibt keine pauschale Umleitung auf die Startseite.

32 Angebotsseiten zeigen passende vorhandene Arbeitsbilder. Nur das belegte
Gartenpaar wird als Vorher-/Nachher-Vergleich desselben Objekts bezeichnet;
Parkhausaufnahmen zeigen Gerät und gereinigte Fläche ohne falschen Winkelvergleich.
Ein quadratisches Favicon aus dem vorhandenen Markenzeichen ergänzt den Head.

## Nachweise und Pflege

- Vollständiger Prüfablauf: `npm run check` (TypeScript/Build, JavaScript,
  PHP-Mocktransport, SEO und 203 bytegenaue Bildvarianten).
- Produktionsvorschau aller 77 Seiten nach JavaScript auf Desktop 1440 px und
  Mobil 390 px: richtige H1, Titel, Canonical, Robots und Seitenschema; keine
  abgeschnittenen Hauptüberschriften oder Dokumentüberläufe.
- Tests mit angehaltenem/fehlgeschlagenem App-Download und fehlgeschlagenem
  Angebotsdialog; Inhalte und Kontaktwege bleiben erhalten.
- Keyword-Registry: 577 exakt abgefragte Suchbegriffe; 40 Fokusbegriffe bleiben
  unverändert. Kelsterbach: 10 geschätzte Suchen/Monat deutschlandweit mit diesem
  Ortsbegriff, CPC 2,07 USD. Niedernhausen: Anbieter liefert keinen Volumenwert,
  ausdrücklich nicht als 0 behandeln. Die Wiederanbindung beruht zusätzlich auf
  dem bestätigten bestehenden Angebot. Querydatum 17.11.2026, Google Ads ohne
  Suchpartner, letzter verfügbarer Zeitraum November 2025–Oktober 2026.
- Veröffentlichung und Google-Indexierung bleiben unabhängig. URL-Prüfungen
  werden mit Datum und genauer Quelle gepflegt; HTTP 200 oder Sitemap-Erkennung
  ersetzt keinen Google-Indexierungsnachweis.

Die öffentliche Website erhält ausschließlich die geprüften Builddateien.
Private GSC-Leistungsdaten, Linkanalysen, Zugangsdaten und Browsernachweise
bleiben außerhalb des Repositorys. Eine ältere Adresse in einem externen
Firmenverzeichnis ist als berechtigter Profilpflegefall separat vorbereitet.

## Grenzen der Bewertung

Feldmesswerte für Core Web Vitals fehlen wegen zu geringer Datenmenge. Die
PageSpeed-Ausgangsmessung vor diesem Release ist ein Labortest für eine einzelne
Seite und kein Beweis realer Besuchergeschwindigkeit oder bereits höherer
Rankings. GitHub Pages bestimmt HTTP-Cacheheader und Hostweiterleitungen;
eine zusätzliche Hostingmigration wurde für diese Verbesserungen nicht benötigt.
Eine vollständige Indexaufnahme und das Ziel 100 monatlicher Klicks hängen auch
von Google, Nachfrage, Inhaltsnutzen und externen Unternehmenssignalen ab.


## Veröffentlichter und überprüfter Stand

Inhaltlicher Quellstand: `866b2b4`, Pages-Ausgabe: `985fcf3`.
[Pages-Lauf 44054505869](https://github.com/Seroffm/perlas/actions/runs/44054505869)
ist erfolgreich abgeschlossen. Nach dem Livegang wurden 198 aktuelle
HTML-/Programm-/Stil-/Discovery-/Icondateien bytegenau verglichen; alle stimmen.
77 kanonische URLs liefern 200, 21 freigegebene Altpfade ihre erwartete sofortige
Weiterleitung. Vier neue unbekannte URL-Familien liefern echte 404 und noindex.
Eine unabhängige erneute 12-Seiten-Stichprobe einschließlich beider neuer Orte
bestätigt die Ausgabe.

Der vollständige Prüfablauf bestand 53 JavaScript- und 150 PHP-Mockprüfungen,
Produktionsbuild/SEO und alle 203 unveränderten Bildvarianten. Beide 77er
Browserläufe (Desktop 1440/Mobil 390) sind ohne Befund; Haupttextparität besteht
nach Normalisierung reiner Umbrüche und responsiver Tabellenhinweise ebenfalls
für alle 77 Seiten. Die API-Routingprüfung `/health` war 200/ok; es wurden keine
realen Test-E-Mails versandt und damit keine vollständige E-Mail-Zustellung
behauptet.

Die mobile Nachher-Labormessung für **Gebäudereinigung Frankfurt** vom 17.11.2026,
10:22 MEZ, liefert 98 Leistung und jeweils 100 in den automatischen Kategorien
Barrierefreiheit, Best Practices und Lighthouse SEO. FCP/LCP jeweils 1,1 s,
TBT 10 ms, CLS 0, Speed Index 3,9 s. Der Vorher-Performancewert war ebenfalls 98;
der Paketvergleich ist daher keine behauptete gemessene Beschleunigung.

Die aktualisierte 77-URL-Sitemap wurde erfolgreich eingereicht. Die Search
Console zeigt in der noch nicht aktualisierten Erkennungszählung weiterhin 75;
diese Zahl darf weder als aktueller Seitenbestand noch als Indexquote gelten.
Für Niedernhausen und Kelsterbach wurden die URL-Prüfungen durchgeführt und
beide Indexierungsanträge von Google bestätigt. Ein bestätigter Antrag ist
keine Bestätigung erfolgter Indexierung. Die Keyword-Übersicht führt 48 live
geprüfte Ziel-URLs und sieben einzeln datierte Indexzustände getrennt.

## Technische Bewertung nach Abnahme

77/77 Seiten vollständig technisch und im Browser geprüft, zusätzlich unabhängige
Nachprüfung. Dies sind Auditwerte, keine Google-Scores oder Rankinggarantien.
Nachfrage, Wettbewerb, externe Links und Originalität der Inhalte sind nicht als
Rankingwirkung eingerechnet; tatsächliche Indexierung und Feld-CWV bleiben separat.

| SEO-Kategorie | Punkte / Maximum |
| --- | ---: |
| Crawl- und Indexierbarkeitsgrundlage | 23 / 25 |
| Rendering und mobile Parität | 20 / 20 |
| Strukturierte Daten | 15 / 15 |
| Metadaten, einsprachig | 20 / 20 |
| Überschriften, Semantik und Links | 10 / 10 |
| Bilder | 5 / 5 |
| Core Web Vitals: Heuristik, kein Feldnachweis | 3 / 5 |
| Technische SEO-Bereitschaft | 96 / 100 |

| GEO-Kategorie | Punkte / Maximum |
| --- | ---: |
| Dokumentierte Crawler-Zugangsentscheidung | 20 / 20 |
| Extrahierbares Rendering | 20 / 20 |
| Extrahierbare Inhaltsstruktur | 13 / 15 |
| Entitätsbelege auf der Website | 16 / 20 |
| Technische SEO-Voraussetzung | 14 / 15 |
| Keine unbelegten GEO-Maßnahmen | 10 / 10 |
| Technische GEO-Bereitschaft | 93 / 100 |

Die frühere technische Bewertung für 75 Seiten war SEO 91/GEO 60; die Differenz
beträgt +5/+33 Auditpunkte. Beim GEO-Wert entfällt insbesondere die methodische
Begrenzung wegen zuvor nicht dokumentierter Crawlerentscheidung. Der reale
Wildcardzugang war schon vorher offen. Diese Differenz ist ausdrücklich keine
behauptete Steigerung von Google-Rankings oder KI-Erwähnungen. Verbleibende
technische Abzüge betreffen Host-/Alias-Konsolidierung und fehlende Feld-CWV.
