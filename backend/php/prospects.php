<?php
require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

function row_to_prospect(array $r): array {
    return [
        'id'           => $r['id'],
        'civility'     => $r['civility'],
        'lastName'     => $r['last_name'],
        'firstName'    => $r['first_name'],
        'phone'        => $r['phone'],
        'email'        => $r['email'],
        'source'       => $r['source'],
        'status'       => $r['status'],
        'assignedTo'   => $r['assigned_to'],
        'createdAt'    => $r['created_at'],
        'city'         => $r['city'],
        'outcome'      => $r['outcome'],
        'lostReason'   => $r['lost_reason'],
        'comment'      => $r['comment'],
        'checkValeur'  => $r['check_valeur'],
        'age'          => isset($r['age']) ? (int)$r['age'] : null,
        'birthDate'    => $r['birth_date'] ?? null,
        'currentMutuelle' => $r['current_mutuelle'] ?? null,
        'regime'       => $r['regime'] ?? null,
        'cotisation'   => isset($r['cotisation']) ? (float)$r['cotisation'] : null,
        'mobile'       => $r['mobile'] ?? null,
        'address'      => $r['address'] ?? null,
        'postalCode'   => $r['postal_code'] ?? null,
        'spouseAge'    => isset($r['spouse_age']) && $r['spouse_age'] !== null ? (int)$r['spouse_age'] : null,
        'spouseBirthDate' => $r['spouse_birth_date'] ?? null,
        'childrenCount' => isset($r['children_count']) && $r['children_count'] !== null ? (int)$r['children_count'] : null,
        'childrenAges' => $r['children_ages'] ?? null,
        'demande'      => $r['demande'] ?? null,
    ];
}

/**
 * Create a calendar event for a prospect when status becomes 'Devis'.
 * Safe no-op if calendar table/columns missing or a similar recent event exists.
 */
function create_calendar_event_for_devis(PDO $db, string $prospectId, string $firstName, string $lastName, ?string $agent = null, array $me = null): void {
    try {
        $hasLink = (bool)$db->query("SHOW COLUMNS FROM extraneterp_calendar_events LIKE 'prospect_id'")->fetch();
    } catch (Throwable $e) { $hasLink = false; }
    try {
        $hasOrig = (bool)$db->query("SHOW COLUMNS FROM extraneterp_calendar_events LIKE 'original_agent'")->fetch();
    } catch (Throwable $e) { $hasOrig = false; }

    $title = trim("Devis — " . trim((string)$lastName . ' ' . $firstName));
    if ($title === '') $title = 'Devis';

    // Deduplicate: skip if a recent similar event exists for this prospect
    try {
        if ($hasLink) {
            $q = $db->prepare("SELECT COUNT(*) FROM extraneterp_calendar_events WHERE prospect_id = :pid AND title LIKE :t AND date >= CURDATE() - INTERVAL 30 DAY");
            $q->execute([':pid' => $prospectId, ':t' => $title . '%']);
            $n = (int)$q->fetchColumn();
            if ($n > 0) return;
        } else {
            $q = $db->prepare("SELECT COUNT(*) FROM extraneterp_calendar_events WHERE title LIKE :t AND date >= CURDATE() - INTERVAL 30 DAY");
            $q->execute([':t' => $title . '%']);
            $n = (int)$q->fetchColumn();
            if ($n > 0) return;
        }
    } catch (Throwable $e) { /* best-effort dedupe; continue to attempt insert */ }

    // Default agent fallback: current user if none provided
    $agentVal = $agent ?? ($me['username'] ?? '');
    $id = 'E-' . substr(bin2hex(random_bytes(6)), 0, 8);
    $date = date('Y-m-d');
    $time = '09:00:00';
    $type = 'rappel';

    try {
        if ($hasLink && $hasOrig) {
            $ins = $db->prepare('INSERT INTO extraneterp_calendar_events (id,title,date,time,type,agent,original_agent,prospect_id) VALUES (:id,:t,:d,:tm,:tp,:a,:oa,:pid)');
            $ins->execute([':id'=>$id, ':t'=>$title, ':d'=>$date, ':tm'=>$time, ':tp'=>$type, ':a'=>$agentVal, ':oa'=>$agentVal, ':pid'=>$prospectId]);
        } elseif ($hasLink) {
            $ins = $db->prepare('INSERT INTO extraneterp_calendar_events (id,title,date,time,type,agent,prospect_id) VALUES (:id,:t,:d,:tm,:tp,:a,:pid)');
            $ins->execute([':id'=>$id, ':t'=>$title, ':d'=>$date, ':tm'=>$time, ':tp'=>$type, ':a'=>$agentVal, ':pid'=>$prospectId]);
        } elseif ($hasOrig) {
            $ins = $db->prepare('INSERT INTO extraneterp_calendar_events (id,title,date,time,type,agent,original_agent) VALUES (:id,:t,:d,:tm,:tp,:a,:oa)');
            $ins->execute([':id'=>$id, ':t'=>$title, ':d'=>$date, ':tm'=>$time, ':tp'=>$type, ':a'=>$agentVal, ':oa'=>$agentVal]);
        } else {
            $ins = $db->prepare('INSERT INTO extraneterp_calendar_events (id,title,date,time,type,agent) VALUES (:id,:t,:d,:tm,:tp,:a)');
            $ins->execute([':id'=>$id, ':t'=>$title, ':d'=>$date, ':tm'=>$time, ':tp'=>$type, ':a'=>$agentVal]);
        }
    } catch (Throwable $e) {
        // If table/columns missing or other DB error, silently ignore — non-critical
    }
}

