# Perla’s Design Language

## Kurzfassung

Die Designsprache lässt sich als **„Friendly Reliability“** beschreiben: professionell und vertrauenswürdig, aber nicht distanziert; aufmerksamkeitsstark, aber nicht laut; modern in Form und Farbe, aber klar in der Bedienung.

Die visuelle Spannung entsteht aus einer bewusst reduzierten Markenpalette:

- Das Primärblau vermittelt Verlässlichkeit, Seriosität und handwerkliche Kompetenz.
- Das Sekundärblau markiert Aktionen, interaktive Elemente und visuelle Tiefe.
- Weiß gibt dem Inhalt Ruhe, Klarheit und großzügigen Raum.

Das System vermeidet die typische nüchterne Gebäudedienstleister-Ästhetik. Objektbetreuung wird als Entlastung, Werterhalt und gute Erreichbarkeit erzählt — nicht als austauschbare Pflichterfüllung.

## 1. Gestaltungsprinzipien

### Vertrauen durch Klarheit

Die Seite spricht reale Sorgen von Eigentümern und Hausverwaltungen an und beantwortet sie sofort mit nachvollziehbaren Leistungen. Visuell bedeutet das: klare Hierarchien, großzügige Flächen, freundliche Farben und eindeutige Aktionen.

### Bold, soft, simple

- **Bold:** große, schwere Headlines und kräftige Farbflächen.
- **Soft:** stark gerundete Karten, Pills und sanfte Schatten.
- **Simple:** wenige Farben, zwei Schriftschnitte und klar begrenzte Inhaltsblöcke.

### Jede Sektion ist eine Bühne

Die Landingpage besteht aus deutlich getrennten horizontalen Farbbändern. Jede Sektion hat eine Hauptbotschaft, einen visuellen Schwerpunkt und ausreichend Weißraum. Inhalte werden nicht in eine dichte, gleichförmige Seite gepresst.

### Betreuung wird menschlich gezeigt

Service-Icons und Leistungsversprechen werden mit warmen Fotografien des Teams, der betreuten Objekte und konkreter Arbeitssituationen kombiniert. Die Leistung bleibt professionell und wird zugleich persönlich und greifbar.

## 2. Farbpalette

### Kernfarben

| Token | Wert | Rolle |
|---|---:|---|
| `primary` | `#124094` | Primäre Textfarbe, große Farbflächen, Footer und Konturen |
| `secondary` | `#195B85` | CTA-Flächen, interaktive Zustände, Icons und Bildakzente |
| `white` | `#FFFFFF` | Seitenhintergrund, Karten und Text auf blauen Flächen |

### Unterstützende Farben und Verläufe

| Verwendung | Umsetzung |
|---|---|
| Große Markenfläche | `#124094` |
| CTA- und Interaktionsfläche | `#195B85` |
| Dezente Tiefe | Transparente Varianten von `#124094` oder `#195B85` auf Weiß |
| Verlauf | Ausschließlich `#124094 → #195B85` oder eine der beiden Farben zu transparent |

### Farbregeln

- `#124094` ist die Standardfarbe für Text und vertrauensbildende Flächen. Reines Schwarz oder neutrales Grau werden nicht verwendet.
- `#195B85` kennzeichnet die wichtigste Aktion und interaktive Zustände.
- Weiß ist der durchgängige Seitenhintergrund und zugleich die Kartenfarbe.
- Text auf beiden Blautönen ist Weiß. Text auf Weiß verwendet vorrangig `#124094`.
- Weitere Vollfarben sind in der Benutzeroberfläche nicht vorgesehen. Transparenzen dürfen nur aus den beiden Markenfarben oder Weiß entstehen.

## 3. Typografie

### Schriftfamilie

**Inter** ist die einzige Schriftfamilie. Das System verwendet bewusst nur zwei Gewichte:

- `400` für Fließtext, Beschreibungen und kleine rechtliche Inhalte.
- `800` für Headlines, Navigation, Buttons, Labels und Autorennamen.

### Typografische Skala

