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

Die am 16.11.2026 geprüften GitHub-Verbindungen und der lokale CLI-Zugang haben für
dieses Repository ausschließlich Leserechte (`READ`). Laden und lokale Entwicklung
funktionieren. Direkter Push in das Quellrepository benötigt Schreibrecht. Alternativ
können Änderungen über einen eigenen Fork und Pull Request eingereicht werden;
dieser Rückweg und ein Hosting-Deployment wurden hier nicht eingerichtet.
Keine Zugangsdaten in diese Dokumentation aufnehmen.

## Ausgangsstand für die Optimierung

Basis: `main` bei Commit `f9b02af` (Einrichtung am 16.11.2026).
Build, TypeScript, 39 JavaScript-Tests, 150 PHP-Prüfungen und der SEO-Check für
42 kanonische Seiten liefen erfolgreich. Die Referenz-Bildprüfung bestätigt 73 Sets
mit 203 Varianten. Start- und Kontaktseite wurden in der lokalen Browservorschau geöffnet.

Vorhandene Befunde für die anschließende Optimierung: Vite meldet ein Hauptpaket
über 500 kB und React beim statischen Rendern einen Hinweis zum `fetchPriority`-Attribut.
Diese Hinweise verhindern den Build nicht. Als nächste Arbeit bieten sich ein gezielter
Performance- und Mobilcheck und die gemeinsame Priorisierung von Nutzerführung,
Inhalten und SEO an. Einrichtung ist keine vollständige Website-Optimierung oder Live-SEO-Prüfung.