// Role-based scoping: Agents only see leads assigned to them. Unassigned
// leads are hidden from agents (claiming still works through /dispatch via
// the dedicated POST action=claim endpoint). Manager / Administrateur /
// Backoffice see everything.
$role = $me['role'] ?? '';
$isPrivileged = in_array($role, ['Admin','Administrateur','Manager','Superviseur','Backoffice','Présentation'], true);
$isAgent = !$isPrivileged; // Agent, Vendeur, Qualificateur, etc. → scoped to own

if ($method === 'GET') { try {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $s = $db->prepare('SELECT * FROM extraneterp_prospects WHERE id = :id');
        $s->execute([':id' => $id]);
        $r = $s->fetch();
        if (!$r) fail('Not found', 404);
        if ($isAgent) {
            $owner = $r['assigned_to'] ?? null;
            // Case-insensitive owner match so imports with mixed-case
            // usernames (e.g. "Felix.NOGHA") still resolve to the right agent.
            if ($owner === null || strcasecmp((string)$owner, (string)$me['username']) !== 0) {
                fail('Accès refusé', 403);
            }
        }
        ok(['prospect' => row_to_prospect($r)]);
    }

    // ------- Build WHERE clause shared by count + list -------
    $where = [];
    $params = [];
    if ($isAgent) {
        $where[] = "LOWER(assigned_to) = LOWER(:__me)";
        $params[':__me'] = $me['username'];
    }
    if (!empty($_GET['q'])) {
        // Smart search: pick the most index-friendly strategy per query shape.
        //   * Short ID prefix (P-…)        → id LIKE 'P-…%'                (PK)
        //   * Mostly-digit string (phone)  → phone/mobile LIKE '0612…%'    (BTREE)
        //   * Token >= 3 chars             → FULLTEXT MATCH(... 'term*')   (FT idx)
        //   * Anything shorter             → fall back to LIKE '%q%'       (scan)
        $q  = trim((string)$_GET['q']);
        $ql = strtolower($q);
        $ors = [];
        $isIdLike    = (bool)preg_match('/^[pcuntfsa]-?\w*$/i', $q);
        $isPhoneLike = (bool)preg_match('/^[\d +().-]{3,}$/', $q);
        $hasFtToken  = false;
        foreach (preg_split('/\s+/', $q) as $tok) {
            if (mb_strlen($tok) >= 3) { $hasFtToken = true; break; }
        }

        if ($isIdLike) {
            $ors[] = "id LIKE :__qid";
            $params[':__qid'] = $q . '%';
        }
        if ($isPhoneLike) {
            $digits = preg_replace('/\D+/', '', $q);
            if ($digits !== '') {
                $ors[] = "phone LIKE :__qph";
                $ors[] = "mobile LIKE :__qmo";
                $params[':__qph'] = $digits . '%';
                $params[':__qmo'] = $digits . '%';
            }
        }
        if ($hasFtToken) {
            // Boolean mode + prefix wildcard so "dup" matches "Dupont".
            $bool = '';
            foreach (preg_split('/\s+/', $q) as $tok) {
                $tok = preg_replace('/[+\-><()~*\"@]+/', ' ', $tok);
                $tok = trim($tok);
                if (mb_strlen($tok) >= 3) $bool .= '+' . $tok . '* ';
            }
            $bool = trim($bool);
            if ($bool !== '') {
                $ors[] = "MATCH(last_name, first_name, email, city) AGAINST (:__qft IN BOOLEAN MODE)";
                $params[':__qft'] = $bool;
            }
        }
        if (!$ors) {
            // Fallback: very short query (1–2 chars). Limit to indexed-ish cols.
            $like = '%' . $q . '%';
            foreach (['last_name','first_name','email','city'] as $i => $c) {
                $ph = ":__qf$i";
                $ors[] = "$c LIKE $ph";
                $params[$ph] = $like;
            }
        }
        $where[] = '(' . implode(' OR ', $ors) . ')';
    }
    foreach ([
        'status'      => 'status',
        'outcome'     => 'outcome',
        'source'      => 'source',
        'assignedTo'  => 'assigned_to',
        'checkValeur' => 'check_valeur',
    ] as $qk => $col) {
        if (isset($_GET[$qk]) && $_GET[$qk] !== '') {
            if ($_GET[$qk] === '__none__') {
                $where[] = "($col IS NULL OR $col = '')";
            } else {
                $where[] = "$col = :__f_$qk";
                $params[":__f_$qk"] = $_GET[$qk];
            }
        }
    }
    if (!empty($_GET['from']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['from'])) {
        $where[] = "created_at >= :__from"; $params[':__from'] = $_GET['from'];
    }
    if (!empty($_GET['to']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['to'])) {
        $where[] = "created_at <= :__to"; $params[':__to'] = $_GET['to'];
    }
    $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

    // ------- Count-only mode -------
    if (isset($_GET['count'])) {
        $st = $db->prepare("SELECT COUNT(*) FROM extraneterp_prospects $whereSql");
        $st->execute($params);
        ok(['total' => (int)$st->fetchColumn()]);
    }

    // ------- IDs-only mode (used for "select all matching filter") -------
    if (isset($_GET['ids'])) {
        $st = $db->prepare("SELECT id FROM extraneterp_prospects $whereSql ORDER BY created_at DESC, id DESC LIMIT 50000");
        $st->execute($params);
        ok(['ids' => array_map(fn($r) => $r['id'], $st->fetchAll())]);
    }

    // ------- Sort whitelist -------
    $sortMap = [
        'createdAt'  => 'created_at',
        'lastName'   => 'last_name',
        'firstName'  => 'first_name',
        'status'     => 'status',
        'source'     => 'source',
        'assignedTo' => 'assigned_to',
        'outcome'    => 'outcome',
    ];
    $sortKey = $_GET['sort'] ?? 'createdAt';
    $sortCol = $sortMap[$sortKey] ?? 'created_at';
    $dir = (strtolower($_GET['dir'] ?? 'desc') === 'asc') ? 'ASC' : 'DESC';

    // ------- Paginated mode -------
    if (isset($_GET['page']) || isset($_GET['pageSize'])) {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $pageSize = (int)($_GET['pageSize'] ?? 2000);
        if ($pageSize < 1) $pageSize = 1;
        if ($pageSize > 5000) $pageSize = 5000;
        $offset = ($page - 1) * $pageSize;

        $cnt = $db->prepare("SELECT COUNT(*) FROM extraneterp_prospects $whereSql");
        $cnt->execute($params);
        $total = (int)$cnt->fetchColumn();

        $sql = "SELECT * FROM extraneterp_prospects $whereSql ORDER BY $sortCol $dir, id DESC LIMIT $pageSize OFFSET $offset";
        $st = $db->prepare($sql);
        $st->execute($params);
        $rows = $st->fetchAll();
        ok([
            'prospects' => array_map('row_to_prospect', $rows),
            'total'     => $total,
            'page'      => $page,
            'pageSize'  => $pageSize,
        ]);
    }

    // ------- Legacy full-list mode (DEPRECATED — capped at 5000) -------
    $sql = "SELECT * FROM extraneterp_prospects $whereSql ORDER BY $sortCol $dir, id DESC LIMIT 5000";
    $st = $db->prepare($sql);
    $st->execute($params);
    $rows = $st->fetchAll();
    $prospects = array_map('row_to_prospect', $rows);
    ok(['prospects' => $prospects]);
} catch (Throwable $e) {
    fail('Erreur recherche prospects: ' . $e->getMessage(), 500, [
        'sqlstate' => method_exists($e, 'getCode') ? $e->getCode() : null,
    ]);
} }

