# Lokale Entwicklung und Zusammenarbeit

Repository: <https://github.com/Seroffm/perlas>, Produktion: <https://perlas.de/>.
Die Architektur und Änderungsstellen stehen in [PROJECT_MAP.md](PROJECT_MAP.md).
[AGENTS.md](../AGENTS.md) erhält den Arbeitskontext für folgende Codex-Sitzungen.

## Einrichtung

Benötigt: Node ≥20.9 (für diese Arbeitsumgebung Node 24, siehe `.nvmrc`), npm sowie
PHP ≥8.2 mit `curl`, `fileinfo` und `zip`. Das PHP-Backend benötigt kein Composer.
Auf diesem Mac wurde PHP über `brew install php` eingerichtet; ein PHP-Systemdienst
ist für die Entwicklung nicht erforderlich.

```sh
npm ci
npm run setup
npm run doctor
npm run dev:local
```

Die Vorschau läuft fest unter <http://127.0.0.1:5173/>. Ein belegter Port führt zu
einem Fehler statt zu einem unbemerkten Portwechsel. Änderungen an Quellen werden
automatisch übernommen. Stoppen jeweils mit `Ctrl+C` im zugehörigen Terminal.

`setup` erstellt die ignorierte `.env.development.local` nur, wenn sie fehlt:
lokale Domain, Indexierung aus, keine Analytics-ID, leere Live-API-Adresse und
Angebots-Demomodus. Vorhandene Einstellungen werden erhalten. Diese Datei wirkt
nur in Vites Entwicklungsmodus und verändert den Produktionsbuild nicht.
Keine allgemeine `.env.local` anlegen: Sie würde auch Produktionsbuilds beeinflussen.

## Befehle

| Befehl | Zweck |
| --- | --- |
| `npm run setup` | Lokale Konfiguration und auf Apple Silicon isolierten Bildprüfer einrichten. |
| `npm run doctor` | Node, Abhängigkeiten, PHP-Erweiterungen, lokale Konfiguration und Git-Remote prüfen; kein Netzwerkzugriff. |
| `npm run dev:local` | Frontend mit Hot Reload auf Port 5173. |
| `npm run dev:api` | PHP-API auf Port 8080, ausschließlich Loopback. |
| `npm test` | Vorhandene Offline-Tests für Analytics, Kurzanfrage und Altpfade. |
| `npm run test:php` | Backendtests mit Mocktransport; keine echten E-Mails. |
| `npm run lint` | TypeScript-Prüfung; kein ESLint. |
| `npm run build:pages` | Produktionsbuild einschließlich statischer Seiten in `dist/`. |
| `npm run check:seo` | Zuvor erzeugte Seiten, Links, Metadaten, Schema und Weiterleitungen prüfen. |
| `npm run check:images:reference` | Strengen Bildvergleich in der passenden Referenzlaufzeit ausführen. |
| `npm run check` | Tests, Produktionsbuild, SEO und Referenz-Bildvergleich nacheinander ausführen. |
| `npm run report:keywords` | Nach dem Build Keyword-Zuordnung und Nachweise in Title, H1 und Hauptinhalt aktualisieren. |
| `npm run preview:local` | Zuvor erzeugten Produktionsbuild auf <http://127.0.0.1:4173/> ansehen. |

`npm run build` allein erzeugt nicht alle statischen Seiten. Für die vollständige
Website immer `build:pages` verwenden. Build und Prüfungen veröffentlichen nichts.
Die Produktionsvorschau verwendet die Produktionskonfiguration einschließlich der
Live-API-Adresse; für isolierte Formular-/Designarbeit `dev:local` verwenden.

## Formulare und Backend

Die lokale API kann separat laufen; `GET http://127.0.0.1:8080/health` liefert
`{"ok":true}`. Der vorhandene Backend-Code akzeptiert ausschließlich festgelegte
öffentliche Origins und damit keine Formularübermittlung von localhost.

Bei der isolierten Frontendkonfiguration simuliert ausschließlich die ausführliche
Angebotsanfrage den ausdrücklich gekennzeichneten Demo-Erfolg. Kontakt-/Kurzanfragen
melden eine fehlende Übermittlungsmöglichkeit; Bewerbungen bieten einen E-Mail-Entwurf.
PHP- und JavaScript-Tests prüfen den Formularvertrag offline mit Mockantworten.
Die lokale Vorschau ist damit kein Nachweis einer produktiven E-Mail-Zustellung.

Echter Versand benötigt eine verifizierte Resend-Domain, einen serverseitigen Schlüssel,
einen privaten Zustandsschlüssel und das bestehende HTTPS-Hosting. Einrichtung:
[server/README.md](../server/README.md). Schlüssel gehören ausschließlich in die private
Serverkonfiguration; für lokale Offlineprüfungen werden keine benötigt.

## Bytegenaue Bilder auf Apple Silicon

Die eingecheckten Bilder sind unter x64 reproduzierbar. Beim Einrichten wurde
nachgewiesen: gleiche Sharp-/libvips-/WebP-Versionen erzeugen unter ARM64 teilweise
andere Bytes; x64/Rosetta prüft alle 73 Bildsets und 203 Varianten bytegenau.
Die Bilddateien wurden dafür nicht verändert und der Vergleich nicht abgeschwächt.

`npm run setup:images` installiert auf einem ARM-Mac Sharp in `.tmp-sharp-x64/`;
eine vorhandene passende Version wird erhalten. Voraussetzung sind Rosetta und eine
x64-fähige Node-Laufzeit (auf diesem Mac vorhanden). Der Referenzprüfer startet Node
über `arch -x86_64` und verwendet ausschließlich dieses isolierte Sharp-Modul.
Auf anderen Plattformen verwendet er die native Installation.

