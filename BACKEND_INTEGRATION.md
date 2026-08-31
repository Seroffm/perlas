# Backend-Vorbereitung für Blog und Karriere

Die Website funktioniert weiterhin vollständig als statische GitHub-Pages-Seite. Blogbeiträge und Stellenbereiche liegen strukturiert in JSON-Dateien und können später ohne Umbau der Oberfläche durch ein CMS oder eine API ersetzt werden.

## Inhalte

- Blogbeiträge: `src/blog-data.json`
- Stellenbereiche: `src/job-data.json`
- Gemeinsame TypeScript-Typen: `src/content-types.ts`

Ein späteres CMS sollte dieselben Felder liefern. Die vorhandenen JSON-Dateien können dabei als Fallback für Build und Vorschau bestehen bleiben.

## Bewerbungs-API

Die Frontend-Anbindung liegt in `src/backend.ts`. Sobald `VITE_PERLAS_API_URL` gesetzt ist, sendet das Karriereformular eine `multipart/form-data`-Anfrage an:

```text
POST {VITE_PERLAS_API_URL}/career-applications
```

Übermittelte Felder:

- `name`
- `email`
- `phone`
- `role`
- `message`
- `source`
- `privacyConsent`
- `attachment` (optional)

Erwartet wird ein HTTP-Status zwischen 200 und 299. Ohne konfigurierte API öffnet das Formular eine vorbereitete E-Mail an `mail@perlas.de`. Eine ausgewählte Datei muss in diesem Übergangsmodus vom Bewerber manuell an die E-Mail angehängt werden.

## Anforderungen vor Produktivbetrieb

1. API ausschließlich über HTTPS bereitstellen.
2. Dateityp und Dateigröße serverseitig erneut prüfen.
3. Rate-Limit, Spam-Schutz und Protokollierung ohne unnötige personenbezogene Daten ergänzen.
4. Bewerbungsdaten nur berechtigten Personen zugänglich machen.
5. Löschfristen und Rechtsgrundlage mit dem finalen Datenschutztext abstimmen.
6. Zulässige Frontend-Domains per CORS begrenzen.
7. Erfolgs- und Fehlerantworten als JSON zurückgeben.

Die benötigten Umgebungsvariablen sind in `.env.example` dokumentiert.

