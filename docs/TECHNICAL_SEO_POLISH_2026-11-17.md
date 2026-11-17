# Technische SEO-Verbesserungen vom 17.11.2026

Die Website umfasst nach der Wiederanbindung von Niedernhausen und Kelsterbach
77 kanonische Seiten, 38 regionale und vier allgemeine Angebotsseiten. Der Betrieb
hat die fortbestehende Hausmeisterleistung in beiden Orten ausdrücklich bestätigt.

## Seitenstart und Seitendaten

Das erzeugte HTML bleibt sichtbar, während App, aktive Seitendaten und die
benötigte React-Ansicht laden. Erst danach übernimmt React. Der bisherige kurze
Austausch des Hauptinhalts gegen „Seite wird geladen …“ entfällt. Sichtbare
Desktop-Inhalte werden beim Start auch nicht mehr durch Einblendanimationen
vorübergehend versteckt. Bei einem fehlgeschlagenen ersten App-Download bleiben
Leistungsbeschreibung und direkte Kontaktalternativen erhalten.

`vite-route-content.mjs` erzeugt kleine Datenmodule aus den bestehenden
JSON-Dateien. Es gibt keine zweite redaktionelle Inhaltsquelle. Globale Karten
erhalten Zusammenfassungen; nur die aktive Leistungs-, Zielgruppen-, Orts-,
Artikel- oder Rechtsseite lädt ihren vollständigen Text. Analytics importiert
keine Inhaltsvolltexte mehr. Normale Links bleiben echte URL-Navigationen.

Die gemeinsamen Einstiegspakete enthalten jetzt zusammen rund 353 kB JavaScript
statt zuvor 789 kB; gzip rund 98 statt 205 kB. Zusätzliche aktive Daten-/Ansichtschunks
werden getrennt geladen. Dies ist ein Paketvergleich, keine gemessene
Verbesserung der Besuchergeschwindigkeit. Das gemeinsame Stylesheet bleibt
absichtlich initial verfügbar, damit auch das HTML vor JavaScript gestaltet ist.

## Robustheit und Darstellung

- Dokumentierte `index.html`-Aliasse behalten nach JavaScript ihre tatsächliche
  Seite, den Canonical und die Indexierbarkeit. Sie werden nicht mehr zur
  clientseitigen Fehlerseite.
- Ungültig codierte Sprungmarken werden ignoriert; gültige Anker funktionieren
  weiter.
- Eine lokale Fehlergrenze schützt die Hauptseite bei einem fehlgeschlagenen
  Download des Angebotsdialogs. Die Kontaktalternative unterstützt Schließen,
  Escape, Fokus- und Scrollwiederherstellung sowie erneutes Öffnen.
- Die mobile Überschrift des Tiefgaragen-Ratgebers bricht korrekt um.
- Die drei Leistungsargumente der älteren Commercial-Landingpages bleiben auch
  mobil sichtbar. Hauptinhalte werden nicht für kleine Bildschirme entfernt.
- Kleine Beschriftungen, Breadcrumbs und Tabellenhinweise im fokussierten
  Angebotslayout erhalten ausreichenden Farbkontrast.

## Strukturierte Daten und Entdeckung

`src/structured-data.mjs` ist die gemeinsame Quelle für Browser und initiales
HTML. Jede kanonische Seite besitzt eine passende Seiteneinheit mit stabiler
Identität; die 76 Nicht-Startseiten haben echte Breadcrumbs. Leistungen und
Artikel bleiben mit dem tatsächlichen Sulzbacher Unternehmen verbunden.

Bestätigte Google-/Trustlocal-/YouTube-/LinkedIn-/Instagramprofile unterstützen
die Unternehmensidentität. Aus Bildern oder Ortsseiten entstehen keine
erfundenen Niederlassungen, Bewertungen, Kundenaufträge oder Qualifikationen.
Die öffentlich überprüfte Google-Angabe ist 5,0 aus 42 Rezensionen, Stand 17.11.2026.
Nicht belegte relative Rezensionsalter, Projekt-/Mieter-/Teamzahlen und eine
vorläufige Jahrzehnt-Timeline wurden bereinigt.

Robots erlaubt weiterhin den bisherigen öffentlichen Abruf. Such-/Retrievalbots
werden ausdrücklich genannt; der bestehende Zugang für Trainingscrawler bleibt
über die Wildcard unverändert. Dies ist eine dokumentierte Zugangsentscheidung,
kein zusätzlicher Google-Rankingfaktor und keine Indexierungsgarantie.

