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