| Stil | Desktop | Einsatz |
|---|---|---|
| Display | `60 / 75 px`, `800`, `-1.2 px` | Hero und große Editorial-Headline |
| Section heading | `36 / 45 px`, `800`, `-0.72 px` | Hauptüberschriften von Sektionen |
| Card heading | `23 / 30 px`, `800`, `-0.48 px` | Karten, Feature- und Footer-Titel |
| UI heading | `19 / 25 px`, `800`, `-0.4 px` | Navigation, Feature-Namen, große Buttons |
| Lead body | `20 / 30 px`, `400` | Hero- und About-Text |
| Body | `16 / 24 px`, `400` | Karten und Feature-Beschreibungen |
| Compact UI | `15 / 18–20 px`, `800` | kleine Buttons, Tags und Formularaktionen |
| Legal | `11–12 / 15 px`, `400` | Copyright und Markenhinweise |

### Typografische Regeln

- Headlines dürfen bewusst auf zwei oder drei Zeilen umbrechen.
- Überschriften sind kompakt, Fließtexte deutlich luftiger.
- Textblöcke bleiben relativ schmal; gute Lesbarkeit ist wichtiger als maximale Flächennutzung.
- Buttons und Navigation verwenden immer den schweren Schriftschnitt.
- Großbuchstaben werden nicht als Stilmittel eingesetzt.
- Typografische Hierarchie entsteht primär durch Größe und Gewicht, nicht durch zusätzliche Farben.

## 4. Abstände und Rhythmus

Das System folgt keinem starren 8-Pixel-Raster. Der Makrorhythmus arbeitet überwiegend mit **12-Pixel-Schritten**.

Wichtige Werte:

| Abstand | Typische Verwendung |
|---:|---|
| `4–8 px` | Icon- und Mikroabstände |
| `16–20 px` | Button-Innenabstände |
| `24 px` | Karteninhalte, Button-Gruppen, kleine vertikale Abstände |
| `36 px` | Karten-Padding, Textgruppen |
| `48 px` | Standard-Gap zwischen wichtigen Elementen |
| `60 px` | Spaltenabstand in zweigeteilten Layouts |
| `72 px` | Abstand zwischen Headline und Content-Panel |
| `84 px` | Standardabstand am oberen Rand großer Sektionen |
| `96 px` | Hero-, Footer- und besonders großzügige Abstände |

### Rhythmusregel

Je größer die semantische Trennung, desto größer der Abstand. Innerhalb einer Komponente liegen Elemente eng zusammen; zwischen eigenständigen Inhaltsgruppen entsteht deutlich mehr Luft.

## 5. Layoutsystem

### Desktop-Referenz

- Referenzbreite: `1440 px`
- Header-Container: `1200 px`
- Breite Social Proof: `1248 px`
- Editorial-, Insights- und Footer-Container: `1056 px`
- Feature-Panel: `840 px`
- Insights-Karte: `320 px`
- Review-Karte: `400 px`

### Layoutmuster

#### Split Hero

Links steht eine große Botschaft mit CTA-Paar, rechts eine dominante Bildfläche aus dem Arbeitsalltag. Eine kompakte Faktenkarte liegt als zweite Ebene über der Fotografie. Ein versetzter sekundärblauer Rahmen verankert die Markenfarbe.

#### Horizontaler Social Proof

Bewertungskarten dürfen an den Bildschirmrändern angeschnitten werden. Dadurch wirkt die Reihe größer als der Viewport und deutet weitere Inhalte an. Darunter stabilisiert eine ruhige Logozeile die Glaubwürdigkeit.

#### Editorial Split

Text und Fotografie stehen in ungefähr gleich starken Spalten. Die Fotografie erhält eine versetzte blaue Fläche statt eines klassischen Rahmens.

#### Zentraler Feature-Block

Die zentralen Dienstleistungen werden in einer großen weißen Karte gesammelt. Das 3×2-Raster sorgt für Vergleichbarkeit, während die umgebende helle Fläche den Block klar hervorhebt.

#### Karten-Trio

Drei gleich breite Editorial-Karten bilden eine ruhige Reihe. Bild, Tag, Titel und Kurztext folgen immer derselben Reihenfolge.

### Responsive Verhalten