if ($method === 'POST') {
    // Create OR claim depending on action
    $in = json_input();
    // Accept `action` from either the JSON body OR the query string so that
    // calls like POST /prospects.php?action=bulk are routed correctly even
    // when the body does not repeat the field.
    $action = $in['action'] ?? ($_GET['action'] ?? 'create');

    if ($action === 'claim') {
        $pid = $in['id'] ?? '';
        if (!$pid) fail('id requis', 422);
        // Allow claiming when nobody owns the lead (NULL or empty string).
        $s = $db->prepare("UPDATE extraneterp_prospects
                           SET assigned_to = :a, status = 'A recontacter (Voir Commentaire)'
                           WHERE id = :id AND (assigned_to IS NULL OR assigned_to = '')");
        $s->execute([':a' => $me['username'], ':id' => $pid]);
        if ($s->rowCount() === 0) fail('Lead déjà attribué ou introuvable', 409);
        log_action($db, 'prospect', $pid, 'assignedTo', '', $me['username'], $me['username'] ?? '');
        log_action($db, 'prospect', $pid, 'claim', '', 'claimed', $me['username'] ?? '');
        notify_user($db, $me['username'], 'Lead attribué', "Vous avez réclamé le lead $pid", "/prospects/$pid");
        ok(['message' => 'Lead attribué']);
    }

    if ($action === 'mark_won') {
        $pid     = $in['id'] ?? '';
        $premium = (float)($in['premium'] ?? 950);
        $partner = trim($in['partner'] ?? 'NEOLIANE');
        if (!$pid) fail('id requis', 422);

        if ($isAgent) {
            $own = $db->prepare('SELECT assigned_to FROM extraneterp_prospects WHERE id = :id');
            $own->execute([':id' => $pid]);
            $owner = $own->fetchColumn();
            if ($owner !== $me['username']) fail('Accès refusé', 403);
        }

        $db->beginTransaction();
        try {
            $s = $db->prepare("UPDATE extraneterp_prospects SET outcome='won', status='Vente' WHERE id = :id");
            $s->execute([':id' => $pid]);

            $row = $db->prepare('SELECT * FROM extraneterp_prospects WHERE id = :id');
            $row->execute([':id' => $pid]);
            $p = $row->fetch();
            if (!$p) { $db->rollBack(); fail('Prospect introuvable', 404); }

            $cid = 'C-' . substr(bin2hex(random_bytes(6)), 0, 10);
            $today = date('Y-m-d');
            // Copy every mappable prospect field into the new contract so the
            // commercial team doesn't have to re-key data, and store a hard
            // link back to the source prospect.
            $ins = $db->prepare('INSERT INTO extraneterp_contracts
                (id,prospect_id,last_name,first_name,city,partner,cabinet,signature_date,effective_date,validation_date,premium,billing_status,source,assigned_to,
                 civility,phone,mobile,email,address,postal_code,current_mutuelle,previous_premium)
                VALUES (:id,:pid,:ln,:fn,:city,:part,:cab,:sd,:ed,NULL,:pr,:bs,:src,:at,
                 :civ,:ph,:mo,:em,:addr,:pc,:cm,:pp)');
            $ins->execute([
                ':id'   => $cid,
                ':pid'  => $p['id'],
                ':ln'   => $p['last_name'],
                ':fn'   => $p['first_name'],
                ':city' => $p['city'],
                ':part' => $partner,
                ':cab'  => 'Cabinet Paris 1',
                ':sd'   => $today,
                ':ed'   => $today,
                ':pr'   => $premium,
                ':bs'   => 'Pré-validé',
                ':src'  => $p['source'],
                ':at'   => $p['assigned_to'] ?? '—',
                ':civ'  => $p['civility'] ?? null,
                ':ph'   => $p['phone'] ?? null,
                ':mo'   => $p['mobile'] ?? null,
                ':em'   => $p['email'] ?? null,
                ':addr' => $p['address'] ?? null,
                ':pc'   => $p['postal_code'] ?? null,
                ':cm'   => $p['current_mutuelle'] ?? null,
                ':pp'   => isset($p['cotisation']) && $p['cotisation'] !== null && $p['cotisation'] !== '' ? (float)$p['cotisation'] : null,
            ]);
            $db->commit();
            log_action($db, 'prospect', $pid, 'outcome', $p['outcome'] ?? 'pending', 'won', $me['username'] ?? '');
            log_action($db, 'prospect', $pid, 'mark_won', '', $cid, $me['username'] ?? '');
            log_action($db, 'contract', $cid, 'created_from_prospect', $pid, $cid, $me['username'] ?? '');
            $owner = $p['assigned_to'] ?? '';
            if ($owner) notify_user($db, $owner, 'Vente confirmée', "Contrat $cid créé pour {$p['first_name']} {$p['last_name']}", "/contracts/$cid");
            ok(['message' => 'Contrat créé', 'contractId' => $cid]);
        } catch (Throwable $e) {
            $db->rollBack();
            fail('Erreur: ' . $e->getMessage(), 500);
        }
    }

    if ($action === 'mark_lost') {
        $pid    = $in['id'] ?? '';
        $reason = trim($in['reason'] ?? 'Non précisé');
        if (!$pid) fail('id requis', 422);
        if ($isAgent) {
            $own = $db->prepare('SELECT assigned_to FROM extraneterp_prospects WHERE id = :id');
            $own->execute([':id' => $pid]);
            $owner = $own->fetchColumn();
            if ($owner !== $me['username']) fail('Accès refusé', 403);
        }
        $prevRow = $db->prepare('SELECT outcome FROM extraneterp_prospects WHERE id = :id');
        $prevRow->execute([':id' => $pid]);
        $prevOutcome = $prevRow->fetchColumn() ?: 'pending';
        $s = $db->prepare("UPDATE extraneterp_prospects
                           SET outcome='lost', status='Sans réponse', lost_reason=:r
                           WHERE id = :id");
        $s->execute([':r' => $reason, ':id' => $pid]);
        if ($s->rowCount() === 0) fail('Prospect introuvable', 404);
        log_action($db, 'prospect', $pid, 'outcome', $prevOutcome, 'lost', $me['username'] ?? '');
        log_action($db, 'prospect', $pid, 'lostReason', '', $reason, $me['username'] ?? '');
        ok(['message' => 'Lead marqué perdu']);
    }

    if ($action === 'bulk') {
        require_auth(['Administrateur','Manager']);
        $ids = $in['ids'] ?? [];
        $op  = $in['op']  ?? '';
        if (!is_array($ids) || !$ids) fail('ids requis', 422);
        $place = implode(',', array_fill(0, count($ids), '?'));
        if ($op === 'assign') {
            $to = trim($in['assignedTo'] ?? '');
            if ($to === '') fail('assignedTo requis', 422);
            $sql = "UPDATE extraneterp_prospects SET assigned_to = ? WHERE id IN ($place)";
            $st = $db->prepare($sql);
            $st->execute(array_merge([$to], $ids));
            foreach ($ids as $pid) log_action($db, 'prospect', $pid, 'assignedTo', '', $to, $me['username'] ?? '');
            ok(['updated' => $st->rowCount()]);
        }
        if ($op === 'status') {
            $st_v = trim($in['status'] ?? '');
            if ($st_v === '') fail('status requis', 422);
            $sql = "UPDATE extraneterp_prospects SET status = ? WHERE id IN ($place)";
            $st = $db->prepare($sql);
            $st->execute(array_merge([$st_v], $ids));
            foreach ($ids as $pid) log_action($db, 'prospect', $pid, 'status', '', $st_v, $me['username'] ?? '');
            // If the new status is Devis, create calendar events for those prospects
            if ($st_v === 'Devis') {
                foreach ($ids as $pid) {
                    try {
                        $pstmt = $db->prepare('SELECT first_name, last_name, assigned_to FROM extraneterp_prospects WHERE id = :id');
                        $pstmt->execute([':id' => $pid]);
                        $prow = $pstmt->fetch();
                        if ($prow) {
                            $f = $prow['first_name'] ?? '';
                            $l = $prow['last_name'] ?? '';
                            $agent = $prow['assigned_to'] ?? null;
                            create_calendar_event_for_devis($db, $pid, $f, $l, $agent, $me);
                        }
                    } catch (Throwable $e) { /* ignore per-row failures */ }
                }
            }
            ok(['updated' => $st->rowCount()]);
        }
        if ($op === 'check') {
            $cv = $in['checkValeur'] ?? 'pending';
            if (!in_array($cv, ['valid','invalid','pending'], true)) fail('checkValeur invalide', 422);
            $sql = "UPDATE extraneterp_prospects SET check_valeur = ? WHERE id IN ($place)";
            $st = $db->prepare($sql);
            $st->execute(array_merge([$cv], $ids));
            foreach ($ids as $pid) log_action($db, 'prospect', $pid, 'checkValeur', '', $cv, $me['username'] ?? '');
            ok(['updated' => $st->rowCount()]);
        }
        if ($op === 'delete') {
            $sql = "DELETE FROM extraneterp_prospects WHERE id IN ($place)";
            $st = $db->prepare($sql);
            $st->execute($ids);
            foreach ($ids as $pid) log_action($db, 'prospect', $pid, 'delete', $pid, '', $me['username'] ?? '');
            ok(['deleted' => $st->rowCount()]);
        }
        fail('op invalide', 422);
    }

    // create / upsert
    $rows = $in['rows'] ?? [$in];
    if (!is_array($rows)) fail('rows invalide', 422);
    $added = 0; $updated = 0; $skipped = 0; $ids = [];

    $ins = $db->prepare('INSERT INTO extraneterp_prospects
        (id,civility,last_name,first_name,phone,email,source,status,assigned_to,created_at,city,outcome,lost_reason,comment,check_valeur,age,birth_date,current_mutuelle,regime,cotisation,mobile,address,postal_code,spouse_age,spouse_birth_date,children_count,children_ages,demande)
        VALUES (:id,:civ,:ln,:fn,:ph,:em,:src,:st,:at,:ca,:city,:oc,:lr,:cm,:cv,:age,:bd,:cmut,:reg,:cot,:mob,:adr,:pc,:sa,:sbd,:cc,:cag,:dem)
        ON DUPLICATE KEY UPDATE
          civility=VALUES(civility), last_name=VALUES(last_name), first_name=VALUES(first_name),
          phone=VALUES(phone), email=VALUES(email), source=VALUES(source), status=VALUES(status),
          assigned_to=VALUES(assigned_to), city=VALUES(city), outcome=VALUES(outcome),
          lost_reason=VALUES(lost_reason), comment=VALUES(comment), check_valeur=VALUES(check_valeur),
          age=VALUES(age), birth_date=VALUES(birth_date), current_mutuelle=VALUES(current_mutuelle), regime=VALUES(regime), cotisation=VALUES(cotisation),
          mobile=VALUES(mobile), address=VALUES(address), postal_code=VALUES(postal_code),
          spouse_age=VALUES(spouse_age), spouse_birth_date=VALUES(spouse_birth_date),
          children_count=VALUES(children_count), children_ages=VALUES(children_ages),
          demande=VALUES(demande)');

    $cfIns = $db->prepare('INSERT INTO extraneterp_custom_field_values (entity, entity_id, field_key, value)
                           VALUES (:e,:id,:k,:v)
                           ON DUPLICATE KEY UPDATE value = VALUES(value)');

    foreach ($rows as $r) {
        $ln = trim($r['lastName'] ?? '');
        if ($ln === '') { $skipped++; continue; }
        $id = $r['id'] ?? ('P-' . substr(bin2hex(random_bytes(6)), 0, 8));
        $exists = $db->prepare('SELECT 1 FROM extraneterp_prospects WHERE id = :id');
        $exists->execute([':id' => $id]);
        $isUpdate = (bool)$exists->fetchColumn();
        // Privilege check: agents may only upsert prospects they own. Prevents
        // an agent from overwriting another user's lead by sending its id.
        if ($isAgent && $isUpdate) {
            $own = $db->prepare('SELECT assigned_to FROM extraneterp_prospects WHERE id = :id');
            $own->execute([':id' => $id]);
            $owner = $own->fetchColumn();
            if ($owner !== $me['username']) { $skipped++; continue; }
        }

        $ca = $r['createdAt'] ?? date('Y-m-d');
        if (is_string($ca) && strlen($ca) >= 10) $ca = substr($ca, 0, 10);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$ca)) $ca = date('Y-m-d');

        $assignedTo = $r['assignedTo'] ?? null;
        if ($assignedTo === '') $assignedTo = null;

        try {
            $ins->execute([
                ':id' => $id,
                ':civ' => ($r['civility'] ?? 'M') === 'Mme' ? 'Mme' : 'M',
                ':ln' => $ln,
                ':fn' => trim($r['firstName'] ?? ''),
                ':ph' => trim($r['phone'] ?? ''),
                ':em' => trim($r['email'] ?? ''),
                ':src' => $r['source'] ?? 'Web',
                ':st' => $r['status'] ?? 'A recontacter (Voir Commentaire)',
                ':at' => $assignedTo,
                ':ca' => $ca,
                ':city' => strtoupper(trim($r['city'] ?? '')),
                ':oc' => in_array(($r['outcome'] ?? 'pending'), ['pending','won','lost'], true) ? ($r['outcome'] ?? 'pending') : 'pending',
                ':lr' => $r['lostReason'] ?? null,
                ':cm' => $r['comment'] ?? null,
                ':cv' => in_array(($r['checkValeur'] ?? 'pending'), ['valid','invalid','pending'], true) ? ($r['checkValeur'] ?? 'pending') : 'pending',
                ':age' => (isset($r['age']) && $r['age'] !== '' && $r['age'] !== null) ? (int)$r['age'] : null,
                ':bd'  => (isset($r['birthDate']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$r['birthDate'])) ? (string)$r['birthDate'] : null,
                ':cmut' => isset($r['currentMutuelle']) && $r['currentMutuelle'] !== '' ? (string)$r['currentMutuelle'] : null,
                ':reg' => isset($r['regime']) && $r['regime'] !== '' ? (string)$r['regime'] : null,
                ':cot' => (isset($r['cotisation']) && $r['cotisation'] !== '' && $r['cotisation'] !== null) ? (float)$r['cotisation'] : null,
                ':mob' => isset($r['mobile']) && $r['mobile'] !== '' ? trim((string)$r['mobile']) : null,
                ':adr' => isset($r['address']) && $r['address'] !== '' ? trim((string)$r['address']) : '',
                ':pc'  => isset($r['postalCode']) && $r['postalCode'] !== '' ? trim((string)$r['postalCode']) : '',
                ':sa'  => (isset($r['spouseAge']) && $r['spouseAge'] !== '' && $r['spouseAge'] !== null) ? (int)$r['spouseAge'] : null,
                ':sbd' => (isset($r['spouseBirthDate']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$r['spouseBirthDate'])) ? (string)$r['spouseBirthDate'] : null,
                ':cc'  => (isset($r['childrenCount']) && $r['childrenCount'] !== '' && $r['childrenCount'] !== null) ? (int)$r['childrenCount'] : null,
                ':cag' => isset($r['childrenAges']) && $r['childrenAges'] !== '' ? (string)$r['childrenAges'] : null,
                ':dem' => isset($r['demande']) && $r['demande'] !== '' ? (string)$r['demande'] : null,
            ]);
        } catch (Throwable $e) {
            fail('Erreur création prospect: ' . $e->getMessage(), 500, [
                'sqlstate' => method_exists($e, 'getCode') ? $e->getCode() : null,
                'rowId'    => $id,
            ]);
        }

        // If this row's status is 'Devis', create a calendar event (best-effort, deduped).
        try {
            $fn = trim($r['firstName'] ?? '');
            $stRow = $r['status'] ?? 'A recontacter (Voir Commentaire)';
            if ($stRow === 'Devis') {
                create_calendar_event_for_devis($db, $id, $fn, $ln, $assignedTo, $me);
            }
        } catch (Throwable $e) { /* ignore event creation failures */ }

        // Optional custom field values shipped alongside the row
        if (isset($r['customValues']) && is_array($r['customValues'])) {
            foreach ($r['customValues'] as $k => $v) {
                $cfIns->execute([
                    ':e' => 'prospect', ':id' => $id, ':k' => (string)$k,
                    ':v' => is_scalar($v) ? (string)$v : json_encode($v),
                ]);
            }
        }

        $ids[] = $id;
        if ($isUpdate) {
            $updated++;
        } else {
            $added++;
            $src = $r['source'] ?? 'Web';
            log_action($db, 'prospect', $id, 'created', '', $src, $me['username'] ?? '');
            if (!empty($r['assignedTo'])) {
                log_action($db, 'prospect', $id, 'assignedTo', '', (string)$r['assignedTo'], $me['username'] ?? '');
            }
        }
    }
    ok(['added' => $added, 'updated' => $updated, 'skipped' => $skipped, 'ids' => $ids]);
}

if ($method === 'PATCH' || $method === 'PUT') {
    $in = json_input();
    $id = $in['id'] ?? ($_GET['id'] ?? '');
    if (!$id) fail('id requis', 422);

    $cur = $db->prepare('SELECT * FROM extraneterp_prospects WHERE id = :id');
    $cur->execute([':id' => $id]);
    $curRow = $cur->fetch();
    if (!$curRow) fail('Prospect introuvable', 404);
    if ($isAgent) {
        $owner = $curRow['assigned_to'] ?? null;
        if ($owner !== $me['username']) fail('Accès refusé', 403);
        // Prevent an agent from re-assigning leads to other users
        if (array_key_exists('assignedTo', $in) && $in['assignedTo'] !== $me['username']) {
            fail('Accès refusé', 403);
        }
    }

    $map = [
        'civility'    => 'civility',
        'lastName'    => 'last_name',
        'firstName'   => 'first_name',
        'phone'       => 'phone',
        'email'       => 'email',
        'source'      => 'source',
        'status'      => 'status',
        'assignedTo'  => 'assigned_to',
        'city'        => 'city',
        'outcome'     => 'outcome',
        'lostReason'  => 'lost_reason',
        'comment'     => 'comment',
        'checkValeur' => 'check_valeur',
        'age'         => 'age',
        'birthDate'   => 'birth_date',
        'currentMutuelle' => 'current_mutuelle',
        'regime'      => 'regime',
        'cotisation'  => 'cotisation',
        'mobile'      => 'mobile',
        'address'     => 'address',
        'postalCode'  => 'postal_code',
        'spouseAge'   => 'spouse_age',
        'spouseBirthDate' => 'spouse_birth_date',
        'childrenCount'   => 'children_count',
        'childrenAges'    => 'children_ages',
        'demande'     => 'demande',
    ];
    $sets = [];
    $params = [':id' => $id];
    foreach ($map as $k => $col) {
        if (array_key_exists($k, $in)) {
            $val = $in[$k];
            if ($k === 'civility' && !in_array($val, ['M','Mme'], true)) continue;
            if ($k === 'outcome' && !in_array($val, ['pending','won','lost'], true)) continue;
            if ($k === 'checkValeur' && !in_array($val, ['valid','invalid','pending'], true)) continue;
            if ($k === 'city' && is_string($val)) $val = strtoupper(trim($val));
            if ($k === 'age') $val = ($val === '' || $val === null) ? null : (int)$val;
            if ($k === 'spouseAge') $val = ($val === '' || $val === null) ? null : (int)$val;
            if ($k === 'childrenCount') $val = ($val === '' || $val === null) ? null : (int)$val;
            if ($k === 'cotisation') $val = ($val === '' || $val === null) ? null : (float)$val;
            if ($k === 'currentMutuelle' && $val === '') $val = null;
            if (in_array($k, ['birthDate','spouseBirthDate'], true)) {
                $val = ($val !== null && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$val)) ? (string)$val : null;
            }
            if (($k === 'regime' || $k === 'childrenAges' || $k === 'mobile' || $k === 'address' || $k === 'postalCode' || $k === 'demande') && $val === '') $val = null;
            $sets[] = "$col = :$k";
            $params[":$k"] = $val;
        }
    }
    if (!$sets) fail('Aucun champ à mettre à jour', 422);
    $sql = 'UPDATE extraneterp_prospects SET ' . implode(', ', $sets) . ' WHERE id = :id';
    $db->prepare($sql)->execute($params);
    foreach ($map as $k => $col) {
        if (!array_key_exists($k, $in)) continue;
        $prev = (string)($curRow[$col] ?? '');
        $next = (string)($params[":$k"] ?? '');
        if ($prev === $next) continue; // skip no-op writes
        log_action($db, 'prospect', $id, $k, $prev, $next, $me['username'] ?? '');
    }
    // If status was changed to 'Devis', create a calendar event (best-effort)
    if (array_key_exists('status', $in) && ($in['status'] ?? '') === 'Devis' && (($curRow['status'] ?? '') !== 'Devis')) {
        try {
            $pstmt = $db->prepare('SELECT first_name, last_name, assigned_to FROM extraneterp_prospects WHERE id = :id');
            $pstmt->execute([':id' => $id]);
            $prow = $pstmt->fetch();
            if ($prow) create_calendar_event_for_devis($db, $id, $prow['first_name'] ?? '', $prow['last_name'] ?? '', $prow['assigned_to'] ?? null, $me);
        } catch (Throwable $e) { /* ignore */ }
    }
    ok(['message' => 'Prospect mis à jour']);
}

if ($method === 'DELETE') {
    require_auth(['Administrateur', 'Manager']);
    $id = $_GET['id'] ?? '';
    if (!$id) fail('id requis', 422);
    $s = $db->prepare('DELETE FROM extraneterp_prospects WHERE id = :id');
    $s->execute([':id' => $id]);
    log_action($db, 'prospect', $id, 'delete', $id, '', $me['username'] ?? '');
    ok(['deleted' => $s->rowCount()]);
}

fail('Method not allowed', 405);
