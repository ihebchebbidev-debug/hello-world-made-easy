<?php
require_once __DIR__ . '/config.php';
require_auth();
require_method('GET');
$db = (new Database())->getConnection();

$cid    = $_GET['contractId']  ?? null;
$entity = $_GET['entity']      ?? null;
$eid    = $_GET['entity_id']   ?? null;
$limit  = max(1, min(500, (int)($_GET['limit'] ?? 200)));

$prospectIds = [];
$contractIds = [];

if ($cid || ($entity === 'contract' && $eid)) {
    $targetCid = $cid ?: $eid;
    $contractIds[] = $targetCid;

    try {
        $cStmt = $db->prepare('SELECT * FROM extraneterp_contracts WHERE id = :c LIMIT 1');
        $cStmt->execute([':c' => $targetCid]);
        $cRow = $cStmt->fetch();
        if ($cRow) {
            $pid = $cRow['prospect_id'] ?? null;
            if (!$pid) {
                $pid = resolve_prospect_id($db, $cRow);
                if ($pid) {
                    $db->prepare('UPDATE extraneterp_contracts SET prospect_id = :p WHERE id = :c AND (prospect_id IS NULL OR prospect_id = "")')
                       ->execute([':p' => $pid, ':c' => $targetCid]);
                }
            }
            if ($pid) {
                $prospectIds[] = $pid;
            }

            // Find all contracts belonging to this same person (even if contract changed)
            $ors = [];
            $params = [];
            if ($pid) {
                $ors[] = 'prospect_id = :pid';
                $params[':pid'] = $pid;
            }
            $ln = trim((string)($cRow['last_name'] ?? ''));
            $fn = trim((string)($cRow['first_name'] ?? ''));
            if ($ln !== '' && $fn !== '') {
                $ors[] = '(LOWER(last_name) = LOWER(:ln) AND LOWER(first_name) = LOWER(:fn))';
                $params[':ln'] = $ln;
                $params[':fn'] = $fn;
            }
            if ($ors) {
                $allStmt = $db->prepare('SELECT id FROM extraneterp_contracts WHERE ' . implode(' OR ', $ors));
                $allStmt->execute($params);
                foreach ($allStmt->fetchAll(PDO::FETCH_COLUMN) as $foundId) {
                    $contractIds[] = $foundId;
                }
            }
        }
    } catch (Throwable $e) {}
} elseif ($entity === 'prospect' && $eid) {
    $prospectIds[] = $eid;

    try {
        $pStmt = $db->prepare('SELECT * FROM extraneterp_prospects WHERE id = :p LIMIT 1');
        $pStmt->execute([':p' => $eid]);
        $pRow = $pStmt->fetch();
        if ($pRow) {
            $ors = ['prospect_id = :pid'];
            $params = [':pid' => $eid];
            $ln = trim((string)($pRow['last_name'] ?? ''));
            $fn = trim((string)($pRow['first_name'] ?? ''));
            if ($ln !== '' && $fn !== '') {
                $ors[] = '(LOWER(last_name) = LOWER(:ln) AND LOWER(first_name) = LOWER(:fn))';
                $params[':ln'] = $ln;
                $params[':fn'] = $fn;
            }
            $allStmt = $db->prepare('SELECT id FROM extraneterp_contracts WHERE ' . implode(' OR ', $ors));
            $allStmt->execute($params);
            foreach ($allStmt->fetchAll(PDO::FETCH_COLUMN) as $foundId) {
                $contractIds[] = $foundId;
            }
        }
    } catch (Throwable $e) {}
} elseif ($entity && $eid) {
    $whereParts = ["entity_type = :e AND entity_id = :id"];
    $s = $db->prepare('SELECT * FROM extraneterp_activity_log WHERE entity_type = :e AND entity_id = :id ORDER BY created_at DESC LIMIT ' . $limit);
    $s->execute([':e' => $entity, ':id' => $eid]);
    $rows = $s->fetchAll();
// Normalize field names from snake_case (DB) to camelCase (UI) and combine name parts
function normalizeField(string $field): string {
    $map = [
        'first_name' => 'firstName',
        'last_name'  => 'lastName',
        // add other mappings if needed
    ];
    return $map[$field] ?? $field;
}

foreach ($rows as &$r) {
    $r['field'] = normalizeField($r['field'] ?? '');
    // Combine firstName and lastName into a single "name" entry if both exist for the same timestamp and user
    // This will be handled later in deduplication; we just keep both entries for now.
}
unset($r);
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
}

$prospectIds = array_values(array_unique(array_filter($prospectIds)));
$contractIds = array_values(array_unique(array_filter($contractIds)));

$whereParts = [];
$queryParams = [];

if (!empty($prospectIds)) {
    $phP = implode(',', array_fill(0, count($prospectIds), '?'));
    $whereParts[] = "(entity_type = 'prospect' AND entity_id IN ($phP))";
    foreach ($prospectIds as $p) $queryParams[] = $p;
}

