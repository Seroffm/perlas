# Projektübersicht

Perlas ist eine statisch ausgelieferte Website mit React 18, TypeScript und Vite.
Die Formular-API ist ein getrenntes PHP-System. Es gibt kein WordPress, kein CMS
und keine Datenbank im Website-Projekt. Einrichtung und Befehle: [DEVELOPMENT.md](DEVELOPMENT.md).

## Einstieg und Seiten

| Datei | Verantwortung / Ansatzpunkt für Änderungen |
| --- | --- |
| `src/main.tsx` | Lädt Schrift und globale Styles, initialisiert Analytics und startet React mit `createRoot`. |
| `src/App.tsx` | Ermittelt die Seite aus `window.location.pathname` und Vites Basispfad; gemeinsame Navigation, Footer, Kontaktaktionen, Startseite, Leistungs-/Zielgruppenseiten und Rechtstexte. Kein Router-Paket. |
| `src/ContactPage.tsx`, `src/CareerPage.tsx`, `src/BlogPage.tsx` | Nachgeladene Kontakt-, Karriere-, Blogübersichts- und Artikelansichten. |
| `src/LocalLandingPage.tsx` | Einsatzgebiete-Hub und allgemeine lokale Leistungsseiten. |
| `src/FrankfurtLandingPage.tsx` | Eigene Gestaltung für `hausmeisterservice-frankfurt`; dieselbe Komponente wird auch statisch gerendert. |
| `src/CommercialLandingPage.tsx` | Angebotsansicht für die ersten 13 recherchierten Themen-/Ortsseiten mit individueller Planungstabelle und Kurzformular; dieselbe Komponente rendert das initiale HTML. |
| `src/FocusedServiceLandingPage.tsx` | Reduzierte Angebotsansicht für vier Leistungsseiten und 16 weitere Orts-/Stadtteilangebote; Browser und initiales HTML nutzen dieselbe Komponente. |
| `src/QuickContactForm.tsx`, `src/QuoteModal.tsx` | Kurzanfrage und ausführliche Angebotsanfrage; weitere Kontaktformulare liegen in `App.tsx` und den Seitenkomponenten. |
| `src/styles.css` | Globale Gestaltung und viele bestehende Seiten-/Komponentenregeln; spätere Regeln und Medienabfragen bei Änderungen mitprüfen. |
| Weitere `src/*.css` | Ergänzungen für Kurzanfrage, Anfrageauswahl, Ratgeberverweise sowie lokale und Frankfurter Landingpages. |

Normale Seitenlinks laden die jeweilige URL. Nicht erkannte Pfade zeigen die
Fehlerseite. Neue Routen müssen in React, statischer Erzeugung und Prüfungen
zusammenpassen; die lokale Analytics-Routenliste ist zusätzlich ausdrücklich begrenzt.

## Inhalte und Medien

| Quelle | Inhalt |
| --- | --- |
| `src/seo-data.json` | Gemeinsame Metadaten, Übersichtsseiten, Region und Leistungsgruppen. |
| `src/service-data.json`, `src/audience-data.json` | Leistungen und Zielgruppen einschließlich Slugs, Seitentexten, Bildern, SEO und FAQs. |
| `src/local-landing-data.json` | Einzeln ausgewählte lokale Seiten; keine automatisch erzeugte Stadt-Leistungs-Matrix. |
| `src/commercial-landing-data.json` | 29 recherchierte Angebote: 13 im bisherigen Layout und 16 mit `layout: "focused"`; Typen in `src/commercial-landing-types.ts`. |
| `src/focused-service-data.json` | Vier einzeln ausgewählte Angebote zu Treppenhausreinigung, Heckenschnitt, Gewerbe-Winterdienst und Gewerbe-Hausmeisterservice; eigene Typen und `focused-services.css`. |
| `src/blog-data.json`, `src/job-data.json` | Artikel und Stellenbereiche; gemeinsame Typen in `src/content-types.ts`. |
| `src/imprint-content.json`, `src/privacy-content.json` | Impressum und Datenschutztexte. |
| `src/google-reviews-data.json` | Hinterlegte Bewertungsangaben und Originalauszüge; keine Live-Abfrage. |
| `public/assets/`, `BILDNACHWEIS.md` | Lokale Bilder, Logos und Mediennachweise. |
| `src/ResponsiveImage.tsx`, `src/image-variants.json` | Gemeinsame Zuordnung von Originalbildern zu responsiven Varianten. |

