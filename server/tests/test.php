<?php
declare(strict_types=1);
define('PERLAS_FORMS_LIBRARY', true);
require dirname(__DIR__) . '/public/index.php';

$checks = 0;
function check(bool $condition, string $label): void
{
    global $checks;
    $checks++;
    if (!$condition) {
        throw new RuntimeException('FAIL: ' . $label);
    }
}
function fails(callable $callback, int $status, string $label): void
{
    try {
        $callback();
    } catch (PerlasHttpError $error) {
        check($error->status === $status, $label);
        return;
    }
    throw new RuntimeException('FAIL: expected rejection: ' . $label);
}
function uuid(int $number): string
{
    return sprintf('00000000-0000-4000-8000-%012d', $number);
}
function contact(int $number = 1): array
{
    return [
        'requestId' => uuid($number), 'source' => 'https://www.perlas.de/kontakt/',
        'privacyConsent' => 'true', 'website' => '', 'name' => 'Test Kontakt',
        'email' => 'test@example.com', 'phone' => '', 'subject' => 'Testanfrage',
        'company' => '', 'street' => '', 'location' => '', 'message' => "Eine Nachricht\nmit zwei Zeilen.",
    ];
}

$temp = sys_get_temp_dir() . '/perlas-forms-tests-' . bin2hex(random_bytes(8));
if (!mkdir($temp, 0700)) {
    throw new RuntimeException('Cannot create test directory.');
}
try {
    $origin = 'https://www.perlas.de';
    $data = perlasValidate('/contact-requests', contact(), $origin);
    check($data['email'] === 'test@example.com', 'valid contact');
    check(perlasOrigin('https://perlas.de') && !perlasOrigin('https://www.perlas.de.evil.example'), 'exact origins');
    fails(fn() => perlasValidate('/contact-requests', [...contact(), 'privacyConsent' => 'false'], $origin), 422, 'consent');
    fails(fn() => perlasValidate('/contact-requests', [...contact(), 'website' => 'spam'], $origin), 422, 'honeypot');
    fails(fn() => perlasValidate('/contact-requests', [...contact(), 'to' => 'attacker@example.com'], $origin), 422, 'no relay');
    fails(fn() => perlasValidate('/contact-requests', [...contact(), 'name' => str_repeat('ä', 161)], $origin), 422, 'unicode length');
    check(perlasValidate('/contact-requests', [...contact(), 'name' => str_repeat('ä', 160)], $origin)['name'] !== '', 'unicode exact limit');
    fails(fn() => perlasValidate('/contact-requests', [...contact(), 'email' => "test@example.com\r\nBcc:evil@example.com"], $origin), 422, 'header injection');
    fails(fn() => perlasValidate('/contact-requests', [...contact(), 'email' => ['test@example.com']], $origin), 422, 'arrays rejected');
    fails(fn() => perlasValidate('/contact-requests', [...contact(), 'message' => str_repeat('x', 6001)], $origin), 422, 'message limit');
    fails(fn() => perlasValidate('/contact-requests', [...contact(), 'requestId' => 'not-a-uuid'], $origin), 422, 'uuid');
    fails(fn() => perlasValidate('/contact-requests', [...contact(), 'source' => 'https://www.perlas.de/kontakt/?email=private'], $origin), 422, 'source strips no PII query');
    fails(fn() => perlasValidate('/contact-requests', [...contact(), 'source' => 'https://evil.example/'], $origin), 422, 'wrong source');
    fails(fn() => perlasValidate('/contact-requests', [...contact(), 'source' => 'https://user@www.perlas.de/'], $origin), 422, 'userinfo');

    $common = array_intersect_key(contact(), array_flip(['requestId', 'source', 'privacyConsent', 'website', 'name', 'email', 'phone']));
    $quote = [...$common, 'propertyType' => 'Wohnanlage', 'street' => 'Teststraße 1', 'location' => 'Frankfurt', 'services' => '["Objektbetreuung","Winterdienst"]', 'preferredStart' => '', 'details' => '', 'company' => ''];
    check(count(perlasValidate('/quote-requests', $quote, $origin)['services']) === 2, 'valid quote');
    fails(fn() => perlasValidate('/quote-requests', [...$quote, 'services' => '{}'], $origin), 422, 'services object');
    fails(fn() => perlasValidate('/quote-requests', [...$quote, 'services' => '[]'], $origin), 422, 'empty services');
    fails(fn() => perlasValidate('/quote-requests', [...$quote, 'services' => '[{"name":"spam"}]'], $origin), 422, 'service nonstring');
    $career = [...$common, 'role' => 'Initiativbewerbung', 'message' => 'Ich möchte im Team mitarbeiten.'];
    check(perlasValidate('/career-applications', $career, $origin)['role'] === 'Initiativbewerbung', 'valid career');
    check(perlasAttachment([], '/career-applications') === null, 'optional attachment');
    fails(fn() => perlasAttachment(['attachment' => ['error' => UPLOAD_ERR_OK, 'tmp_name' => $temp . '/fake']], '/contact-requests'), 422, 'contact attachment disallowed');
    fails(fn() => perlasAttachment(['attachment' => ['error' => UPLOAD_ERR_OK, 'tmp_name' => $temp . '/fake']], '/career-applications'), 422, 'only genuine uploads');
    fails(fn() => perlasAttachment(['attachment' => ['error' => UPLOAD_ERR_INI_SIZE]], '/career-applications'), 413, 'oversized upload');

    $pdfPath = $temp . '/example.pdf';
    file_put_contents($pdfPath, "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n");
    $pdf = perlasInspectAttachment($pdfPath, '../Bewerbung.pdf');
    check($pdf['filename'] === 'Bewerbung.pdf' && base64_decode($pdf['content'], true) !== false, 'PDF and filename');
    fails(fn() => perlasInspectAttachment($pdfPath, 'Bewerbung.png'), 422, 'fake image');
    fails(fn() => perlasInspectAttachment($pdfPath, 'Bewerbung.exe'), 422, 'executable');
    fails(fn() => perlasInspectAttachment($pdfPath, "file\r\nname.pdf"), 422, 'filename injection');
    $largePath = $temp . '/large.pdf';
    file_put_contents($largePath, str_repeat('a', PERLAS_FILE_LIMIT + 1));
    fails(fn() => perlasInspectAttachment($largePath, 'large.pdf'), 413, '5 MB limit');
    $pngPath = $temp . '/one.png';
    file_put_contents($pngPath, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jOioAAAAASUVORK5CYII='));
    check(perlasInspectAttachment($pngPath, 'Bild.png')['filename'] === 'Bild.png', 'PNG signature');
    if (class_exists(ZipArchive::class)) {
        $docxPath = $temp . '/example.docx';
        $zip = new ZipArchive();
        $zip->open($docxPath, ZipArchive::CREATE);
        $zip->addFromString('[Content_Types].xml', '<Types><Override ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml" /></Types>');
        $zip->addFromString('word/document.xml', '<w:document xmlns:w="test"/>');
        $zip->close();
        check(perlasInspectAttachment($docxPath, 'Bewerbung.docx')['filename'] === 'Bewerbung.docx', 'DOCX validation');
        $zip->open($docxPath);
        $zip->addFromString('word/vbaProject.bin', 'macro');
        $zip->close();
        fails(fn() => perlasInspectAttachment($docxPath, 'Bewerbung.docx'), 422, 'DOCX macro disallowed');
    }

    $mail = perlasMail('/contact-requests', $data, null);
    check($mail['to'] === ['mail@perlas.de'] && $mail['from'] === PERLAS_FROM && $mail['reply_to'] === 'test@example.com', 'fixed mail envelope');
    check(isset($mail['text']) && !array_intersect_key($mail, array_flip(['html', 'cc', 'bcc'])), 'plain text only');
    $caseData = [...$data, 'requestId' => 'aabbccdd-aabb-4aab-8aab-aabbccddaabb'];
    check(perlasMail('/contact-requests', $caseData, null) === perlasMail('/contact-requests', [...$caseData, 'requestId' => strtoupper($caseData['requestId'])], null), 'provider payload stable across UUID case');
    $sent = 0;
    $lastKey = '';
    $transport = function (array $payload, string $key) use (&$sent, &$lastKey): void {
        $sent++;
        $lastKey = $key;
        check($payload['to'] === ['mail@perlas.de'], 'mock transport recipient');
    };
    $config = ['state_dir' => $temp . '/state', 'state_secret' => str_repeat('x', 64), 'resend_api_key' => 'not-used'];
    $clock = 1800000000;
    $result = perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $config, $transport, $clock);
    check($result === ['ok' => true, 'requestId' => uuid(1), 'confirmationEmailSent' => false], 'truthful success');
    perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $config, $transport, $clock);
    check($sent === 1 && $lastKey === 'perlas-form/' . uuid(1), 'idempotent resend');
    fails(fn() => perlasDispatch('/contact-requests', [...$data, 'message' => 'different'], null, '192.0.2.1', $config, $transport, $clock), 409, 'idempotency conflict');
    for ($number = 2; $number <= 5; $number++) {
        perlasDispatch('/contact-requests', perlasValidate('/contact-requests', contact($number), $origin), null, '192.0.2.1', $config, $transport, $clock);
    }
    fails(fn() => perlasDispatch('/contact-requests', perlasValidate('/contact-requests', contact(6), $origin), null, '192.0.2.1', $config, $transport, $clock), 429, 'IP limit');
    for ($number = 6; $number <= 30; $number++) {
        perlasDispatch('/contact-requests', perlasValidate('/contact-requests', contact($number), $origin), null, '192.0.2.' . $number, $config, $transport, $clock);
    }
    fails(fn() => perlasDispatch('/contact-requests', perlasValidate('/contact-requests', contact(31), $origin), null, '192.0.2.31', $config, $transport, $clock), 429, 'global limit');
    $rawState = file_get_contents($config['state_dir'] . '/state.json');
    check(!str_contains($rawState, 'test@example.com') && !str_contains($rawState, '192.0.2.') && !str_contains($rawState, 'Test Kontakt'), 'state has no raw PII');

    $retryConfig = [...$config, 'state_dir' => $temp . '/retry'];
    try {
        perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $retryConfig, fn() => throw new RuntimeException('timeout'), $clock);
        throw new RuntimeException('FAIL: mock transport failure must not succeed');
    } catch (RuntimeException $error) {
        check($error->getMessage() === 'timeout', 'transport failure preserved for adapter');
    }
    perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $retryConfig, $transport, $clock + 30);
    check($lastKey === 'perlas-form/' . uuid(1), 'retry same provider key');
    $oldConfig = [...$config, 'state_dir' => $temp . '/old'];
    try {
        perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $oldConfig, fn() => throw new RuntimeException('timeout'), $clock);
    } catch (RuntimeException) {
    }
    fails(fn() => perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $oldConfig, $transport, $clock + 23 * 3600 + 1), 409, 'old uncertain retry never resent');
    $pruned = perlasPruneState(['requests' => ['old' => ['created' => $clock - 3 * 86400]], 'rates' => ['old' => ['expires' => $clock - 1]]], $clock);
    check($pruned === ['requests' => [], 'rates' => []], 'state retention');
    $dayState = ['rates' => ['global-day:' . intdiv($clock, 86400) => ['count' => 100, 'expires' => $clock + 1000]]];
    fails(function () use (&$dayState, $clock): void { perlasConsumeRate($dayState, 'ip', $clock); }, 429, 'daily global limit');
    echo "PASS: {$checks} checks; no external email sent.\n";
} finally {
    // Only remove the explicitly created isolated fixture directory.
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($temp, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($iterator as $entry) {
        $entry->isDir() ? rmdir($entry->getPathname()) : unlink($entry->getPathname());
    }
    rmdir($temp);
}
