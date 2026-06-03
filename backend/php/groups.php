<?php
// =====================================================================
// Protection ERP — User groups (équipes)
//
// Endpoints (auth required):
//   GET    groups.php                        -> { groups: ["Direction", ...] }
//   POST   groups.php  body: {name}          [admin]
//   PATCH  groups.php  body: {old, new}      [admin]   (cascades to users.team)
//   DELETE groups.php?name=...               [admin]   (refuse if team in use)
// =====================================================================

require_once __DIR__ . '/config.php';
$me     = require_auth();
$db     = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Self-heal table
$db->exec("CREATE TABLE IF NOT EXISTS extraneterp_groups (
  name       VARCHAR(80) NOT NULL PRIMARY KEY,
  position   INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Seed defaults on first call (only if table is empty)
$count = (int)$db->query('SELECT COUNT(*) FROM extraneterp_groups')->fetchColumn();
if ($count === 0) {
    $defaults = ['Direction', 'Lead-Actifs', 'Lead-Premium', 'Backoffice', 'TV'];
    $ins = $db->prepare('INSERT IGNORE INTO extraneterp_groups (name, position) VALUES (:n, :p)');
    foreach ($defaults as $i => $n) $ins->execute([':n' => $n, ':p' => $i]);
}

function list_groups(PDO $db): array {
    $rows = $db->query('SELECT name FROM extraneterp_groups ORDER BY position ASC, name ASC')->fetchAll();
    return array_map(fn($r) => $r['name'], $rows);
}

function valid_name(string $n): bool {
    $n = trim($n);
    return $n !== '' && mb_strlen($n) <= 80;
}

if ($method === 'GET') {
    ok(['groups' => list_groups($db)]);
}

if ($method === 'POST') {
    require_auth(['Administrateur']);
    $in   = json_input();
    $name = trim((string)($in['name'] ?? ''));
    if (!valid_name($name)) fail('Nom invalide', 422);

    $exists = $db->prepare('SELECT 1 FROM extraneterp_groups WHERE name = :n');
    $exists->execute([':n' => $name]);
    if ($exists->fetchColumn()) fail('Ce groupe existe déjà', 409);

    $maxPos = (int)$db->query('SELECT COALESCE(MAX(position), -1) + 1 FROM extraneterp_groups')->fetchColumn();
    $ins = $db->prepare('INSERT INTO extraneterp_groups (name, position) VALUES (:n, :p)');
    $ins->execute([':n' => $name, ':p' => $maxPos]);
    ok(['groups' => list_groups($db)]);
}

if ($method === 'PATCH') {
    require_auth(['Administrateur']);
    $in  = json_input();
    $old = trim((string)($in['old'] ?? ''));
    $new = trim((string)($in['new'] ?? ''));
    if (!valid_name($old) || !valid_name($new)) fail('Nom invalide', 422);
    if ($old === $new) ok(['groups' => list_groups($db)]);

    $exists = $db->prepare('SELECT 1 FROM extraneterp_groups WHERE name = :n');
    $exists->execute([':n' => $new]);
    if ($exists->fetchColumn()) fail('Le nouveau nom existe déjà', 409);

    $db->beginTransaction();
    try {
        $u = $db->prepare('UPDATE extraneterp_groups SET name = :new WHERE name = :old');
        $u->execute([':new' => $new, ':old' => $old]);
        // Cascade rename to users.team if column exists
        try {
            $cu = $db->prepare('UPDATE extraneterp_users SET team = :new WHERE team = :old');
            $cu->execute([':new' => $new, ':old' => $old]);
        } catch (Throwable $e) { /* users.team missing -> ignore */ }
        $db->commit();
    } catch (Throwable $e) {
        $db->rollBack();
        fail('Erreur: ' . $e->getMessage(), 500);
    }
    ok(['groups' => list_groups($db)]);
}

if ($method === 'DELETE') {
    require_auth(['Administrateur']);
    $name = trim((string)($_GET['name'] ?? ''));
    if (!valid_name($name)) fail('Nom invalide', 422);

    // Refuse deletion if any user still belongs to this group
    try {
        $c = $db->prepare('SELECT COUNT(*) FROM extraneterp_users WHERE team = :n');
        $c->execute([':n' => $name]);
        $used = (int)$c->fetchColumn();
        if ($used > 0) fail("Impossible : $used utilisateur(s) appartiennent encore à ce groupe", 409);
    } catch (Throwable $e) { /* users.team missing -> ignore */ }

    $d = $db->prepare('DELETE FROM extraneterp_groups WHERE name = :n');
    $d->execute([':n' => $name]);
    ok(['groups' => list_groups($db)]);
}

fail('Method not allowed', 405);
