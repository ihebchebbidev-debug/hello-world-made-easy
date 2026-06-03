<?php
require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/**
 * The agent-scoping clauses below depend on the `prospect_id` column added by
 * backend/sql/2026_05_13_contracts_prospect_link.sql. Detect it once so the
 * endpoint stays usable on databases where the migration has not been run yet
 * (instead of throwing an "Unknown column" SQL error → 500 → blank dashboard).
 */
function contracts_has_prospect_link(PDO $db): bool {
    static $cached = null;
    if ($cached !== null) return $cached;
    try {
        $s = $db->query("SHOW COLUMNS FROM extraneterp_contracts LIKE 'prospect_id'");
        $cached = (bool)$s->fetch();
    } catch (Throwable $e) {
        $cached = false;
    }
    return $cached;
}

/**
 * Self-heal: the original schema declared `billing_status` as an ENUM with
 * only 4 hardcoded values, so any custom status created via the dynamic
 * status admin (e.g. "Courrier") was silently coerced to '' by MySQL and
 * then re-rendered as "Pré-validé" by the frontend fallback. Relax the
 * column to VARCHAR on the fly so dynamic statuses persist correctly.
 */
function contracts_ensure_billing_status_varchar(PDO $db): void {
    static $done = false;
    if ($done) return;
    try {
        $s = $db->query("SHOW COLUMNS FROM extraneterp_contracts LIKE 'billing_status'");
        $col = $s->fetch();
        if ($col && stripos((string)$col['Type'], 'enum(') === 0) {
            $db->exec("ALTER TABLE extraneterp_contracts MODIFY billing_status VARCHAR(120) NOT NULL DEFAULT 'Pré-validé'");
        }
    } catch (Throwable $e) { /* non-fatal */ }
    $done = true;
}
contracts_ensure_billing_status_varchar($db);

function row_to_contract(array $r): array {
    return [
        'id'             => $r['id'],
        'prospectId'     => $r['prospect_id'] ?? null,
        'lastName'       => $r['last_name'],
        'firstName'      => $r['first_name'],
        'city'           => $r['city'],
        'partner'        => $r['partner'],
        'cabinet'        => $r['cabinet'],
        'signatureDate'  => $r['signature_date'],
        'effectiveDate'  => $r['effective_date'],
        'validationDate' => $r['validation_date'],
        'premium'        => (float)$r['premium'],
        'billingStatus'  => $r['billing_status'],
        'source'         => $r['source'],
        'assignedTo'     => $r['assigned_to'],
        // Détail Client
        'civility'       => $r['civility']     ?? null,
        'phone'          => $r['phone']        ?? null,
        'mobile'         => $r['mobile']       ?? null,
        'email'          => $r['email']        ?? null,
        'birthDate'      => $r['birth_date']   ?? null,
        // Adresse
        'address'        => $r['address']      ?? null,
        'postalCode'     => $r['postal_code']  ?? null,
        // Mutuelle Actuelle
        'currentMutuelle'    => $r['current_mutuelle']    ?? null,
        'ssn'                => $r['ssn']                 ?? null,
        'adhesionNumber'     => $r['adhesion_number']     ?? null,
        'principalMember'    => $r['principal_member']    ?? null,
        'previousPremium'    => isset($r['previous_premium']) ? (float)$r['previous_premium'] : null,
        'currentExpiryDate'  => $r['current_expiry_date'] ?? null,
        // Produit Proposé
        'product'                     => $r['product']                     ?? null,
        'productOptions'              => $r['product_options']             ?? null,
        'complementaryProduct'        => $r['complementary_product']       ?? null,
        'complementaryPremium'        => isset($r['complementary_premium']) ? (float)$r['complementary_premium'] : null,
        'complementaryEffectiveDate'  => $r['complementary_effective_date'] ?? null,
        // Conjoint
        'spouseCivility'    => $r['spouse_civility']    ?? null,
        'spouseLastName'    => $r['spouse_last_name']   ?? null,
        'spouseFirstName'   => $r['spouse_first_name']  ?? null,
        'spouseBirthDate'   => $r['spouse_birth_date']  ?? null,
        // Coordonnées Bancaires
        'bankHolderLastName'  => $r['bank_holder_last_name']  ?? null,
        'bankHolderFirstName' => $r['bank_holder_first_name'] ?? null,
        'iban'                => $r['iban']                   ?? null,
        'bic'                 => $r['bic']                    ?? null,
        'debitDate'           => $r['debit_date']             ?? null,
        'debitType'           => $r['debit_type']             ?? null,
        // Résiliation
        'terminationType'     => $r['termination_type']       ?? null,
        // Régime
        'regime'              => $r['regime']                 ?? null,
        // Enfants
        'childrenCount'       => isset($r['children_count']) && $r['children_count'] !== null ? (int)$r['children_count'] : null,
        'childrenAges'        => $r['children_ages']          ?? null,
        // Commentaires
        'commercialComment'   => $r['commercial_comment']     ?? null,
    ];
}