## Alte URLs und tatsächliche Leistungen

21 genaue Altpfadzuordnungen ersetzen die zuvor 13 Zuordnungen. Zusätzliche
Ratgeberziele wurden anhand archivierter Originalinhalte geprüft; nützliche
Auswahlkriterien wurden in den vorhandenen Frankfurt-Ratgeber integriert. Das
Gewerbeangebot erläutert Erreichbarkeit ohne unbelegtes Notdienstversprechen.

Die alten Hausmeisteradressen für Niedernhausen und Kelsterbach führen zu
vollständigen neuen Angeboten. Niedernhausen unterstützt die geordnete Übernahme
von Aufgaben, Schlüsseln und offenen Maßnahmen; Kelsterbach die Abgrenzung von
Gemeinschaftsflächen, Nutzungseinheiten und Zuständigkeiten. Beide Seiten
enthalten eigene Planungshilfen, Ablauf/Kosten, FAQs und Themenkontaktformulare.

Das bestehende GitHub-Pages-Verfahren liefert diese Altpfade mit sofortigem
Meta-Refresh, Ziel-Canonical und Ersatzlink aus. Es sind HTTP 200-Antworten und
keine serverseitigen 301. Unbekannte oder fachlich nicht ersetzbare Adressen
bleiben echte Fehlerseiten. Es gibt keine pauschale Umleitung auf die Startseite.

32 Angebotsseiten zeigen passende vorhandene Arbeitsbilder. Nur das belegte
Gartenpaar wird als Vorher-/Nachher-Vergleich desselben Objekts bezeichnet;
Parkhausaufnahmen zeigen Gerät und gereinigte Fläche ohne falschen Winkelvergleich.
Ein quadratisches Favicon aus dem vorhandenen Markenzeichen ergänzt den Head.

## Nachweise und Pflege

- Vollständiger Prüfablauf: `npm run check` (TypeScript/Build, JavaScript,
  PHP-Mocktransport, SEO und 203 bytegenaue Bildvarianten).
- Produktionsvorschau aller 77 Seiten nach JavaScript auf Desktop 1440 px und
  Mobil 390 px: richtige H1, Titel, Canonical, Robots und Seitenschema; keine
  abgeschnittenen Hauptüberschriften oder Dokumentüberläufe.
- Tests mit angehaltenem/fehlgeschlagenem App-Download und fehlgeschlagenem
  Angebotsdialog; Inhalte und Kontaktwege bleiben erhalten.
- Keyword-Registry: 577 exakt abgefragte Suchbegriffe; 40 Fokusbegriffe bleiben
  unverändert. Kelsterbach: 10 geschätzte Suchen/Monat deutschlandweit mit diesem
  Ortsbegriff, CPC 2,07 USD. Niedernhausen: Anbieter liefert keinen Volumenwert,
  ausdrücklich nicht als 0 behandeln. Die Wiederanbindung beruht zusätzlich auf
  dem bestätigten bestehenden Angebot. Querydatum 17.11.2026, Google Ads ohne
  Suchpartner, letzter verfügbarer Zeitraum November 2025–Oktober 2026.
- Veröffentlichung und Google-Indexierung bleiben unabhängig. URL-Prüfungen
  werden mit Datum und genauer Quelle gepflegt; HTTP 200 oder Sitemap-Erkennung
  ersetzt keinen Google-Indexierungsnachweis.

Die öffentliche Website erhält ausschließlich die geprüften Builddateien.
Private GSC-Leistungsdaten, Linkanalysen, Zugangsdaten und Browsernachweise
bleiben außerhalb des Repositorys. Eine ältere Adresse in einem externen
Firmenverzeichnis ist als berechtigter Profilpflegefall separat vorbereitet.

## Grenzen der Bewertung

Feldmesswerte für Core Web Vitals fehlen wegen zu geringer Datenmenge. Die
PageSpeed-Ausgangsmessung vor diesem Release ist ein Labortest für eine einzelne
Seite und kein Beweis realer Besuchergeschwindigkeit oder bereits höherer
Rankings. GitHub Pages bestimmt HTTP-Cacheheader und Hostweiterleitungen;
eine zusätzliche Hostingmigration wurde für diese Verbesserungen nicht benötigt.
Eine vollständige Indexaufnahme und das Ziel 100 monatlicher Klicks hängen auch
von Google, Nachfrage, Inhaltsnutzen und externen Unternehmenssignalen ab.
