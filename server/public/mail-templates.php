<?php
declare(strict_types=1);

/** Branded transactional mail. All links and attachments come from fixed, trusted sources. */
function perlasMailEscape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
}

function perlasMailTopic(string $route): string
{
    return match ($route) {
        '/quote-requests' => 'Angebotsanfrage',
        '/contact-requests' => 'Kontaktanfrage',
        '/career-applications' => 'Bewerbung',
        default => throw new RuntimeException('Mail route is unavailable.'),
    };
}

function perlasMailReference(string $reference): string
{
    if (!preg_match('/^P-[A-F0-9]{10}$/D', $reference)) {
        throw new RuntimeException('Mail reference is unavailable.');
    }
    return $reference;
}

function perlasMailRecipient(array $data): string
{
    $email = $data['email'] ?? null;
    if (!is_string($email) || preg_match('/[\r\n]/', $email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('Mail recipient is unavailable.');
    }
    return $email;
}

/** The image is embedded, not remotely fetched or tracked. The path cannot come from form data. */
function perlasMailLogo(): array
{
    $path = __DIR__ . '/assets/perlas-email-logo.png';
    $size = is_file($path) ? filesize($path) : false;
    if ($size === false || $size < 8 || $size > 2 * 1024 * 1024) {
        throw new RuntimeException('Mail logo is unavailable.');
    }
    $bytes = file_get_contents($path);
    if ($bytes === false || strlen($bytes) !== $size || !str_starts_with($bytes, "\x89PNG\r\n\x1A\n")) {
        throw new RuntimeException('Mail logo is unavailable.');
    }
    return ['filename' => 'perlas-logo.png', 'content' => base64_encode($bytes), 'content_id' => 'perlas-logo'];
}

/** Deliberately no timestamps or random HTML IDs: retries produce exactly the same payload. */
function perlasMailLayout(string $preheader, string $eyebrow, string $heading, string $reference, string $body, string $footerNote): string
{
    $preheader = perlasMailEscape($preheader);
    $eyebrow = perlasMailEscape($eyebrow);
    $heading = perlasMailEscape($heading);
    $reference = perlasMailEscape(perlasMailReference($reference));
    $footerNote = perlasMailEscape($footerNote);
    return <<<HTML
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>{$heading} · {$reference}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: 600px) {
      .mail-shell { width: 100% !important; }
      .mail-outer { padding: 12px 8px !important; }
      .mail-content { padding-left: 22px !important; padding-right: 22px !important; }
      .mail-title { font-size: 27px !important; line-height: 34px !important; }
      .mail-label, .mail-value { display: block !important; width: auto !important; }
      .mail-label { padding-bottom: 4px !important; }
      .mail-value { padding-top: 0 !important; }
      .mail-logo { width: 176px !important; height: auto !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:#ffffff;color:#000000;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">{$preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#ffffff;">
    <tr><td class="mail-outer" align="center" style="padding:32px 16px;">
      <!--[if mso]><table role="presentation" width="620" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table class="mail-shell" role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;border:1px solid #e5e7eb;background-color:#ffffff;">
        <tr><td height="6" style="height:6px;line-height:6px;font-size:1px;background-color:#073372;">&nbsp;</td></tr>
        <tr><td class="mail-content" style="padding:32px 36px 30px;background-color:#ffffff;">
          <a href="https://perlas.de/" style="display:inline-block;text-decoration:none;">
            <img class="mail-logo" src="cid:perlas-logo" width="200" height="44" alt="Perla’s" style="display:block;width:200px;max-width:100%;height:auto;color:#073372;font-size:24px;font-weight:bold;">
          </a>
        </td></tr>
        <tr><td class="mail-content" style="padding:28px 36px 30px;background-color:#073372;color:#ffffff;">
          <p style="margin:0 0 12px;font-size:11px;line-height:17px;letter-spacing:1.4px;font-weight:bold;text-transform:uppercase;color:#ffffff;">{$eyebrow}</p>
          <h1 class="mail-title" style="margin:0 0 24px;font-size:31px;line-height:38px;font-weight:bold;color:#ffffff;">{$heading}</h1>
          <p style="margin:0 0 5px;font-size:12px;line-height:18px;color:#ffffff;">Vorgangsnummer</p>
          <p style="margin:0;font-family:Consolas,'Courier New',monospace;font-size:23px;line-height:30px;letter-spacing:1px;font-weight:bold;color:#ffffff;">{$reference}</p>
        </td></tr>
        <tr><td class="mail-content" style="padding:32px 36px 34px;background-color:#ffffff;color:#000000;font-size:15px;line-height:24px;">
          {$body}
        </td></tr>
        <tr><td class="mail-content" style="padding:25px 36px 27px;border-top:1px solid #e5e7eb;background-color:#ffffff;color:#000000;">
          <p style="margin:0 0 9px;font-size:13px;line-height:20px;font-weight:bold;color:#000000;">Perla’s Objektbetreuung GmbH &amp; Co. KG</p>
          <p style="margin:0 0 13px;font-size:12px;line-height:20px;color:#000000;">Hauptstraße 1 · 65843 Sulzbach (Taunus)</p>
          <p style="margin:0 0 16px;font-size:13px;line-height:23px;color:#000000;">
            <a href="mailto:mail@perlas.de" style="color:#000000;text-decoration:underline;">mail@perlas.de</a><br>
            <a href="tel:+491776867145" style="color:#000000;text-decoration:underline;">0177 68 67 145</a> · <a href="https://perlas.de/" style="color:#000000;text-decoration:underline;">perlas.de</a>
          </p>
          <p style="margin:0;font-size:11px;line-height:18px;color:#000000;">{$footerNote}</p>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>
HTML;
}

/** A labelled section for internal use. The form values are text, never markup or hrefs. */
function perlasMailFields(string $heading, array $fields): string
{
    $rows = '';
    foreach ($fields as $label => $value) {
        if ($value === '') {
            continue;
        }
        $label = perlasMailEscape((string) $label);
        $value = nl2br(perlasMailEscape((string) $value), false);
        $rows .= '<tr><td class="mail-label" width="35%" valign="top" style="width:35%;padding:10px 15px 10px 0;font-size:12px;line-height:20px;color:#000000;">'
            . $label . '</td><td class="mail-value" width="65%" valign="top" style="width:65%;padding:10px 0;font-size:15px;line-height:22px;color:#000000;word-break:break-word;overflow-wrap:anywhere;">'
            . $value . '</td></tr>';
    }
    if ($rows === '') {
        return '';
    }
    return '<h2 style="margin:28px 0 8px;font-size:17px;line-height:25px;color:#000000;font-weight:bold;">'
        . perlasMailEscape($heading) . '</h2><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">'
        . $rows . '</table>';
}

function perlasMailMessage(string $heading, string $message): string
{
    if ($message === '') {
        return '';
    }
    return '<h2 style="margin:28px 0 12px;font-size:17px;line-height:25px;color:#000000;font-weight:bold;">'
        . perlasMailEscape($heading) . '</h2><p style="margin:0;font-size:15px;line-height:25px;color:#000000;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;">'
        . perlasMailEscape($message) . '</p>';
}

function perlasMailPlainFields(string $heading, array $fields): array
{
    $lines = [];
    foreach ($fields as $label => $value) {
        if ($value !== '') {
            $lines[] = $label . ': ' . $value;
        }
    }
    return $lines === [] ? [] : [$heading, str_repeat('=', strlen($heading)), ...$lines, ''];
}

/** The business notification contains the submitted information and optional career attachment. */
function perlasMail(string $route, array $data, ?array $attachment, string $reference): array
{
    $topic = perlasMailTopic($route);
    $reference = perlasMailReference($reference);
    $email = perlasMailRecipient($data);
    $contact = [
        'Name' => $data['name'],
        'Unternehmen' => $data['company'] ?? '',
        'E-Mail' => $email,
        'Telefon' => $data['phone'] ?? '',
    ];
    $details = match ($route) {
        '/quote-requests' => [
            'Objektart' => $data['propertyType'],
            'Straße' => $data['street'],
            'Ort' => $data['location'],
            'Gewünschte Leistungen' => implode("\n", $data['services']),
            'Gewünschter Beginn' => $data['preferredStart'] ?? '',
        ],
        '/contact-requests' => [
            'Thema' => $data['subject'],
            'Straße' => $data['street'] ?? '',
            'Ort' => $data['location'] ?? '',
        ],
        '/career-applications' => ['Bereich / Stelle' => $data['role']],
    };
    $detailHeading = match ($route) {
        '/quote-requests' => 'Objekt & Leistungen',
        '/contact-requests' => 'Zur Anfrage',
        '/career-applications' => 'Zur Bewerbung',
    };
    $message = $data[$route === '/quote-requests' ? 'details' : 'message'] ?? '';
    $messageHeading = $route === '/quote-requests' ? 'Weitere Angaben zum Objekt' : 'Nachricht';
    $technical = [
        'Formularseite' => $data['source'],
        'Übertragungskennung' => strtolower($data['requestId']),
        'Datenschutzhinweise' => 'Im Formular bestätigt',
    ];
    $intro = match ($route) {
        '/quote-requests' => 'Eine neue Angebotsanfrage ist über die Website eingegangen. Die Angaben zum Kontakt, zum Objekt und zu den gewünschten Leistungen finden Sie unten.',
        '/contact-requests' => 'Eine neue Kontaktanfrage ist über die Website eingegangen. Alle übermittelten Angaben finden Sie unten.',
        '/career-applications' => 'Eine neue Bewerbung ist über die Website eingegangen. Die Kontaktdaten und die Nachricht finden Sie unten.',
    };
    $body = '<p style="margin:0 0 12px;font-size:15px;line-height:24px;color:#000000;">' . perlasMailEscape($intro) . '</p>'
        . '<p style="margin:0;font-size:13px;line-height:21px;color:#000000;">Zum Antworten können Sie direkt die Antwortfunktion Ihres E-Mail-Programms verwenden.</p>'
        . perlasMailFields('Kontaktdaten', $contact)
        . perlasMailFields($detailHeading, $details)
        . perlasMailMessage($messageHeading, $message);
    $lines = ["Neue {$topic} über die Perla’s Website", "Vorgangsnummer: {$reference}", '', $intro, '', ...perlasMailPlainFields('Kontaktdaten', $contact), ...perlasMailPlainFields($detailHeading, $details)];
    if ($message !== '') {
        $lines = [...$lines, $messageHeading, $message, ''];
    }
    $attachments = [perlasMailLogo()];
    if ($attachment !== null) {
        if ($route !== '/career-applications' || !is_string($attachment['filename'] ?? null) || !is_string($attachment['content'] ?? null)) {
            throw new RuntimeException('Mail attachment is unavailable.');
        }
        $body .= perlasMailFields('Dateianhang', ['Datei' => $attachment['filename']])
            . '<p style="margin:10px 0 0;font-size:12px;line-height:20px;color:#000000;">Die Bewerbungsdatei ist dieser E-Mail beigefügt. Bitte prüfen Sie Dateien von Bewerbern vor dem Öffnen.</p>';
        $lines = [...$lines, 'Dateianhang: ' . $attachment['filename'], 'Die Bewerbungsdatei ist beigefügt. Bitte vor dem Öffnen prüfen.', ''];
        $attachments[] = ['filename' => $attachment['filename'], 'content' => $attachment['content']];
    }
    $body .= perlasMailFields('Technische Zuordnung', $technical);
    $lines = [...$lines, ...perlasMailPlainFields('Technische Zuordnung', $technical), 'Perla’s Objektbetreuung GmbH & Co. KG', 'Hauptstraße 1, 65843 Sulzbach (Taunus)', 'mail@perlas.de | 0177 68 67 145 | https://perlas.de/'];
    return [
        'from' => PERLAS_FROM,
        'to' => [PERLAS_TO],
        'reply_to' => $email,
        'subject' => "[{$reference}] Neue {$topic} | Perla’s",
        'text' => implode("\n", $lines),
        'html' => perlasMailLayout("Neue {$topic} · Vorgang {$reference}", 'Eingang über die Website', "Neue {$topic}", $reference, $body, 'Interne Benachrichtigung zum Eingang eines Websiteformulars. Die Übertragungskennung dient der technischen Zuordnung.'),
        'attachments' => $attachments,
    ];
}

/** No submitted content is reflected to the recipient: this is not a free-text mail relay. */
function perlasConfirmationMail(string $route, array $data, string $reference): array
{
    $topic = perlasMailTopic($route);
    $reference = perlasMailReference($reference);
    $email = perlasMailRecipient($data);
    [$heading, $intro, $next, $note] = match ($route) {
        '/quote-requests' => [
            'Ihre Anfrage ist eingegangen.',
            'Vielen Dank für Ihre Angebotsanfrage. Wir haben Ihre Angaben erhalten und schauen uns an, wie wir Sie bei Ihrem Objekt unterstützen können.',
            'Unser Team prüft die übermittelten Informationen und meldet sich persönlich bei Ihnen. Falls wir noch etwas wissen müssen, klären wir das direkt mit Ihnen.',
            'Diese automatische Eingangsbestätigung ist noch kein Angebot und keine verbindliche Leistungszusage.',
        ],
        '/contact-requests' => [
            'Ihre Nachricht ist eingegangen.',
            'Vielen Dank für Ihre Nachricht. Ihre Anfrage ist bei Perla’s angekommen.',
            'Unser Team liest Ihre Nachricht und meldet sich persönlich bei Ihnen. Bei Rückfragen können Sie einfach auf diese E-Mail antworten.',
            'Diese Nachricht bestätigt den Eingang einer über die Perla’s Website übermittelten Kontaktanfrage.',
        ],
        '/career-applications' => [
            'Ihre Bewerbung ist eingegangen.',
            'Vielen Dank für Ihr Interesse an Perla’s. Wir haben Ihre Bewerbung erhalten.',
            'Unser Team schaut sich Ihre Unterlagen an und meldet sich persönlich bei Ihnen. Falls noch Informationen fehlen, nehmen wir Kontakt mit Ihnen auf.',
            'Diese automatische Nachricht bestätigt nur den Eingang Ihrer Bewerbung. Sie enthält noch keine Entscheidung über eine Einstellung.',
        ],
    };
    $referenceHint = 'Bitte bewahren Sie Ihre Vorgangsnummer für Rückfragen auf. So können wir Ihre Nachricht direkt zuordnen.';
    $contactText = 'Sie möchten etwas ergänzen? Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.';
    $body = '<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#000000;">Guten Tag,</p>'
        . '<p style="margin:0 0 20px;font-size:15px;line-height:25px;color:#000000;">' . perlasMailEscape($intro) . '</p>'
        . '<h2 style="margin:28px 0 12px;font-size:18px;line-height:26px;color:#000000;">So geht es weiter</h2>'
        . '<p style="margin:0 0 18px;font-size:15px;line-height:25px;color:#000000;">' . perlasMailEscape($next) . '</p>'
        . '<p style="margin:0 0 26px;font-size:14px;line-height:23px;color:#000000;">' . perlasMailEscape($referenceHint) . '</p>'
        . '<h2 style="margin:28px 0 12px;font-size:18px;line-height:26px;color:#000000;">Wir sind für Sie da</h2>'
        . '<p style="margin:0 0 18px;font-size:14px;line-height:23px;color:#000000;">' . perlasMailEscape($contactText) . '</p>'
        . '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#073372" style="background-color:#073372;border-radius:6px;text-align:center;"><a href="tel:+491776867145" style="display:inline-block;padding:13px 20px;color:#ffffff;background-color:#073372;border-radius:6px;font-size:14px;line-height:20px;font-weight:bold;text-decoration:none;">0177 68 67 145</a></td></tr></table>'
        . '<p style="margin:28px 0 0;font-size:15px;line-height:24px;color:#000000;">Freundliche Grüße<br><strong>Ihr Perla’s Team</strong></p>';
    $lines = [
        $heading,
        "Vorgangsnummer: {$reference}",
        '', 'Guten Tag,', '', $intro, '', 'So geht es weiter', $next, '', $referenceHint,
        '', 'Wir sind für Sie da', $contactText, 'E-Mail: mail@perlas.de', 'Telefon: 0177 68 67 145',
        '', 'Freundliche Grüße', 'Ihr Perla’s Team', '',
        'Perla’s Objektbetreuung GmbH & Co. KG', 'Hauptstraße 1, 65843 Sulzbach (Taunus)', 'https://perlas.de/', '', $note,
    ];
    return [
        'from' => PERLAS_FROM,
        'to' => [$email],
        'reply_to' => PERLAS_TO,
        'subject' => "[{$reference}] {$topic} eingegangen | Perla’s",
        'text' => implode("\n", $lines),
        'html' => perlasMailLayout("Ihre {$topic} ist eingegangen · Vorgang {$reference}", 'Eingangsbestätigung', $heading, $reference, $body, $note),
        'attachments' => [perlasMailLogo()],
    ];
}