`npm run check:images` bleibt der ursprüngliche native Vergleich und kann auf ARM64
abweichen. Bild-Neugenerierung ist eine separate Änderung: dafür eine zur Referenz
passende Laufzeit verwenden und die resultierenden Assets bewusst prüfen.

## Git und Rückweg zu GitHub

`origin` zeigt auf `https://github.com/Seroffm/perlas.git`; `main` verfolgt `origin/main`.
Die Einrichtung liegt auf `codex/perlas-setup`. Weitere Änderungen erfolgen auf
passenden `codex/`-Branches. Vor Beginn `git status --short --branch` prüfen und bei
sauberem Arbeitsstand `git fetch origin --prune` für neue Remote-Stände verwenden.

Die Einrichtung begann mit Leserechten. Für die Veröffentlichung wurde am
16.11.2026 der lokale GitHub-CLI-Zugang mit Schreibrecht geprüft. Der veröffentlichte
Quellenstand ist `6c963e1`; GitHub Pages veröffentlicht den gebauten Stand aus
`gh-pages` bei `8115f7d`. Alle 46 kanonischen URLs wurden anschließend mit HTTP 200
und identischem Inhalt gegen den geprüften Build bestätigt. Diese Live-Prüfung
ist kein Nachweis der Google-Indexierung. Keine Zugangsdaten in diese Dokumentation
aufnehmen. Die Pflege dieser Zustände beschreibt [KEYWORD_WORKFLOW.md](KEYWORD_WORKFLOW.md).

## Ausgangsstand für die Optimierung

Basis: `main` bei Commit `f9b02af` (Einrichtung am 16.11.2026).
Build, TypeScript, 39 JavaScript-Tests, 150 PHP-Prüfungen und der SEO-Check für
42 kanonische Seiten liefen erfolgreich. Die Referenz-Bildprüfung bestätigt 73 Sets
mit 203 Varianten. Start- und Kontaktseite wurden in der lokalen Browservorschau geöffnet.

Der nachfolgende Optimierungsstand auf `codex/perlas-growth` umfasst 46 Seiten,
elf lokale Angebotsseiten und zwölf Altpfad-Zuordnungen. Der React-Hinweis zum
`fetchPriority`-Attribut wurde im gemeinsamen Bildbaustein behoben; der statische
Renderer öffnet auch keinen WebSocket-Port mehr. Vite meldet weiterhin ein Hauptpaket
über 500 kB. Feldmesswerte für Core Web Vitals fehlen; Paketgröße allein beweist
kein konkretes Performanceproblem.

Neue Seiten, Keyword-Pflege und Veröffentlichungsstand:
[SEO_GROWTH_IMPLEMENTATION.md](SEO_GROWTH_IMPLEMENTATION.md).

## Zweite Erweiterung vom 16.11.2026

Der neue Build umfasst 55 Seiten, 20 lokale Angebote, 13 Commercial-Landingpages und 13 genaue Weiterleitungen. `SiteFooter.tsx` wird im Browser und im initialen HTML gemeinsam gerendert; `footer-links.json` hält die direkten Leistungen und Orte. Die Keyword-Registry enthält 433 Begriffe: 337 aktiv eingeplant und 96 archivierte Beispielthemen ohne Ziel-URL. Die Beispiele sind kein offener Arbeitsauftrag und werden nicht als vorhandene Leistung ausgegeben. Weitere Angaben: [REGIONAL_EXPANSION.md](REGIONAL_EXPANSION.md) und [PURCHASE_INTENT_PLAN.md](PURCHASE_INTENT_PLAN.md).

Die zweite Erweiterung wurde anschließend nach `main` und `gh-pages` veröffentlicht (inhaltlicher Quellenstand `ff36fa2`, Pages `efdfa5d`). Alle 55 URLs und veröffentlichten Assets wurden mit dem Build abgeglichen. Die lokale Git-Konfiguration verwendet den vorhandenen GitHub-CLI-Zugang; für die Pflege ist kein Token in Projektdateien nötig.

## Gezielte Leistungsangebote vom 16.11.2026

Der nachfolgende Build enthält 59 kanonische Seiten: vier zusätzliche Angebote
unter `/leistungen/treppenhausreinigung/`, `/leistungen/heckenschnitt/`,
`/leistungen/winterdienst-gewerbe/` und `/leistungen/hausmeisterservice-gewerbe/`.
`FocusedServiceLandingPage.tsx` wird im Browser und im statischen Build aus
`focused-service-data.json` gerendert. Die vorhandenen Büro- und
Tiefgaragen-Landingpages enthalten zusätzliche Angebots-/Kostenhilfen.

Für neue gezielte Leistungsseiten müssen ihre expliziten Pfade zusätzlich in
Analytics und der unabhängigen SEO-Routenprüfung freigegeben werden. Die bestehende
regionale Sammlung bleibt bei 20 Angeboten; Leistungsübersicht, Elternleistungen
und passender Footer führen zu den neuen Seiten. `newLocalPagePaths` in der
Keyword-Registry ist ein historischer Feldname und enthält jetzt alle 17 heute
erstellten Angebotsseiten, auch die vier neuen Leistungspfade. Veröffentlichung
und Google-Indexierung bleiben separate Zustände.

Der 59-Seiten-Stand wurde aus Quellenstand `199496d` im Pages-Release `e5e4cba`
veröffentlicht (Lauf `43893639104`, erfolgreich). Alle kanonischen URLs und aktuellen
Programm-/Stildateien wurden live mit dem Build abgeglichen. In der Keyword-Registry
sind alle 30 zugeordneten Ziel-URLs und 17 neuen Angebotsseiten als live geprüft
geführt. Nachfolgende Pflege dieser Nachweise verändert den ausgelieferten Build
nicht.
