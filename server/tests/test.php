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

    $reference = 'P-123456789A';
    $mail = perlasMail('/contact-requests', $data, null, $reference);
    check($mail['to'] === ['mail@perlas.de'] && $mail['from'] === PERLAS_FROM && $mail['reply_to'] === 'test@example.com', 'fixed mail envelope');
    check(isset($mail['text'], $mail['html']) && !array_intersect_key($mail, array_flip(['cc', 'bcc'])), 'HTML and text, no cc/bcc');
    $confirmation = perlasConfirmationMail('/contact-requests', $data, $reference);
    check($confirmation['to'] === [$data['email']] && $confirmation['from'] === PERLAS_FROM && $confirmation['reply_to'] === PERLAS_TO, 'single validated confirmation recipient');
    $untrusted = [...$data, 'name' => 'USER-INJECTED-NAME', 'subject' => 'USER-INJECTED-SUBJECT', 'message' => '<script>USER-INJECTED-MESSAGE</script>', 'company' => 'USER-INJECTED-COMPANY'];
    $safeConfirmation = perlasConfirmationMail('/contact-requests', $untrusted, $reference);
    check($safeConfirmation === $confirmation, 'confirmation cannot mirror user-provided content');
    check(!str_contains($safeConfirmation['html'], '<script>') && !str_contains($safeConfirmation['text'], 'USER-INJECTED'), 'confirmation injection safety');
    $escapedInternal = perlasMail('/contact-requests', $untrusted, null, $reference);
    check(!str_contains($escapedInternal['html'], '<script>') && str_contains($escapedInternal['html'], '&lt;script&gt;'), 'internal HTML escapes submitted markup');
    $careerData = perlasValidate('/career-applications', $career, $origin);
    $careerMail = perlasMail('/career-applications', $careerData, $pdf, $reference);
    $careerConfirmation = perlasConfirmationMail('/career-applications', $careerData, $reference);
    check(count($careerMail['attachments']) === 2 && $careerMail['attachments'][1]['filename'] === $pdf['filename'], 'career attachment only in internal message');
    check(count($careerConfirmation['attachments']) === 1 && $careerConfirmation['attachments'][0]['content_id'] === 'perlas-logo', 'confirmation carries logo only');
    try {
        perlasConfirmationMail('/contact-requests', [...$data, 'email' => "test@example.com\r\nBcc:evil@example.com"], $reference);
        throw new RuntimeException('FAIL: confirmation address injection must be rejected');
    } catch (RuntimeException $error) {
        check($error->getMessage() === 'Mail recipient is unavailable.', 'template revalidates confirmation address');
    }
    check(str_contains($mail['subject'], $reference) && str_contains($confirmation['subject'], $reference), 'reference in both subjects');
    $sent = 0;
    $lastKey = '';
    $stages = [];
    $transport = function (array $payload, string $key) use (&$sent, &$lastKey, &$stages): void {
        $sent++;
        $lastKey = $key;
        $internal = str_ends_with($key, '/internal-v2');
        $stages[] = $internal ? 'internal' : 'confirmation';
        check($internal ? $payload['to'] === ['mail@perlas.de'] : count($payload['to']) === 1, 'mock transport recipient');
    };
    $config = ['state_dir' => $temp . '/state', 'state_secret' => str_repeat('x', 64), 'resend_api_key' => 'not-used'];
    $clock = 1800000000;
    $result = perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $config, $transport, $clock);
    check($result['ok'] === true && $result['requestId'] === uuid(1) && $result['confirmationEmailSent'] === true && preg_match('/^P-[A-F0-9]{10}$/D', $result['reference']) === 1, 'truthful two-stage success and short reference');
    check($stages === ['internal', 'confirmation'], 'internal is accepted before confirmation');
    $replay = perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $config, $transport, $clock);
    check($sent === 2 && $lastKey === 'perlas-form/' . uuid(1) . '/confirmation-v2' && $replay === $result, 'idempotent resend and stable reference');
    fails(fn() => perlasDispatch('/contact-requests', [...$data, 'message' => 'different'], null, '192.0.2.1', $config, $transport, $clock), 409, 'idempotency conflict');
    for ($number = 2; $number <= 5; $number++) {
        $loadData = perlasValidate('/contact-requests', [...contact($number), 'email' => 'load' . $number . '@example.com'], $origin);
        $loaded = perlasDispatch('/contact-requests', $loadData, null, '192.0.2.1', $config, $transport, $clock);
        check($loaded['reference'] !== $result['reference'], 'distinct reference');
    }
    fails(fn() => perlasDispatch('/contact-requests', perlasValidate('/contact-requests', contact(6), $origin), null, '192.0.2.1', $config, $transport, $clock), 429, 'IP limit');
    for ($number = 6; $number <= 30; $number++) {
        perlasDispatch('/contact-requests', perlasValidate('/contact-requests', [...contact($number), 'email' => 'load' . $number . '@example.com'], $origin), null, '192.0.2.' . $number, $config, $transport, $clock);
    }
    fails(fn() => perlasDispatch('/contact-requests', perlasValidate('/contact-requests', contact(31), $origin), null, '192.0.2.31', $config, $transport, $clock), 429, 'global limit');
    $rawState = file_get_contents($config['state_dir'] . '/state.json');
    check(!str_contains($rawState, 'test@example.com') && !str_contains($rawState, '192.0.2.') && !str_contains($rawState, 'Test Kontakt'), 'state has no raw PII');

    $retryConfig = [...$config, 'state_dir' => $temp . '/retry'];
    $failureStages = [];
    $failInternal = function (array $payload, string $key) use (&$failureStages): void {
        $failureStages[] = $key;
        throw new RuntimeException('timeout');
    };
    try {
        perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $retryConfig, $failInternal, $clock);
        throw new RuntimeException('FAIL: mock transport failure must not succeed');
    } catch (RuntimeException $error) {
        check($error->getMessage() === 'timeout', 'transport failure preserved for adapter');
    }
    check($failureStages === ['perlas-form/' . uuid(1) . '/internal-v2'], 'no customer confirmation before accepted internal mail');
    perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $retryConfig, $transport, $clock + 30);
    check($lastKey === 'perlas-form/' . uuid(1) . '/confirmation-v2', 'retry uses distinct stable provider keys');
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

    $partialConfig = [...$config, 'state_dir' => $temp . '/partial'];
    $internalCalls = 0;
    $confirmationCalls = 0;
    $confirmationKeys = [];
    $partialTransport = function (array $payload, string $key) use (&$internalCalls, &$confirmationCalls, &$confirmationKeys): void {
        if (str_ends_with($key, '/internal-v2')) {
            $internalCalls++;
            return;
        }
        $confirmationKeys[] = $key;
        $confirmationCalls++;
        if ($confirmationCalls === 1) {
            throw new RuntimeException('confirmation-timeout');
        }
    };
    $partial = perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $partialConfig, $partialTransport, $clock);
    check($partial['ok'] && !$partial['confirmationEmailSent'] && $internalCalls === 1 && $confirmationCalls === 1, 'partial failure retains accepted internal request');
    $immediate = perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $partialConfig, $partialTransport, $clock + 30);
    check($immediate === $partial && $confirmationCalls === 1, 'confirmation backoff');
    $retried = perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $partialConfig, $partialTransport, $clock + 61);
    check($retried['confirmationEmailSent'] && $retried['reference'] === $partial['reference'] && $internalCalls === 1 && $confirmationCalls === 2, 'confirmation-only retry');
    check(count(array_unique($confirmationKeys)) === 1, 'confirmation retry stable key');
    perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $partialConfig, $partialTransport, $clock + 122);
    check($internalCalls === 1 && $confirmationCalls === 2, 'both successful stages deduplicated');

    $boundedConfig = [...$config, 'state_dir' => $temp . '/bounded'];
    $boundedInternal = 0;
    $boundedConfirm = 0;
    $failConfirmation = function (array $payload, string $key) use (&$boundedInternal, &$boundedConfirm): void {
        if (str_ends_with($key, '/internal-v2')) { $boundedInternal++; return; }
        $boundedConfirm++;
        throw new RuntimeException('confirmation-timeout');
    };
    foreach ([0, 61, 122, 183, 3600] as $delay) {
        $boundedResult = perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $boundedConfig, $failConfirmation, $clock + $delay);
        check($boundedResult['ok'] && !$boundedResult['confirmationEmailSent'], 'bounded retry preserves truthful accepted status');
    }
    check($boundedInternal === 1 && $boundedConfirm === 3, 'confirmation max three attempts');
    $expiredResult = perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $boundedConfig, $failConfirmation, $clock + 23 * 3600 + 1);
    check($expiredResult['ok'] && !$expiredResult['confirmationEmailSent'] && $boundedConfirm === 3, 'expired confirmation never resent');

    $recipientConfig = [...$config, 'state_dir' => $temp . '/recipient'];
    for ($number = 101; $number <= 103; $number++) {
        perlasDispatch('/contact-requests', perlasValidate('/contact-requests', contact($number), $origin), null, '192.0.2.' . ($number - 100), $recipientConfig, $transport, $clock);
    }
    fails(fn() => perlasDispatch('/contact-requests', perlasValidate('/contact-requests', contact(104), $origin), null, '198.51.100.20', $recipientConfig, $transport, $clock), 429, 'recipient limit survives IP changes');
    $recipientHash = hash_hmac('sha256', $data['email'], $config['state_secret']);
    $recipientDay = ['rates' => ['recipient-form-day:' . $recipientHash . ':' . intdiv($clock, 86400) => ['count' => 10, 'expires' => $clock + 3600]]];
    fails(function () use (&$recipientDay, $clock, $recipientHash): void { perlasConsumeRate($recipientDay, 'another-ip', $clock, $recipientHash); }, 429, 'recipient daily submission limit');
    $confirmationDay = ['rates' => ['recipient-mail-day:' . $recipientHash . ':' . intdiv($clock, 86400) => ['count' => 10, 'expires' => $clock + 3600]]];
    fails(function () use (&$confirmationDay, $clock, $recipientHash): void { perlasConsumeConfirmationRate($confirmationDay, $recipientHash, $clock); }, 429, 'recipient daily confirmation limit');

    $legacyConfig = [...$config, 'state_dir' => $temp . '/legacy'];
    mkdir($legacyConfig['state_dir']);
    $legacyState = ['requests' => [uuid(1) => ['fingerprint' => perlasFingerprint('/contact-requests', $data, null), 'created' => $clock, 'status' => 'sent']], 'rates' => []];
    file_put_contents($legacyConfig['state_dir'] . '/state.json', json_encode($legacyState));
    $legacyCalls = 0;
    $legacyTransport = function () use (&$legacyCalls): void { $legacyCalls++; };
    $legacy = perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $legacyConfig, $legacyTransport, $clock);
    $legacyReplay = perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $legacyConfig, $legacyTransport, $clock + 61);
    check($legacy['ok'] && !$legacy['confirmationEmailSent'] && preg_match('/^P-[A-F0-9]{10}$/D', $legacy['reference']) === 1 && $legacyReplay === $legacy && $legacyCalls === 0, 'legacy successful requests migrate with no new mail');
    $legacyState['requests'][uuid(1)]['status'] = 'pending';
    file_put_contents($legacyConfig['state_dir'] . '/state.json', json_encode($legacyState));
    fails(fn() => perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $legacyConfig, $legacyTransport, $clock), 409, 'legacy uncertain payload not replayed with new templates');
    check($legacyCalls === 0, 'legacy pending never sends');
    $candidate = perlasReference(['requests' => []], uuid(1), $config['state_secret']);
    $collisionResolved = perlasReference(['requests' => [uuid(2) => ['reference' => $candidate]]], uuid(1), $config['state_secret']);
    check($candidate !== $collisionResolved, 'short reference collision checked and resolved');
    $busyConfig = [...$config, 'state_dir' => $temp . '/busy'];
    mkdir($busyConfig['state_dir']);
    $busyPath = $busyConfig['state_dir'] . '/state.json';
    $busyState = '{"requests":[],"rates":[]}';
    file_put_contents($busyPath, $busyState);
    $busyHandle = fopen($busyPath, 'c+');
    $secondHandle = fopen($busyPath, 'c+');
    check(flock($busyHandle, LOCK_EX | LOCK_NB), 'fixture owns exclusive state lock');
    try {
        $start = hrtime(true);
        fails(fn() => perlasAcquireLock($secondHandle, 100_000), 503, 'bounded nonblocking lock rejects busy state');
        $elapsed = (hrtime(true) - $start) / 1_000_000_000;
        check($elapsed >= 0.08 && $elapsed < 1, 'lock wait remains bounded');
        $busyCalls = 0;
        $busyTransport = function () use (&$busyCalls): void { $busyCalls++; };
        fails(fn() => perlasDispatch('/contact-requests', $data, null, '192.0.2.1', $busyConfig, $busyTransport, $clock), 503, 'dispatch aborts before send if state lock is busy');
        rewind($busyHandle);
        check($busyCalls === 0 && stream_get_contents($busyHandle) === $busyState, 'busy dispatch changes no state and sends no mail');
    } finally {
        fclose($secondHandle);
        flock($busyHandle, LOCK_UN);
        fclose($busyHandle);
    }
    echo "PASS: {$checks} checks; no external email sent.\n";
} finally {
    // Only remove the explicitly created isolated fixture directory.
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($temp, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($iterator as $entry) {
        $entry->isDir() ? rmdir($entry->getPathname()) : unlink($entry->getPathname());
    }
    rmdir($temp);
}
