<?php
declare(strict_types=1);

/** Local-only previews with invented details. This script never makes a network request. */
define('PERLAS_FORMS_LIBRARY', true);
require dirname(__DIR__) . '/public/index.php';

$directory = $argv[1] ?? dirname(__DIR__, 2) . '/.tmp-mail-preview';
if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
    throw new RuntimeException('Preview directory is unavailable.');
}
$common = [
    'requestId' => '00000000-0000-4000-8000-000000000001',
    'source' => 'https://perlas.de/kontakt/',
    'name' => 'Erika Musterfrau',
    'company' => 'Beispiel Hausverwaltung GmbH',
    'email' => 'erika.musterfrau@example.com',
    'phone' => '0000 123456789',
];
$fixtures = [
    'kontakt' => ['/contact-requests', [...$common,
        'subject' => 'Betreuung einer Wohnanlage', 'street' => 'Musterstraße 12', 'location' => '65843 Beispielstadt',
        'message' => "Guten Tag,\n\nwir suchen eine zuverlässige Betreuung für unsere Wohnanlage mit 32 Wohnungen. Uns sind regelmäßige Kontrollgänge und ein fester Ansprechpartner wichtig.\n\nKönnen wir die nächsten Schritte persönlich besprechen?\n\nVielen Dank und freundliche Grüße\nErika Musterfrau",
    ]],
    'angebot' => ['/quote-requests', [...$common,
        'source' => 'https://perlas.de/leistungen/objektpflege/',
        'propertyType' => 'Wohnanlage', 'street' => 'Musterstraße 12', 'location' => '65843 Beispielstadt',
        'services' => ['Objektbetreuung', 'Gebäudereinigung', 'Winterdienst'], 'preferredStart' => 'Nach gemeinsamer Abstimmung',
        'details' => "Die Wohnanlage besteht aus drei Gebäuden mit insgesamt 32 Wohnungen und einer gemeinsamen Tiefgarage.\n\nGewünscht sind wöchentliche Kontrollen, eine regelmäßige Treppenhausreinigung und Winterdienst auf den Zugangswegen.",
    ]],
    'bewerbung' => ['/career-applications', [...$common,
        'source' => 'https://perlas.de/karriere/', 'role' => 'Initiativbewerbung',
        'message' => "Guten Tag,\n\nich interessiere mich für die Mitarbeit in Ihrem Team. Ich habe Erfahrung in der Objektbetreuung und arbeite gerne praktisch und im direkten Kontakt mit Menschen.\n\nMein Lebenslauf ist beigefügt. Über ein persönliches Gespräch würde ich mich freuen.\n\nFreundliche Grüße\nErika Musterfrau",
    ]],
];
$logo = base64_encode((string) file_get_contents(dirname(__DIR__) . '/public/assets/perlas-email-logo.png'));
$links = [];
foreach ($fixtures as $slug => [$route, $data]) {
    $attachment = $slug === 'bewerbung' ? ['filename' => 'Lebenslauf-Beispiel.pdf', 'content' => base64_encode("%PDF-1.4\n%%EOF\n")] : null;
    $mails = [
        'intern' => perlasMail($route, $data, $attachment, 'P-2D4479B26E'),
        'bestaetigung' => perlasConfirmationMail($route, $data, 'P-2D4479B26E'),
    ];
    foreach ($mails as $kind => $mail) {
        $filename = $slug . '-' . $kind;
        $html = str_replace('cid:perlas-logo', 'data:image/png;base64,' . $logo, $mail['html']);
        file_put_contents($directory . '/' . $filename . '.html', $html);
        file_put_contents($directory . '/' . $filename . '.txt', $mail['text']);
        $links[] = '<li><a href="' . $filename . '.html">' . perlasMailEscape($mail['subject'] . ' · ' . $kind) . '</a></li>';
    }
}
file_put_contents($directory . '/index.html', '<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Perla’s E-Mail-Vorschau</title><body style="font-family:Arial,sans-serif;padding:24px;color:#000;background:#fff;"><h1>Perla’s E-Mail-Vorschau</h1><p>Nur lokale Beispieldaten. Es werden keine E-Mails verschickt.</p><ul style="line-height:2;">' . implode('', $links) . '</ul></body></html>');
echo "Generated six local HTML and plaintext previews in {$directory}\n";
