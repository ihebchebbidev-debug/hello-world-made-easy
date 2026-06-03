<?php
require_once __DIR__ . '/config.php';
require_method('POST');
// Stateless JWT — client just discards the token. We still log it for auditing.
try {
    $payload = jwt_verify(bearer_token());
    if ($payload && !empty($payload['username'])) {
        $db = (new Database())->getConnection();
        log_action(
            $db, 'user', (string)$payload['username'], 'logout',
            '', client_ip(), (string)$payload['username']
        );
    }
} catch (Throwable $e) { /* best-effort */ }
ok(['message' => 'Logged out']);
