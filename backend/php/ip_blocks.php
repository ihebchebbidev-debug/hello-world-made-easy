<?php
// =====================================================================
// Protection ERP — Journal des tentatives bloquées par l'allowlist IP.
// GET    ?limit=200          → liste les blocages récents
// GET    ?stats=1            → agrégats (total, uniques IP, dernières 24h)
// DELETE ?id=N | ?all=1      → purge (admin)
// =====================================================================
require_once __DIR__ . '/config.php';
$me = require_auth(['Administrateur']); // réservé Admin
$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Idempotent: garantit l'existence même si aucune tentative n'a encore été loggée.
$db->exec('CREATE TABLE IF NOT EXISTS extraneterp_ip_blocks (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    ip          VARCHAR(64)  NOT NULL,
    username    VARCHAR(120) NULL,
    role        VARCHAR(40)  NULL,
    path        VARCHAR(200) NULL,
    user_agent  VARCHAR(200) NULL,
    attempted_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_ip_time   (ip, attempted_at),
    KEY idx_user_time (username, attempted_at),
    KEY idx_time      (attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

if ($method === 'GET') {
    if (!empty($_GET['stats'])) {
        $tot = (int)$db->query('SELECT COUNT(*) FROM extraneterp_ip_blocks')->fetchColumn();
        $d24 = (int)$db->query('SELECT COUNT(*) FROM extraneterp_ip_blocks WHERE attempted_at >= (NOW() - INTERVAL 1 DAY)')->fetchColumn();
        $uniq = (int)$db->query('SELECT COUNT(DISTINCT ip) FROM extraneterp_ip_blocks WHERE attempted_at >= (NOW() - INTERVAL 7 DAY)')->fetchColumn();
        ok(['total' => $tot, 'last24h' => $d24, 'uniqueIps7d' => $uniq]);
    }
    $limit = max(1, min(1000, (int)($_GET['limit'] ?? 200)));
    $s = $db->prepare("SELECT id, ip, username, role, path, user_agent, attempted_at
                       FROM extraneterp_ip_blocks
                       ORDER BY attempted_at DESC, id DESC
                       LIMIT $limit");
    $s->execute();
    $rows = array_map(function ($r) {
        return [
            'id'          => (int)$r['id'],
            'ip'          => $r['ip'],
            'username'    => $r['username'],
            'role'        => $r['role'],
            'path'        => $r['path'],
            'userAgent'   => $r['user_agent'],
            'attemptedAt' => $r['attempted_at'],
        ];
    }, $s->fetchAll());
    ok(['blocks' => $rows, 'count' => count($rows)]);
}

if ($method === 'DELETE') {
    if (!empty($_GET['all'])) {
        $n = $db->exec('DELETE FROM extraneterp_ip_blocks');
        ok(['deleted' => (int)$n]);
    }
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) fail('id ou all=1 requis', 422);
    $s = $db->prepare('DELETE FROM extraneterp_ip_blocks WHERE id = :id');
    $s->execute([':id' => $id]);
    ok(['deleted' => $s->rowCount()]);
}

fail('Method not allowed', 405);
