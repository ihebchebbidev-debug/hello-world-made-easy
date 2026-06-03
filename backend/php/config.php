<?php
// =====================================================================
// Protection ERP — Shared bootstrap (CORS + DB + JWT helpers + auth)
// Place this folder on a PHP 8+ host with MySQL. Each *.php endpoint
// includes this file as its first line.
// =====================================================================

error_reporting(E_ALL);
ini_set('display_errors', 0);

// ---------- CORS ------------------------------------------------------
// Reflect the request origin. Only emit Allow-Credentials when we have a
// real origin — otherwise the wildcard + credentials combo is rejected by browsers.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    header("Access-Control-Allow-Origin: $origin");
    header("Vary: Origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");

$reqHeaders = $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']
    ?? 'Content-Type, Authorization, X-Requested-With, X-Request-ID, X-Client-Version, Cache-Control, Pragma';
header("Access-Control-Allow-Headers: $reqHeaders");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---------- DATABASE --------------------------------------------------
class Database {
    private $host = "luccybcdb.mysql.db";
    private $username = "luccybcdb";
    private $password = "Dadouhibou2025";
    private $database = "luccybcdb";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->database . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Connection error: ' . $e->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}

// ---------- HELPERS ---------------------------------------------------
function json_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function ok($data = [], int $code = 200): void {
    http_response_code($code);
    echo json_encode(['success' => true] + (is_array($data) ? $data : ['data' => $data]));
    exit;
}

function fail(string $message, int $code = 400, array $extra = []): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message] + $extra);
    exit;
}

function require_method(string ...$methods): void {
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', $methods, true)) {
        fail('Method not allowed', 405);
    }
}

// ---------- JWT (HS256, dependency-free) ------------------------------
const JWT_SECRET = 'change-me-to-a-long-random-string-min-32-chars-9f7c1';
const JWT_TTL_SECONDS = 60 * 60 * 12; // 12h

function b64url_encode(string $s): string {
    return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}
function b64url_decode(string $s): string {
    $pad = strlen($s) % 4;
    if ($pad) $s .= str_repeat('=', 4 - $pad);
    return base64_decode(strtr($s, '-_', '+/'));
}

function jwt_sign(array $payload): string {
    $header  = ['alg' => 'HS256', 'typ' => 'JWT'];
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_TTL_SECONDS;
    $h = b64url_encode(json_encode($header));
    $p = b64url_encode(json_encode($payload));
    $sig = b64url_encode(hash_hmac('sha256', "$h.$p", JWT_SECRET, true));
    return "$h.$p.$sig";
}

