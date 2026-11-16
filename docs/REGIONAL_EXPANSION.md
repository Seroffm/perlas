# Regionale Angebote und Gestaltung, 16.11.2026

Die zweite Erweiterung ergänzt neun gezielte Angebote: jeweils Hausmeisterservice
und Gebäudereinigung für Wiesbaden, Hanau, Taunusstein und Rüsselsheim am Main
sowie Grundreinigung für Frankfurt. Zusammen mit der ersten Erweiterung sind
heute 13 neue Angebotsseiten entstanden. Der gesamte Build umfasst 55 kanonische
Seiten, davon 20 Orts-/Leistungsangebote. Status: lokal fertig; Live-Prüfung folgt.

## Auswahl anhand der Nachfrage

| Stadt | Hausmeisterservice | Gebäudereinigung |
| --- | ---: | ---: |
| Wiesbaden | 320 | 390 |
| Hanau | 140 | 140 |
| Taunusstein | 90 | 20 |
| Rüsselsheim | 40 | 50 |

DataForSEO-Schätzungen für Deutschland/Deutsch, Google ohne Suchpartner,
Monatsdurchschnitt November 2025 bis Oktober 2026. Grundreinigung Frankfurt
liefert 40, Bodenreinigung Frankfurt 10. Diese Werte sind Suchanfragen, keine
Klick- oder Anfrageprognosen; ähnliche Varianten nicht summieren. Details und
Quellen-Task-IDs stehen in der [Keyword-Übersicht](KEYWORD_OVERVIEW.md).

Die Recherche umfasst jetzt 393 eindeutige, abgefragte Keywords. 96 Begriffe zu
Spezialmaterialien und Verfahren bleiben ohne Angebotsziel, bis die tatsächliche
Leistung bestätigt ist. Darunter sind Marmor-/Natursteinreinigung und einzelne
Verfahren zur Bodenaufbereitung. Die vorhandenen Unternehmensangaben belegen
Grund- und Übergabereinigung; sie belegen diese Spezialverfahren nicht.

## Eigenständiger Nutzen der neun Seiten

| Seite unter `/einsatzgebiete/` | Konkrete Entscheidungshilfe |
| --- | --- |
| `hausmeisterservice-wiesbaden/` | Aufgaben- und Freigabematrix für WEG und Verwaltung. |
| `hausmeisterservice-hanau/` | Nutzer, Gemeinschaftsflächen, Zutritt und Meldungswege im Gewerbeobjekt. |
| `hausmeisterservice-taunusstein/` | Kontrollplan mit verständlicher Weitergabe offener Aufgaben. |
| `hausmeisterservice-ruesselsheim/` | Unterlagen und Schlüssel für die Übernahme einer Betreuung. |
| `gebaeudereinigung-wiesbaden/` | Leistungsverzeichnis mit Flächen, Tätigkeiten, Intervallen und Ergänzungen. |
| `gebaeudereinigung-hanau/` | Reinigungszonen und Zugänge im laufenden Gebäudebetrieb. |
| `gebaeudereinigung-taunusstein/` | Bereichsplan für Treppenhäuser und Gemeinschaftsflächen. |
| `gebaeudereinigung-ruesselsheim/` | Regelpflege, intensiven Bedarf und Übergabe voneinander unterscheiden. |
| `grundreinigung-frankfurt/` | Anlass, Material, Zustand und Vorbereitung einer einmaligen Reinigung. |

Die tatsächliche Anbieteranschrift bleibt Sulzbach (Taunus). Es werden keine
zusätzlichen Niederlassungen, Kundenobjekte in den Zielstädten oder garantierten
Einsatzkapazitäten behauptet. Die Bilder stammen aus dem vorhandenen Bestand;
die Stadt der Aufnahme wird nicht aus dem Einsatzgebiet der Seite abgeleitet.

## Gestaltung und Navigation

| Vorher | Jetzt |
| --- | --- |
| Keyword und langer Slogan gemeinsam in der H1. | Kurze H1 mit Leistung und Ort, separater Nutzen und kürzerer Einstieg. |
| Gleichförmige weiße Textblöcke. | Stärkere Arbeitsbilder, versetzte Markenfläche, Kundenlogos und blauweiße Inhaltsabschnitte. |
| Wenig Orientierung auf langen Seiten. | Sprunglinks zu Leistungen, Vorbereitung, Ablauf, Fragen und Anfrage. |
| Allgemeine Hauptnavigation im Footer. | Gruppierte direkte Links zu Leistungen, Ortsangeboten und Unternehmen. |

`SiteFooter.tsx` rendert den Footer im Browser und im initialen HTML. Die Links
kommen aus `footer-links.json`. Die statische Cookieinformation funktioniert ohne
JavaScript, während der Browser weiterhin die vorhandenen Cookie-Einstellungen
öffnet. Telefonnummer, E-Mail und Datenschutzwege bleiben direkt erreichbar.

Die historische Adresse `/hausmeisterservice-wiesbaden/` erhält einen fachlich
passenden Nachfolger. Es sind damit 13 genaue Altpfad-Mappings, ausgeführt über
sofortigen Meta-Refresh und Ziel-Canonical auf dem bestehenden GitHub Pages.

## Prüfung

39 JavaScript-Tests und 150 PHP-Prüfungen bestanden, ohne echte E-Mails auszulösen.
Der vollständige Build und die SEO-Prüfung bestätigen die 55 erlaubten Seiten,
Metadaten, Schemas, interne Links, Footerziele und 13 Weiterleitungen. Die 203
vorhandenen Bildvarianten wurden bytegenau geprüft. Das größere Hauptpaket bleibt
ein Performance-Prüfpunkt; eine konkrete Feld-CWV-Auswirkung wurde nicht gemessen.

Veröffentlichung, Google-Indexierung und tatsächliche Anfragen sind gesonderte
Nachweise. Der [Pflegeworkflow](KEYWORD_WORKFLOW.md) hält die Zustände getrennt.
