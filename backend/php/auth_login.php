<?php
require_once __DIR__ . '/config.php';
require_method('POST');

$in = json_input();
$username = trim($in['username'] ?? '');
$password = (string)($in['password'] ?? '');

if ($username === '' || $password === '') {
    fail('Identifiants requis', 422);
}
if (strlen($username) > 80 || strlen($password) > 200) {
    fail('Identifiants invalides', 422);
}

$db = (new Database())->getConnection();

// ---- Ad-hoc rate limiting (MySQL-backed) ---------------------------------
// Tracks failed login attempts per username/email and per source IP.
// Tunables:
//   - WINDOW_MIN  : sliding window in minutes used to count attempts
//   - MAX_USER    : max failed attempts per username/email in the window
//   - MAX_IP      : max failed attempts per IP across all accounts in the window
//   - LOCK_MIN    : how long a target stays locked once the threshold is hit
// Successful logins reset the per-username counter for a clean slate.
const RL_WINDOW_MIN = 15;
const RL_MAX_USER   = 5;
const RL_MAX_IP     = 20;
const RL_LOCK_MIN   = 15;

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (strpos($ip, ',') !== false) $ip = trim(explode(',', $ip)[0]);
$ip = substr($ip, 0, 64);
$userKey = substr(strtolower($username), 0, 120);

// Make sure the attempts table exists (idempotent — safe on every request,
// negligible cost; lets the endpoint work even before the migration is run).
$db->exec('CREATE TABLE IF NOT EXISTS extraneterp_login_attempts (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    username_key VARCHAR(120) NOT NULL,
    ip           VARCHAR(64)  NOT NULL,
    success      TINYINT(1)   NOT NULL DEFAULT 0,
    attempted_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_time (username_key, attempted_at),
    KEY idx_ip_time   (ip, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

// Opportunistic cleanup of rows older than the window (cheap, bounded).
$db->exec('DELETE FROM extraneterp_login_attempts
           WHERE attempted_at < (NOW() - INTERVAL 1 DAY)');

// Count recent failures for this username and this IP.
$cntUser = $db->prepare('SELECT COUNT(*) FROM extraneterp_login_attempts
                         WHERE username_key = :u AND success = 0
                           AND attempted_at >= (NOW() - INTERVAL :win MINUTE)');
$cntUser->bindValue(':u',   $userKey);
$cntUser->bindValue(':win', RL_WINDOW_MIN, PDO::PARAM_INT);
$cntUser->execute();
$failsUser = (int)$cntUser->fetchColumn();

$cntIp = $db->prepare('SELECT COUNT(*) FROM extraneterp_login_attempts
                       WHERE ip = :ip AND success = 0
                         AND attempted_at >= (NOW() - INTERVAL :win MINUTE)');
$cntIp->bindValue(':ip',  $ip);
$cntIp->bindValue(':win', RL_WINDOW_MIN, PDO::PARAM_INT);
$cntIp->execute();
$failsIp = (int)$cntIp->fetchColumn();

if ($failsUser >= RL_MAX_USER || $failsIp >= RL_MAX_IP) {
    // Look at the most recent failure to estimate retry-after.
    $last = $db->prepare('SELECT MAX(attempted_at) FROM extraneterp_login_attempts
                          WHERE success = 0 AND (username_key = :u OR ip = :ip)');
    $last->execute([':u' => $userKey, ':ip' => $ip]);
    $lastAt = $last->fetchColumn();
    $retryAfter = RL_LOCK_MIN * 60;
    if ($lastAt) {
        $elapsed = max(0, time() - strtotime((string)$lastAt));
        $retryAfter = max(1, RL_LOCK_MIN * 60 - $elapsed);
    }
    header('Retry-After: ' . $retryAfter);
    fail('Trop de tentatives. Réessayez dans ' . ceil($retryAfter / 60) . ' min.', 429);
}

/** Record a login attempt outcome. */
$recordAttempt = function (bool $success) use ($db, $userKey, $ip) {
    $ins = $db->prepare('INSERT INTO extraneterp_login_attempts
                         (username_key, ip, success) VALUES (:u, :ip, :s)');
    $ins->execute([':u' => $userKey, ':ip' => $ip, ':s' => $success ? 1 : 0]);
};
// --------------------------------------------------------------------------

ensure_must_change_column($db);
$stmt = $db->prepare('SELECT id, username, full_name, email, password_hash, role, team, active,
                             COALESCE(must_change_password, 0) AS must_change_password
                      FROM extraneterp_users WHERE username = :username OR email = :email LIMIT 1');
$stmt->execute([
    ':username' => $username,
    ':email' => $username,
]);
$user = $stmt->fetch();

if (!$user || !$user['active']) {
    $recordAttempt(false);
    fail('Identifiants invalides', 401);
}
if (!password_verify($password, $user['password_hash'])) {
    $recordAttempt(false);
    fail('Identifiants invalides', 401);
}

// Enforce IP allowlist BEFORE issuing token (Administrateur is always exempt).
enforce_ip_allowlist(['role' => $user['role'], 'username' => $user['username']]);

// Successful login — clear the per-username failure history.
$clear = $db->prepare('DELETE FROM extraneterp_login_attempts
                       WHERE username_key = :u AND success = 0');
$clear->execute([':u' => $userKey]);
$recordAttempt(true);

// Audit log: successful login.
$ua = substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 180);
log_action($db, 'user', $user['username'], 'login', '', $ip . ' · ' . $ua, $user['username']);

$token = jwt_sign([
    'sub'      => $user['id'],
    'username' => $user['username'],
    'role'     => $user['role'],
]);

unset($user['password_hash']);
ok([
    'token' => $token,
    'user'  => [
        'id'        => $user['id'],
        'username'  => $user['username'],
        'fullName'  => $user['full_name'],
        'email'     => $user['email'],
        'role'      => $user['role'],
        'team'      => $user['team'],
        'active'    => (bool)$user['active'],
        'mustChangePassword' => (bool)($user['must_change_password'] ?? 0),
    ],
]);
