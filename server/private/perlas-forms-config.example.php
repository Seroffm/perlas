<?php
declare(strict_types=1);

// Copy to perlas-forms-config.php OUTSIDE the public document root; never commit real secrets.
// Prefer server-side environment variables RESEND_API_KEY and PERLAS_FORMS_STATE_SECRET.
return [
    'resend_api_key' => '',
    // Generate once: php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
    'state_secret' => '',
];
