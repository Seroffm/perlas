# perlas

Live: https://perlas.de/

## SEO auf bestehenden Seiten

Die Seite verwendet React/Vite und statisch erzeugtes HTML, nicht WordPress. `npm run build:pages` erzeugt die vorhandenen 27 kanonischen Seiten mit sichtbaren Inhalten, Metadaten und strukturierten Daten. Es wurden keine zusätzlichen Leistungs- oder Stadtseiten angelegt.

- `src/seo-data.json`: gemeinsame Metadaten, lokale Einordnung und Leistungsgruppen für Start-/Übersichtsseiten. Änderungen gelten für Browser und initiales HTML.
- `src/service-data.json` und `src/audience-data.json`: Metadaten, Leistungsumfang und Angebots-FAQs der bestehenden Detailseiten.
- Unternehmensschema: `LocalBusiness`, feste Identität/Adresse/Logo; Leistungen: `Service` mit Provider und Breadcrumbs. Keine selbstbezogenen Bewertungssterne im Markup.
- `npm run check:seo`: prüft das gebaute HTML einschließlich der unveränderten 27 URLs, internen Links, 60-/155-Zeichenlimits, Canonicals, Schema und regionaler Inhalte.
- `node --test src/analytics.test.mjs`: prüft die Einwilligungslogik offline ohne externe Anfragen.

Analytics erfasst bestätigte Kontakt-/Angebotsanfragen als `generate_lead` mit fester Formularart und Klicks auf den Telefonlink als `phone_click`. Nur bei gültiger Analyse-Einwilligung und geladenem Analytics; keine Formularfelder, Vorgangsnummern oder Bewerbungen, kein nachträgliches Erfassen. Ein Telefonklick ist kein bestätigtes Telefonat.

OpenSEO-Recherche am 06.10.2026: 653 lokale Keyword-Kandidaten über alle Leistungsgruppen, darunter 158 auftragsspezifische Longtails. Das Tool lieferte 74 Keywords mit positivem geschätztem Monatsvolumen; fehlende Werte sind unbekannt, nicht null Nachfrage. Varianten desselben Begriffs dürfen nicht addiert werden. Weitere Discovery-Abfragen scheiterten separat mit HTTP 402 beim Datenanbieter. Keine Zugangsdaten verändert und keine Credits gekauft. Die private Recherche-Arbeitsmappe gehört nicht zum öffentlichen Website-Build.

Die aktuelle Sitemap liegt unter `/sitemap.xml`; `/sitemap_index.xml` bleibt als gültiger Index auf diese Sitemap für ältere Search-Console-Einträge erreichbar. Indexierbarkeit und Sitemap-Einreichung garantieren weder sofortige Aufnahme noch Rankings.
