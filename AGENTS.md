# Perlas: Arbeitskontext

## Projekt und Einstieg

- Repository: `https://github.com/Seroffm/perlas.git`, Hauptbranch `main`.
- Öffentliche Website: `https://perlas.de/`.
- React/TypeScript/Vite mit statischem Seitenbuild; separates PHP-Backend für Formulare.
- Einstieg: `docs/DEVELOPMENT.md` für Einrichtung und Befehle, `docs/PROJECT_MAP.md` für Architektur und Änderungsstellen.
- Gestalterische Grundlage: `DESIGN_LANGUAGE.md`; Bildquellen: `BILDNACHWEIS.md`.

## Lokaler Arbeitsablauf

- Node gemäß `.nvmrc`, Abhängigkeiten mit `npm ci`; `npm run setup` erstellt die lokale Entwicklungskonfiguration, ohne vorhandene Einstellungen zu überschreiben.
- `npm run dev:local`: Vorschau unter `http://127.0.0.1:5173/` mit Hot Reload.
- `npm run dev:api`: PHP unter `http://127.0.0.1:8080/`; `/health` prüft Routing, nicht den E-Mail-Versand.
- `npm run doctor`: lokale Voraussetzungen prüfen. `npm run check`: vorhandene JavaScript-/PHP-Tests, Produktionsbuild, SEO- und bytegenaue Bildprüfung.
- Auf Apple Silicon verwendet `check:images:reference` die isolierte x64-Laufzeit; Details und Installation in `docs/DEVELOPMENT.md`. Native Encoder-Abweichungen nicht durch pauschales Neugenerieren der Bilder kaschieren.
- Auf einem passenden `codex/`-Branch arbeiten. Vor Änderungen Git-Status prüfen und vorhandene Nutzeränderungen erhalten.

## Änderungen und Prüfung

- Die meisten Seiten haben React-Inhalte und gesondert erzeugtes initiales HTML in `scripts/prepare-pages.mjs`. Beide Darstellungen berücksichtigen; Frankfurt verwendet eine gemeinsame React-Komponente.
- `dist/`, `node_modules/`, `.tmp-*/` und private Konfigurationen sind lokale bzw. generierte Dateien.
- Für UI-Änderungen die betroffenen Seiten im Browser auf Desktop und Mobilgerät prüfen. Relevante bestehende Tests ausführen; vollständigen Build bei Inhalts-/Routingänderungen prüfen.
- Routing, Canonicals, strukturierte Daten, Sitemap und Analytics-Routen müssen zusammenpassen. Neue URLs bewusst in den bestehenden Prüfungen ergänzen.
- Formularerfolg und Lead-Messung müssen auf bestätigten Serverantworten beruhen. Der vorhandene Angebots-Demomodus gilt ausschließlich in der Entwicklung.
- Lokale `.env.development.local` isoliert die Vorschau von Live-Formularen und Analytics. `.env.production` steuert den Produktionsbuild.
- Keine privaten Schlüssel oder Formulardaten in Frontenddateien, Logs oder Git übernehmen. Lokale Backendtests verwenden Mocktransport.
- Projektübersicht und Entwicklungsanleitung bei wesentlichen Architektur-/Workflowänderungen aktualisieren; offene technische Befunde dort nachvollziehbar festhalten.
