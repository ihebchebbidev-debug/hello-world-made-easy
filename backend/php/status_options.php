<?php
// =====================================================================
// Protection ERP — Dynamic status options for prospects & contracts.
//
// Endpoints (auth required):
//   GET    status_options.php?entity=prospect|contract
//          → { options: [{id,value,color,position}, ...] } (ordered)
//          (omit entity to get both, grouped: { prospect:[], contract:[] })
//   POST   status_options.php  body: {entity, value, color?, position?}  [admin/manager]
//   PATCH  status_options.php  body: {id, value?, color?, position?}     [admin/manager]
//   DELETE status_options.php?id=...                                     [admin]
//          Refuses to delete a value still referenced by live data
//          (use ?force=1 to bypass — leaves rows with the orphaned label).
// =====================================================================

require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// ---- Self-heal: create table if migration was not yet applied ----
$db->exec("CREATE TABLE IF NOT EXISTS extraneterp_status_options (
  id        VARCHAR(40)  NOT NULL PRIMARY KEY,
  entity    ENUM('prospect','contract') NOT NULL,
  value     VARCHAR(120) NOT NULL,
  color     VARCHAR(20)  NOT NULL DEFAULT 'muted',
  position  INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_status_entity_value (entity, value),
  KEY idx_status_entity (entity, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

function row_to_option(array $r): array {
    return [
        'id'       => $r['id'],
        'entity'   => $r['entity'],
        'value'    => $r['value'],
        'color'    => $r['color'],
        'position' => (int)$r['position'],
    ];
}

if ($method === 'GET') {
    $entity = $_GET['entity'] ?? '';
    if ($entity === 'prospect' || $entity === 'contract') {
        $s = $db->prepare('SELECT * FROM extraneterp_status_options WHERE entity = :e ORDER BY position, value');
        $s->execute([':e' => $entity]);
        ok(['options' => array_map('row_to_option', $s->fetchAll())]);
    }
    $rows = $db->query('SELECT * FROM extraneterp_status_options ORDER BY entity, position, value')->fetchAll();
    $grouped = ['prospect' => [], 'contract' => []];
    foreach ($rows as $r) $grouped[$r['entity']][] = row_to_option($r);
    ok($grouped);
}

if ($method === 'POST') {
    require_auth(['Administrateur', 'Manager']);
    $in     = json_input();
    $entity = $in['entity'] ?? '';
    $value  = trim((string)($in['value'] ?? ''));
    $color  = trim((string)($in['color'] ?? 'muted')) ?: 'muted';
    $pos    = (int)($in['position'] ?? 0);
    if (!in_array($entity, ['prospect', 'contract'], true)) fail('entity invalide', 422);
    if ($value === '') fail('value requis', 422);
    if (mb_strlen($value) > 120) fail('value trop long (max 120)', 422);
    if (!preg_match('/^[a-z][a-z0-9_-]{0,19}$/i', $color)) fail('color invalide', 422);
    $prefix = $entity === 'prospect' ? 'PS' : 'CS';
    $id = $prefix . '-' . substr(bin2hex(random_bytes(6)), 0, 8);
    try {
        $s = $db->prepare('INSERT INTO extraneterp_status_options (id,entity,value,color,position) VALUES (:id,:e,:v,:c,:p)');
        $s->execute([':id' => $id, ':e' => $entity, ':v' => $value, ':c' => $color, ':p' => $pos]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') fail('Statut déjà existant', 409);
        fail('Erreur: ' . $e->getMessage(), 500);
    }
    ok(['option' => ['id' => $id, 'entity' => $entity, 'value' => $value, 'color' => $color, 'position' => $pos]], 201);
}

if ($method === 'PUT' || $method === 'PATCH') {
    require_auth(['Administrateur', 'Manager']);
    $in = json_input();
    $id = $in['id'] ?? ($_GET['id'] ?? '');
    if (!$id) fail('id requis', 422);

    // Load to know the entity + old value (for cascading rename to live data).
    $cur = $db->prepare('SELECT * FROM extraneterp_status_options WHERE id = :id');
    $cur->execute([':id' => $id]);
    $existing = $cur->fetch();
    if (!$existing) fail('Statut introuvable', 404);

    $sets = []; $params = [':id' => $id]; $renameTo = null;
    if (array_key_exists('value', $in)) {
        $v = trim((string)$in['value']);
        if ($v === '') fail('value requis', 422);
        if (mb_strlen($v) > 120) fail('value trop long', 422);
        $sets[] = 'value = :v'; $params[':v'] = $v;
        if ($v !== $existing['value']) $renameTo = $v;
    }
    if (array_key_exists('color', $in)) {
        $c = trim((string)$in['color']) ?: 'muted';
        if (!preg_match('/^[a-z][a-z0-9_-]{0,19}$/i', $c)) fail('color invalide', 422);
        $sets[] = 'color = :c'; $params[':c'] = $c;
    }
    if (array_key_exists('position', $in)) {
        $sets[] = 'position = :p'; $params[':p'] = (int)$in['position'];
    }
    if (!$sets) fail('Aucun champ à mettre à jour', 422);

    try {
        $db->beginTransaction();
        $db->prepare('UPDATE extraneterp_status_options SET ' . implode(', ', $sets) . ' WHERE id = :id')->execute($params);

        // Cascade rename to live data so existing rows keep matching their label.
        if ($renameTo !== null) {
            if ($existing['entity'] === 'prospect') {
                $u = $db->prepare('UPDATE extraneterp_prospects SET status = :n WHERE status = :o');
                $u->execute([':n' => $renameTo, ':o' => $existing['value']]);
            } else {
                $u = $db->prepare('UPDATE extraneterp_contracts SET billing_status = :n WHERE billing_status = :o');
                $u->execute([':n' => $renameTo, ':o' => $existing['value']]);
            }
        }
        $db->commit();
    } catch (\Throwable $e) {
        $db->rollBack();
        if ($e instanceof PDOException && $e->getCode() === '23000') fail('Statut déjà existant', 409);
        fail('Erreur: ' . $e->getMessage(), 500);
    }
    ok(['updated' => true]);
}

if ($method === 'DELETE') {
    require_auth(['Administrateur']);
    $id    = $_GET['id'] ?? '';
    $force = !empty($_GET['force']);
    if (!$id) fail('id requis', 422);

    $cur = $db->prepare('SELECT * FROM extraneterp_status_options WHERE id = :id');
    $cur->execute([':id' => $id]);
    $opt = $cur->fetch();
    if (!$opt) fail('Statut introuvable', 404);

    if (!$force) {
        if ($opt['entity'] === 'prospect') {
            $c = $db->prepare('SELECT COUNT(*) FROM extraneterp_prospects WHERE status = :v');
            $c->execute([':v' => $opt['value']]);
        } else {
            $c = $db->prepare('SELECT COUNT(*) FROM extraneterp_contracts WHERE billing_status = :v');
            $c->execute([':v' => $opt['value']]);
        }
        $n = (int)$c->fetchColumn();
        if ($n > 0) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => "Statut utilisé par $n enregistrement(s). Renommez-les ou utilisez force=1.",
                'inUse'   => $n,
            ]);
            exit;
        }
    }

    $d = $db->prepare('DELETE FROM extraneterp_status_options WHERE id = :id');
    $d->execute([':id' => $id]);
    ok(['deleted' => $d->rowCount()]);
}

fail('Method not allowed', 405);
