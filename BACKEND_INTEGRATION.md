# Formularanbindung und Inhalte

Die Website wird statisch ausgeliefert. Alle Onlineformulare senden an ein separates PHP-Backend unter `https://api.perlas.de`; dieses leitet die Angaben mit Resend an `mail@perlas.de` weiter. Der Resend-Schlüssel liegt ausschließlich in der privaten Serverkonfiguration. Die Installation und Betriebsanforderungen stehen in [server/README.md](server/README.md).

## Frontend-Konfiguration

```dotenv
VITE_PERLAS_API_URL=https://api.perlas.de
PERLAS_SITE_URL=https://www.perlas.de/
PERLAS_INDEX_SITE=true
```

Die öffentliche API-Adresse wird beim Build eingebunden. Nach einer Änderung ist ein neuer Build erforderlich. `PERLAS_SITE_URL` steuert den Basispfad und die URLs für Canonicals, strukturierte Daten und Sitemap. Der tatsächlich verwendete Domainstand muss zur Hosting-Konfiguration passen.

`VITE_*`-Werte sind im Browser öffentlich. Weder API-Schlüssel noch andere Geheimnisse dürfen dort abgelegt werden. `.env.example` enthält ausschließlich die dokumentierte Beispielkonfiguration.

## Formulare und Endpunkte

Die gemeinsame Frontend-Anbindung liegt in `src/backend.ts`. Alle Anfragen verwenden `multipart/form-data` und den Header `Accept: application/json`.

| Formular | Verwendung | Endpunkt | Formularfelder |
| --- | --- | --- | --- |
| Angebot | Globale Lightbox, auch von Startseite und Kontaktseite erreichbar | `POST /quote-requests` | `propertyType`, `street`, `location`, `services`, `preferredStart`, `details`, `name`, `company`, `email`, `phone` |
| Direktanfrage | Leistungsdetailseiten und Zielgruppenseiten | `POST /contact-requests` | `subject`, `name`, `company`, `email`, `phone`, `street`, `location`, `message` |
| Bewerbung | Karriereseite | `POST /career-applications` | `name`, `email`, `phone`, `role`, `message`, optional `attachment` |

`services` ist ein JSON-Array mit ausgewählten Leistungsnamen. Alle Formulare ergänzen:

- `source`: Origin und Pfad der Formularseite, ohne Query oder Fragment.
- `privacyConsent`: der String `true`, nachdem die erforderliche Datenschutzzustimmung geprüft wurde.
- `website`: leeres Honeypot-Feld, visuell verborgen, nicht per `display: none` aus dem Layout entfernt und für Tastatur sowie Assistenztechnik ausgeblendet.
- `requestId`: zufällige UUID. Bei unveränderten Wiederholungen nach einem Fehler bleibt die Kennung im aktuellen Seitenkontext gleich; veränderte Eingaben oder Dateiinhalte erhalten eine neue Kennung.

Der Client erwartet eine JSON-Antwort mit derselben `requestId`:

```json
{"ok":true,"requestId":"<gesendete UUID>","confirmationEmailSent":false}
```

Ein HTTP-2xx-Status allein genügt nicht. Fehler liefern beispielsweise mit Status 422, 429 oder 5xx:

```json
{"ok":false,"message":"Verständliche Fehlermeldung"}
```

Der Client bricht nach 25 Sekunden ab. Während des Versands verhindert er doppelte Klicks und zeigt einen Versandstatus. Bei Fehlern bleiben die Eingaben erhalten. Der Server bestätigt Erfolg erst, wenn Resend die interne E-Mail angenommen hat; dies ist noch keine Garantie für den Eingang im Postfach.

## Empfänger und Bestätigungen

Das Backend verschickt eine Text-E-Mail an den festen Empfänger `mail@perlas.de` mit dem festen Absender `Perla's <formulare@perlas.de>`. Die validierte Nutzermail wird ausschließlich als `reply_to` gesetzt. Versandempfänger, Absender und Attachment-URLs lassen sich nicht durch Formularfelder bestimmen.