`scripts/optimize-images.mjs` erzeugt mit Sharp WebP-Dateien in
`public/assets/optimized/` und das Bildmanifest; Originale bleiben erhalten.
`--check` prüft vorhandene Dateien ohne Änderung. Keine generierten Varianten von Hand bearbeiten.

## Build und initiales HTML

- `npm run build` prüft TypeScript und erzeugt mit Vite die Browserdateien in `dist/`.
- `npm run build:pages` führt zusätzlich `scripts/prepare-pages.mjs` aus: sichtbares initiales HTML, Metadaten, Canonicals, Schema, Sitemap, Robots-Datei, Fehlerseite und Hostingdateien.
- Die meisten statischen Seiten werden durch eigene HTML-Vorlagen im Skript erzeugt. React ersetzt diese Inhalte beim Start; es findet keine allgemeine React-Hydration statt. Inhaltliche Änderungen deshalb in beiden Darstellungen prüfen.
- Die Frankfurtseite, die Angebotsseiten in beiden Layouts und der Footer verwenden jeweils dieselbe React-Komponente im Browser und im Build. Vite lädt sie ohne Netzwerkport; `renderToStaticMarkup` rendert sie mit `staticMode`. Formulare erhalten dann direkte Kontaktalternativen. Die Styles der gezielten Seiten werden bereits im initialen Stylesheet geladen.
- `vite.config.ts` und die Buildskripte verwenden `PERLAS_SITE_URL` für Basispfad und öffentliche URLs sowie `PERLAS_INDEX_SITE` für Indexierung. Das Browser-SEO wird zusätzlich in `App.tsx` aktualisiert.
- `src/legacy-redirects.json` und `scripts/prepare-legacy-redirects.mjs` erzeugen sofortige HTML-Weiterleitungen. Unter GitHub Pages sind das HTTP-200-Seiten mit Meta-Refresh, keine HTTP-301-Antworten.
- `dist/` ist ein Buildprodukt. Änderungen gehören in Quellen; `public/CNAME` und die konfigurierte Zieldomain müssen zum Hosting passen.

## Formulare und externe Integrationen

- `src/backend.ts`: gemeinsamer Multipart-Transport, Grenzen, Timeout, Retry-UUID und Prüfung der Serverbestätigung. Endpunkte: `/contact-requests`, `/quote-requests`, `/career-applications`.
- `server/public/index.php`: PHP-API mit Validierung, festen erlaubten Origins, Ratenlimits und Versand über Resend. `mail-templates.php` und das lokale E-Mail-Logo gestalten die Nachrichten. Nur `server/public/` gehört in den öffentlichen Dokumentroot.
- Private Schlüssel, Konfiguration und Retry-Zustand gehören ausschließlich außerhalb des öffentlichen Roots. Details: [Backend-Anbindung](../BACKEND_INTEGRATION.md), [Serverbetrieb](../server/README.md). Echte Versandtests erzeugen interne E-Mails und Kundenbestätigungen.
- `src/config.ts`: Der Entwicklungs-Demomodus simuliert ausschließlich die Angebotsanfrage. Kontakt-/Kurzanfragen benötigen die API; Bewerbungen können bei fehlender API eine vorbereitete E-Mail öffnen.
- `src/CookieConsent.tsx` und `src/analytics.ts`: optionale GA4-Messung erst mit gültiger Analyse-Einwilligung. Feste Ereignisse unterscheiden bestätigte Anfragen von Telefon-/E-Mail-/WhatsApp-Klicks; keine Formularinhalte oder Vorgangsnummern übermitteln.
- Das Startseitenvideo lädt YouTube erst nach Marketing-Einwilligung. Telefon, E-Mail, WhatsApp und Bewertungsprofile sind feste externe Kontakt-/Profilverweise.

