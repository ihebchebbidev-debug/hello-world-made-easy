<?php
/**
 * /reclamations.php — CRUD des Réclamations (Protection ERP)
 *
 *   GET    /reclamations.php?...filtres
 *            tel, cin, gsm, ref, q, service, audit_status,
 *            prospect_id, contract_id, mois, annee,
 *            date_from, date_to, limit, offset
 *          → { reclamations:[...], total:N }
 *
 *   GET    /reclamations.php?id=NN          → { reclamation: {...} }
 *   POST   /reclamations.php                → création (id auto, REC-AAAAMM-XXXX)
 *   PATCH  /reclamations.php?id=NN          → MAJ partielle
 *   DELETE /reclamations.php?id=NN          → suppression (Admin/Manager)
 */

require_once __DIR__ . '/config.php';

$me     = require_auth();
$db     = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/* ---------------------------------------------------- bootstrap (idempotent) */
function ensure_reclamations_tables(PDO $db): void {
    $db->exec("CREATE TABLE IF NOT EXISTS extraneterp_reclamations (
        id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        reference       VARCHAR(32)  NOT NULL,
        prospect_id     VARCHAR(64)  NULL,
        contract_id     VARCHAR(64)  NULL,
        tel_adsl        VARCHAR(32)  NULL,
        ref_demand      VARCHAR(64)  NULL,
        cin_client      VARCHAR(32)  NULL,
        gsm_client      VARCHAR(32)  NULL,
        client_name     VARCHAR(160) NULL,
        service         ENUM('Technique','Facturation','Commercial','Autre') NOT NULL DEFAULT 'Technique',
        description     TEXT         NULL,
        statut_crm      VARCHAR(80)  NULL,
        statut_tt       VARCHAR(80)  NULL,
        audit_status    ENUM('en_cours','resolu','annule') NOT NULL DEFAULT 'en_cours',
        priority        ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
        localisation    VARCHAR(160) NULL,
        etat            VARCHAR(80)  NULL,
        remarques       TEXT         NULL,
        date_creation   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        date_resolution DATETIME     NULL,
        mois            TINYINT  UNSIGNED GENERATED ALWAYS AS (MONTH(date_creation)) STORED,
        annee           SMALLINT UNSIGNED GENERATED ALWAYS AS (YEAR(date_creation))  STORED,
        assigned_to     VARCHAR(80)  NULL,
        created_by      VARCHAR(80)  NULL,
        created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_rec_ref (reference),
        KEY idx_rec_audit    (audit_status),
        KEY idx_rec_service  (service),
        KEY idx_rec_prospect (prospect_id),
        KEY idx_rec_contract (contract_id),
        KEY idx_rec_assigned (assigned_to),
        KEY idx_rec_period   (annee, mois),
        KEY idx_rec_created  (date_creation)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $db->exec("CREATE TABLE IF NOT EXISTS extraneterp_reclamation_counter (
        period   CHAR(6)      NOT NULL,
        last_seq INT UNSIGNED NOT NULL DEFAULT 0,
        PRIMARY KEY (period)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}
ensure_reclamations_tables($db);

/* ------------------------------------------------------------------ helpers */
const REC_AUDIT     = ['en_cours', 'resolu', 'annule'];
const REC_SERVICES  = ['Technique', 'Facturation', 'Commercial', 'Autre'];
const REC_PRIORITY  = ['low', 'normal', 'high', 'urgent'];

function rec_can_manage(array $me): bool {
    return in_array($me['role'] ?? '', ['Administrateur', 'Manager'], true);
}
function rec_clean_str($v, int $max = 255): ?string {
    if ($v === null) return null;
    $s = trim((string)$v);
    if ($s === '') return null;
    return mb_substr($s, 0, $max);
}
function rec_audit($v): string {
    $v = strtolower((string)$v);
    return in_array($v, REC_AUDIT, true) ? $v : 'en_cours';
}
function rec_service($v): string {
    $v = (string)$v;
    return in_array($v, REC_SERVICES, true) ? $v : 'Technique';
}
function rec_priority($v): string {
    $v = strtolower((string)$v);
    return in_array($v, REC_PRIORITY, true) ? $v : 'normal';
}
function rec_datetime($v): ?string {
    if ($v === null || $v === '') return null;
    $t = strtotime((string)$v);
    return $t ? date('Y-m-d H:i:s', $t) : null;
}
function rec_generate_reference(PDO $db, ?string $createdAt = null): string {
    $period = date('Ym', $createdAt ? strtotime($createdAt) : time());
    $db->prepare(
        'INSERT INTO extraneterp_reclamation_counter (period, last_seq)
         VALUES (:p, 1)
         ON DUPLICATE KEY UPDATE last_seq = last_seq + 1'
    )->execute([':p' => $period]);
    $s = $db->prepare('SELECT last_seq FROM extraneterp_reclamation_counter WHERE period = :p');
    $s->execute([':p' => $period]);
    $seq = (int)$s->fetchColumn();
    return sprintf('REC-%s-%04d', $period, $seq);
}
function rec_row(array $r): array {
    return [
        'id'              => (int)$r['id'],
        'reference'       => $r['reference'],
        'prospect_id'     => $r['prospect_id'],
        'contract_id'     => $r['contract_id'],
        'tel_adsl'        => $r['tel_adsl'],
        'ref_demand'      => $r['ref_demand'],
        'cin_client'      => $r['cin_client'],
        'gsm_client'      => $r['gsm_client'],
        'client_name'     => $r['client_name'],
        'service'         => $r['service'],
        'description'     => $r['description'],
        'statut_crm'      => $r['statut_crm'],
        'statut_tt'       => $r['statut_tt'],
        'audit_status'    => $r['audit_status'],
        'priority'        => $r['priority'],
        'localisation'    => $r['localisation'],
        'etat'            => $r['etat'],
        'remarques'       => $r['remarques'],
        'date_creation'   => $r['date_creation'],
        'date_resolution' => $r['date_resolution'],
        'mois'            => isset($r['mois'])  ? (int)$r['mois']  : null,
        'annee'           => isset($r['annee']) ? (int)$r['annee'] : null,
        'assigned_to'     => $r['assigned_to'],
        'created_by'      => $r['created_by'],
        'created_at'      => $r['created_at'],
        'updated_at'      => $r['updated_at'],
    ];
}
function rec_payload(array $in, bool $forUpdate = false): array {
    $aliasMap = [
        'clientName'     => 'client_name',
        'telAdsl'        => 'tel_adsl',
        'refDemand'      => 'ref_demand',
        'cinClient'      => 'cin_client',
        'gsmClient'      => 'gsm_client',
        'statutCrm'      => 'statut_crm',
        'statutTt'       => 'statut_tt',
        'auditStatus'    => 'audit_status',
        'dateCreation'   => 'date_creation',
        'dateResolution' => 'date_resolution',
        'assignedTo'     => 'assigned_to',
        'prospectId'     => 'prospect_id',
        'contractId'     => 'contract_id',
        'subject'        => 'description',
    ];
    foreach ($aliasMap as $camel => $snake) {
        if (array_key_exists($camel, $in) && !array_key_exists($snake, $in)) {
            $in[$snake] = $in[$camel];
        }
    }
    $p = [];
    $map = [
        'prospect_id' => 64,
        'contract_id' => 64,
        'tel_adsl'    => 32,
        'ref_demand'  => 64,
        'cin_client'  => 32,
        'gsm_client'  => 32,
        'client_name' => 160,
        'description' => 65535,
        'statut_crm'  => 80,
        'statut_tt'   => 80,
        'localisation'=> 160,
        'etat'        => 80,
        'remarques'   => 65535,
        'assigned_to' => 80,
    ];
    foreach ($map as $k => $max) {
        if (array_key_exists($k, $in)) $p[$k] = rec_clean_str($in[$k], $max);
    }
    if (array_key_exists('service',      $in)) $p['service']      = rec_service($in['service']);
    if (array_key_exists('audit_status', $in)) $p['audit_status'] = rec_audit($in['audit_status']);
    if (array_key_exists('priority',     $in)) $p['priority']     = rec_priority($in['priority']);
    if (array_key_exists('date_creation', $in)) {
        $d = rec_datetime($in['date_creation']);
        if ($d) $p['date_creation'] = $d;
    }
    if (array_key_exists('date_resolution', $in)) {
        $p['date_resolution'] = rec_datetime($in['date_resolution']);
    }
    if (($p['audit_status'] ?? null) === 'resolu' && empty($p['date_resolution']) && !$forUpdate) {
        $p['date_resolution'] = date('Y-m-d H:i:s');
    }
    return $p;
}
function rec_fetch(PDO $db, int $id): ?array {
    $s = $db->prepare('SELECT * FROM extraneterp_reclamations WHERE id = :id LIMIT 1');
    $s->execute([':id' => $id]);
    $r = $s->fetch();
    return $r ? rec_row($r) : null;
}

/* ------------------------------------------------------------------ GET */
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $r = rec_fetch($db, (int)$_GET['id']);
        if (!$r) fail('Réclamation introuvable', 404);
        ok(['reclamation' => $r]);
    }
    $where = [];
    $args  = [];
    foreach ([
        'tel'         => 'tel_adsl',
        'cin'         => 'cin_client',
        'gsm'         => 'gsm_client',
        'ref'         => 'ref_demand',
        'prospect_id' => 'prospect_id',
        'contract_id' => 'contract_id',
    ] as $param => $col) {
        if (!empty($_GET[$param])) {
            $where[] = "$col = :$param";
            $args[":$param"] = trim((string)$_GET[$param]);
        }
    }
    if (!empty($_GET['service']) && in_array($_GET['service'], REC_SERVICES, true)) {
        $where[] = 'service = :service';
        $args[':service'] = $_GET['service'];
    }
    if (!empty($_GET['audit_status']) && in_array($_GET['audit_status'], REC_AUDIT, true)) {
        $where[] = 'audit_status = :audit';
        $args[':audit'] = $_GET['audit_status'];
    }
    if (!empty($_GET['mois']))  { $where[] = 'mois = :mois';   $args[':mois']  = (int)$_GET['mois']; }
    if (!empty($_GET['annee'])) { $where[] = 'annee = :annee'; $args[':annee'] = (int)$_GET['annee']; }
    if (!empty($_GET['date_from'])) { $where[] = 'date_creation >= :df'; $args[':df'] = rec_datetime($_GET['date_from']); }
    if (!empty($_GET['date_to']))   { $where[] = 'date_creation <= :dt'; $args[':dt'] = rec_datetime($_GET['date_to']); }
    if (!empty($_GET['q'])) {
        $where[] = '(reference LIKE :q OR client_name LIKE :q OR description LIKE :q OR remarques LIKE :q OR tel_adsl LIKE :q OR gsm_client LIKE :q)';
        $args[':q'] = '%' . trim($_GET['q']) . '%';
    }
    if (!rec_can_manage($me)) {
        $where[] = '(assigned_to = :me OR created_by = :me2)';
        $args[':me']  = $me['username'];
        $args[':me2'] = $me['username'];
    }
    $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';
    $limit  = max(1, min(500, (int)($_GET['limit']  ?? 200)));
    $offset = max(0, (int)($_GET['offset'] ?? 0));

    $cnt = $db->prepare("SELECT COUNT(*) FROM extraneterp_reclamations $whereSql");
    $cnt->execute($args);
    $total = (int)$cnt->fetchColumn();

    $sql = "SELECT * FROM extraneterp_reclamations $whereSql
            ORDER BY date_creation DESC, id DESC
            LIMIT $limit OFFSET $offset";
    $s = $db->prepare($sql);
    $s->execute($args);
    $rows = array_map('rec_row', $s->fetchAll());

    ok(['reclamations' => $rows, 'total' => $total]);
}

