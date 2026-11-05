<?php
require_once __DIR__ . '/config.php';
require_auth();
require_method('GET');
$db = (new Database())->getConnection();

$cid    = $_GET['contractId']  ?? null;
$entity = $_GET['entity']      ?? null;
$eid    = $_GET['entity_id']   ?? null;
$limit  = max(1, min(500, (int)($_GET['limit'] ?? 200)));

if ($cid) {
    // Find if contract is linked to a prospect
    $pid = null;
    try {
        $pStmt = $db->prepare('SELECT prospect_id FROM extraneterp_contracts WHERE id = :c LIMIT 1');
        $pStmt->execute([':c' => $cid]);
        $pid = $pStmt->fetchColumn();
    } catch (Throwable $e) {}

    if ($pid) {
        $s = $db->prepare('SELECT * FROM extraneterp_activity_log WHERE contract_id = :c OR (entity_type = "contract" AND entity_id = :c2) OR (entity_type = "prospect" AND entity_id = :p) ORDER BY created_at DESC LIMIT ' . $limit);
        $s->execute([':c' => $cid, ':c2' => $cid, ':p' => $pid]);
    } else {
        $s = $db->prepare('SELECT * FROM extraneterp_activity_log WHERE contract_id = :c OR (entity_type = "contract" AND entity_id = :c2) ORDER BY created_at DESC LIMIT ' . $limit);
        $s->execute([':c' => $cid, ':c2' => $cid]);
    }
} elseif ($entity === 'prospect' && $eid) {
    // Find any contracts linked to this prospect
    $linkedCids = [];
    try {
        $cStmt = $db->prepare('SELECT id FROM extraneterp_contracts WHERE prospect_id = :p');
        $cStmt->execute([':p' => $eid]);
        $linkedCids = $cStmt->fetchAll(PDO::FETCH_COLUMN);
    } catch (Throwable $e) {}

    if (!empty($linkedCids)) {
        $placeholders = implode(',', array_fill(0, count($linkedCids), '?'));
        $sql = "SELECT * FROM extraneterp_activity_log WHERE (entity_type = 'prospect' AND entity_id = ?) OR contract_id IN ($placeholders) OR (entity_type = 'contract' AND entity_id IN ($placeholders)) ORDER BY created_at DESC LIMIT " . $limit;
        $s = $db->prepare($sql);
        $s->execute(array_merge([$eid], $linkedCids, $linkedCids));
    } else {
        $s = $db->prepare('SELECT * FROM extraneterp_activity_log WHERE entity_type = :e AND entity_id = :id ORDER BY created_at DESC LIMIT ' . $limit);
        $s->execute([':e' => $entity, ':id' => $eid]);
    }
} elseif ($entity && $eid) {
    $s = $db->prepare('SELECT * FROM extraneterp_activity_log WHERE entity_type = :e AND entity_id = :id ORDER BY created_at DESC LIMIT ' . $limit);
    $s->execute([':e' => $entity, ':id' => $eid]);
} elseif ($entity) {
    $s = $db->prepare('SELECT * FROM extraneterp_activity_log WHERE entity_type = :e ORDER BY created_at DESC LIMIT ' . $limit);
    $s->execute([':e' => $entity]);
} else {
    $s = $db->query('SELECT * FROM extraneterp_activity_log ORDER BY created_at DESC LIMIT ' . $limit);
}
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
ok(['activity' => $out]);