## Leitplanken und vorhandene Prüfungen

[DESIGN_LANGUAGE.md](../DESIGN_LANGUAGE.md) beschreibt die gestalterische Richtung:
Markenblau `#124094`, Aktionsblau `#195B85`, Weiß, Inter 400/800, großzügige gerundete
Flächen, eine Hauptaktion je Sektion, sichtbarer Fokus und mindestens 44 × 44 px
große Klickziele. Bestehende Styles und Abweichungen am konkreten Bauteil prüfen;
mobile Darstellung, Tastaturbedienung und reduzierte Bewegung erhalten.

- `npm run lint`: TypeScript-Prüfung; kein separater ESLint-Lauf.
- `npm run check:seo`: prüft den zuvor erzeugten Build, einschließlich der ausdrücklich erlaubten 75 kanonischen Seiten, interner Links, Metadaten, Schema, Robots-Datei und 13 Altpfad-Zuordnungen. Bei neuen freigegebenen Seiten die unabhängige Routenliste bewusst aktualisieren.
- `npm run check:images`: prüft Bildmanifest und generierte Bilddateien.
- `node --test src/*.test.mjs scripts/*.test.mjs`: vorhandene Offlineprüfungen für Analytics/Einwilligung, Kurzanfrage/Transport und Altpfad-Zuordnung.
- `php server/tests/test.php`: Backendprüfungen mit Mocktransport ohne echten Versand; PHP ≥8.2 und die dokumentierten Erweiterungen erforderlich.
- `npm run report:keywords`: leitet aus Recherche-Registry und gebautem Hauptinhalt die Keyword-Übersicht mit CSV ab; Veröffentlichung und Indexierung bleiben gesondert nachzuweisen.

Lokale Leistungsversprechen, Referenzen, Bewertungen und Änderungsdaten nur mit
nachvollziehbarer Grundlage anpassen. Recherchekontext steht in
`docs/local-landing-research-2026-10-07.json`; Datenlücken sind keine gemessene Nullnachfrage.

## Regionale Erweiterung

`SiteFooter.tsx` und `footer-links.json` sind die gemeinsame Quelle für den Browser- und SSR-Footer. Der Vite-Renderer erstellt ihn vor dem ersten Seitenbuild. `commercial-landing-data.json` enthält 13 gestaltete Angebotsseiten einschließlich der neun regionalen/spezifischen Erweiterungen; Details: [REGIONAL_EXPANSION.md](REGIONAL_EXPANSION.md).

## Gezielte Leistungsseiten

Die vier Einträge in `focused-service-data.json` besitzen ausdrücklich gespeicherte
`path`-Werte unter `/leistungen/`. Sie bleiben von den 20 lokalen Seiten getrennt.
`App.tsx` und `prepare-pages.mjs` berücksichtigen diese Pfade gemeinsam bei
Routing, Canonicals und Breadcrumbs. Die Leistungsübersicht und die jeweilige
Elternleistung verlinken sie über dieselben Inhaltsdaten. Das neue Layout verwendet
schlichtere Flächen, kurze Überschriften und größere Abstände; die Markenfarben,
Schrift und bestehenden Formularkomponenten bleiben erhalten. Auswahl und
Keyword-Zuordnung: [PURCHASE_INTENT_PLAN.md](PURCHASE_INTENT_PLAN.md).

## Erweiterung am 17.11.2026

16 weitere kuratierte Orts-/Stadtteilangebote verwenden `layout: "focused"` in
`commercial-landing-data.json`. App und statischer Build wählen dieselbe reduzierte
Ansicht. Der tatsächliche Pfad bestimmt die Breadcrumb-Hierarchie; ein vorhandenes
`path`-Feld allein bedeutet nicht, dass die Seite unter `/leistungen/` liegt.
Die regionale Sammlung umfasst jetzt 36 Angebote; zusammen mit den vier
übergreifenden Leistungsangeboten sind es 40. Auswahl und 40 priorisierte
Suchphrasen: [SEARCH_EXPANSION_2026-11-17.md](SEARCH_EXPANSION_2026-11-17.md).