$role = $me['role'] ?? '';
$isPrivileged = in_array($role, ['Admin','Administrateur','Manager','Superviseur','Backoffice','Présentation'], true);
$isAgent = !$isPrivileged; // Agent, Vendeur, etc. → scoped to own

if ($method === 'GET') { try {
    $hasLink = contracts_has_prospect_link($db);
    $id = $_GET['id'] ?? null;
    if ($id) {
        $s = $db->prepare('SELECT * FROM extraneterp_contracts WHERE id = :id');
        $s->execute([':id' => $id]);
        $r = $s->fetch();
        if (!$r) fail('Not found', 404);
        if ($isAgent) {
            // Agent scope: contract is accessible when it is directly assigned
            // to the agent, OR when its source prospect is currently assigned
            // to the agent (legacy link-based access). Matching is
            // case-insensitive so imports that stored the username with a
            // different case (e.g. "Felix.NOGHA" vs "felix.nogha") still
            // resolve to the right owner.
            $allowed = (isset($r['assigned_to']) && strcasecmp((string)$r['assigned_to'], (string)$me['username']) === 0);
            if (!$allowed && $hasLink && !empty($r['prospect_id'])) {
                $own = $db->prepare('SELECT 1 FROM extraneterp_prospects WHERE id = :pid AND LOWER(assigned_to) = LOWER(:me)');
                $own->execute([':pid' => $r['prospect_id'], ':me' => $me['username']]);
                $allowed = (bool)$own->fetchColumn();
            }
            if (!$allowed) fail('Accès refusé', 403);
        }
        ok(['contract' => row_to_contract($r)]);
    }

    // ------- Build WHERE clause shared by count + list -------
    $where = [];
    $params = [];
    if ($isAgent) {
        // Agent scope (case-insensitive — see note above).
        if ($hasLink) {
            $where[] = "(LOWER(assigned_to) = LOWER(:__me) OR (prospect_id IS NOT NULL AND prospect_id IN
                        (SELECT id FROM extraneterp_prospects WHERE LOWER(assigned_to) = LOWER(:__me2))))";
            $params[':__me']  = $me['username'];
            $params[':__me2'] = $me['username'];
        } else {
            $where[] = "LOWER(assigned_to) = LOWER(:__me)";
            $params[':__me'] = $me['username'];
        }
    }
    if (!empty($_GET['q'])) {
        // Same smart-search strategy as prospects.php — see comments there.
        $q  = trim((string)$_GET['q']);
        $ors = [];
        $isIdLike   = (bool)preg_match('/^[pcuntfsa]-?\w*$/i', $q);
        $hasFtToken = false;
        foreach (preg_split('/\s+/', $q) as $tok) {
            if (mb_strlen($tok) >= 3) { $hasFtToken = true; break; }
        }

        if ($isIdLike) {
            $ors[] = "id LIKE :__qid";
            $params[':__qid'] = $q . '%';
        }
        if ($hasFtToken) {
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
        'billingStatus' => 'billing_status',
        'partner'       => 'partner',
        'cabinet'       => 'cabinet',
        'source'        => 'source',
        'assignedTo'    => 'assigned_to',
    ] as $qk => $col) {
        if (isset($_GET[$qk]) && $_GET[$qk] !== '') {
            $where[] = "$col = :__f_$qk";
            $params[":__f_$qk"] = $_GET[$qk];
        }
    }
    foreach ([
        'sigFrom' => ['signature_date',  '>='],
        'sigTo'   => ['signature_date',  '<='],
        'effFrom' => ['effective_date',  '>='],
        'effTo'   => ['effective_date',  '<='],
        'valFrom' => ['validation_date', '>='],
        'valTo'   => ['validation_date', '<='],
    ] as $qk => [$col, $op]) {
        if (!empty($_GET[$qk]) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET[$qk])) {
            // Wrap column in DATE() so DATETIME-typed columns still match a
            // YYYY-MM-DD comparison (otherwise `<= '2026-05-22'` excludes
            // any row whose timestamp is later that same day).
            $where[] = "DATE($col) $op :__d_$qk";
            $params[":__d_$qk"] = $_GET[$qk];
        }
    }
    $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

    if (isset($_GET['count'])) {
        $st = $db->prepare("SELECT COUNT(*) FROM extraneterp_contracts $whereSql");
        $st->execute($params);
        ok(['total' => (int)$st->fetchColumn()]);
    }

    if (isset($_GET['ids'])) {
        $st = $db->prepare("SELECT id FROM extraneterp_contracts $whereSql ORDER BY signature_date DESC, id DESC LIMIT 50000");
        $st->execute($params);
        ok(['ids' => array_map(fn($r) => $r['id'], $st->fetchAll())]);
    }

    $sortMap = [
        'signatureDate'  => 'signature_date',
        'effectiveDate'  => 'effective_date',
        'validationDate' => 'validation_date',
        'premium'        => 'premium',
        'lastName'       => 'last_name',
        'id'             => 'id',
    ];
    $sortKey = $_GET['sort'] ?? 'signatureDate';
    $sortCol = $sortMap[$sortKey] ?? 'signature_date';
    $dir = (strtolower($_GET['dir'] ?? 'desc') === 'asc') ? 'ASC' : 'DESC';

    if (isset($_GET['page']) || isset($_GET['pageSize'])) {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $pageSize = (int)($_GET['pageSize'] ?? 2000);
        if ($pageSize < 1) $pageSize = 1;
        if ($pageSize > 5000) $pageSize = 5000;
        $offset = ($page - 1) * $pageSize;

        $cnt = $db->prepare("SELECT COUNT(*) FROM extraneterp_contracts $whereSql");
        $cnt->execute($params);
        $total = (int)$cnt->fetchColumn();

        $sql = "SELECT * FROM extraneterp_contracts $whereSql ORDER BY $sortCol $dir, id DESC LIMIT $pageSize OFFSET $offset";
        $st = $db->prepare($sql);
        $st->execute($params);
        $rows = $st->fetchAll();
        ok([
            'contracts' => array_map('row_to_contract', $rows),
            'total'     => $total,
            'page'      => $page,
            'pageSize'  => $pageSize,
        ]);
    }

    // Legacy full-list mode (DEPRECATED — capped at 5000)
    $sql = "SELECT * FROM extraneterp_contracts $whereSql ORDER BY $sortCol $dir, id DESC LIMIT 5000";
    $st = $db->prepare($sql);
    $st->execute($params);
    $rows = $st->fetchAll();
    $contracts = array_map('row_to_contract', $rows);
    ok(['contracts' => $contracts]);
} catch (Throwable $e) {
    fail('Erreur recherche contrats: ' . $e->getMessage(), 500, [
        'sqlstate' => method_exists($e, 'getCode') ? $e->getCode() : null,
    ]);
} }

