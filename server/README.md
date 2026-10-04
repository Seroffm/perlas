# Perla's Formular-API

Eigenständiges PHP-Backend für alle Kontakt-, Angebots- und Bewerbungsformulare. Die Website bleibt statisch; der API-Schlüssel liegt ausschließlich auf dem Server. Die API verschickt genau eine Text-E-Mail an `mail@perlas.de`, mit dem festen Absender `Perla's <formulare@perlas.de>`. Die validierte Adresse des Absenders wird als `reply_to` gesetzt. Es werden keine automatischen Bestätigungen an beliebige Benutzeradressen verschickt; `confirmationEmailSent` ist deshalb immer `false`.

## Installation auf Plesk

1. `api.perlas.de` als Subdomain anlegen, DNS auf den Plesk-Server zeigen lassen und ein gültiges TLS-Zertifikat installieren. HTTPS erzwingen.
2. Inhalt von `server/public` nach `/var/www/vhosts/perlas.de/api.perlas.de/public` hochladen. Den Dokumentroot dieser Subdomain genau auf diesen `public`-Ordner setzen. Nicht den gesamten `server`-Ordner öffentlich bereitstellen.
3. Daneben `/var/www/vhosts/perlas.de/api.perlas.de/private` anlegen. Die Beispielkonfiguration als `private/perlas-forms-config.php` speichern und ausschließlich dort den Resend-Schlüssel sowie einen mindestens 32 Zeichen langen zufälligen `state_secret` setzen. Alternativ `RESEND_API_KEY` und `PERLAS_FORMS_STATE_SECRET` in der serverseitigen Umgebung setzen. Niemals einen API-Schlüssel als `VITE_*`-Variable verwenden oder committen.
4. Der PHP-Benutzer muss `private/perlas-forms-state` schreiben können. Ordnerberechtigung möglichst `0700`, Dateien `0600`; nicht für alle Benutzer beschreibbar machen. Die Datei mit Limits und Retry-Kennungen wird automatisch erzeugt und enthält keine Formularinhalte oder IP-Adressen im Klartext.
5. PHP 8.2 oder neuer mit `curl`, `fileinfo`, `zip` aktivieren. PHP-Limits: `post_max_size=6M`, `upload_max_filesize=5M`, `max_file_uploads=1`, `memory_limit=64M` oder höher, `max_execution_time=30` oder höher. Auch im vorgeschalteten nginx die Anfragegröße auf höchstens 6 MB begrenzen. Apache muss `.htaccess` und `mod_rewrite` auswerten; ein nginx-only Setup braucht entsprechende Routen auf `index.php`.
6. Die Domain `perlas.de` bei Resend verifizieren. Den Schlüssel möglichst auf „Sending access“ und diese Domain beschränken. Bestehende Empfangs-MX-Einträge der Domain nicht ersetzen. Resend-DNS nur nach den tatsächlich im Resend-Panel angezeigten Werten einrichten.
7. Im Frontend `VITE_PERLAS_API_URL=https://api.perlas.de` setzen und neu bauen. CORS erlaubt ausschließlich `https://www.perlas.de`, `https://perlas.de`, `https://seroffm.github.io` (Vorschau).

Ist der tatsächliche Dokumentroot ohne abschließendes `/public` fest vorgegeben, bleibt die Konfiguration im Ordner `private` **eine Ebene oberhalb** von `index.php`. Keine echte Konfiguration in den Dokumentroot legen. Den entsprechenden absoluten Pfad vor dem Upload prüfen.

`GET /health` liefert nur `{"ok":true}` und zeigt, dass PHP und Routing laufen. Es prüft weder Geheimnisse noch die Zustellung. Keine Diagnoseausgaben mit Konfiguration öffentlich aktivieren. Die private Konfiguration und State-Dateien dürfen über HTTP nicht erreichbar sein.

## Formularvertrag

Anfragen sind `multipart/form-data` an:

| Endpunkt | Felder |
| --- | --- |
| `POST /quote-requests` | `propertyType`, `street`, `location`, `services` (JSON-Array), `preferredStart`, `details`, `name`, `company`, `email`, `phone` |
| `POST /contact-requests` | `subject`, `name`, `company`, `email`, `phone`, `street`, `location`, `message` |
| `POST /career-applications` | `name`, `email`, `phone`, `role`, `message`, `attachment` (optional) |

Alle Formulare senden außerdem `source` (exakte erlaubte Origin + Pfad, ohne Query/Fragment), `privacyConsent=true`, `website` (leeres Honeypot-Feld) und `requestId` (UUID). Ein Retry mit denselben Daten verwendet dieselbe UUID. Neue Inhalte benötigen eine neue UUID. Unbekannte Felder und Anhänge außerhalb der Bewerbung werden abgewiesen.