Der aktuelle Server verschickt keine automatischen Bestätigungen an Nutzermails. Daher ist `confirmationEmailSent` derzeit immer `false`, und die Oberfläche behauptet keine versandte Bestätigung.

## Validierung und Dateien

Name und E-Mail sind in allen Formularen erforderlich. Die Direktanfrage benötigt außerdem Thema und Nachricht, die Bewerbung Bereich und Nachricht, das Angebot Objektart, Adresse und mindestens eine Leistung. Die Angebotsoberfläche verlangt zusätzlich einen gewünschten Startzeitpunkt.

Textlimits: Name 160, E-Mail 254, Telefon 60, Unternehmen/Straße/Ort/Thema/Bereich jeweils 200, Nachricht und Objektdetails jeweils 6000 Zeichen. Objektart und Beginn werden serverseitig auf 120 Zeichen begrenzt; höchstens 16 Leistungen mit jeweils 100 Zeichen sind zulässig.

Nur Bewerbungen dürfen genau eine optionale Datei mit bis zu 5 MB enthalten. Zulässig sind PDF, DOC, DOCX, JPEG und PNG. Das Frontend prüft Größe und Dateiendung; das Backend prüft zusätzlich tatsächlichen MIME-Typ und Signatur. Die Datei wird intern als E-Mail-Anhang übertragen und nicht öffentlich gespeichert. MIME- und Signaturprüfungen ersetzen keine Malwareprüfung.

Weitere serverseitige Schutzmaßnahmen umfassen Origin- und Quellenprüfung, eingeschränkte CORS-Origins, feste Empfänger, Größenbegrenzungen, Honeypot, Ratenlimits und Schutz vor Doppelversand. Die konkrete Implementierung und private Zustandsverwaltung sind in `server/README.md` dokumentiert.

## Betrieb ohne aktivierte API

Angebot und Direktanfrage zeigen bei fehlender API-Konfiguration eine ehrliche Fehlermeldung und behalten die Eingaben. Das Karriereformular kann ohne API-Konfiguration weiterhin eine vorbereitete E-Mail öffnen; eine ausgewählte Datei muss dann manuell angehängt werden. Bei konfigurierter API wird nach einem Versandfehler nicht automatisch auf einen E-Mail-Versand gewechselt.

Die statischen HTML-Fallbacks für Karriere und Zielgruppen enthalten keine `mailto`-Formulare mehr. Sie erklären, dass das Onlineformular JavaScript benötigt, und bieten direkte E-Mail- beziehungsweise Telefonlinks an. Persönliche Kontaktalternativen bleiben auf allen betroffenen Seiten erhalten.

## Inhaltsverwaltung

- Blogbeiträge: `src/blog-data.json`
- Stellenbereiche: `src/job-data.json`
- Gemeinsame Inhaltstypen: `src/content-types.ts`
- Technischer Datenschutzablauf: `src/privacy-content.json`

Ein späteres CMS kann dieselben Felder liefern; die JSON-Dateien bleiben als Build- und Vorschaufallback verwendbar. Die technische Beschreibung des Formularversands ersetzt keine rechtliche Prüfung der Datenschutzerklärung oder die organisatorische Festlegung von Zugriffsrechten und Löschfristen.

## Prüfung ohne externen Versand

```text
npm run lint
npm run build:pages
php server/tests/test.php
```

Die PHP-Tests verwenden einen Mocktransport. Die Frontend-Anbindung wurde zusätzlich mit lokal gemocktem `fetch` auf alle drei Endpunkte, bereinigte Quellen, UUID-Wiederholungen, geänderte Dateiinhalte, JSON-Antworten und den Timeout geprüft. Externe Tests über die produktive Domain und reale E-Mail-Eingänge müssen als solche bewusst durchgeführt werden.