if (!empty($contractIds)) {
    $phC1 = implode(',', array_fill(0, count($contractIds), '?'));
    $phC2 = implode(',', array_fill(0, count($contractIds), '?'));
    $whereParts[] = "(contract_id IN ($phC1) OR (entity_type = 'contract' AND entity_id IN ($phC2)))";
    foreach ($contractIds as $c) $queryParams[] = $c;
    foreach ($contractIds as $c) $queryParams[] = $c;
}

if (!empty($whereParts)) {
    $sql = 'SELECT * FROM extraneterp_activity_log WHERE ' . implode(' OR ', $whereParts) . ' ORDER BY created_at DESC LIMIT ' . $limit;
    $s = $db->prepare($sql);
    $s->execute($queryParams);
} elseif ($entity) {
    $s = $db->prepare('SELECT * FROM extraneterp_activity_log WHERE entity_type = :e ORDER BY created_at DESC LIMIT ' . $limit);
    $s->execute([':e' => $entity]);
} else {
    $s = $db->query('SELECT * FROM extraneterp_activity_log ORDER BY created_at DESC LIMIT ' . $limit);
}

$rows = $s->fetchAll();
// Normalize field names from snake_case (DB) to camelCase (UI) and combine name parts
function normalizeField(string $field): string {
    $map = [
        'first_name' => 'firstName',
        'last_name'  => 'lastName',
        // add other mappings if needed
    ];
    return $map[$field] ?? $field;
}

foreach ($rows as &$r) {
    $r['field'] = normalizeField($r['field'] ?? '');
    // Combine firstName and lastName into a single "name" entry if both exist for the same timestamp and user
    // This will be handled later in deduplication; we just keep both entries for now.
}
unset($r);

// Retroactively include existing claims (réclamations) even if created before activity logging was enabled
if (!empty($prospectIds) || !empty($contractIds)) {
    try {
        $recWheres = [];
        $recParams = [];
        if (!empty($prospectIds)) {
            $recWheres[] = 'prospect_id IN (' . implode(',', array_fill(0, count($prospectIds), '?')) . ')';
            foreach ($prospectIds as $p) $recParams[] = $p;
        }
        if (!empty($contractIds)) {
            $recWheres[] = 'contract_id IN (' . implode(',', array_fill(0, count($contractIds), '?')) . ')';
            foreach ($contractIds as $c) $recParams[] = $c;
        }
        if (!empty($recWheres)) {
            $recStmt = $db->prepare('SELECT * FROM extraneterp_reclamations WHERE ' . implode(' OR ', $recWheres) . ' ORDER BY date_creation DESC LIMIT 100');
            $recStmt->execute($recParams);
            foreach ($recStmt->fetchAll() as $claim) {
                $ref = $claim['reference'] ?? ('REC-' . $claim['id']);
                $desc = trim(($claim['service'] ?? 'Réclamation') . (!empty($claim['description']) ? (' : ' . mb_substr($claim['description'], 0, 80)) : ''));
                $rows[] = [
                    'id'             => 'REC-LOG-' . $claim['id'],
                    'entity_type'    => !empty($claim['contract_id']) ? 'contract' : 'prospect',
                    'entity_id'      => $claim['contract_id'] ?: $claim['prospect_id'],
                    'contract_id'    => $claim['contract_id'],
                    'field'          => 'claim_created',
                    'previous_value' => '',
                    'new_value'      => $ref . ' — ' . $desc,
                    'user_username'  => $claim['created_by'] ?: 'system',
                    'created_at'     => $claim['date_creation'],
                ];
                if (($claim['audit_status'] ?? '') === 'resolu' && !empty($claim['date_resolution'])) {
                    $rows[] = [
                        'id'             => 'REC-RES-' . $claim['id'],
                        'entity_type'    => !empty($claim['contract_id']) ? 'contract' : 'prospect',
                        'entity_id'      => $claim['contract_id'] ?: $claim['prospect_id'],
                        'contract_id'    => $claim['contract_id'],
                        'field'          => 'claim_status',
                        'previous_value' => $ref . ' : en_cours',
                        'new_value'      => 'resolu',
                        'user_username'  => $claim['created_by'] ?: 'system',
                        'created_at'     => $claim['date_resolution'],
                    ];
                }
            }
        }
    } catch (Throwable $e) {}
}

// Sort all rows chronologically descending
usort($rows, fn($a, $b) => strcmp((string)($b['created_at'] ?? ''), (string)($a['created_at'] ?? '')));

// Deduplicate identical simultaneous action entries (e.g. claim logged to both prospect and contract)
$seen = [];
$uniqueRows = [];
foreach ($rows as $r) {
    $minute = substr((string)$r['created_at'], 0, 16);
    $dedupeKey = ($r['field'] ?? '') . '|' . ($r['new_value'] ?? '') . '|' . $minute . '|' . ($r['user_username'] ?? '');
    if (isset($seen[$dedupeKey])) {
        continue;
    }
    $seen[$dedupeKey] = true;
    $uniqueRows[] = $r;
}

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
], $uniqueRows);
ok(['activity' => $out]);