function jwt_verify(?string $token): ?array {
    if (!$token) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $p, $sig] = $parts;
    $expected = b64url_encode(hash_hmac('sha256', "$h.$p", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(b64url_decode($p), true);
    if (!is_array($payload)) return null;
    if (($payload['exp'] ?? 0) < time()) return null;
    return $payload;
}

function bearer_token(): ?string {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $normalized = [];
    foreach ($headers as $key => $value) {
        $normalized[strtolower((string)$key)] = $value;
    }

    $candidates = [
        $normalized['authorization'] ?? null,
        $_SERVER['HTTP_AUTHORIZATION'] ?? null,
        $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null,
        getenv('HTTP_AUTHORIZATION') ?: null,
        getenv('REDIRECT_HTTP_AUTHORIZATION') ?: null,
        $_SERVER['HTTP_X_AUTH_TOKEN'] ?? null,
        $normalized['x-auth-token'] ?? null,
        $_GET['token'] ?? null,
    ];

    foreach ($candidates as $auth) {
        $auth = trim((string)$auth);
        if ($auth === '') continue;
        if (stripos($auth, 'Bearer ') === 0) return trim(substr($auth, 7));
        if (substr_count($auth, '.') === 2) return $auth;
    }
    return null;
}

/**
 * Require an authenticated user. Returns the JWT payload (id, username, role).
 * Optional $roles whitelist enforces RBAC.
 */
function require_auth(array $roles = []): array {
    $payload = jwt_verify(bearer_token());
    if (!$payload) fail('Unauthorized', 401);
    if ($roles && !in_array($payload['role'] ?? '', $roles, true)) {
        fail('Forbidden', 403);
    }
    // Enforce IP allowlist (Administrateur is always exempt to avoid lock-out).
    enforce_ip_allowlist($payload);
    return $payload;
}

// ---------- IP ALLOWLIST ---------------------------------------------
/** Real client IP, honouring X-Forwarded-For (first hop). */
function current_client_ip(): string {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
    if (strpos($ip, ',') !== false) $ip = trim(explode(',', $ip)[0]);
    return substr(trim((string)$ip), 0, 64);
}

/** True if $ip matches a single IP or a CIDR block (IPv4 or IPv6). */
function ip_matches(string $ip, string $rule): bool {
    $rule = trim($rule);
    if ($rule === '' || $ip === '') return false;
    if (strpos($rule, '/') === false) return strcasecmp($ip, $rule) === 0;
    [$subnet, $bits] = explode('/', $rule, 2);
    $bits = (int)$bits;
    $ipBin = @inet_pton($ip);
    $netBin = @inet_pton(trim($subnet));
    if ($ipBin === false || $netBin === false || strlen($ipBin) !== strlen($netBin)) return false;
    $bytes = intdiv($bits, 8);
    $remBits = $bits % 8;
    if ($bytes > 0 && substr($ipBin, 0, $bytes) !== substr($netBin, 0, $bytes)) return false;
    if ($remBits === 0) return true;
    $mask = chr((0xff << (8 - $remBits)) & 0xff);
    return (substr($ipBin, $bytes, 1) & $mask) === (substr($netBin, $bytes, 1) & $mask);
}

/**
 * Load the IP allowlist config from extraneterp_settings (scope=global, key=ip_allowlist).
 * Shape: { enabled: bool, ranges: string[], bypassUsers: string[] }
 */
function load_ip_allowlist(): array {
    static $cached = null;
    if ($cached !== null) return $cached;
    $cfg = ['enabled' => false, 'ranges' => [], 'bypassUsers' => [], 'bypassRoles' => []];
    try {
        $db = (new Database())->getConnection();
        $db->exec('CREATE TABLE IF NOT EXISTS extraneterp_settings (
            scope VARCHAR(80) NOT NULL,
            setting_key VARCHAR(120) NOT NULL,
            value LONGTEXT NULL,
            PRIMARY KEY (scope, setting_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        $s = $db->prepare('SELECT value FROM extraneterp_settings WHERE scope = "global" AND setting_key = "ip_allowlist" LIMIT 1');
        $s->execute();
        $raw = $s->fetchColumn();
        if ($raw) {
            $decoded = json_decode((string)$raw, true);
            if (is_array($decoded)) {
                $cfg['enabled']     = !empty($decoded['enabled']);
                $cfg['ranges']      = is_array($decoded['ranges'] ?? null) ? array_values(array_filter(array_map('strval', $decoded['ranges']))) : [];
                $cfg['bypassUsers'] = is_array($decoded['bypassUsers'] ?? null) ? array_values(array_filter(array_map('strval', $decoded['bypassUsers']))) : [];
                $cfg['bypassRoles'] = is_array($decoded['bypassRoles'] ?? null) ? array_values(array_filter(array_map('strval', $decoded['bypassRoles']))) : [];
            }
        }
    } catch (Throwable $e) { /* fail-open if settings unreadable */ }
    return $cached = $cfg;
}

/**
 * Enforce the IP allowlist. Administrateur role and bypassUsers always pass.
 * Pass the JWT payload (with at least 'role' and 'username') when available.
 * Throws 403 with code=IP_NOT_ALLOWED otherwise.
 */
function enforce_ip_allowlist(?array $payload = null): void {
    $cfg = load_ip_allowlist();
    if (!$cfg['enabled'] || empty($cfg['ranges'])) return;
    $role = $payload['role'] ?? null;
    $username = $payload['username'] ?? null;
    // Administrateur is hardcoded-exempt (anti-lock-out), plus any role/user
    // explicitly added to the bypass lists by the admin.
    if ($role === 'Administrateur') return;
    if ($role && in_array((string)$role, $cfg['bypassRoles'], true)) return;
    if ($username && in_array((string)$username, $cfg['bypassUsers'], true)) return;
    $ip = current_client_ip();
    foreach ($cfg['ranges'] as $rule) {
        if (ip_matches($ip, $rule)) return;
    }
    log_ip_block($ip, $username, $role);
    fail(
        "Accès refusé : votre adresse IP (" . ($ip ?: 'inconnue') . ") n'est pas autorisée à se connecter à l'application. Contactez votre administrateur pour ajouter votre IP à la liste blanche.",
        403,
        ['code' => 'IP_NOT_ALLOWED', 'ip' => $ip]
    );
}

/**
 * Log a blocked attempt. Idempotent table creation, soft-fail so a logging
 * problem never masks the original 403 response.
 */
function log_ip_block(string $ip, ?string $username, ?string $role): void {
    try {
        $db = (new Database())->getConnection();
        $db->exec('CREATE TABLE IF NOT EXISTS extraneterp_ip_blocks (
            id          BIGINT AUTO_INCREMENT PRIMARY KEY,
            ip          VARCHAR(64)  NOT NULL,
            username    VARCHAR(120) NULL,
            role        VARCHAR(40)  NULL,
            path        VARCHAR(200) NULL,
            user_agent  VARCHAR(200) NULL,
            attempted_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_ip_time   (ip, attempted_at),
            KEY idx_user_time (username, attempted_at),
            KEY idx_time      (attempted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        // Opportunistic retention: keep only 30 days of history.
        $db->exec('DELETE FROM extraneterp_ip_blocks WHERE attempted_at < (NOW() - INTERVAL 30 DAY)');
        $path = substr((string)($_SERVER['REQUEST_URI'] ?? ''), 0, 200);
        $ua   = substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 200);
        $s = $db->prepare('INSERT INTO extraneterp_ip_blocks (ip, username, role, path, user_agent)
                           VALUES (:ip, :u, :r, :p, :ua)');
        $s->execute([':ip' => $ip ?: '0.0.0.0', ':u' => $username, ':r' => $role, ':p' => $path, ':ua' => $ua]);
    } catch (Throwable $e) { /* swallow */ }
}

/** Insert a notification row for a target user. Soft-fails (no exception) on error. */
function notify_user(PDO $db, string $username, string $title, ?string $body = null, ?string $link = null): void {
    if ($username === '' || $username === '—') return;
    try {
        $s = $db->prepare('INSERT INTO extraneterp_notifications (id, user_username, title, body, link)
                           VALUES (:id, :u, :t, :b, :l)');
        $s->execute([
            ':id' => 'N-' . substr(bin2hex(random_bytes(6)), 0, 10),
            ':u'  => $username, ':t' => $title, ':b' => $body, ':l' => $link,
        ]);
    } catch (Throwable $e) { /* swallow — notifications are best-effort */ }
}

/** Ensure the must_change_password column exists (idempotent, soft-fail). */
function ensure_must_change_column(PDO $db): void {
    try {
        $db->exec("ALTER TABLE extraneterp_users ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0");
    } catch (Throwable $e) { /* column already exists — ignore */ }
}

function extraneterp_all_roles(): array {
    return ['Administrateur','Manager','Superviseur','Agent','Vendeur','Qualificateur','Backoffice','Présentation'];
}

/** Ensure MySQL ENUM columns accept every role used by the app. */
function ensure_app_role_enums(PDO $db): void {
    static $done = false;
    if ($done) return;
    $enumValues = "'Administrateur','Manager','Superviseur','Agent','Vendeur','Qualificateur','Backoffice','Présentation'";
    $expected = "enum($enumValues)";
    $columns = [
        ['table' => 'extraneterp_users', 'column' => 'role', 'sql' => "ALTER TABLE extraneterp_users MODIFY role ENUM($enumValues) NOT NULL DEFAULT 'Agent'"],
        ['table' => 'extraneterp_role_permissions', 'column' => 'role', 'sql' => "ALTER TABLE extraneterp_role_permissions MODIFY role ENUM($enumValues) NOT NULL"],
    ];
    foreach ($columns as $c) {
        try {
            $s = $db->prepare('SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t AND COLUMN_NAME = :c LIMIT 1');
            $s->execute([':t' => $c['table'], ':c' => $c['column']]);
            $type = strtolower((string)$s->fetchColumn());
            if ($type !== strtolower($expected)) $db->exec($c['sql']);
        } catch (Throwable $e) { /* soft-fail; schema.sql / migration can still be run manually */ }
    }
    $done = true;
}

/**
 * Append a row to extraneterp_activity_log. Soft-fails so callers never break
 * a business action because the audit log is unavailable.
 * Use entity_type='user' to track per-user actions (login/logout/edits).
 */
function log_action(
    PDO $db,
    string $entityType,
    string $entityId,
    string $field,
    $previous,
    $next,
    string $user
): void {
    if ($user === '') return;
    try {
        $s = $db->prepare('INSERT INTO extraneterp_activity_log
            (id, entity_type, entity_id, contract_id, field, previous_value, new_value, user_username)
            VALUES (:id, :et, :eid, :cid, :f, :pv, :nv, :u)');
        $s->execute([
            ':id'  => 'A-' . substr(bin2hex(random_bytes(8)), 0, 14),
            ':et'  => substr($entityType, 0, 32),
            ':eid' => substr($entityId, 0, 40),
            ':cid' => $entityType === 'contract' ? substr($entityId, 0, 40) : '',
            ':f'   => substr($field, 0, 40),
            ':pv'  => substr((string)($previous ?? ''), 0, 255),
            ':nv'  => substr((string)($next ?? ''), 0, 255),
            ':u'   => substr($user, 0, 80),
        ]);
    } catch (Throwable $e) { /* best-effort */ }
}

/**
 * Try to find the prospect.id that best matches a contact record (contract
 * row, calendar event, …). Resolution order:
 *   1) exact phone (digits-only) — phone OR mobile on both sides
 *   2) exact lowercased email
 *   3) exact (last_name + first_name), case-insensitive
 *   4) last_name only when unique
 * Returns null when no confident match is found. Idempotent / read-only.
 */
function resolve_prospect_id(PDO $db, array $r): ?string {
    $digits = function ($v): string {
        return preg_replace('/\D+/', '', (string)($v ?? ''));
    };
    $phones = array_values(array_filter([
        $digits($r['phone']  ?? null),
        $digits($r['mobile'] ?? null),
    ], fn($v) => strlen($v) >= 8));
    foreach ($phones as $p) {
        try {
            $s = $db->prepare("SELECT id FROM extraneterp_prospects
                WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(phone,''),  ' ',''),'.',''),'-',''),'(',''),')','') = :p
                   OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(mobile,''), ' ',''),'.',''),'-',''),'(',''),')','') = :p
                ORDER BY created_at DESC LIMIT 1");
            $s->execute([':p' => $p]);
            $id = $s->fetchColumn();
            if ($id) return (string)$id;
        } catch (Throwable $e) {}
    }
    $email = strtolower(trim((string)($r['email'] ?? '')));
    if ($email !== '' && strpos($email, '@') !== false) {
        try {
            $s = $db->prepare("SELECT id FROM extraneterp_prospects
                WHERE LOWER(email) = :e ORDER BY created_at DESC LIMIT 1");
            $s->execute([':e' => $email]);
            $id = $s->fetchColumn();
            if ($id) return (string)$id;
        } catch (Throwable $e) {}
    }
    $ln = trim((string)($r['lastName']  ?? $r['last_name']  ?? ''));
    $fn = trim((string)($r['firstName'] ?? $r['first_name'] ?? ''));
    if ($ln !== '' && $fn !== '') {
        try {
            $s = $db->prepare("SELECT id FROM extraneterp_prospects
                WHERE LOWER(last_name) = LOWER(:l) AND LOWER(first_name) = LOWER(:f)
                ORDER BY created_at DESC LIMIT 1");
            $s->execute([':l' => $ln, ':f' => $fn]);
            $id = $s->fetchColumn();
            if ($id) return (string)$id;
        } catch (Throwable $e) {}
    }
    if ($ln !== '') {
        try {
            $s = $db->prepare("SELECT id FROM extraneterp_prospects
                WHERE LOWER(last_name) = LOWER(:l) LIMIT 2");
            $s->execute([':l' => $ln]);
            $ids = $s->fetchAll(PDO::FETCH_COLUMN);
            if (count($ids) === 1) return (string)$ids[0];
        } catch (Throwable $e) {}
    }
    return null;
}

/**
 * Best-effort: parse a calendar event title and resolve the linked prospect.
 * Accepts titles like "RDV — Jean DUPONT", "Jean DUPONT", "P-abc12345 Jean Dupont".
 */
function resolve_prospect_id_from_title(PDO $db, string $title): ?string {
    $title = trim($title);
    if ($title === '') return null;
    if (preg_match('/\bP-[A-Z0-9-]{4,}\b/i', $title, $m)) {
        $cand = strtoupper($m[0]);
        try {
            $s = $db->prepare('SELECT id FROM extraneterp_prospects WHERE id = :id');
            $s->execute([':id' => $cand]);
            $id = $s->fetchColumn();
            if ($id) return (string)$id;
        } catch (Throwable $e) {}
    }
    $candidates = [$title];
    foreach ([' — ', ' – ', ' - ', ' : ', ' | ', '—', '–', ':', '|'] as $sep) {
        $pos = strpos($title, $sep);
        if ($pos !== false) $candidates[] = trim(substr($title, $pos + strlen($sep)));
    }
    foreach ($candidates as $c) {
        $c = trim(preg_replace('/^(rdv|rappel|signature)\b[\s:–—-]*/i', '', $c));
        $parts = preg_split('/\s+/', $c);
        if (count($parts) < 2) continue;
        // Try every (first, last) split of length 2..N
        for ($i = 1; $i < count($parts); $i++) {
            $fn = implode(' ', array_slice($parts, 0, $i));
            $ln = implode(' ', array_slice($parts, $i));
            $id = resolve_prospect_id($db, ['firstName' => $fn, 'lastName' => $ln]);
            if ($id) return $id;
            $id = resolve_prospect_id($db, ['firstName' => $ln, 'lastName' => $fn]);
            if ($id) return $id;
        }
    }
    return null;
}

/** Best-effort client IP, trusts X-Forwarded-For first hop. */
function client_ip(): string {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if (strpos($ip, ',') !== false) $ip = trim(explode(',', $ip)[0]);
    return substr($ip, 0, 64);
}
