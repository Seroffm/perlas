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

OpenSEO-Keyword-Recherche am 06.10.2026 erneut im lokalen Tool geprüft: sowohl eine wiederholte als auch eine neue Abfrage für Deutschland endeten mit einem Serverfehler. Die Keyword-Zuordnung ist daher eine intentbasierte Arbeitshypothese, keine durch Suchvolumen/KD bestätigte Liste. Keine Zugangsdaten verändert.
