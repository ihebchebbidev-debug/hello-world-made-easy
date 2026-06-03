<?php
require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
ensure_app_role_enums($db);
$method = $_SERVER['REQUEST_METHOD'];
$ROLES = extraneterp_all_roles();

if ($method === 'GET') {
    $rows = $db->query('SELECT role, permission, enabled FROM extraneterp_role_permissions')->fetchAll();
    $out = [];
    foreach ($ROLES as $r) $out[$r] = [];
    foreach ($rows as $r) $out[$r['role']][$r['permission']] = (bool)$r['enabled'];
    ok(['permissions' => $out]);
}

if ($method === 'PUT') {
    require_auth(['Administrateur']);
    $in = json_input();
    $role = $in['role'] ?? '';
    $perms = $in['permissions'] ?? [];
    if (!in_array($role, $ROLES, true)) fail('Rôle invalide', 422);
    if (!is_array($perms)) fail('permissions invalide', 422);

    $db->beginTransaction();
    try {
        $del = $db->prepare('DELETE FROM extraneterp_role_permissions WHERE role = :r');
        $del->execute([':r' => $role]);
        $ins = $db->prepare('INSERT INTO extraneterp_role_permissions (role,permission,enabled) VALUES (:r,:p,:e)');
        foreach ($perms as $key => $val) {
            $ins->execute([':r' => $role, ':p' => (string)$key, ':e' => $val ? 1 : 0]);
        }
        $db->commit();
        ok(['message' => 'Permissions mises à jour']);
    } catch (Throwable $e) {
        $db->rollBack();
        fail('Erreur: ' . $e->getMessage(), 500);
    }
}

fail('Method not allowed', 405);
