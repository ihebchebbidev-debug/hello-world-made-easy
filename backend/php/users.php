<?php
require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
ensure_app_role_enums($db);
$method = $_SERVER['REQUEST_METHOD'];

function row_to_user(array $u): array {
    return [
        'id'        => $u['id'],
        'username'  => $u['username'],
        'fullName'  => $u['full_name'],
        'email'     => $u['email'],
        'role'      => $u['role'],
        'team'      => $u['team'],
        'active'    => (bool)$u['active'],
    ];
}

if ($method === 'GET') {
    // Aggregate leadsHandled / contractsWon / conversionRate from extraneterp_prospects.
    $sql = "
        SELECT u.*,
          COALESCE(p.handled, 0) AS leads_handled,
          COALESCE(p.won, 0)     AS contracts_won
        FROM extraneterp_users u
        LEFT JOIN (
          SELECT assigned_to,
                 COUNT(*)                                    AS handled,
                 SUM(CASE WHEN outcome='won' THEN 1 ELSE 0 END) AS won
          FROM extraneterp_prospects WHERE assigned_to IS NOT NULL GROUP BY assigned_to
        ) p ON p.assigned_to = u.username
        ORDER BY u.full_name
    ";
    $rows = $db->query($sql)->fetchAll();
    $extraneterp_users = array_map(function ($u) {
        $base = row_to_user($u);
        $handled = (int)$u['leads_handled'];
        $won = (int)$u['contracts_won'];
        $conv = $handled > 0 ? round(($won / $handled) * 100, 1) : 0.0;
        $base['leadsHandled'] = $handled;
        $base['contractsWon'] = $won;
        $base['conversionRate'] = $conv;
        return $base;
    }, $rows);
    ok(['users' => $extraneterp_users]);
}

if ($method === 'POST') {
    require_auth(['Administrateur']);
    $in = json_input();
    $rows = $in['rows'] ?? [$in];
    $added = 0; $updated = 0; $skipped = 0;
    $allowedRole = extraneterp_all_roles();

    foreach ($rows as $r) {
        $username = trim($r['username'] ?? '');
        $fullName = trim($r['fullName'] ?? '');
        if ($username === '' || $fullName === '') { $skipped++; continue; }

        $roleIn = trim((string)($r['role'] ?? ''));
        $role = in_array($roleIn, $allowedRole, true) ? $roleIn : 'Agent';
        $email = trim($r['email'] ?? ($username . '@protection.fr'));
        $team  = $r['team'] ?? 'Lead-Actifs';
        $activeIn = $r['active'] ?? true;
        $active = filter_var($activeIn, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($active === null) $active = true;
        $active = $active ? 1 : 0;

        $exists = $db->prepare('SELECT id FROM extraneterp_users WHERE username = :u');
        $exists->execute([':u' => $username]);
        $existingId = $exists->fetchColumn();

        if ($existingId) {
            $u = $db->prepare('UPDATE extraneterp_users SET full_name=:fn, email=:em, role=:r, team=:t, active=:a WHERE id=:id');
            $u->execute([':fn'=>$fullName, ':em'=>$email, ':r'=>$role, ':t'=>$team, ':a'=>$active, ':id'=>$existingId]);
            $updated++;
        } else {
            $id = $r['id'] ?? ('U-' . substr(bin2hex(random_bytes(6)), 0, 8));
            $tempPwd = $r['password'] ?? bin2hex(random_bytes(6));
            $hash = password_hash($tempPwd, PASSWORD_BCRYPT);
            $i = $db->prepare('INSERT INTO extraneterp_users (id,username,full_name,email,password_hash,role,team,active)
                               VALUES (:id,:u,:fn,:em,:p,:r,:t,:a)');
            $i->execute([':id'=>$id, ':u'=>$username, ':fn'=>$fullName, ':em'=>$email,
                         ':p'=>$hash, ':r'=>$role, ':t'=>$team, ':a'=>$active]);
            $added++;
        }
    }
    ok(['added'=>$added, 'updated'=>$updated, 'skipped'=>$skipped]);
}

if ($method === 'DELETE') {
    require_auth(['Administrateur']);
    $id = $_GET['id'] ?? '';
    if (!$id) fail('id requis', 422);
    $s = $db->prepare('DELETE FROM extraneterp_users WHERE id = :id');
    $s->execute([':id' => $id]);
    ok(['deleted' => $s->rowCount()]);
}

fail('Method not allowed', 405);