Erfolg ist HTTP 200 mit `{"ok":true,"requestId":"...","confirmationEmailSent":false}`. Die API bestätigt nur nach erfolgreicher Annahme durch Resend. Ein Fehler liefert `{"ok":false,"message":"..."}` mit passendem Status; keine positive Erfolgsmeldung bei Timeout oder fehlender Konfiguration.

Textlimits: Name 160, E-Mail 254, Telefon 60, Unternehmen/Straße/Ort/Betreff/Stelle jeweils 200, Nachricht/Objektdetails jeweils 6000 Zeichen. Objektart/Beginn jeweils 120; höchstens 16 Leistungen mit je 100 Zeichen. Name und E-Mail sind Pflichtfelder; Kontakt: Betreff/Nachricht; Bewerbung: Stelle/Nachricht; Angebot: Objektart/Straße/Ort/mindestens eine Leistung.

## Schutzmaßnahmen und Betrieb

- Festes Ziel und fester Absender, kein frei wählbarer Versandempfänger; CORS ist nicht alleiniger Spam-Schutz.
- 5 Übertragungsversuche je IP und Stunde, 30 global pro Stunde, 100 global pro Tag. Erfolgreiche identische Retries zählen nicht erneut. IPs werden ausschließlich aus `REMOTE_ADDR` genommen und mit dem privaten Geheimnis gehasht. Wenn ein Reverse Proxy vorgeschaltet ist, muss der Webserver die echte IP ausschließlich von diesem vertrauenswürdigen Proxy auflösen; ungeprüftes `X-Forwarded-For` wird bewusst ignoriert.
- Ein privater Dateilock serialisiert Limits und Übertragung. UUID plus Inhaltsfingerprint verhindert Doppelversand; Resend erhält ebenfalls einen stabilen `Idempotency-Key`. Retry-Daten werden nach maximal 48 Stunden beim nächsten Zugriff entfernt. Unbestätigte Retries nach 23 Stunden werden nicht erneut verschickt, da Resend seinen Schlüssel nach 24 Stunden vergisst.
- Höchstens 6 MB Request, ein höchstens 5 MB großer Anhang. PDF, DOC, DOCX, JPEG und PNG werden mit Extension, tatsächlichem MIME und Signatur geprüft. DOCX muss ein Word-Dokument sein; Makros, ausführbare Inhalte und übergroße ZIP-Inhalte werden abgewiesen. Es wird nichts öffentlich hochgeladen oder entpackt und keine URL vom Benutzer abgerufen.
- Anhänge sind trotzdem untrusted. MIME-/Signaturprüfung ersetzt keine Virenprüfung. Die Empfänger sollten Anhänge vor dem Öffnen prüfen; für höheren Schutz lässt sich serverseitig ein Malware-Scanner ergänzen.
- CURL verwendet ausschließlich den festen HTTPS-Endpunkt von Resend, überprüft TLS und hat begrenzte Timeouts. Fehlerlogs enthalten nur eine feste Betriebskennung, keine personenbezogenen Daten, Schlüssel oder Resend-Antworten.
- Plesk-/Resend-Logs und empfangene Anfragen enthalten zwangsläufig Betriebs-/Bewerbungsdaten. Zugriffsberechtigungen und Löschfristen organisatorisch festlegen und den Datenschutztext passend finalisieren. State- und Konfigurationsdateien vor Fremdzugriff schützen und nicht in öffentliche Backups legen.

## Tests ohne echten E-Mail-Versand

```text
php -l server/public/index.php
php -l server/tests/test.php
php server/tests/test.php
```

Der Test verwendet einen injizierten Mock-Transport und temporäre isolierte Dateien. Er prüft Feldvalidierung, Consent, Honeypot, Herkunft, Header-Injection, Upload-MIME/Signaturen, festen Mail-Empfänger, Retry-Deduplizierung, Ratenlimits und Aufbewahrung. Es wird kein API-Schlüssel benötigt und keine E-Mail versandt.

Vor Veröffentlichung zusätzlich über die tatsächliche HTTPS-Domain prüfen: Health 200, gültiges Preflight 204, fremde Origin 403, falsche Methode 405, leere/unzulässige Felder 422. Erst anschließend bewusst je einen als Test gekennzeichneten Versand pro Formulartyp an das feste interne Postfach durchführen und den Eingang dort kontrollieren. Resend-Erfolg bedeutet Annahme, nicht zwingend Zustellung in den Posteingang.

API-Grundlage: [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email).
