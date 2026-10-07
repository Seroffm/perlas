# perlas

Live: https://perlas.de/

## SEO auf bestehenden Seiten

Die Seite verwendet React/Vite und statisch erzeugtes HTML, nicht WordPress. `npm run build:pages` erzeugt 33 kanonische Seiten (einschließlich neun Blogartikeln) mit sichtbaren Inhalten, Metadaten und strukturierten Daten. Es wurden keine zusätzlichen Leistungs- oder Stadtseiten angelegt.

- `src/seo-data.json`: gemeinsame Metadaten, lokale Einordnung und Leistungsgruppen für Start-/Übersichtsseiten. Änderungen gelten für Browser und initiales HTML.
- `src/service-data.json` und `src/audience-data.json`: Metadaten, Leistungsumfang und Angebots-FAQs der bestehenden Detailseiten.
- Unternehmensschema: `LocalBusiness`, feste Identität/Adresse/Logo; Leistungen: `Service` mit Provider und Breadcrumbs. Keine selbstbezogenen Bewertungssterne im Markup.
- `npm run check:seo`: prüft das gebaute HTML einschließlich der 33 erlaubten kanonischen URLs, internen Ratgeberlinks, 60-/155-Zeichenlimits, Canonicals, Schema, realen Änderungsdaten und neun Altpfad-Weiterleitungen.
- `node --test src/analytics.test.mjs`: prüft die Einwilligungslogik offline ohne externe Anfragen.

Analytics erfasst bestätigte Kontakt-/Angebots-/Kurzanfragen als `generate_lead` mit fester Formularart (`contact`, `quote`, `quick_contact`). Telefon-, E-Mail- und WhatsApp-Linkklicks werden getrennt als `phone_click`, `email_click` und `whatsapp_click` erfasst. Nur bei gültiger Analyse-Einwilligung und geladenem Analytics; keine Formularfelder, Vorgangsnummern oder Bewerbungen, kein nachträgliches Erfassen. Kontaktklicks sind keine zugestellten Anfragen oder bestätigten Gespräche.

Für künftige freigegebene Suchanzeigen erkennt die Messung ausschließlich die festen Kombinationen `utm_source=google&utm_medium=cpc` bzw. `utm_source=bing&utm_medium=cpc`. Andere URL-Parameter, Kampagnennamen und Anzeigenklick-IDs werden nicht übermittelt. Diese begrenzte Erkennung ersetzt keine vollständige Kampagnen-/CRM-Attribution; sie erstellt keine Werbung und aktiviert keine Werbefunktionen.

## Anfragewege und lokale Inhalte

- Die Kurzanfrage funktioniert über den vorhandenen Kontakt-Endpunkt und verlangt keine vollständige Objektadresse. Die ausführliche Angebotsanfrage bleibt verfügbar. Bestätigungen/Vorgangsnummern werden nur nach tatsächlich erfolgreicher Serverantwort angezeigt.
- Sieben bestehende Leistungsseiten verweisen kontextuell auf passende Ratgeber. Die aktualisierten Leistungsseiten haben feste, inhaltlich begründete `updatedOn`-Werte; kein tägliches künstliches Hochsetzen von `lastmod`.
- `src/legacy-redirects.json` aktiviert neun sofortige HTML-Weiterleitungen zu fachlich passenden bestehenden Seiten. GitHub Pages liefert diese Dateien mit HTTP 200 + `meta refresh 0`; es sind keine serverseitigen HTTP-301. Die Altpfade stehen nicht in der Sitemap und enthalten keine kopierten Serviceinhalte, App-Skripte oder Analytics. `node --test scripts/legacy-redirects.test.mjs` prüft das sichere Mapping.

## Geschäftserfolg nachhalten

Perlas sollte pro echter Anfrage intern Quelle (soweit bekannt), Datum, Leistung, Ort/Objekttyp, verantwortliche Person und Status pflegen: **neu → qualifiziert → Erstgespräch/Begehung → Angebot → Auftrag oder abgesagt**. Qualifiziert bedeutet: angebotene Leistung, realer Einsatzort, geeigneter Ansprechpartner und wirtschaftlich passender Bedarf. Wöchentlich qualifizierte Anfragen, Angebotsquote, gewonnene Aufträge und Reaktionszeiten prüfen. Keine Kundendaten oder Vorgangsnummern in öffentliche Dateien oder Analytics übernehmen.

Reale lokale Referenzfälle, aktuelle freie Kapazitäten und eine verlässliche Rückmeldefrist benötigen die fachliche Bestätigung/Freigabe von Perlas. Google-Unternehmensprofil-Änderungen benötigen Zugriff auf das bestehende Profil; keine Ersatzprofile oder erfundenen Standorte anlegen. Werbung benötigt ein freigegebenes Budget und eigene Erfolgsmessung.

OpenSEO-Recherche am 06.10.2026: 653 lokale Keyword-Kandidaten über alle Leistungsgruppen, darunter 158 auftragsspezifische Longtails. Das Tool lieferte 74 Keywords mit positivem geschätztem Monatsvolumen; fehlende Werte sind unbekannt, nicht null Nachfrage. Varianten desselben Begriffs dürfen nicht addiert werden. Weitere Discovery-Abfragen scheiterten separat mit HTTP 402 beim Datenanbieter. Keine Zugangsdaten verändert und keine Credits gekauft. Die private Recherche-Arbeitsmappe gehört nicht zum öffentlichen Website-Build.

Die aktuelle Sitemap liegt unter `/sitemap.xml`; `/sitemap_index.xml` bleibt als gültiger Index auf diese Sitemap für ältere Search-Console-Einträge erreichbar. Indexierbarkeit und Sitemap-Einreichung garantieren weder sofortige Aufnahme noch Rankings.
