<?php
declare(strict_types=1);

/** Perla's form gateway. PHP 8.2+, curl, fileinfo, zip. No third-party packages. */
const PERLAS_ORIGINS = ['https://www.perlas.de', 'https://perlas.de', 'https://seroffm.github.io'];
const PERLAS_ROUTES = ['/quote-requests', '/contact-requests', '/career-applications'];
const PERLAS_BODY_LIMIT = 6 * 1024 * 1024;
const PERLAS_FILE_LIMIT = 5 * 1024 * 1024;
const PERLAS_FROM = "Perla's <formulare@perlas.de>";
const PERLAS_TO = 'mail@perlas.de';
require_once __DIR__ . '/mail-templates.php';

final class PerlasHttpError extends RuntimeException
{
    public function __construct(public readonly int $status, string $message)
    {
        parent::__construct($message);
    }
}

function perlasError(int $status, string $message): never
{
    throw new PerlasHttpError($status, $message);
}

/** Reject arrays, malformed UTF-8, hidden controls and header injection. Limits are characters. */
function perlasText(array $input, string $key, int $limit, bool $required = false, bool $multiline = false): string
{
    $value = $input[$key] ?? '';
    if (!is_string($value) || !preg_match('//u', $value)) {
        perlasError(422, 'Bitte prüfen Sie die Angaben im Formular.');
    }
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    if (preg_match($multiline ? '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u' : '/[\x00-\x1F\x7F]/u', $value)) {
        perlasError(422, 'Bitte prüfen Sie die Angaben im Formular.');
    }
    $value = trim($value);
    $length = preg_match_all('/./us', $value);
    if ($length === false || $length > $limit || ($required && $value === '')) {
        perlasError(422, 'Bitte füllen Sie alle Pflichtfelder aus und beachten Sie die Textlängen.');
    }
    return $value;
}

function perlasOrigin(string $origin): bool
{
    return in_array($origin, PERLAS_ORIGINS, true);
}

/** The source is only origin + pathname, never a client-provided mail destination. */
function perlasSource(string $source, string $origin): string
{
    $parts = parse_url($source);
    if ($parts === false || isset($parts['user']) || isset($parts['pass']) || isset($parts['query']) || isset($parts['fragment'])) {
        perlasError(422, 'Die Herkunft des Formulars ist ungültig.');
    }
    $sourceOrigin = ($parts['scheme'] ?? '') . '://' . ($parts['host'] ?? '') . (isset($parts['port']) ? ':' . $parts['port'] : '');
    if ($sourceOrigin !== $origin || !perlasOrigin($sourceOrigin) || !str_starts_with($parts['path'] ?? '/', '/')) {
        perlasError(422, 'Die Herkunft des Formulars ist ungültig.');
    }
    return $sourceOrigin . ($parts['path'] ?? '/');
}

