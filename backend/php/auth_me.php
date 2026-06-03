<?php
require_once __DIR__ . '/config.php';
require_method('GET');
$payload = require_auth();

$db = (new Database())->getConnection();
ensure_must_change_column($db);
$stmt = $db->prepare('SELECT id, username, full_name, email, role, team, active,
                             COALESCE(must_change_password, 0) AS must_change_password
                      FROM extraneterp_users WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $payload['sub']]);
$u = $stmt->fetch();
if (!$u) fail('User not found', 404);

ok(['user' => [
    'id'       => $u['id'],
    'username' => $u['username'],
    'fullName' => $u['full_name'],
    'email'    => $u['email'],
    'role'     => $u['role'],
    'team'     => $u['team'],
    'active'   => (bool)$u['active'],
    'mustChangePassword' => (bool)($u['must_change_password'] ?? 0),
]]);
