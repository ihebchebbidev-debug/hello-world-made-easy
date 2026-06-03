<?php
require_once __DIR__ . '/config.php';
require_auth();
require_method('GET');

$username = trim((string)($_GET['username'] ?? ''));
if ($username === '') fail('username requis', 422);
$limit = max(1, min(500, (int)($_GET['limit'] ?? 200)));

$db = (new Database())->getConnection();

// All actions performed BY this user, plus events on the user entity itself
// (login/logout/profile edits target entity_type='user', entity_id=username).
$sql = "SELECT * FROM extraneterp_activity_log
        WHERE user_username = :u
           OR (entity_type = 'user' AND entity_id = :u2)
        ORDER BY created_at DESC LIMIT " . $limit;
$s = $db->prepare($sql);
$s->execute([':u' => $username, ':u2' => $username]);
$rows = $s->fetchAll();

$out = array_map(fn($a) => [
    'id'            => $a['id'],
    'entityType'    => $a['entity_type'] ?? 'contract',
    'entityId'      => $a['entity_id']   ?? $a['contract_id'],
    'contractId'    => $a['contract_id'],
    'field'         => $a['field'],
    'previousValue' => $a['previous_value'],
    'newValue'      => $a['new_value'],
    'user'          => $a['user_username'],
    'timestamp'     => str_replace(' ', 'T', $a['created_at']) . 'Z',
], $rows);

ok(['activity' => $out, 'count' => count($out)]);