/** Normalize only known fields so the client cannot influence transport or recipient. */
function perlasValidate(string $route, array $input, string $origin): array
{
    if (!in_array($route, PERLAS_ROUTES, true)) {
        perlasError(404, 'Dieser Endpunkt existiert nicht.');
    }
    $common = ['requestId', 'source', 'privacyConsent', 'website', 'name', 'email', 'phone'];
    $specific = match ($route) {
        '/quote-requests' => ['propertyType', 'street', 'location', 'services', 'preferredStart', 'details', 'company'],
        '/contact-requests' => ['subject', 'company', 'street', 'location', 'message'],
        '/career-applications' => ['role', 'message'],
    };
    if (array_diff(array_keys($input), array_merge($common, $specific))) {
        perlasError(422, 'Das Formular enthält unbekannte Angaben.');
    }
    if (($input['privacyConsent'] ?? null) !== 'true') {
        perlasError(422, 'Bitte bestätigen Sie die Datenschutzhinweise.');
    }
    if (!array_key_exists('website', $input) || !is_string($input['website']) || $input['website'] !== '') {
        perlasError(422, 'Die Anfrage konnte nicht geprüft werden. Bitte versuchen Sie es erneut.');
    }
    $requestId = perlasText($input, 'requestId', 36, true);
    if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iD', $requestId)) {
        perlasError(422, 'Die Anfragekennung ist ungültig. Bitte laden Sie die Seite erneut.');
    }
    $data = [
        'requestId' => $requestId,
        'source' => perlasSource(perlasText($input, 'source', 1000, true), $origin),
        'name' => perlasText($input, 'name', 160, true),
        'email' => perlasText($input, 'email', 254, true),
        'phone' => perlasText($input, 'phone', 60),
    ];
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        perlasError(422, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    }
    if ($route === '/quote-requests') {
        foreach (['propertyType' => 120, 'street' => 200, 'location' => 200, 'preferredStart' => 120, 'company' => 200] as $key => $limit) {
            $data[$key] = perlasText($input, $key, $limit, in_array($key, ['propertyType', 'street', 'location'], true));
        }
        $data['details'] = perlasText($input, 'details', 6000, false, true);
        $servicesRaw = perlasText($input, 'services', 2000, true);
        try {
            $services = json_decode($servicesRaw, true, 8, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            perlasError(422, 'Bitte wählen Sie mindestens eine Leistung aus.');
        }
        if (!is_array($services) || !array_is_list($services) || count($services) < 1 || count($services) > 16) {
            perlasError(422, 'Bitte wählen Sie mindestens eine Leistung aus.');
        }
        $data['services'] = [];
        foreach ($services as $service) {
            $data['services'][] = perlasText(['service' => $service], 'service', 100, true);
        }
        $data['services'] = array_values(array_unique($data['services']));
    } elseif ($route === '/contact-requests') {
        foreach (['subject' => 200, 'company' => 200, 'street' => 200, 'location' => 200] as $key => $limit) {
            $data[$key] = perlasText($input, $key, $limit, $key === 'subject');
        }
        $data['message'] = perlasText($input, 'message', 6000, true, true);
    } else {
        $data['role'] = perlasText($input, 'role', 200, true);
        $data['message'] = perlasText($input, 'message', 6000, true, true);
    }
    return $data;
}

/** Accept one genuine PHP upload; never fetch URLs or move uploads into a public directory. */
function perlasAttachment(array $files, string $route): ?array
{
    if (!$files) {
        return null;
    }
    if ($route !== '/career-applications' || array_keys($files) !== ['attachment']) {
        perlasError(422, 'Ein Anhang ist nur für Bewerbungen erlaubt.');
    }
    $file = $files['attachment'];
    if (!is_array($file) || !isset($file['error']) || !is_int($file['error'])) {
        perlasError(422, 'Der Anhang ist ungültig.');
    }
    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
        perlasError(413, 'Der Anhang darf höchstens 5 MB groß sein.');
    }
    if ($file['error'] !== UPLOAD_ERR_OK || !is_string($file['tmp_name'] ?? null) || !is_uploaded_file($file['tmp_name'])) {
        perlasError(422, 'Der Anhang konnte nicht übertragen werden.');
    }
    return perlasInspectAttachment($file['tmp_name'], $file['name'] ?? '');
}