if ($method === 'PATCH' || $method === 'PUT') {
    // Only Administrateur and Manager can modify contracts.
    require_auth(['Administrateur', 'Manager']);
    $in = json_input();
    $cid = $in['id'] ?? ($_GET['id'] ?? '');
    if (!$cid) fail('id requis', 422);

    $cur = $db->prepare('SELECT * FROM extraneterp_contracts WHERE id = :id');
    $cur->execute([':id' => $cid]);
    $existing = $cur->fetch();
    if (!$existing) fail('Contrat introuvable', 404);

    $sets = [];
    $params = [':id' => $cid];

    if (array_key_exists('billingStatus', $in)) {
        // Allowed statuses come from the dynamic extraneterp_status_options
        // table (entity='contract'), so any admin-defined status (e.g.
        // "Courrier") is accepted. Fall back to the legacy hardcoded list
        // when the table is missing/empty so existing installs keep working.
        $allowed = [];
        try {
            $st = $db->prepare("SELECT value FROM extraneterp_status_options WHERE entity = 'contract'");
            $st->execute();
            $allowed = array_map(fn($r) => $r['value'], $st->fetchAll());
        } catch (Throwable $e) { $allowed = []; }
        if (!$allowed) {
            $allowed = ['Validé Confirmation','En attente de validation','Annuler la confirmation','Pré-validé'];
        }
        if (!in_array($in['billingStatus'], $allowed, true)) fail('Statut invalide', 422);
        $sets[] = 'billing_status = :bs';
        $params[':bs'] = $in['billingStatus'];

        if ($in['billingStatus'] === 'Validé Confirmation') {
            $sets[] = 'validation_date = :vd';
            $params[':vd'] = date('Y-m-d');
        } else {
            // Clear validation date when leaving the validated state
            $sets[] = 'validation_date = NULL';
        }
        // log activity
        if ($existing['billing_status'] !== $in['billingStatus']) {
            $log = $db->prepare('INSERT INTO extraneterp_activity_log (id,entity_type,entity_id,contract_id,field,previous_value,new_value,user_username)
                                 VALUES (:id,:et,:eid,:cid,:f,:pv,:nv,:u)');
            $log->execute([
                ':id'  => 'A-' . substr(bin2hex(random_bytes(6)), 0, 10),
                ':et'  => 'contract', ':eid' => $cid,
                ':cid' => $cid, ':f' => 'billingStatus',
                ':pv'  => $existing['billing_status'], ':nv' => $in['billingStatus'],
                ':u'   => $me['username'],
            ]);
        }
    }
    if (array_key_exists('premium', $in)) {
        $new = (float)$in['premium'];
        $sets[] = 'premium = :pr';
        $params[':pr'] = $new;
        if ((float)$existing['premium'] !== $new) {
            $log = $db->prepare('INSERT INTO extraneterp_activity_log (id,entity_type,entity_id,contract_id,field,previous_value,new_value,user_username)
                                 VALUES (:id,:et,:eid,:cid,:f,:pv,:nv,:u)');
            $log->execute([
                ':id'  => 'A-' . substr(bin2hex(random_bytes(6)), 0, 10),
                ':et'  => 'contract', ':eid' => $cid,
                ':cid' => $cid, ':f' => 'premium',
                ':pv'  => (string)$existing['premium'], ':nv' => (string)$new,
                ':u'   => $me['username'],
            ]);
        }
    }
    // Generic update of any of the extended/optional contract fields.
    // All fields are nullable so empty strings are coerced to NULL.
    $extMap = [
        'lastName'       => 'last_name',
        'firstName'      => 'first_name',
        'city'           => 'city',
        'partner'        => 'partner',
        'cabinet'        => 'cabinet',
        'signatureDate'  => 'signature_date',
        'effectiveDate'  => 'effective_date',
        'source'         => 'source',
        'assignedTo'     => 'assigned_to',
        'civility'       => 'civility',
        'phone'          => 'phone',
        'mobile'         => 'mobile',
        'email'          => 'email',
        'birthDate'      => 'birth_date',
        'address'        => 'address',
        'postalCode'     => 'postal_code',
        'currentMutuelle'    => 'current_mutuelle',
        'ssn'                => 'ssn',
        'adhesionNumber'     => 'adhesion_number',
        'principalMember'    => 'principal_member',
        'previousPremium'    => 'previous_premium',
        'currentExpiryDate'  => 'current_expiry_date',
        'product'                     => 'product',
        'productOptions'              => 'product_options',
        'complementaryProduct'        => 'complementary_product',
        'complementaryPremium'        => 'complementary_premium',
        'complementaryEffectiveDate'  => 'complementary_effective_date',
        'spouseCivility'    => 'spouse_civility',
        'spouseLastName'    => 'spouse_last_name',
        'spouseFirstName'   => 'spouse_first_name',
        'spouseBirthDate'   => 'spouse_birth_date',
        'bankHolderLastName'  => 'bank_holder_last_name',
        'bankHolderFirstName' => 'bank_holder_first_name',
        'iban'                => 'iban',
        'bic'                 => 'bic',
        'debitDate'           => 'debit_date',
        'debitType'           => 'debit_type',
        'terminationType'     => 'termination_type',
        'regime'              => 'regime',
        'childrenCount'       => 'children_count',
        'childrenAges'        => 'children_ages',
        'commercialComment'   => 'commercial_comment',
    ];
    $dateCols = ['signature_date','effective_date','birth_date','current_expiry_date',
                 'complementary_effective_date','spouse_birth_date','debit_date'];
    foreach ($extMap as $k => $col) {
        if (!array_key_exists($k, $in)) continue;
        $v = $in[$k];
        if ($v === '' ) $v = null;
        if ($v !== null && in_array($col, $dateCols, true) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$v)) {
            $v = null;
        }
        if ($col === 'children_count' && $v !== null) $v = (int)$v;
        if ($col === 'city' && is_string($v)) $v = strtoupper(trim($v));
        $sets[] = "$col = :ext_$k";
        $params[":ext_$k"] = $v;
    }
    if (!$sets) fail('Aucun champ à mettre à jour', 422);

    $sql = 'UPDATE extraneterp_contracts SET ' . implode(', ', $sets) . ' WHERE id = :id';
    $db->prepare($sql)->execute($params);
    if (!empty($existing['assigned_to']) && $existing['assigned_to'] !== $me['username']) {
        notify_user($db, $existing['assigned_to'], 'Contrat mis à jour', "$cid modifié par {$me['username']}", "/contracts/$cid");
    }
    ok(['message' => 'Contrat mis à jour']);
}

if ($method === 'POST') {
    // bulk import / create
    $in = json_input();
    $rows = $in['rows'] ?? [$in];
    if (!is_array($rows)) fail('rows invalide', 422);
    // Bulk imports (more than one row at a time) are restricted to admins.
    // Single-row POSTs from /contracts/new remain open to Manager/Agent.
    if (count($rows) > 1 && ($me['role'] ?? '') !== 'Administrateur') {
        fail('Import contrats réservé aux administrateurs', 403);
    }
    $added = 0; $updated = 0; $skipped = 0; $ids = [];
    $allowed = ['Validé Confirmation','En attente de validation','Annuler la confirmation','Pré-validé'];

    $hasProspectLink = contracts_has_prospect_link($db);
    $prospectCol = $hasProspectLink ? 'prospect_id,' : '';
    $prospectVal = $hasProspectLink ? ':pid,' : '';
    $prospectUpd = $hasProspectLink ? 'prospect_id=VALUES(prospect_id), ' : '';

    $ins = $db->prepare("INSERT INTO extraneterp_contracts
        (id,{$prospectCol}last_name,first_name,city,partner,cabinet,signature_date,effective_date,validation_date,premium,billing_status,source,assigned_to,
         civility,phone,mobile,email,birth_date,address,postal_code,
         current_mutuelle,ssn,adhesion_number,principal_member,previous_premium,current_expiry_date,
         product,product_options,complementary_product,complementary_premium,complementary_effective_date,
         spouse_civility,spouse_last_name,spouse_first_name,spouse_birth_date,
         bank_holder_last_name,bank_holder_first_name,iban,bic,debit_date,debit_type,
         termination_type,regime,children_count,children_ages,
         commercial_comment)
        VALUES (:id,{$prospectVal}:ln,:fn,:city,:p,:cab,:sd,:ed,:vd,:pr,:bs,:src,:at,
         :civ,:ph,:mo,:em,:bd,:addr,:pc,
         :cm,:ssn,:an,:pm,:pp,:ced,
         :prod,:po,:cp,:cprem,:ceffd,
         :scv,:sln,:sfn,:sbd,
         :bhl,:bhf,:iban,:bic,:dd,:dt,
         :tt,:reg,:chc,:cha,
         :cc)
        ON DUPLICATE KEY UPDATE
          {$prospectUpd}last_name=VALUES(last_name), first_name=VALUES(first_name), city=VALUES(city),
          partner=VALUES(partner), cabinet=VALUES(cabinet), signature_date=VALUES(signature_date),
          effective_date=VALUES(effective_date), validation_date=VALUES(validation_date),
          premium=VALUES(premium), billing_status=VALUES(billing_status),
          source=VALUES(source), assigned_to=VALUES(assigned_to),
          civility=VALUES(civility), phone=VALUES(phone), mobile=VALUES(mobile),
          email=VALUES(email), birth_date=VALUES(birth_date),
          address=VALUES(address), postal_code=VALUES(postal_code),
          current_mutuelle=VALUES(current_mutuelle), ssn=VALUES(ssn),
          adhesion_number=VALUES(adhesion_number), principal_member=VALUES(principal_member),
          previous_premium=VALUES(previous_premium), current_expiry_date=VALUES(current_expiry_date),
          product=VALUES(product), product_options=VALUES(product_options),
          complementary_product=VALUES(complementary_product),
          complementary_premium=VALUES(complementary_premium),
          complementary_effective_date=VALUES(complementary_effective_date),
          spouse_civility=VALUES(spouse_civility), spouse_last_name=VALUES(spouse_last_name),
          spouse_first_name=VALUES(spouse_first_name), spouse_birth_date=VALUES(spouse_birth_date),
          bank_holder_last_name=VALUES(bank_holder_last_name),
          bank_holder_first_name=VALUES(bank_holder_first_name),
          iban=VALUES(iban), bic=VALUES(bic),
          debit_date=VALUES(debit_date), debit_type=VALUES(debit_type),
          termination_type=VALUES(termination_type), regime=VALUES(regime),
          children_count=VALUES(children_count), children_ages=VALUES(children_ages),
          commercial_comment=VALUES(commercial_comment)");

    $cfIns = $db->prepare('INSERT INTO extraneterp_custom_field_values (entity, entity_id, field_key, value)
                           VALUES (:e,:id,:k,:v)
                           ON DUPLICATE KEY UPDATE value = VALUES(value)');

    foreach ($rows as $r) {
        $ln = trim($r['lastName'] ?? '');
        // Last name is no longer mandatory (form sections can be partially filled),
        // but we still skip rows with absolutely no identifying info.
        if ($ln === '' && trim($r['firstName'] ?? '') === '' && empty($r['email']) && empty($r['phone'])) {
            $skipped++; continue;
        }
        $id = $r['id'] ?? ('C-' . substr(bin2hex(random_bytes(6)), 0, 10));

        $exists = $db->prepare('SELECT 1 FROM extraneterp_contracts WHERE id = :id');
        $exists->execute([':id' => $id]);
        $isUpdate = (bool)$exists->fetchColumn();
        // Agents may CREATE contracts (e.g. when converting their own prospect)
        // but are NEVER allowed to UPDATE an existing contract.
        if ($isAgent && $isUpdate) { $skipped++; continue; }


        $bs = $r['billingStatus'] ?? 'Pré-validé';
        if (!in_array($bs, $allowed, true)) $bs = 'Pré-validé';

        $nullable = function ($v) { return ($v === '' || $v === null) ? null : $v; };
        $nullableDate = function ($v) {
            if ($v === '' || $v === null) return null;
            $v = substr((string)$v, 0, 10);
            return preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) ? $v : null;
        };
        $nullableNum = function ($v) {
            if ($v === '' || $v === null) return null;
            return (float)$v;
        };

        $params = [
            ':id'   => $id, ':ln' => $ln,
            ':fn'   => trim($r['firstName'] ?? ''),
            ':city' => strtoupper(trim($r['city'] ?? '')),
            ':p'    => $r['partner'] ?? 'NEOLIANE',
            ':cab'  => $r['cabinet'] ?? 'Cabinet Paris 1',
            ':sd'   => $nullableDate($r['signatureDate'] ?? null),
            ':ed'   => $nullableDate($r['effectiveDate'] ?? null),
            ':vd'   => $nullableDate($r['validationDate'] ?? null),
            ':pr'   => (float)($r['premium'] ?? 0),
            ':bs'   => $bs,
            ':src'  => $r['source'] ?? 'Web',
            ':at'   => $r['assignedTo'] ?? '—',
            ':civ'  => $nullable($r['civility']    ?? null),
            ':ph'   => $nullable($r['phone']       ?? null),
            ':mo'   => $nullable($r['mobile']      ?? null),
            ':em'   => $nullable($r['email']       ?? null),
            ':bd'   => $nullableDate($r['birthDate'] ?? null),
            ':addr' => $nullable($r['address']     ?? null),
            ':pc'   => $nullable($r['postalCode']  ?? null),
            ':cm'   => $nullable($r['currentMutuelle']   ?? null),
            ':ssn'  => $nullable($r['ssn']               ?? null),
            ':an'   => $nullable($r['adhesionNumber']    ?? null),
            ':pm'   => $nullable($r['principalMember']   ?? null),
            ':pp'   => $nullableNum($r['previousPremium'] ?? null),
            ':ced'  => $nullableDate($r['currentExpiryDate'] ?? null),
            ':prod'  => $nullable($r['product']           ?? null),
            ':po'    => $nullable($r['productOptions']    ?? null),
            ':cp'    => $nullable($r['complementaryProduct']        ?? null),
            ':cprem' => $nullableNum($r['complementaryPremium']     ?? null),
            ':ceffd' => $nullableDate($r['complementaryEffectiveDate'] ?? null),
            ':scv'  => $nullable($r['spouseCivility']    ?? null),
            ':sln'  => $nullable($r['spouseLastName']    ?? null),
            ':sfn'  => $nullable($r['spouseFirstName']   ?? null),
            ':sbd'  => $nullableDate($r['spouseBirthDate'] ?? null),
            ':bhl'  => $nullable($r['bankHolderLastName']  ?? null),
            ':bhf'  => $nullable($r['bankHolderFirstName'] ?? null),
            ':iban' => $nullable($r['iban']                ?? null),
            ':bic'  => $nullable($r['bic']                 ?? null),
            ':dd'   => $nullableDate($r['debitDate'] ?? null),
            ':dt'   => $nullable($r['debitType']     ?? null),
            ':tt'   => $nullable($r['terminationType'] ?? null),
            ':reg'  => $nullable($r['regime']          ?? null),
            ':chc'  => (isset($r['childrenCount']) && $r['childrenCount'] !== '' && $r['childrenCount'] !== null) ? (int)$r['childrenCount'] : null,
            ':cha'  => $nullable($r['childrenAges']    ?? null),
            ':cc'   => $nullable($r['commercialComment'] ?? null),
        ];
        if ($hasProspectLink) {
            $pid = $nullable($r['prospectId'] ?? null);
            // Auto-link when caller omitted prospectId so RDV/won stats stay
            // accurate. Resolution by phone/email/name (see config.php).
            if (!$pid) {
                $pid = resolve_prospect_id($db, $r);
            }
            $params[':pid'] = $pid;
        }
        $ins->execute($params);

        if (isset($r['customValues']) && is_array($r['customValues'])) {
            foreach ($r['customValues'] as $k => $v) {
                $cfIns->execute([
                    ':e' => 'contract', ':id' => $id, ':k' => (string)$k,
                    ':v' => is_scalar($v) ? (string)$v : json_encode($v),
                ]);
            }
        }

        $ids[] = $id;
        if ($isUpdate) $updated++; else $added++;
    }
    ok(['added' => $added, 'updated' => $updated, 'skipped' => $skipped, 'ids' => $ids]);
}

if ($method === 'DELETE') {
    require_auth(['Administrateur', 'Manager']);
    $id = $_GET['id'] ?? '';
    if (!$id) fail('id requis', 422);
    $s = $db->prepare('DELETE FROM extraneterp_contracts WHERE id = :id');
    $s->execute([':id' => $id]);
    ok(['deleted' => $s->rowCount()]);
}

fail('Method not allowed', 405);
