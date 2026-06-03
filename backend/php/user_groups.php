<?php
// =====================================================================
// Protection ERP — User ↔ Group memberships (many-to-many)
//
// Endpoints (auth required):
//   GET  user_groups.php                       -> { memberships: { user_id: [group,...] } }
//   GET  user_groups.php?user_id=...           -> { user_id, groups: [name,...] }
//   PUT  user_groups.php  body: { user_id, groups: [name,...] }     [admin]
//        - Replaces full membership set for the user
//        - Auto-creates any group name that doesn't yet exist
//        - Also syncs extraneterp_users.team to the first group (primary)
// =====================================================================

require_once __DIR__ . '/config.php';
$me     = require_auth();
$db     = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Self-heal tables
$db->exec("CREATE TABLE IF NOT EXISTS extraneterp_groups (
  name       VARCHAR(80) NOT NULL PRIMARY KEY,
  position   INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$db->exec("CREATE TABLE IF NOT EXISTS extraneterp_user_groups (
  user_id    VARCHAR(40) NOT NULL,
  group_name VARCHAR(80) NOT NULL,
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, group_name),
  KEY idx_ug_group (group_name),
  KEY idx_ug_user  (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// One-time backfill if join table is empty but users have a team
$cnt = (int)$db->query('SELECT COUNT(*) FROM extraneterp_user_groups')->fetchColumn();
if ($cnt === 0) {
    try {
        $db->exec("INSERT IGNORE INTO extraneterp_groups (name, position)
                   SELECT DISTINCT team, 99 FROM extraneterp_users
                   WHERE team IS NOT NULL AND team <> ''");
        $db->exec("INSERT IGNORE INTO extraneterp_user_groups (user_id, group_name)
                   SELECT id, team FROM extraneterp_users
                   WHERE team IS NOT NULL AND team <> ''");
    } catch (Throwable $e) { /* users.team missing -> ignore */ }
}

function groups_for(PDO $db, string $userId): array {
    $s = $db->prepare(
        'SELECT ug.group_name
           FROM extraneterp_user_groups ug
           LEFT JOIN extraneterp_groups g ON g.name = ug.group_name
           WHERE ug.user_id = :u
           ORDER BY COALESCE(g.position, 9999) ASC, ug.group_name ASC'
    );
    $s->execute([':u' => $userId]);
    return array_map(fn($r) => $r['group_name'], $s->fetchAll());
}

if ($method === 'GET') {
    $userId = trim((string)($_GET['user_id'] ?? ''));
    if ($userId !== '') {
        ok(['user_id' => $userId, 'groups' => groups_for($db, $userId)]);
    }
    $rows = $db->query(
        'SELECT ug.user_id, ug.group_name
           FROM extraneterp_user_groups ug
           LEFT JOIN extraneterp_groups g ON g.name = ug.group_name
           ORDER BY COALESCE(g.position, 9999) ASC, ug.group_name ASC'
    )->fetchAll();
    $out = [];
    foreach ($rows as $r) {
        $uid = $r['user_id'];
        if (!isset($out[$uid])) $out[$uid] = [];
        $out[$uid][] = $r['group_name'];
    }
    ok(['memberships' => $out]);
}

if ($method === 'PUT') {
    require_auth(['Administrateur']);
    $in     = json_input();
    $userId = trim((string)($in['user_id'] ?? ''));
    $groups = $in['groups'] ?? [];
    if ($userId === '') fail('user_id requis', 422);
    if (!is_array($groups)) fail('groups doit être un tableau', 422);

    // Validate + dedupe + cap
    $clean = [];
    foreach ($groups as $g) {
        $n = trim((string)$g);
        if ($n === '' || mb_strlen($n) > 80) continue;
        if (!in_array($n, $clean, true)) $clean[] = $n;
    }
    if (count($clean) > 32) fail('Trop de groupes (max 32)', 422);

    // Ensure user exists
    $u = $db->prepare('SELECT id FROM extraneterp_users WHERE id = :id');
    $u->execute([':id' => $userId]);
    if (!$u->fetchColumn()) fail('Utilisateur introuvable', 404);

    $db->beginTransaction();
    try {
        // Auto-create missing groups in catalog
        if ($clean) {
            $maxPos = (int)$db->query('SELECT COALESCE(MAX(position), -1) FROM extraneterp_groups')->fetchColumn();
            $insG = $db->prepare('INSERT IGNORE INTO extraneterp_groups (name, position) VALUES (:n, :p)');
            foreach ($clean as $i => $n) $insG->execute([':n' => $n, ':p' => $maxPos + 1 + $i]);
        }
        // Replace memberships
        $del = $db->prepare('DELETE FROM extraneterp_user_groups WHERE user_id = :u');
        $del->execute([':u' => $userId]);
        if ($clean) {
            $ins = $db->prepare('INSERT INTO extraneterp_user_groups (user_id, group_name) VALUES (:u, :g)');
            foreach ($clean as $n) $ins->execute([':u' => $userId, ':g' => $n]);
        }
        // Sync primary team for backward compat
        try {
            $primary = $clean[0] ?? '';
            if ($primary !== '') {
                $up = $db->prepare('UPDATE extraneterp_users SET team = :t WHERE id = :id');
                $up->execute([':t' => $primary, ':id' => $userId]);
            }
        } catch (Throwable $e) { /* team column missing -> ignore */ }
        $db->commit();
    } catch (Throwable $e) {
        $db->rollBack();
        fail('Erreur: ' . $e->getMessage(), 500);
    }

    ok(['user_id' => $userId, 'groups' => groups_for($db, $userId)]);
}

fail('Method not allowed', 405);
