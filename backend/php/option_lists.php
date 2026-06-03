<?php
// =====================================================================
// Protection ERP — Generic dynamic option lists for select fields.
//
// Used for editable dropdowns in prospects/contracts forms:
//   entity ∈ {prospect, contract}
//   field   = column slug (source, regime, civility, partner, product,
//             cabinet, debit_type, termination_type, lost_reason, ...)
//
// Endpoints (auth required):
//   GET    option_lists.php?entity=...&field=...
//          → { options: [{id,value,position}, ...] }
//   GET    option_lists.php?entity=...
//          → { fields: { field: [...], ... } }
//   GET    option_lists.php
//          → { prospect: {field:[...]}, contract: {field:[...]} }
//   POST   option_lists.php  body: {entity, field, value, position?}     [admin/manager]
//   PATCH  option_lists.php  body: {id, value?, position?}               [admin/manager]
//   DELETE option_lists.php?id=...&force=0|1                             [admin]
// =====================================================================

require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// ---- Self-heal: create table if migration not yet applied -----------
$db->exec("CREATE TABLE IF NOT EXISTS extraneterp_option_lists (
  id         VARCHAR(40)  NOT NULL PRIMARY KEY,
  entity     ENUM('prospect','contract') NOT NULL,
  field      VARCHAR(60)  NOT NULL,
  value      VARCHAR(160) NOT NULL,
  position   INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_opt_entity_field_value (entity, field, value),
  KEY idx_opt_entity_field (entity, field, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Per-(entity,field) edit permissions. Administrateur is always allowed
// implicitly; this table only stores the *additional* roles allowed to
// add/rename/reorder options. Delete remains Administrateur-only.
$db->exec("CREATE TABLE IF NOT EXISTS extraneterp_option_field_perms (
  entity ENUM('prospect','contract') NOT NULL,
  field  VARCHAR(60)  NOT NULL,
  role   VARCHAR(40)  NOT NULL,
  PRIMARY KEY (entity, field, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// ---- Permission helpers ---------------------------------------------
function perms_get_all(PDO $db): array {
    $rows = $db->query('SELECT entity, field, role FROM extraneterp_option_field_perms')->fetchAll();
    $out = [];
    foreach ($rows as $r) {
        $k = $r['entity'] . ':' . $r['field'];
        $out[$k][] = $r['role'];
    }
    return $out;
}
function perms_roles_for(PDO $db, string $entity, string $field): array {
    $s = $db->prepare('SELECT role FROM extraneterp_option_field_perms WHERE entity = :e AND field = :f');
    $s->execute([':e' => $entity, ':f' => $field]);
    return array_map(fn($r) => $r['role'], $s->fetchAll());
}
function can_edit_field(PDO $db, array $me, string $entity, string $field): bool {
    if (($me['role'] ?? '') === 'Administrateur') return true;
    return in_array($me['role'] ?? '', perms_roles_for($db, $entity, $field), true);
}

// ---- Map (entity,field) → DB column for cascading rename ------------
function cascade_target(string $entity, string $field): ?array {
    $map = [
        'prospect' => [
            'source'           => ['extraneterp_prospects', 'source'],
            'regime'           => ['extraneterp_prospects', 'regime'],
            'civility'         => ['extraneterp_prospects', 'civility'],
            'lost_reason'      => ['extraneterp_prospects', 'lost_reason'],
            'current_mutuelle' => ['extraneterp_prospects', 'current_mutuelle'],
        ],
        'contract' => [
            'source'           => ['extraneterp_contracts', 'source'],
            'regime'           => ['extraneterp_contracts', 'regime'],
            'civility'         => ['extraneterp_contracts', 'civility'],
            'partner'          => ['extraneterp_contracts', 'partner'],
            'product'          => ['extraneterp_contracts', 'product'],
            'cabinet'          => ['extraneterp_contracts', 'cabinet'],
            'debit_type'       => ['extraneterp_contracts', 'debit_type'],
            'termination_type' => ['extraneterp_contracts', 'termination_type'],
            'spouse_civility'  => ['extraneterp_contracts', 'spouse_civility'],
        ],
    ];
    return $map[$entity][$field] ?? null;
}
function table_has_column(PDO $db, string $table, string $col): bool {
    try {
        $s = $db->prepare("SELECT 1 FROM information_schema.columns
                           WHERE table_schema = DATABASE() AND table_name = :t AND column_name = :c LIMIT 1");
        $s->execute([':t' => $table, ':c' => $col]);
        return (bool)$s->fetchColumn();
    } catch (\Throwable $e) { return false; }
}

function valid_field(string $f): bool {
    return (bool)preg_match('/^[a-z][a-z0-9_]{0,59}$/', $f);
}
function valid_entity(string $e): bool {
    return $e === 'prospect' || $e === 'contract';
}
function row_to_option(array $r): array {
    return [
        'id'       => $r['id'],
        'entity'   => $r['entity'],
        'field'    => $r['field'],
        'value'    => $r['value'],
        'position' => (int)$r['position'],
    ];
}

if ($method === 'GET') {
    $entity = $_GET['entity'] ?? '';
    $field  = $_GET['field']  ?? '';
    $action = $_GET['action'] ?? '';
    if ($entity !== '' && !valid_entity($entity)) fail('entity invalide', 422);
    if ($field  !== '' && !valid_field($field))   fail('field invalide', 422);

    if ($action === 'perms') {
        ok(['perms' => perms_get_all($db)]);
    }

    if ($entity && $field) {
        $s = $db->prepare('SELECT * FROM extraneterp_option_lists
                           WHERE entity = :e AND field = :f ORDER BY position, value');
        $s->execute([':e' => $entity, ':f' => $field]);
        ok(['options' => array_map('row_to_option', $s->fetchAll())]);
    }
    if ($entity) {
        $s = $db->prepare('SELECT * FROM extraneterp_option_lists
                          WHERE entity = :e ORDER BY field, position, value');
        $s->execute([':e' => $entity]);
        $out = [];
        foreach ($s->fetchAll() as $r) $out[$r['field']][] = row_to_option($r);
        ok(['fields' => $out]);
    }
    $rows = $db->query('SELECT * FROM extraneterp_option_lists
                        ORDER BY entity, field, position, value')->fetchAll();
    $grouped = ['prospect' => [], 'contract' => []];
    foreach ($rows as $r) $grouped[$r['entity']][$r['field']][] = row_to_option($r);
    ok($grouped);
}

if ($method === 'POST') {
    $in     = json_input();
    $action = (string)($in['action'] ?? '');

    // Admin-only: set the roles authorised to edit a given (entity,field).
    if ($action === 'set_perms') {
        require_auth(['Administrateur']);
        $entity = (string)($in['entity'] ?? '');
        $field  = strtolower(trim((string)($in['field'] ?? '')));
        $roles  = $in['roles'] ?? [];
        if (!valid_entity($entity)) fail('entity invalide', 422);
        if (!valid_field($field))   fail('field invalide', 422);
        if (!is_array($roles))      fail('roles doit être un tableau', 422);
        $allowed = ['Manager', 'Superviseur', 'Agent', 'Vendeur', 'Qualificateur', 'Backoffice'];
        $clean   = array_values(array_intersect($allowed, array_map('strval', $roles)));
        $db->beginTransaction();
        try {
            $db->prepare('DELETE FROM extraneterp_option_field_perms WHERE entity = :e AND field = :f')
               ->execute([':e' => $entity, ':f' => $field]);
            $ins = $db->prepare('INSERT INTO extraneterp_option_field_perms (entity,field,role) VALUES (:e,:f,:r)');
            foreach ($clean as $r) $ins->execute([':e' => $entity, ':f' => $field, ':r' => $r]);
            $db->commit();
        } catch (\Throwable $e) { $db->rollBack(); fail('Erreur: ' . $e->getMessage(), 500); }
        ok(['roles' => $clean]);
    }

    $entity = (string)($in['entity'] ?? '');
    $field  = strtolower(trim((string)($in['field'] ?? '')));
    $value  = trim((string)($in['value'] ?? ''));
    $pos    = (int)($in['position'] ?? 0);
    if (!valid_entity($entity)) fail('entity invalide', 422);
    if (!valid_field($field))   fail('field invalide', 422);
    if (!can_edit_field($db, $me, $entity, $field)) fail('Non autorisé pour cette liste', 403);
    if ($value === '') fail('value requis', 422);
    if (mb_strlen($value) > 160) fail('value trop long (max 160)', 422);
    $id = 'OL-' . substr(bin2hex(random_bytes(8)), 0, 12);
    try {
        $s = $db->prepare('INSERT INTO extraneterp_option_lists (id,entity,field,value,position)
                           VALUES (:id,:e,:f,:v,:p)');
        $s->execute([':id'=>$id, ':e'=>$entity, ':f'=>$field, ':v'=>$value, ':p'=>$pos]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') fail('Option déjà existante', 409);
        fail('Erreur: ' . $e->getMessage(), 500);
    }
    ok(['option' => ['id'=>$id, 'entity'=>$entity, 'field'=>$field, 'value'=>$value, 'position'=>$pos]], 201);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $in = json_input();
    $id = $in['id'] ?? ($_GET['id'] ?? '');
    if (!$id) fail('id requis', 422);

    $cur = $db->prepare('SELECT * FROM extraneterp_option_lists WHERE id = :id');
    $cur->execute([':id' => $id]);
    $existing = $cur->fetch();
    if (!$existing) fail('Option introuvable', 404);
    if (!can_edit_field($db, $me, $existing['entity'], $existing['field'])) {
        fail('Non autorisé pour cette liste', 403);
    }

    $sets = []; $params = [':id' => $id]; $renameTo = null;
    if (array_key_exists('value', $in)) {
        $v = trim((string)$in['value']);
        if ($v === '') fail('value requis', 422);
        if (mb_strlen($v) > 160) fail('value trop long', 422);
        $sets[] = 'value = :v'; $params[':v'] = $v;
        if ($v !== $existing['value']) $renameTo = $v;
    }
    if (array_key_exists('position', $in)) {
        $sets[] = 'position = :p'; $params[':p'] = (int)$in['position'];
    }
    if (!$sets) fail('Aucun champ à mettre à jour', 422);

    try {
        $db->beginTransaction();
        $db->prepare('UPDATE extraneterp_option_lists SET ' . implode(', ', $sets) . ' WHERE id = :id')->execute($params);
        if ($renameTo !== null) {
            $target = cascade_target($existing['entity'], $existing['field']);
            if ($target && table_has_column($db, $target[0], $target[1])) {
                $u = $db->prepare("UPDATE {$target[0]} SET {$target[1]} = :n WHERE {$target[1]} = :o");
                $u->execute([':n' => $renameTo, ':o' => $existing['value']]);
            }
        }
        $db->commit();
    } catch (\Throwable $e) {
        $db->rollBack();
        if ($e instanceof PDOException && $e->getCode() === '23000') fail('Option déjà existante', 409);
        fail('Erreur: ' . $e->getMessage(), 500);
    }
    ok(['updated' => true]);
}

if ($method === 'DELETE') {
    require_auth(['Administrateur']);
    $id    = $_GET['id'] ?? '';
    $force = !empty($_GET['force']);
    if (!$id) fail('id requis', 422);

    $cur = $db->prepare('SELECT * FROM extraneterp_option_lists WHERE id = :id');
    $cur->execute([':id' => $id]);
    $opt = $cur->fetch();
    if (!$opt) fail('Option introuvable', 404);

    if (!$force) {
        $target = cascade_target($opt['entity'], $opt['field']);
        if ($target && table_has_column($db, $target[0], $target[1])) {
            $c = $db->prepare("SELECT COUNT(*) FROM {$target[0]} WHERE {$target[1]} = :v");
            $c->execute([':v' => $opt['value']]);
            $n = (int)$c->fetchColumn();
            if ($n > 0) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'message' => "Option utilisée par $n enregistrement(s). Renommez-les ou utilisez force=1.",
                    'inUse'   => $n,
                ]);
                exit;
            }
        }
    }
    $d = $db->prepare('DELETE FROM extraneterp_option_lists WHERE id = :id');
    $d->execute([':id' => $id]);
    ok(['deleted' => $d->rowCount()]);
}

fail('Method not allowed', 405);