- Oberhalb von etwa `1100 px` bleibt das Desktop-Raster erhalten.
- Darunter werden Spalten flexibler und Abstände leicht reduziert.
- Unter `760 px` werden Split-Layouts und Grids einspaltig.
- Die primäre CTA steht mobil über der sekundären CTA.
- Bewertungskarten werden mobil horizontal scrollbar statt stark verkleinert.
- Headlines skalieren, behalten aber ihre dominante Wirkung.
- Dekorative Elemente dürfen beschnitten werden; zentrale Inhalte niemals.

## 6. Formensprache

### Rundungen

| Radius | Einsatz |
|---:|---|
| `48 px` | große Panels, Review- und Story-Karten |
| `42 px` | Buttons, Insight-Karten, Kontaktkarte |
| `21 px` | kompakte Formularfelder und kleine Pills |
| `12 px` | kleine Zertifikats- oder Badge-Flächen |

Große Rundungen sind ein Kernmerkmal. Sie geben dem funktionalen Dienstleistungsthema Wärme und lassen Leistungen zugänglich wirken.

### Schatten

Der charakteristische Kartenschatten ist leicht nach rechts unten versetzt:

```css
box-shadow: 12px 12px 10px rgb(0 0 0 / 10%);
```

Hover-Schatten sind weicher und näher an der Karte:

```css
box-shadow: 0 14px 28px rgb(18 64 148 / 12%);
```

Schatten werden nur dort eingesetzt, wo Elemente tatsächlich über einer Fläche schweben: Review-Karten, Feature-Panel und interaktive Editorial-Karten.

### Versetzte Akzentflächen

Fotos erhalten keinen dünnen Rahmen. Stattdessen liegt eine kräftige Farbfläche leicht versetzt hinter dem Bild. Das erzeugt Tiefe und wirkt markanter als ein klassischer Border.

## 7. Komponenten

### Buttons

#### Primary Action

- Sekundärblauer Hintergrund
- Weißer Text
- Pill-Form
- Optionaler Pfeil rechts
- Einsatz: wichtigste Conversion-Aktion

#### Secondary Outline

- Transparenter Hintergrund
- `2 px` Kontur in Primärblau
- Text in Primärblau
- Einsatz: alternative Plattform oder weniger wichtige Aktion

#### Inverted Outline

- Transparenter Hintergrund
- Weiße Kontur und weißer Text
- Einsatz ausschließlich auf primärblauem oder sekundärblauem Hintergrund

#### Compact Action

- Sekundärblauer Hintergrund
- Weißer Text
- Einsatz für kompakte Markenaktionen wie „Kontakt“ oder „Anfrage senden“

CTA-Paare stehen immer in der Reihenfolge **primär → sekundär**. Sie dürfen nicht gleich stark gestaltet werden.

### Review Card

- Weiß, `48 px` Radius
- Richtungsbetonter Schatten
- Sterne oben
- Kurzer Erfahrungsbericht
- Autorenname fett am Ende
- Keine zusätzliche Linie oder Avatar-Pflicht

### Feature Item

- Lineares, zweifarbiges Icon
- Kurzer Name in `800`
- Maximal wenige Zeilen Erklärung
- Zentrierte Ausrichtung
- Alle Items eines Rasters besitzen dieselbe visuelle Struktur

### Insight Card

- Bild oben, Content unten
- Kategorie als helle Pill über dem Bild
- Große Rundung der gesamten Karte
- Keine sichtbare Border
- Hover: maximal `6 px` anheben und Schatten verstärken

### Kontaktkarte

- Sekundärblaue, stark gerundete Fläche
- Großes transparentes Markensymbol im Hintergrund
- Kurzes Nutzenversprechen und eine eindeutige Kontaktaktion
- Kontaktweg bleibt kompakt; kein zusätzlicher UI-Ballast

## 8. Icons und Illustrationen

- Icons sind lineare Vektorgrafiken in Primärblau mit gezielten sekundärblauen Akzenten.
- Die Strichstärke wirkt robust, aber nicht massiv.
- Icons werden in festen, gleich großen Boxen zentriert.
- Pfeile sind horizontal, klar und funktional — keine verspielten Chevron-Kaskaden.
- Social-Media-Icons stehen weiß auf Primärblau.
- Neue Icons sollten aus derselben Familie stammen oder formal exakt angepasst werden.

Nicht verwenden:

- dünne, graue Standard-Icons,
- mehrfarbige 3D-Illustrationen,
- Emojis als Interface-Icons,
- uneinheitliche Icon-Boxen oder Strichstärken.

## 9. Bildsprache

### Menschen

- Alltagssituationen statt abstrakter Business-Posen
- warme Lichtstimmung
- natürliche Umgebung
- sichtbare Arbeitsmittel wie Klemmbrett oder Smartphone als Kontext, aber keine gestellten Werkzeugposen
- Menschen wirken zugänglich, konzentriert und kompetent

### Leistungsdarstellung

- Eine kompakte Fakten- oder Prozesskarte darf über einer Fotografie liegen.
- Team und betreute Immobilie bleiben als glaubwürdiger Beweis sichtbar.
- Primärblaue und sekundärblaue Akzentflächen verbinden Fotografie und Leistungsversprechen mit der Markenwelt.

### Editorial-Bilder

- klare, sofort verständliche Metapher zum Thema
- hoher Kontrast und eindeutiger Fokus
- konsistentes Querformat in Karten
- nicht mehrere visuelle Geschichten in einem Bild erzählen

## 10. Content-Tonalität

Die Sprache ist direkt, verständlich und ergebnisorientiert.

### Headlines

- beginnen mit Nutzerproblem oder gewünschtem Ergebnis,
- sind aktiv formuliert,
- verzichten auf Fachjargon,
- verbinden Objektbetreuung mit Entlastung, Werterhalt oder Verlässlichkeit.

Beispielstruktur:

> Ihre Immobilie. Einfach gut betreut.

### Fließtext

- erklärt den Nutzen in Alltagssprache,
- verwendet konkrete Verben wie „pflegen“, „warten“, „dokumentieren“ und „entlasten“,
- benennt Leistungen und übersetzt sie sofort in einen Nutzen für Eigentümer, Mieter und Verwaltungen,
- bleibt kurz genug, um gescannt zu werden.

### CTA-Text

- benennt die konkrete Aktion oder den Kontaktweg,
- vermeidet unklare Texte wie „Mehr erfahren“, wenn „Objektbetreuung anfragen“ präziser ist,
- nutzt den Pfeil als Richtungssignal, nicht als Dekoration.

## 11. Interaktion und Motion

Motion unterstützt Klarheit und bleibt zurückhaltend.

- Button-Hover: `translateY(-2px)` mit `160 ms`.
- Karten-Hover: maximal `translateY(-6px)` mit `180 ms`.
- Schatten intensivieren sich beim Anheben leicht.
- Kein Bouncing, keine langen Scroll-Animationen und keine dauerhafte Bewegung.
- Bild- oder Farbwechsel sollten weich und unter `250 ms` bleiben.
- `prefers-reduced-motion` muss respektiert werden.

Empfohlene Kurve:

```css
transition-timing-function: ease;
```

## 12. Barrierefreiheit

- Primärblau auf Weiß bietet den Standardkontrast.
- Weiß wird auf Primärblau und Sekundärblau eingesetzt.
- Klickziele sind mindestens `44 × 44 px` groß.
- Fokuszustände müssen mindestens so deutlich wie Hover-Zustände sein.
- Text darf nicht ausschließlich über Farbe hierarchisiert werden.
- Dekorative Bilder erhalten leere Alt-Texte; inhaltliche Bilder eine konkrete Beschreibung.
- Formulare besitzen echte Labels, auch wenn sie visuell verborgen sind.
- Horizontale Scrollbereiche müssen per Touch und Tastatur bedienbar bleiben.

## 13. Do / Don’t

### Do

- Große Headlines mit ruhigen, breiten Flächen kombinieren.
- Sekundärblau für Conversion und Interaktion reservieren.
- Primärblau konsequent als Text- und Vertrauensfarbe verwenden.
- Komponenten stark runden und mit viel Innenraum gestalten.
- Leistungsdetails mit menschlichen Bildern ausbalancieren.
- Pro Sektion eine eindeutige Hauptaussage und Hauptaktion zeigen.
- Asymmetrie durch angeschnittene Karten oder versetzte Akzentflächen erzeugen.

### Don’t