/** Also usable with local fixtures in tests; the HTTP adapter enforces is_uploaded_file. */
function perlasInspectAttachment(string $path, mixed $originalName): array
{
    if (!is_string($originalName) || strlen($originalName) > 1024 || !preg_match('//u', $originalName) || preg_match('/[\x00-\x1F\x7F]/', $originalName)) {
        perlasError(422, 'Der Dateiname ist ungültig.');
    }
    $size = filesize($path);
    if ($size === false || $size <= 0 || $size > PERLAS_FILE_LIMIT) {
        perlasError(413, 'Der Anhang darf höchstens 5 MB groß sein und muss eine Datei enthalten.');
    }
    $name = basename(str_replace('\\', '/', $originalName));
    $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $allowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    if (!in_array($extension, $allowed, true)) {
        perlasError(422, 'Erlaubte Anhänge: PDF, DOC, DOCX, JPG und PNG.');
    }
    $bytes = file_get_contents($path);
    if ($bytes === false || strlen($bytes) !== $size) {
        perlasError(422, 'Der Anhang konnte nicht gelesen werden.');
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
    $valid = false;
    if ($extension === 'pdf') {
        $valid = $mime === 'application/pdf' && preg_match('/^%PDF-1\.[0-9]|^%PDF-2\.0/', $bytes) === 1;
    } elseif (in_array($extension, ['jpg', 'jpeg', 'png'], true)) {
        $image = @getimagesizefromstring($bytes);
        $type = $extension === 'png' ? IMAGETYPE_PNG : IMAGETYPE_JPEG;
        $valid = is_array($image) && ($image[2] ?? null) === $type && $mime === ($extension === 'png' ? 'image/png' : 'image/jpeg');
        if ($image && ($image[0] > 20000 || $image[1] > 20000)) {
            $valid = false;
        }
    } elseif ($extension === 'doc') {
        $valid = str_starts_with($bytes, "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1")
            && in_array($mime, ['application/msword', 'application/x-ole-storage', 'application/CDFV2'], true)
            && str_contains($bytes, "W\0o\0r\0d\0D\0o\0c\0u\0m\0e\0n\0t\0");
    } elseif ($extension === 'docx') {
        if (!class_exists(ZipArchive::class)) {
            perlasError(503, 'DOCX-Dateien können momentan nicht verarbeitet werden. Bitte verwenden Sie PDF.');
        }
        if (str_starts_with($bytes, "PK\x03\x04") && in_array($mime, ['application/zip', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], true)) {
            $valid = perlasInspectDocx($path);
        }
    }
    if (!$valid) {
        perlasError(422, 'Dateityp und Dateiinhalt stimmen nicht überein oder die Datei ist beschädigt.');
    }
    $stem = preg_replace('/[^\p{L}\p{N} _.-]/u', '_', pathinfo($name, PATHINFO_FILENAME)) ?? 'Bewerbung';
    $stem = function_exists('mb_substr') ? mb_substr($stem, 0, 100) : substr($stem, 0, 100);
    $stem = trim($stem, '. ');
    $safeName = ($stem !== '' && preg_match('//u', $stem) ? $stem : 'Bewerbung') . '.' . $extension;
    return ['filename' => $safeName, 'content' => base64_encode($bytes), 'sha256' => hash('sha256', $bytes)];
}

function perlasInspectDocx(string $path): bool
{
    $zip = new ZipArchive();
    if ($zip->open($path) !== true) {
        return false;
    }
    try {
        if ($zip->numFiles > 512 || $zip->locateName('word/document.xml') === false) {
            return false;
        }
        $total = 0;
        for ($index = 0; $index < $zip->numFiles; $index++) {
            $entry = $zip->statIndex($index);
            if (!$entry || str_contains($entry['name'], '..') || str_starts_with($entry['name'], '/')
                || str_contains($entry['name'], '\\') || ($entry['encryption_method'] ?? 0) !== 0
                || str_starts_with(strtolower($entry['name']), 'word/embeddings/')
                || preg_match('/(?:vbaProject\.bin|\.(?:exe|dll|js|vbs|ps1|php|phar|bat|cmd|com|scr))$/i', $entry['name'])) {
                return false;
            }
            $total += $entry['size'];
            if ($total > 50 * 1024 * 1024 || $entry['size'] > 20 * 1024 * 1024) {
                return false;
            }
        }
        $typesStat = $zip->statName('[Content_Types].xml');
        if (!$typesStat || $typesStat['size'] > 1024 * 1024) {
            return false;
        }
        $types = $zip->getFromName('[Content_Types].xml');
        return is_string($types)
            && str_contains($types, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml')
            && !str_contains(strtolower($types), 'macroenabled');
    } finally {
        $zip->close();
    }
}

function perlasFingerprint(string $route, array $data, ?array $attachment): string
{
    unset($data['requestId']);
    return hash('sha256', json_encode([$route, $data, $attachment ? [$attachment['filename'], $attachment['sha256']] : null], JSON_THROW_ON_ERROR));
}

function perlasConfig(): array
{
    $path = dirname(__DIR__) . '/private/perlas-forms-config.php';
    $config = is_file($path) ? require $path : [];
    if (!is_array($config)) {
        throw new RuntimeException('Configuration is unavailable.');
    }
    $config['resend_api_key'] = getenv('RESEND_API_KEY') ?: ($config['resend_api_key'] ?? '');
    $config['state_secret'] = getenv('PERLAS_FORMS_STATE_SECRET') ?: ($config['state_secret'] ?? '');
    $config['state_dir'] = dirname(__DIR__) . '/private/perlas-forms-state';
    if (!is_string($config['resend_api_key']) || !preg_match('/^re_[A-Za-z0-9_-]{10,}$/D', $config['resend_api_key'])
        || !is_string($config['state_secret']) || strlen($config['state_secret']) < 32) {
        throw new RuntimeException('Configuration is unavailable.');
    }
    return $config;
}

/** Fixed transport: TLS verification stays enabled; never expose vendor errors or the key. */
function perlasResend(array $mail, string $idempotencyKey, array $config): void
{
    if (!function_exists('curl_init')) {
        throw new RuntimeException('Transport is unavailable.');
    }
    $curl = curl_init('https://api.resend.com/emails');
    if ($curl === false) {
        throw new RuntimeException('Transport is unavailable.');
    }
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($mail, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $config['resend_api_key'],
            'Content-Type: application/json',
            'Idempotency-Key: ' . $idempotencyKey,
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
    ]);
    try {
        $body = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $response = is_string($body) ? json_decode($body, true) : null;
        if ($status < 200 || $status >= 300 || !is_array($response) || !is_string($response['id'] ?? null)) {
            throw new RuntimeException('Transport could not confirm delivery.');
        }
    } finally {
        curl_close($curl);
    }
}

function perlasPruneState(array $state, int $now): array
{
    $state += ['requests' => [], 'rates' => []];
    foreach ($state['requests'] as $key => $record) {
        if (!is_array($record) || ($record['created'] ?? 0) < $now - 2 * 86400) {
            unset($state['requests'][$key]);
        }
    }
    foreach ($state['rates'] as $key => $rate) {
        if (!is_array($rate) || ($rate['expires'] ?? 0) <= $now) {
            unset($state['rates'][$key]);
        }
    }
    return $state;
}

function perlasConsumeRate(array &$state, string $ipHash, int $now, ?string $recipientHash = null): void
{
    $hour = intdiv($now, 3600);
    $day = intdiv($now, 86400);
    $limits = [
        'ip:' . $ipHash . ':' . $hour => [5, ($hour + 1) * 3600],
        'global-hour:' . $hour => [30, ($hour + 1) * 3600],
        'global-day:' . $day => [100, ($day + 1) * 86400],
    ];
    if ($recipientHash !== null) {
        $limits['recipient-form-hour:' . $recipientHash . ':' . $hour] = [3, ($hour + 1) * 3600];
        $limits['recipient-form-day:' . $recipientHash . ':' . $day] = [10, ($day + 1) * 86400];
    }
    perlasApplyLimits($state, $limits);
}

function perlasConsumeConfirmationRate(array &$state, string $recipientHash, int $now): void
{
    $hour = intdiv($now, 3600);
    $day = intdiv($now, 86400);
    // Bound actual confirmation attempts as well as initial submissions. Changing IPs does not help.
    perlasApplyLimits($state, [
        'recipient-mail-hour:' . $recipientHash . ':' . $hour => [3, ($hour + 1) * 3600],
        'recipient-mail-day:' . $recipientHash . ':' . $day => [10, ($day + 1) * 86400],
    ]);
}

function perlasApplyLimits(array &$state, array $limits): void
{
    foreach ($limits as $key => [$limit]) {
        if (($state['rates'][$key]['count'] ?? 0) >= $limit) {
            perlasError(429, 'Es wurden zu viele Anfragen gesendet. Bitte versuchen Sie es später oder rufen Sie uns an.');
        }
    }
    foreach ($limits as $key => [, $expires]) {
        $state['rates'][$key] = ['count' => ($state['rates'][$key]['count'] ?? 0) + 1, 'expires' => $expires];
    }
}

/** Opaque short reference, independent of UUID prefixes; checked for collisions under the state lock. */
function perlasReference(array $state, string $key, string $secret): string
{
    for ($counter = 0; $counter < 256; $counter++) {
        $reference = 'P-' . strtoupper(substr(hash_hmac('sha256', 'reference/' . $key . '/' . $counter, $secret), 0, 10));
        $duplicate = false;
        foreach ($state['requests'] as $recordKey => $record) {
            if ($recordKey !== $key && ($record['reference'] ?? null) === $reference) {
                $duplicate = true;
                break;
            }
        }
        if (!$duplicate) {
            return $reference;
        }
    }
    throw new RuntimeException('Reference is unavailable.');
}

function perlasSuccess(array $data, array $record): array
{
    return [
        'ok' => true,
        'requestId' => $data['requestId'],
        'reference' => $record['reference'],
        'confirmationEmailSent' => ($record['confirmation_status'] ?? '') === 'sent',
    ];
}

function perlasWriteState($handle, array $state): void
{
    $json = json_encode($state, JSON_THROW_ON_ERROR);
    if (!rewind($handle) || !ftruncate($handle, 0) || fwrite($handle, $json) !== strlen($json) || !fflush($handle)) {
        throw new RuntimeException('State could not be saved.');
    }
}

/** Do not queue slow submissions behind two network calls for longer than the UI timeout. */
function perlasAcquireLock($handle, int $waitMicroseconds = 2_000_000): void
{
    $deadline = hrtime(true) + max(0, $waitMicroseconds) * 1000;
    do {
        if (flock($handle, LOCK_EX | LOCK_NB)) {
            return;
        }
        $remaining = $deadline - hrtime(true);
        if ($remaining <= 0) {
            perlasError(503, 'Die Formularübermittlung ist gerade ausgelastet. Ihre Angaben wurden noch nicht übertragen. Bitte versuchen Sie es gleich erneut.');
        }
        usleep((int) min(100_000, max(1, intdiv($remaining, 1000))));
    } while (true);
}

/** One lock protects limits and send/retry records across PHP workers; state contains no form data. */
function perlasDispatch(string $route, array $data, ?array $attachment, string $remoteAddress, array $config, ?callable $transport = null, ?int $clock = null): array
{
    $now = $clock ?? time();
    $directory = $config['state_dir'];
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('State is unavailable.');
    }
    $handle = fopen($directory . '/state.json', 'c+');
    if ($handle === false) {
        throw new RuntimeException('State is unavailable.');
    }
    @chmod($directory . '/state.json', 0600);
    try {
        perlasAcquireLock($handle);
        $raw = stream_get_contents($handle);
        $state = $raw === '' ? [] : json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
        if (!is_array($state)) {
            throw new RuntimeException('State is unavailable.');
        }
        $state = perlasPruneState($state, $now);
        $key = strtolower($data['requestId']);
        $fingerprint = perlasFingerprint($route, $data, $attachment);
        $record = $state['requests'][$key] ?? null;
        if ($record) {
            if (!hash_equals($record['fingerprint'], $fingerprint)) {
                perlasError(409, 'Diese Anfragekennung gehört zu anderen Angaben. Bitte starten Sie eine neue Anfrage.');
            }
            if (!isset($record['mail_version'])) {
                // Legacy successful requests must never receive a new unsolicited confirmation.
                // Legacy pending payloads cannot be replayed with changed templates/idempotency keys.
                if ($record['status'] !== 'sent') {
                    perlasError(409, 'Die ursprüngliche Übertragung konnte nicht bestätigt werden. Bitte kontaktieren Sie uns direkt.');
                }
                $record['reference'] = perlasReference($state, $key, $config['state_secret']);
                $record['mail_version'] = 1;
                $record['confirmation_status'] = 'disabled';
                $record['confirmation_attempts'] = 0;
                $state['requests'][$key] = $record;
                perlasWriteState($handle, $state);
                return perlasSuccess($data, $record);
            }
            if (!preg_match('/^P-[A-F0-9]{10}$/D', $record['reference'] ?? '')) {
                throw new RuntimeException('State is unavailable.');
            }
            if ($record['status'] === 'sent' && in_array($record['confirmation_status'], ['sent', 'disabled', 'expired'], true)) {
                return perlasSuccess($data, $record);
            }
            // Resend forgets idempotency keys after 24h. Never risk duplicating an uncertain old send.
            if ($record['status'] !== 'sent' && $record['created'] < $now - 23 * 3600) {
                perlasError(409, 'Die ursprüngliche Übertragung konnte nicht bestätigt werden. Bitte kontaktieren Sie uns direkt.');
            }
        }
        $ipHash = hash_hmac('sha256', $remoteAddress, $config['state_secret']);
        $recipientHash = hash_hmac('sha256', strtolower($data['email']), $config['state_secret']);
        $send = $transport ?? 'perlasResend';
        $internalSentThisTurn = false;
        if (!$record || $record['status'] !== 'sent') {
            perlasConsumeRate($state, $ipHash, $now, $recipientHash);
            $record ??= [
                'fingerprint' => $fingerprint,
                'created' => $now,
                'status' => 'pending',
                'reference' => perlasReference($state, $key, $config['state_secret']),
                'mail_version' => 2,
                'confirmation_status' => 'pending',
                'confirmation_attempts' => 0,
            ];
            $state['requests'][$key] = $record;
            // Persist before either send; interrupted workers retry the same stage-specific provider key.
            perlasWriteState($handle, $state);
            $mailData = [...$data, 'requestId' => $key];
            $send(perlasMail($route, $mailData, $attachment, $record['reference']), 'perlas-form/' . $key . '/internal-v2', $config);
            $record['status'] = 'sent';
            $state['requests'][$key] = $record;
            perlasWriteState($handle, $state);
            $internalSentThisTurn = true;
        }
        if ($record['created'] < $now - 23 * 3600) {
            $record['confirmation_status'] = 'expired';
            $state['requests'][$key] = $record;
            perlasWriteState($handle, $state);
            return perlasSuccess($data, $record);
        }
        // No immediate loops, and at most three attempts for this request, even on network timeouts.
        if ($record['confirmation_attempts'] >= 3 || ($record['confirmation_last_attempt'] ?? 0) + 60 > $now) {
            return perlasSuccess($data, $record);
        }
        try {
            $limitedState = $state;
            if (!$internalSentThisTurn) {
                perlasConsumeRate($limitedState, $ipHash, $now);
            }
            perlasConsumeConfirmationRate($limitedState, $recipientHash, $now);
            $state = $limitedState;
            $record['confirmation_attempts']++;
            $record['confirmation_last_attempt'] = $now;
            $record['confirmation_status'] = 'pending';
            $state['requests'][$key] = $record;
            perlasWriteState($handle, $state);
            $send(perlasConfirmationMail($route, $data, $record['reference']), 'perlas-form/' . $key . '/confirmation-v2', $config);
            $record['confirmation_status'] = 'sent';
        } catch (Throwable) {
            // The original request is already accepted; a confirmation failure must not undo it.
            // Pending keeps the same Resend key for bounded retries, including uncertain timeouts.
            if ($transport === null) {
                error_log('perlas_forms_confirmation_unavailable');
            }
        }
        $state['requests'][$key] = $record;
        perlasWriteState($handle, $state);
        return perlasSuccess($data, $record);
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function perlasJson(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function perlasHttp(): never
{
    ini_set('display_errors', '0');
    header_remove('X-Powered-By');
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    header('Vary: Origin');
    $method = $_SERVER['REQUEST_METHOD'] ?? '';
    $route = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    $route = is_string($route) ? rtrim($route, '/') : '';
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (is_string($origin) && perlasOrigin($origin)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Max-Age: 600');
    }
    try {
        if ($route === '/health' && $method === 'GET') {
            perlasJson(200, ['ok' => true]);
        }
        if (!in_array($route, PERLAS_ROUTES, true)) {
            perlasError(404, 'Dieser Endpunkt existiert nicht.');
        }
        if (!is_string($origin) || !perlasOrigin($origin)) {
            perlasError(403, 'Diese Formularseite ist nicht freigegeben.');
        }
        if ($method === 'OPTIONS') {
            if (($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'] ?? '') !== 'POST') {
                perlasError(405, 'Diese Anfrageart ist nicht erlaubt.');
            }
            $requestedHeaders = strtolower($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'] ?? '');
            if ($requestedHeaders !== '' && trim($requestedHeaders) !== 'content-type') {
                perlasError(403, 'Diese Anfrageheader sind nicht erlaubt.');
            }
            http_response_code(204);
            exit;
        }
        if ($method !== 'POST') {
            header('Allow: POST, OPTIONS');
            perlasError(405, 'Diese Anfrageart ist nicht erlaubt.');
        }
        $length = $_SERVER['CONTENT_LENGTH'] ?? '';
        if (!is_string($length) || !ctype_digit($length) || (int) $length <= 0) {
            perlasError(411, 'Die Größe der Formularanfrage fehlt.');
        }
        if ((int) $length > PERLAS_BODY_LIMIT) {
            perlasError(413, 'Die Anfrage ist zu groß. Der Anhang darf höchstens 5 MB groß sein.');
        }
        if (!preg_match('/^multipart\/form-data\s*;\s*boundary=/i', $_SERVER['CONTENT_TYPE'] ?? '')) {
            perlasError(415, 'Bitte senden Sie die Anfrage über das Formular der Website.');
        }
        $data = perlasValidate($route, $_POST, $origin);
        $attachment = perlasAttachment($_FILES, $route);
        $remoteAddress = $_SERVER['REMOTE_ADDR'] ?? '';
        // Never trust spoofable X-Forwarded-For. The web server must resolve its trusted proxy itself.
        if (!filter_var($remoteAddress, FILTER_VALIDATE_IP)) {
            throw new RuntimeException('Remote address is unavailable.');
        }
        $result = perlasDispatch($route, $data, $attachment, $remoteAddress, perlasConfig());
        perlasJson(200, $result);
    } catch (PerlasHttpError $error) {
        if ($error->status === 429) {
            header('Retry-After: 3600');
        }
        perlasJson($error->status, ['ok' => false, 'message' => $error->getMessage()]);
    } catch (Throwable) {
        // No submitted content, IP, email, provider response, API key or stack trace is logged.
        error_log('perlas_forms_service_unavailable');
        perlasJson(503, ['ok' => false, 'message' => 'Die Anfrage konnte momentan nicht bestätigt werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.']);
    }
}

if (!defined('PERLAS_FORMS_LIBRARY')) {
    perlasHttp();
}