/* ------------------------------------------------------------------ POST */
if ($method === 'POST') {
    $in = json_input();
    $payload = rec_payload($in, false);
    if (empty($payload['date_creation'])) $payload['date_creation'] = date('Y-m-d H:i:s');
    $payload['service']      = $payload['service']      ?? 'Technique';
    $payload['audit_status'] = $payload['audit_status'] ?? 'en_cours';
    $payload['priority']     = $payload['priority']     ?? 'normal';
    $payload['created_by']   = $me['username'];
    $payload['reference']    = rec_generate_reference($db, $payload['date_creation']);

    $cols = array_keys($payload);
    $placeholders = array_map(fn($c) => ':' . $c, $cols);
    $sql = 'INSERT INTO extraneterp_reclamations (' . implode(',', $cols)
         . ') VALUES (' . implode(',', $placeholders) . ')';
    $st = $db->prepare($sql);
    $args = [];
    foreach ($payload as $k => $v) $args[':' . $k] = $v;
    $st->execute($args);
    $id = (int)$db->lastInsertId();
    ok(['reclamation' => rec_fetch($db, $id)], 201);
}

/* ------------------------------------------------------------------ PATCH */
if ($method === 'PATCH') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) fail('id requis', 422);
    $existing = rec_fetch($db, $id);
    if (!$existing) fail('Réclamation introuvable', 404);

    $isOwner = ($existing['assigned_to'] === ($me['username'] ?? '')
             || $existing['created_by'] === ($me['username'] ?? ''));
    if (!rec_can_manage($me) && !$isOwner) fail('Accès refusé', 403);

    $payload = rec_payload(json_input(), true);
    if (!$payload) fail('Aucune modification', 422);

    if (($payload['audit_status'] ?? null) === 'resolu'
        && empty($payload['date_resolution'])
        && empty($existing['date_resolution'])) {
        $payload['date_resolution'] = date('Y-m-d H:i:s');
    }
    $sets = [];
    $args = [':id' => $id];
    foreach ($payload as $k => $v) {
        $sets[] = "$k = :$k";
        $args[":$k"] = $v;
    }
    $sql = 'UPDATE extraneterp_reclamations SET ' . implode(', ', $sets) . ' WHERE id = :id';
    $db->prepare($sql)->execute($args);
    ok(['reclamation' => rec_fetch($db, $id)]);
}

/* ------------------------------------------------------------------ DELETE */
if ($method === 'DELETE') {
    if (!rec_can_manage($me)) fail('Accès refusé', 403);
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) fail('id requis', 422);
    $s = $db->prepare('DELETE FROM extraneterp_reclamations WHERE id = :id');
    $s->execute([':id' => $id]);
    ok(['deleted' => $s->rowCount()]);
}

fail('Method not allowed', 405);
