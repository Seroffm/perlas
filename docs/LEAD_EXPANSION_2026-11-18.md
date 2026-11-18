# Angebotsseiten und Kontaktmessung, 18. November 2026

## Umfang und Suchintention

Acht einzeln ausgewählte Angebote ergänzen den bestehenden Bestand. Der Build
enthält 85 kanonische Seiten, darunter 44 regionale und sechs gezielte allgemeine
Angebote, außerdem weiterhin elf allgemeine Leistungsseiten und zehn Artikel.
Die 21 freigegebenen historischen URL-Zuordnungen bleiben unverändert.

| Neue Seite | Suchphrasen; geschätztes Monatsvolumen | Praktische Anfragehilfe |
| --- | --- | --- |
| [/leistungen/unterhaltsreinigung/](https://perlas.de/leistungen/unterhaltsreinigung/) | Unterhaltsreinigung 3.600; Firma 30; Kosten 30 | Räume, Tätigkeiten, Turnus, Zugang und getrennte Zusatzaufgaben |
| [/leistungen/grundreinigung/](https://perlas.de/leistungen/grundreinigung/) | Grundreinigung 2.400; professionelle Bodenreinigung 140 | Material, Zustand, Möblierung, Vorbereitung und gewünschte Übergabe |
| [/einsatzgebiete/winterdienst-offenbach/](https://perlas.de/einsatzgebiete/winterdienst-offenbach/) | Winterdienst Offenbach 50 | Flächenübergänge und Abstimmung beteiligter Ansprechpartner |
| [/einsatzgebiete/winterdienst-bad-homburg/](https://perlas.de/einsatzgebiete/winterdienst-bad-homburg/) | Winterdienst Bad Homburg 40 | Stufen, Rampen, Engstellen, Tore und Verbindungen am konkreten Objekt |
| [/einsatzgebiete/baumpflege-baumfaellung-frankfurt/](https://perlas.de/einsatzgebiete/baumpflege-baumfaellung-frankfurt/) | Baumpflege Frankfurt 90; Baumfällung Frankfurt 40 | Drei Fotoansichten, Arbeitsumfeld, Zugang, Schnittgut und offene Freigaben |
| [/einsatzgebiete/praxisreinigung-wiesbaden/](https://perlas.de/einsatzgebiete/praxisreinigung-wiesbaden/) | Praxisreinigung Wiesbaden 30 | Allgemeine Innen-/Sanitärflächen, Freigaben und nutzbare Zeitfenster |
| [/einsatzgebiete/gartenpflege-wiesbaden/](https://perlas.de/einsatzgebiete/gartenpflege-wiesbaden/) | Gartenpflege Wiesbaden 70 | Einmalige Erstpflege und laufende Pflege getrennt aufnehmen |
| [/einsatzgebiete/gebaeudereinigung-oberursel/](https://perlas.de/einsatzgebiete/gebaeudereinigung-oberursel/) | Gebäudereinigung Oberursel 30; Reinigungsfirma Oberursel 20 | Mehrere Gebäudeteile für ein gemeinsames Angebot erfassen |

Quelle: DataForSEO Google Ads Search Volume, Deutschland, Deutsch, ohne
Suchpartner; Messungen 16.–18.11.2026, Zeitraum November 2025–Oktober 2026.
Nationale Leistungsbegriffe sind keine Messung der Nachfrage im Einsatzgebiet.
Wortvarianten werden nicht zu einer Reichweiten- oder Anfrageprognose addiert.
CPC und Anzeigenwettbewerb bleiben von organischer Schwierigkeit getrennt.

Die allgemeinen Angebote übernehmen die allgemeinen Leistungsphrasen.
Bestehende lokale Seiten behalten ihre Ortsintention. Baumfällung und Baumpflege
Frankfurt teilen sich eine Seite; Firma-/Kostenvarianten erhalten keine
zusätzliche URL. Winterdienst für beide neuen Orte ist als tatsächliches Angebot
bestätigt. Es werden keine zusätzlichen Niederlassungen oder lokalen Referenzen
aus Texten oder Bildern abgeleitet.

## Bestehende Angebote und Rechercheübersicht

Müllmanagement wird als Mülltonnenservice mit Bereitstellung, Rückstellung,
Abholkalender, Zugang und Kostenfaktoren konkretisiert. Die Keyword-Zuordnung
führt jetzt zur vorhandenen Müllmanagementseite. Die öffentliche Entleerung und
neue Entsorgungsleistungen werden dadurch nicht zugesagt.

Spielplatzbetreuung benennt Reinigung und Pflege deutlicher. Vereinbarte
Sichtkontrollen bleiben von weitergehenden Prüfungen getrennt; `certified: false`
bleibt erhalten. Die Gebäudereinigungs-Elternseite ordnet Unterhalts- und
Grundreinigung kompakt ein und verlinkt die neuen Details.

Die Recherchequelle enthält 600 eindeutige Suchphrasen: 504 im aktiven Plan und
96 archivierte Beispielthemen. Die 23 neuen Messungen liefern 13 positive und
zehn unbekannte Werte. Insgesamt: 247 positiv, 348 unbekannt, fünf ausdrücklich
gemeldete Nullwerte. Unbekannte Werte bleiben `null`. Drei recherchierte
Bauendreinigungsvarianten haben ohne Leistungsbestätigung weiterhin keine
beworbene Ziel-URL. Die bisherigen 40 Fokusbegriffe bleiben unverändert.

Der erste neue Liveaufruf zeigte im optimierten Antwortformat nur zehn von
23 Zeilen und keine Kosten. Die übrigen 13 Werte wurden mit vollständigem
Schema nachgeholt; sie zählen nicht doppelt als recherchierte Phrasen.
Bestätigte Kosten dieses Abschnitts: 0,094 USD plus der nicht offengelegte Betrag
des ersten Aufrufs. Zwei mobile SERP-Stichproben enthalten kodierte
`google.com/goto`-Ziele; daraus wird keine genaue Wettbewerberposition behauptet.
Task-IDs und Messherkunft bleiben in der Recherchequelle dokumentiert.

Nach einem Build erzeugt `npm run report:keywords` weiterhin Markdown und CSV
aus derselben Quelle. Wörtliche Phrase, thematische Abdeckung, Veröffentlichung
und Indexierung bleiben getrennte Felder.

## Formularmessung und Schnittstellen

Die bestehenden kurzen Formulare bleiben bei Name, E-Mail und Datenschutz-
Bestätigung als Pflichtangaben. Die Backend-Endpunkte und Nutzdaten ändern sich
nicht. Es werden zwei feste, ausschließlich nach Analyse-Einwilligung aktive
Ereignisse ergänzt:

- `form_start`: erste tatsächliche Eingabe oder Auswahl je Anfrage beziehungsweise
  geöffnetem Dialog; Vorbelegung und Honeypot sind keine Interaktion.
- `form_submit_error`: fehlgeschlagener Übermittlungsversuch einschließlich
  Transport-, Antwort- oder Serverfehler; reine Pflichtfeldvalidierung zählt nicht.

Beide verwenden nur die festen Kategorien `contact`, `quote`, `quick_contact`
und die bereits begrenzten öffentlichen Seitenwerte. Formularinhalte,
Fehlertexte und Vorgangsnummern werden nicht übermittelt. Widerruf beendet die
Messung; Analysefehler dürfen die Anfrage weder verhindern noch einen Erfolg in
einen Fehler verwandeln. `generate_lead` bleibt an eine bestätigte Serverantwort
gebunden. Kontaktklicks, angenommene Formulare, qualifizierte Anfragen und Aufträge
bleiben unterschiedliche Vorgänge. Bewerbungen gehören nicht zu diesem Funnel.

## Prüfung, Abnahme und Grenzen

Die neuen Angebote verwenden den vorhandenen gemeinsamen Focused-Renderer für
Browser und initiales HTML. Footer, Routen-Datenmodule, Canonicals, Schema,
Sitemap, Analytics-Zulassung und unabhängige Routenprüfungen berücksichtigen die
acht URLs. Neue Inhalte erhalten das tatsächliche Datum 18.11.2026; unveränderte
Seiten bekommen kein künstlich fortgeschriebenes Datum.

Die Prüfung umfasst den vollständigen bestehenden Prüfablauf, bytegenaue
Kontrolle der 203 vorhandenen Bildvarianten und Desktop-/Mobilprüfung der acht
Angebote sowie der geänderten Leistungen und Übersichten. Formular-, Transport-
und Einwilligungstests verwenden Mockantworten; das ist kein Nachweis einer
tatsächlichen Postfachzustellung.

Abgenommen: `npm run check` mit 59 JavaScript-Tests, 150 PHP-Mockprüfungen,
Produktionsbuild, SEO-Prüfung aller 85 URLs und bytegenauer Bildprüfung.
13 betroffene Angebots-/Leistungs-/Übersichtsseiten wurden bei 1440 und 390 CSS-
Pixeln im Browser geprüft: keine überlaufenden Überschriften, Seitenüberbreite
oder defekten geladenen Bilder. Auf allen acht neuen Seiten wurden CTA-Ziel,
Formularthema, erreichbarer Telefonkontakt und die Pflichtfeldprüfung mit Fokus
auf das erste fehlerhafte Feld bestätigt; es wurden dabei keine echten Anfragen
versandt.

Nach konkreter Versandfreigabe wurde zusätzlich eine klar gekennzeichnete
Testanfrage über das Live-Kontaktformular abgeschickt. Der Server hat sie
angenommen; die Oberfläche bestätigt die Annahme und meldet die
Eingangsbestätigung als gesendet. Analyse-Einwilligung war dabei deaktiviert.
Der Auftraggeber hat den Eingang im Perlas-Postfach anschließend bestätigt.
Damit sind Formularannahme und Postfacheingang für diesen Test nachvollzogen;
der Postfachnachweis beruht auf seiner Bestätigung. Testdaten und
Vorgangskennung werden nicht in Git übernommen.

Livegang, Indexaufnahme und Nachfragewirkung benötigen jeweils eigene Nachweise.
Das Ziel von 100 monatlichen Suchklicks ist kein Ergebnis dieser Veröffentlichung.
Die technischen Hosting- und Feldmessungsgrenzen aus dem
[vollständigen technischen Audit](TECHNICAL_SEO_POLISH_2026-11-17.md) gelten weiter;
zusätzliche Seiten allein begründen keinen höheren Audit- oder Rankingwert.

## Veröffentlichung und unabhängige Nachprüfung

Inhaltlicher Quellstand: `2968885`, Pages-Ausgabe: `445608a`.
[Pages-Lauf 44270228135](https://github.com/Seroffm/perlas/actions/runs/44270228135)
ist erfolgreich abgeschlossen. Alle 85 kanonischen Seiten und insgesamt
215 aktuelle HTML-/Programm-/Stil-/Discovery-/Icondateien wurden live bytegenau
mit dem Build abgeglichen; alle stimmen. 28 unveränderte JS-/CSS-Dateien der
unmittelbar vorherigen geprüften Generation bleiben für bereits geöffnete oder
zwischengespeicherte Seiten erreichbar und wurden zusätzlich abgeglichen.
Ältere, nicht mehr referenzierte Generationen werden nicht fortgeschrieben.
Vier unbekannte URL-Familien liefern echte 404 und `noindex`.

Die 85-URL-Sitemap wurde am 18.11.2026 erneut eingereicht; Google bestätigt den
Eingang. Der Bericht zeigt bei Abnahme noch 77 erkannte Seiten aus dem vorherigen
Abruf. Das ist weder eine Ablehnung der neuen Sitemap noch ein Nachweis, dass
alle neuen Seiten bereits indexiert sind. Die Keyword-Übersicht enthält
58 live geprüfte Ziel-URLs und weiterhin sieben einzeln datierte Indexnachweise.

Ein zusätzlicher unabhängiger Crawler meldete bei einer Artikel-URL einmal
HTTP 503. Die Einzel-Nachprüfung lieferte HTTP 200 und bytegleichen Inhalt;
auch der vollständige separate Livevergleich war erfolgreich. Der Rohbefund
bleibt in der lokalen Prüfdokumentation erhalten. Seine Hinweise zu einem
fehlenden `@type` am reinen `@context`/`@graph`-Container sind Fehlalarme:
Der Container ist nach dem [JSON-LD-Standard](https://www.w3.org/TR/json-ld11/#node-objects)
kein Knotenobjekt. Alle 330 tatsächlichen Graph-Entitäten auf den 85 Seiten sind
typisiert. Das gültige Markup wurde nicht durch künstliche Typangaben verändert.

## Technische Bewertung nach Abnahme

Vollständige technische HTML-/HTTP-Abdeckung: 85/85. Die aktuellen UI-Prüfungen
umfassen die acht neuen Seiten sowie fünf geänderte Leistungen/Übersichten auf
Desktop und Mobilgerät. Die Bewertung verwendet dieselbe Kategorieverteilung
wie der vorherige vollständige Audit; zusätzliche Seiten erhöhen sie nicht
automatisch. Es sind eigene Prüfwerte, keine Google-Scores. Wettbewerb,
Backlinks und die tatsächliche Rankingwirkung von Inhalten sind nicht bewertet.

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
