# SEO und Landingpages: Umsetzung vom 16.11.2026

Status: lokal auf `codex/perlas-growth` vorbereitet und geprüft. Veröffentlichung ist ein eigener Nachweis; die zuletzt geprüften GitHub-Zugänge hatten für `Seroffm/perlas` nur Leserechte.

## Recherchierte Angebote

| Neue Seite unter `/einsatzgebiete/` | Hauptthema | Eigener Nutzen vor der Anfrage |
| --- | --- | --- |
| `bueroreinigung-frankfurt/` | Büro- und Unterhaltsreinigung | Vergleichbares Leistungsverzeichnis mit Räumen, Aufgaben und Reinigungsrhythmus. |
| `gebaeudereinigung-eschborn/` | Gewerbliche Gebäude-, Büro- und Treppenhausreinigung | Vorbereitung für Unternehmen und WEG mit getrennten Bereichen, Zugang und Zusatzleistungen. |
| `hausmeisterservice-kelkheim/` | Hausmeisterservice für WEG und Gewerbe | Übergabecheckliste für Objektübersicht, Schlüssel, Aufgaben, Freigaben und Rückmeldung. |
| `tiefgaragenreinigung-frankfurt/` | Tiefgaragen- und Parkhausreinigung | Ablaufplan für freie Stellplätze, Arbeitsabschnitte, Zugang und Nutzerinformation. |

Die bestehende Eschborn-Seite bleibt unter `/einsatzgebiete/objektbetreuung-eschborn/` erreichbar. Title, H1 und Einstieg benennen Hausmeisterservice deutlicher; es wurde keine zweite Seite für denselben Betreuungsauftrag angelegt.

Die Auswahl folgt der aktuellen [Keyword-Übersicht](KEYWORD_OVERVIEW.md). Nachfragewerte sind Schätzungen für Deutschland/Deutsch; ähnliche Varianten dürfen nicht addiert werden. Eine kaufnahe Suchabsicht ist eine begründete Einordnung, keine gemessene Abschlusswahrscheinlichkeit.

## Inhalt und Gestaltung

Jede neue Seite besitzt einen eigenen Leistungsumfang, eine Planungstabelle, passende Bestandsbilder, Ablauf und Angebotsfaktoren, vier Fragen sowie ein thematisch vorbelegtes Kurzformular. Navigation und Gestaltung verwenden die bestehende Perlas-Marke. Die tatsächliche Anschrift bleibt Sulzbach (Taunus); Ortsseiten behaupten keine weiteren Niederlassungen.

`CommercialLandingPage.tsx` ist die gemeinsame Quelle für Browser und initiales HTML. Ohne JavaScript werden direkte Telefon- und E-Mail-Wege anstelle eines funktionslosen Formulars ausgegeben. Hero-Bilder werden priorisiert; weitere Bilder laden verzögert. Responsive WebP-Varianten und intrinsische Maße kommen aus dem vorhandenen Manifest. Bildnachweis: [BILDNACHWEIS.md](../BILDNACHWEIS.md).

## Technische Einbindung

- Vollständiger Seitenbuild: 46 kanonische URLs, elf lokale Angebotsseiten und zehn Artikel.
- Eindeutige Title-/Description-Werte, H1, Self-Canonical, Open-Graph-Daten und Twitter-Card je Seite. Redaktionelle Grenzwerte werden geprüft.
- Neue lokale Seiten mit `WebPage`, `Service`, `LocalBusiness` und Breadcrumbs; keine selbstbezogenen Bewertungssterne und keine erfundenen Standorte.
- Unternehmensidentität mit verifizierbarem Google-Profil und bestehendem Trustlocal-Profil verknüpft.
- Sitemap umfasst genau die kanonischen Seiten; Robots-Datei erlaubt den Produktionsbuild. Datumswerte sind feste tatsächliche Änderungsdaten.
- Neue Seiten sind über den Einsatzgebiete-Hub, ihre Hauptleistung und passende Ratgeber erreichbar. Die Ratgeber verlinken auch direkt zum Anfrageabschnitt.
- Drei zusätzliche Altpfade erhalten gezielte Nachfolger: Frankfurt, Eschborn und Kelkheim. Zusammen mit den neun vorhandenen Mappings sind es zwölf. GitHub Pages verwendet `meta refresh 0` und Ziel-Canonical; das ist keine HTTP-301-Antwort.
- Analytics erkennt die vier neuen öffentlichen Routen ausdrücklich. Einwilligung, bereinigte URLs und serverbestätigte Leads bleiben Voraussetzung; Kontaktklicks gelten nicht als zugestellte Anfragen.

## Prüfung

`npm run check` bestand: 39 JavaScript-Tests, 150 PHP-Prüfungen, TypeScript/Build, alle 46 SEO-Seiten und 203 bytegenaue Bildvarianten. Die SEO-Prüfung kontrolliert auch Inhaltsvollständigkeit, Planungsdaten, beidseitige Kontextlinks und die zwölf Altpfade.

Alle vier Seiten wurden im Browser bei Desktop- und Mobilbreite geprüft. Keine horizontalen Seitenüberläufe; die Planungstabelle bleibt auf kleinen Bildschirmen separat verschiebbar. Formular-Pflichtfelder und Fokus, native FAQ und nachladende Bilder wurden praktisch geprüft. Der Live-Health-Endpunkt der vorhandenen Formular-API antwortete mit HTTP 200; die CORS-Vorprüfung für `https://perlas.de` mit HTTP 204. Produktive E-Mail-Zustellung wurde nicht durch Testnachrichten ausgelöst.

Der gemeinsame Bildbaustein gibt `fetchpriority` passend zu React 18 aus. Der Buildrenderer öffnet keinen WebSocket mehr. Das Hauptpaket bleibt größer als 500 kB; es gibt keine Feldmessung, aus der sich ein konkreter Core-Web-Vitals-Verlust ableiten ließe.

## Pflege und Veröffentlichung

```sh
npm run check
npm run report:keywords
```

Die Recherche-Registry ist die pflegbare Quelle; Markdown und CSV werden aus dem tatsächlichen Build erneuert. Wörtlicher Keywordnachweis, Themenabdeckung, Veröffentlichung und Google-Indexierung werden separat geführt. Private Search-Console-Daten und Arbeitsmappen liegen ausschließlich in ignorierten lokalen Dateien.

Die aktuelle Website wird von GitHub Pages aus Branch `gh-pages`, Verzeichnis `/`, mit `CNAME=perlas.de` veröffentlicht. Ein Quellcode-Push auf `main` allein veröffentlicht diese statische Ausgabe nicht. Nach Freigabe des Schreibzugriffs Quellen und geprüfte Branch-Ausgabe synchronisieren und neue URLs, Metadaten, Sitemap, Weiterleitungen und Formularanbindung live erneut prüfen. Erst dann die Veröffentlichungsfelder der Keyword-Registry aktualisieren. Indexierungsanfragen ersetzen weder Veröffentlichung noch Googles Auswahlentscheidung.

Begründung: [Google zu URL-Migrationen](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes), [Weiterleitungen](https://developers.google.com/search/docs/crawling-indexing/301-redirects), [Seitenindexierung](https://support.google.com/webmasters/answer/7440203?hl=de).
