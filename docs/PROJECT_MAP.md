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
- Ausnahme Frankfurt: Vite lädt die React-Komponente im Build ohne Netzwerkport; `renderToStaticMarkup` rendert sie mit `staticMode`. Formulare erhalten dann direkte Kontaktalternativen.
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
- `npm run check:seo`: prüft den zuvor erzeugten Build, einschließlich der ausdrücklich erlaubten 42 kanonischen Seiten, interner Links, Metadaten, Schema und Altpfade. Bei neuen freigegebenen Seiten die unabhängige Routenliste bewusst aktualisieren.
- `npm run check:images`: prüft Bildmanifest und generierte Bilddateien.
- `node --test src/*.test.mjs scripts/*.test.mjs`: vorhandene Offlineprüfungen für Analytics/Einwilligung, Kurzanfrage/Transport und Altpfad-Zuordnung.
- `php server/tests/test.php`: Backendprüfungen mit Mocktransport ohne echten Versand; PHP ≥8.2 und die dokumentierten Erweiterungen erforderlich.

Lokale Leistungsversprechen, Referenzen, Bewertungen und Änderungsdaten nur mit
nachvollziehbarer Grundlage anpassen. Recherchekontext steht in
`docs/local-landing-research-2026-10-07.json`; Datenlücken sind keine gemessene Nullnachfrage.
