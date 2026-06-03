<?php
require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/** Cached check: does extraneterp_calendar_events have a prospect_id column? */
function events_has_prospect_link(PDO $db): bool {
    static $cached = null;
    if ($cached !== null) return $cached;
    try {
        $r = $db->query("SHOW COLUMNS FROM extraneterp_calendar_events LIKE 'prospect_id'")->fetch();
        $cached = (bool)$r;
    } catch (Throwable $e) { $cached = false; }
    return $cached;
}

/** Cached check: does extraneterp_calendar_events have a rdv_status column? */
function events_has_rdv_status(PDO $db): bool {
    static $cached = null;
    if ($cached !== null) return $cached;
    try {
        $r = $db->query("SHOW COLUMNS FROM extraneterp_calendar_events LIKE 'rdv_status'")->fetch();
        $cached = (bool)$r;
    } catch (Throwable $e) { $cached = false; }
    return $cached;
}

/** Ensure the immutable `original_agent` column exists; backfill from `agent`.
 *  Used as the single source of truth for RDV attribution in stats. Once set
 *  it is NEVER overwritten so reassigning the prospect or editing the event's
 *  visible `agent` cannot move credit away from the original taker. */
function events_has_original_agent(PDO $db): bool {
    static $cached = null;
    if ($cached !== null) return $cached;
    try {
        $r = $db->query("SHOW COLUMNS FROM extraneterp_calendar_events LIKE 'original_agent'")->fetch();
        if (!$r) {
            $db->exec("ALTER TABLE extraneterp_calendar_events
                       ADD COLUMN original_agent VARCHAR(80) NULL AFTER agent");
            $db->exec("UPDATE extraneterp_calendar_events
                          SET original_agent = agent
                        WHERE original_agent IS NULL OR original_agent = ''");
            $cached = true;
        } else {
            // One-time backfill safety net for rows inserted before this column.
            $db->exec("UPDATE extraneterp_calendar_events
                          SET original_agent = agent
                        WHERE (original_agent IS NULL OR original_agent = '')
                          AND agent IS NOT NULL AND agent <> ''");
            $cached = true;
        }
    } catch (Throwable $e) { $cached = false; }
    return $cached;
}


function calendar_norm_text(string $s): string {
    $s = strtolower(trim($s));
    $ascii = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
    if ($ascii !== false) $s = $ascii;
    $s = preg_replace('/[^a-z0-9]+/', ' ', $s);
    return trim(preg_replace('/\s+/', ' ', $s));
}
function calendar_name_keys(?string $first, ?string $last): array {
    $fn = calendar_norm_text((string)$first);
    $ln = calendar_norm_text((string)$last);
    $keys = [];
    foreach ([trim("$fn $ln"), trim("$ln $fn")] as $k) if ($k !== '') $keys[$k] = true;
    $tokens = array_values(array_unique(array_filter(array_merge(explode(' ', $fn), explode(' ', $ln)))));
    sort($tokens);
    if (!empty($tokens)) $keys[implode(' ', $tokens)] = true;
    return array_keys($keys);
}
function calendar_identity_tokens(string $s): array {
    $stop = array_flip(['rdv','rendez','vous','rappel','signature','appel','tel','telephone','phone','mobile','client','prospect','test','devis','mutuelle','sante','mr','mme','mlle','monsieur','madame']);
    $tokens = [];
    foreach (explode(' ', calendar_norm_text($s)) as $t) {
        if ($t === '' || strlen($t) < 3 || isset($stop[$t]) || preg_match('/^\d+$/', $t)) continue;
        $tokens[$t] = true;
    }
    return array_keys($tokens);
}
function calendar_tokens_cover(array $haystack, array $needles): bool {
    if (count($needles) < 2) return false;
    $set = array_flip($haystack);
    foreach ($needles as $t) if (!isset($set[$t])) return false;
    return true;
}

function rdv_contract_lookup(PDO $db): array {
    static $cached = null;
    if ($cached !== null) return $cached;
    $cached = ['byAgentName'=>[], 'byAgentPhone'=>[], 'byAgentEmail'=>[], 'byAgent'=>[]];
    try {
        $s = $db->query("SELECT id, assigned_to, first_name, last_name, phone, mobile, email, signature_date
                         FROM extraneterp_contracts
                         WHERE signature_date IS NOT NULL
                           AND (billing_status IS NULL OR billing_status <> 'Annuler la confirmation')");
        foreach ($s->fetchAll() as $r) {
            $agent = strtolower(trim((string)($r['assigned_to'] ?? '')));
            $d = $r['signature_date'] ?? '';
            if (!$agent || !$d) continue;
            $nameKeys = calendar_name_keys($r['first_name'] ?? '', $r['last_name'] ?? '');
            $nameTokens = calendar_identity_tokens(($r['first_name'] ?? '') . ' ' . ($r['last_name'] ?? ''));
            $phoneTails = [];
            foreach ($nameKeys as $key) if ($key !== '' && (!isset($cached['byAgentName'][$agent][$key]) || $d < $cached['byAgentName'][$agent][$key])) $cached['byAgentName'][$agent][$key] = $d;
            foreach ([$r['phone'] ?? '', $r['mobile'] ?? ''] as $ph) {
                $digits = preg_replace('/\D+/', '', (string)$ph);
                if (strlen($digits) < 9) continue;
                $tail = substr($digits, -9); $phoneTails[$tail] = true;
                if (!isset($cached['byAgentPhone'][$agent][$tail]) || $d < $cached['byAgentPhone'][$agent][$tail]) $cached['byAgentPhone'][$agent][$tail] = $d;
            }
            $email = strtolower(trim((string)($r['email'] ?? '')));
            if ($email !== '' && (!isset($cached['byAgentEmail'][$agent][$email]) || $d < $cached['byAgentEmail'][$agent][$email])) $cached['byAgentEmail'][$agent][$email] = $d;
            $cached['byAgent'][$agent][] = ['id'=>$r['id'] ?? '', 'signature_date'=>$d, 'name_keys'=>$nameKeys, 'name_tokens'=>$nameTokens, 'phone_tails'=>array_keys($phoneTails), 'email'=>$email];
        }
    } catch (Throwable $e) { /* ignore */ }
    return $cached;
}

/** Map of prospect_id -> earliest signature_date of a non-cancelled contract. */
function rdv_won_prospects(PDO $db): array {
    static $cached = null;
    if ($cached !== null) return $cached;
    $cached = [];
    try {
        $s = $db->query("SELECT prospect_id, MIN(signature_date) AS d
                         FROM extraneterp_contracts
                         WHERE prospect_id IS NOT NULL AND prospect_id <> ''
                           AND signature_date IS NOT NULL
                           AND (billing_status IS NULL OR billing_status <> 'Annuler la confirmation')
                         GROUP BY prospect_id");
        foreach ($s->fetchAll() as $r) {
            if (!empty($r['d'])) $cached[$r['prospect_id']] = $r['d'];
        }
    } catch (Throwable $e) { /* contracts may not have prospect_id yet */ }
    try {
        $s = $db->query("SELECT entity_id AS prospect_id, MIN(DATE(created_at)) AS d
                         FROM extraneterp_activity_log
                         WHERE entity_type = 'prospect'
                           AND field = 'outcome'
                           AND LOWER(new_value) = 'won'
                         GROUP BY entity_id");
        foreach ($s->fetchAll() as $r) {
            $pid = $r['prospect_id'] ?? '';
            $d = $r['d'] ?? '';
            if ($pid && $d && (!isset($cached[$pid]) || $d < $cached[$pid])) $cached[$pid] = $d;
        }
    } catch (Throwable $e) { /* activity log may not exist yet */ }
    try {
        $s = $db->query("SELECT id FROM extraneterp_prospects WHERE outcome = 'won'");
        foreach ($s->fetchAll() as $r) {
            if (!empty($r['id']) && !isset($cached[$r['id']])) $cached[$r['id']] = date('Y-m-d');
        }
    } catch (Throwable $e) { /* prospects may be unavailable */ }
    try {
        $nameToProspect = [];
        $p = $db->query("SELECT id, first_name, last_name FROM extraneterp_prospects");
        foreach ($p->fetchAll() as $r) {
            foreach (calendar_name_keys($r['first_name'] ?? '', $r['last_name'] ?? '') as $key) {
                if ($key !== '' && !isset($nameToProspect[$key])) $nameToProspect[$key] = $r['id'];
            }
        }
        $s = $db->query("SELECT first_name, last_name, MIN(signature_date) AS d
                         FROM extraneterp_contracts
                         WHERE signature_date IS NOT NULL
                           AND (billing_status IS NULL OR billing_status <> 'Annuler la confirmation')
                         GROUP BY first_name, last_name");
        foreach ($s->fetchAll() as $r) {
            $d = $r['d'] ?? '';
            if (!$d) continue;
            foreach (calendar_name_keys($r['first_name'] ?? '', $r['last_name'] ?? '') as $key) {
                $pid = $nameToProspect[$key] ?? null;
                if ($pid && (!isset($cached[$pid]) || $d < $cached[$pid])) $cached[$pid] = $d;
            }
        }
    } catch (Throwable $e) { /* legacy fallback best-effort */ }
    return $cached;
}

/** Legacy fallback for old data that has prospect_id but no dated activity row. */
function rdv_current_outcomes(PDO $db): array {
    static $cached = null;
    if ($cached !== null) return $cached;
    $cached = [];
    try {
        $s = $db->query("SELECT id, outcome FROM extraneterp_prospects WHERE outcome IN ('won','lost')");
        foreach ($s->fetchAll() as $r) {
            if (!empty($r['id'])) $cached[$r['id']] = strtolower((string)$r['outcome']);
        }
    } catch (Throwable $e) { /* prospects may be unavailable */ }
    return $cached;
}

/** Return true when the current user may mutate the given event row. */
function calendar_can_edit(array $me, array $row): bool {
    $role = $me['role'] ?? '';
    if (in_array($role, ['Administrateur','Admin','Manager','Backoffice'], true)) return true;
    return ($row['agent'] ?? '') === ($me['username'] ?? '');
}

function event_summary(array $e): string {
    $type = $e['type'] ?? 'rdv';
    $label = $type === 'rdv' ? 'RDV' : ($type === 'rappel' ? 'Rappel' : ($type === 'signature' ? 'Signature' : ucfirst($type)));
    $when = trim(($e['date'] ?? '') . ' ' . ($e['time'] ?? ''));
    $agent = $e['agent'] ?? '';
    $parts = [$label, $when];
    if ($agent !== '') $parts[] = 'agent: ' . $agent;
    return implode(' — ', array_filter($parts, fn($p) => $p !== ''));
}

if ($method === 'GET') {
    $hasLink = events_has_prospect_link($db);
    $hasStatus = events_has_rdv_status($db);
    $wonByProspect = $hasLink ? rdv_won_prospects($db) : [];
    $currentOutcomes = $hasLink ? rdv_current_outcomes($db) : [];
    $contractLookup = rdv_contract_lookup($db);
    $nameToProspect = [];
    try {
        $p = $db->query("SELECT id, first_name, last_name FROM extraneterp_prospects");
        foreach ($p->fetchAll() as $r) {
            foreach (calendar_name_keys($r['first_name'] ?? '', $r['last_name'] ?? '') as $key) {
                if ($key !== '' && !isset($nameToProspect[$key])) $nameToProspect[$key] = $r['id'];
            }
        }
    } catch (Throwable $e) { /* best-effort */ }
    $role = $me['role'] ?? '';
    $isPrivileged = in_array($role, ['Admin','Administrateur','Manager','Superviseur','Backoffice'], true);
    if ($isPrivileged) {
        $s = $db->query('SELECT * FROM extraneterp_calendar_events ORDER BY date, time');
    } else {
        $s = $db->prepare('SELECT * FROM extraneterp_calendar_events WHERE agent = :u ORDER BY date, time');
        $s->execute([':u' => $me['username'] ?? '']);
    }
    $rows = $s->fetchAll();
    $events = array_map(function($e) use ($hasLink, $hasStatus, $wonByProspect, $currentOutcomes, $nameToProspect, $contractLookup) {
        $out = [
            'id'    => $e['id'],
            'title' => $e['title'],
            'date'  => $e['date'],
            'time'  => $e['time'],
            'type'  => $e['type'],
            'agent' => $e['agent'],
        ];
        if ($hasLink) $out['prospectId'] = $e['prospect_id'] ?? null;
        if ($hasStatus) {
            $stored = $e['rdv_status'] ?? 'pending';
            // Auto-derive "won" only when contract was signed on/after the RDV.
            $pid = $hasLink ? ($e['prospect_id'] ?? null) : null;
            if (!$pid) {
                $title = (string)($e['title'] ?? '');
                $candidates = [$title];
                foreach ([' — ', ' – ', ' - ', ' : ', ' | ', '—', '–', ':', '|'] as $sep) {
                    $pos = strpos($title, $sep);
                    if ($pos !== false) $candidates[] = substr($title, $pos + strlen($sep));
                }
                foreach ($candidates as $c) {
                    $key = calendar_norm_text($c);
                    if ($key !== '' && isset($nameToProspect[$key])) { $pid = $nameToProspect[$key]; break; }
                }
            }
            $rdvDate = $e['date'] ?? '';
            if ($stored === 'pending' && $pid && isset($wonByProspect[$pid]) && $wonByProspect[$pid] >= $rdvDate) {
                $stored = 'won';
            } elseif ($stored === 'pending' && $pid && !isset($wonByProspect[$pid]) && ($currentOutcomes[$pid] ?? '') === 'won') {
                $stored = 'won';
            } elseif ($stored === 'pending') {
                $agent = strtolower(trim((string)($e['agent'] ?? '')));
                $title = (string)($e['title'] ?? '');
                $titleClean = $title;
                foreach ([' — ', ' – ', ' - ', ' : ', ' | ', '—', '–', ':', '|'] as $sep) {
                    $pos = strpos($titleClean, $sep);
                    if ($pos !== false) { $titleClean = substr($titleClean, $pos + strlen($sep)); break; }
                }
                $candidatesName = [];
                $titleKey = calendar_norm_text($titleClean);
                if ($titleKey !== '') {
                    $candidatesName[$titleKey] = true;
                    $toks = array_values(array_filter(explode(' ', $titleKey)));
                    if (count($toks) >= 2) {
                        $candidatesName[implode(' ', array_reverse($toks))] = true;
                        $sorted = $toks; sort($sorted); $candidatesName[implode(' ', $sorted)] = true;
                    }
                }
                $candidatesPhone = [];
                $digits = preg_replace('/\D+/', '', $title);
                if (strlen($digits) >= 9) $candidatesPhone[substr($digits, -9)] = true;
                $titleTokens = calendar_identity_tokens($title);
                $matched = false;
                foreach (array_keys($candidatesName) as $k) if (($contractLookup['byAgentName'][$agent][$k] ?? '') >= $rdvDate) { $matched = true; break; }
                if (!$matched) foreach (array_keys($candidatesPhone) as $t) if (($contractLookup['byAgentPhone'][$agent][$t] ?? '') >= $rdvDate) { $matched = true; break; }
                if (!$matched) foreach ($contractLookup['byAgent'][$agent] ?? [] as $c) {
                    if (($c['signature_date'] ?? '') < $rdvDate) continue;
                    foreach ($c['phone_tails'] as $t) if (isset($candidatesPhone[$t])) { $matched = true; break 2; }
                    foreach ($c['name_keys'] as $k) if (isset($candidatesName[$k])) { $matched = true; break 2; }
                    if (calendar_tokens_cover($titleTokens, $c['name_tokens'])) { $matched = true; break; }
                }
                if ($matched) $stored = 'won';
            }
            $out['rdvStatus'] = $stored;
        }
        return $out;
    }, $rows);
    ok(['events' => $events]);
}


if ($method === 'POST') {
    $in = json_input();
    $title = trim($in['title'] ?? '');
    $date  = $in['date'] ?? '';
    $time  = $in['time'] ?? '';
    $type  = in_array($in['type'] ?? 'rdv', ['rdv','rappel','signature'], true) ? ($in['type'] ?? 'rdv') : 'rdv';
    $agent = trim($in['agent'] ?? '');
    $pid   = trim((string)($in['prospectId'] ?? ''));
    if (!$title || !$date || !$time || !$agent) fail('Champs requis manquants', 422);
    $isPrivilegedPost = in_array($me['role'] ?? '', ['Admin','Administrateur','Manager','Superviseur','Backoffice'], true);
    if (!$isPrivilegedPost && $agent !== ($me['username'] ?? '')) {
        fail('Accès refusé', 403);
    }

    $id = $in['id'] ?? ('E-' . substr(bin2hex(random_bytes(6)), 0, 8));
    $hasLink = events_has_prospect_link($db);
    $hasOrig = events_has_original_agent($db);
    if ($hasLink) {
        // Auto-resolve from title when caller didn't pass prospectId.
        if ($pid === '' && $type === 'rdv') {
            $resolved = resolve_prospect_id_from_title($db, $title);
            if ($resolved) $pid = $resolved;
        }
        if ($hasOrig) {
            $s = $db->prepare('INSERT INTO extraneterp_calendar_events (id,title,date,time,type,agent,original_agent,prospect_id)
                               VALUES (:id,:t,:d,:tm,:tp,:a,:oa,:pid)');
            $s->execute([':id'=>$id, ':t'=>$title, ':d'=>$date, ':tm'=>$time, ':tp'=>$type, ':a'=>$agent, ':oa'=>$agent, ':pid'=>$pid !== '' ? $pid : null]);
        } else {
            $s = $db->prepare('INSERT INTO extraneterp_calendar_events (id,title,date,time,type,agent,prospect_id)
                               VALUES (:id,:t,:d,:tm,:tp,:a,:pid)');
            $s->execute([':id'=>$id, ':t'=>$title, ':d'=>$date, ':tm'=>$time, ':tp'=>$type, ':a'=>$agent, ':pid'=>$pid !== '' ? $pid : null]);
        }
    } else {
        if ($hasOrig) {
            $s = $db->prepare('INSERT INTO extraneterp_calendar_events (id,title,date,time,type,agent,original_agent)
                               VALUES (:id,:t,:d,:tm,:tp,:a,:oa)');
            $s->execute([':id'=>$id, ':t'=>$title, ':d'=>$date, ':tm'=>$time, ':tp'=>$type, ':a'=>$agent, ':oa'=>$agent]);
        } else {
            $s = $db->prepare('INSERT INTO extraneterp_calendar_events (id,title,date,time,type,agent)
                               VALUES (:id,:t,:d,:tm,:tp,:a)');
            $s->execute([':id'=>$id, ':t'=>$title, ':d'=>$date, ':tm'=>$time, ':tp'=>$type, ':a'=>$agent]);
        }
    }


    if ($pid !== '') {
        $summary = event_summary(['type'=>$type,'date'=>$date,'time'=>$time,'agent'=>$agent]);
        log_action($db, 'prospect', $pid, 'rdv_created', '', $summary . ' — ' . $title, $me['username'] ?? '');
    }
    ok(['id' => $id]);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $in = json_input();
    $id = $in['id'] ?? ($_GET['id'] ?? '');
    if (!$id) fail('id requis', 422);

    $hasLink = events_has_prospect_link($db);
    $cols = $hasLink ? 'id,title,date,time,type,agent,prospect_id' : 'id,title,date,time,type,agent';
    $cur = $db->prepare("SELECT $cols FROM extraneterp_calendar_events WHERE id = :id");
    $cur->execute([':id' => $id]);
    $row = $cur->fetch();
    if (!$row) fail('Événement introuvable', 404);
    if (!calendar_can_edit($me, $row)) fail('Accès refusé', 403);
    $isPrivilegedPut = in_array($me['role'] ?? '', ['Admin','Administrateur','Manager','Superviseur','Backoffice'], true);
    if (!$isPrivilegedPut && array_key_exists('agent', $in)
        && $in['agent'] !== ($me['username'] ?? '')) {
        fail('Accès refusé', 403);
    }

    $sets = [];
    $params = [':id' => $id];
    $changed = [];
    foreach ([
        'title' => 'title', 'date' => 'date', 'time' => 'time',
        'agent' => 'agent', 'type' => 'type',
    ] as $k => $col) {
        if (array_key_exists($k, $in)) {
            if ($k === 'type' && !in_array($in[$k], ['rdv','rappel','signature'], true)) continue;
            $sets[] = "$col = :$k";
            $params[":$k"] = $in[$k];
            if (($row[$col] ?? '') !== ($in[$k] ?? '')) {
                $changed[$col] = ['from' => (string)($row[$col] ?? ''), 'to' => (string)$in[$k]];
            }
        }
    }
    if ($hasLink && array_key_exists('prospectId', $in)) {
        $sets[] = 'prospect_id = :pid';
        $params[':pid'] = $in['prospectId'] !== '' ? $in['prospectId'] : null;
    }
    $hasStatus = events_has_rdv_status($db);
    if ($hasStatus && array_key_exists('rdvStatus', $in)) {
        $allowed = ['pending','nrp','lost','won'];
        $newStatus = in_array($in['rdvStatus'], $allowed, true) ? $in['rdvStatus'] : 'pending';
        $sets[] = 'rdv_status = :rdvst';
        $params[':rdvst'] = $newStatus;
    }
    if (!$sets) fail('Aucun champ à mettre à jour', 422);
    $sql = 'UPDATE extraneterp_calendar_events SET ' . implode(', ', $sets) . ' WHERE id = :id';
    $db->prepare($sql)->execute($params);

    $pid = $hasLink ? ($in['prospectId'] ?? $row['prospect_id'] ?? '') : '';
    if ($pid && $changed) {
        foreach ($changed as $col => $diff) {
            $field = $col === 'date' ? 'rdv_date'
                   : ($col === 'time' ? 'rdv_time'
                   : ($col === 'agent' ? 'rdv_agent'
                   : ($col === 'type' ? 'rdv_type'
                   : ($col === 'title' ? 'rdv_title' : 'rdv_' . $col))));
            log_action($db, 'prospect', $pid, $field, $diff['from'], $diff['to'], $me['username'] ?? '');
        }
    }
    ok(['message' => 'Événement mis à jour']);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) fail('id requis', 422);
    $hasLink = events_has_prospect_link($db);
    $cols = $hasLink ? 'id,title,date,time,type,agent,prospect_id' : 'id,title,date,time,type,agent';
    $cur = $db->prepare("SELECT $cols FROM extraneterp_calendar_events WHERE id = :id");
    $cur->execute([':id' => $id]);
    $row = $cur->fetch();
    if (!$row) fail('Événement introuvable', 404);
    if (!calendar_can_edit($me, $row)) fail('Accès refusé', 403);
    $s = $db->prepare('DELETE FROM extraneterp_calendar_events WHERE id = :id');
    $s->execute([':id' => $id]);

    $pid = $hasLink ? ($row['prospect_id'] ?? '') : '';
    if ($pid) {
        $summary = event_summary($row);
        log_action($db, 'prospect', $pid, 'rdv_cancelled', $summary . ' — ' . ($row['title'] ?? ''), '', $me['username'] ?? '');
    }
    ok(['deleted' => $s->rowCount()]);
}

fail('Method not allowed', 405);