- Keine generische Handwerker-Optik mit austauschbaren Stockfotos und Werkzeug-Collagen.
- Keine kleinen, engen Kartenraster mit zu viel Inhalt.
- Keine fünf gleich starken CTA-Farben nebeneinander.
- Keine neutralgrauen Texte, wenn Primärblau funktioniert.
- Keine harten rechtwinkligen Panels als dominierende Form.
- Keine dekorativen Schatten auf jedem Element.
- Keine komplizierte Animation, die von Vertrauen oder Inhalt ablenkt.

## 14. Design-Rezept für neue Sektionen

1. Definiere genau eine Kernbotschaft und höchstens eine primäre Conversion-Aktion.
2. Wähle eine Bühne: Weiß, Primärblau oder Sekundärblau.
3. Nutze einen bestehenden Container: `1248`, `1056` oder `840 px`.
4. Beginne desktop mit `84 px` oberem Abstand.
5. Verwende eine Section-Headline mit `36 / 45 px` oder eine Display-Headline mit `60 / 75 px`.
6. Ergänze genau einen dominanten visuellen Akzent: Foto, Kartenreihe, Icon-Raster oder große CTA-Fläche.
7. Nutze bestehende Button- und Kartenvarianten, statt neue Formen einzuführen.
8. Prüfe anschließend Kontrast, Textlänge, mobile Stapelung und Fokuszustände.

## 15. Starter Tokens

```css
:root {
  --color-primary: #124094;
  --color-secondary: #195b85;
  --color-surface: #ffffff;
  --color-white: #ffffff;

  --gradient-brand: linear-gradient(130deg, #124094 0%, #195b85 100%);

  --radius-panel: 48px;
  --radius-card: 42px;
  --radius-pill: 999px;

  --shadow-card: 12px 12px 10px rgb(18 64 148 / 10%);
  --shadow-hover: 0 14px 28px rgb(18 64 148 / 12%);

  --space-1: 12px;
  --space-2: 24px;
  --space-3: 36px;
  --space-4: 48px;
  --space-5: 60px;
  --space-6: 72px;
  --space-7: 84px;
  --space-8: 96px;

  --content-wide: 1248px;
  --content-standard: 1056px;
  --content-focused: 840px;
}
```

## 16. Qualitätscheck

Eine neue Seite gehört visuell zu diesem System, wenn die meisten dieser Fragen mit „Ja“ beantwortet werden:

- Ist `#124094` die dominante Text- und Vertrauensfarbe?
- Ist die wichtigste Aktion mit `#195B85` klar erkennbar?
- Hat jede Sektion genügend Luft und eine eindeutige visuelle Aufgabe?
- Sind Karten und Buttons weich, großzügig und stark gerundet?
- Bleibt die Typografie auf Inter `400` und `800` beschränkt?
- Werden Leistungen verständlich, konkret und menschlich präsentiert?
- Funktioniert das Layout ohne horizontalen Seitenüberlauf auf Mobile?
- Sind Motion, Schatten und Akzentfarben bewusst dosiert?
- Würde die Seite auch ohne dekorative Effekte verständlich bleiben?

---

Diese Datei beschreibt die Designsprache als wiederverwendbares System. Die aktuelle Implementierung in `src/styles.css` und `src/App.tsx` ist die technische Referenz für die bestehende Landingpage.

## 17. Aktuelle Erweiterungen

- Die reduzierte Wortmarke **PERLAS** wird typografisch in Inter `800` mit großzügigem Tracking gesetzt.
- Auf Mobile öffnet ein runder sekundärblauer Menü-Button eine weiße, stark gerundete Navigationsfläche.
- Leistungskarten sind vollständige Links. Hover und Fokus heben die Karte an, färben das Icon sekundärblau und zeigen die Zielrichtung klar an.
- Leistungsdetailseiten übernehmen Hero, Akzentflächen, Prozesskarten und CTA-Hierarchie der Hauptseite.
- Das Angebotsformular erscheint als große Lightbox und führt in drei Schritten durch Objekt, Leistungen und Kontaktdaten.
- Formularfortschritt, Validierung, Zurück-Navigation und Erfolgszustand bleiben jederzeit sichtbar und eindeutig.
- Editorial-Inhalte werden als ausgeglichenes `2 × 2`-Raster mit vier Karten dargestellt; mobil stapeln sie einspaltig.
