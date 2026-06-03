<?php
require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $rows = $db->query('SELECT * FROM extraneterp_lead_stages ORDER BY position, id')->fetchAll();
    ok(['stages' => array_map(fn($r) => [
        'id'=>$r['id'],'name'=>$r['name'],'color'=>$r['color'],'position'=>(int)$r['position']
    ], $rows)]);
}

if ($method === 'POST') {
    require_auth(['Administrateur','Manager']);
    $in = json_input();
    $name = trim($in['name'] ?? '');
    if ($name === '') fail('name requis', 422);
    $color = $in['color'] ?? 'muted';
    $pos = (int)($in['position'] ?? 0);
    $id = 'S-' . substr(bin2hex(random_bytes(6)), 0, 8);
    try {
        $s = $db->prepare('INSERT INTO extraneterp_lead_stages (id,name,color,position) VALUES (:id,:n,:c,:p)');
        $s->execute([':id'=>$id, ':n'=>$name, ':c'=>$color, ':p'=>$pos]);
        ok(['stage' => ['id'=>$id,'name'=>$name,'color'=>$color,'position'=>$pos]], 201);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') fail('Étape déjà existante', 409);
        fail('Erreur: ' . $e->getMessage(), 500);
    }
}

if ($method === 'PUT' || $method === 'PATCH') {
    require_auth(['Administrateur','Manager']);
    $in = json_input();
    $id = $in['id'] ?? ($_GET['id'] ?? '');
    if (!$id) fail('id requis', 422);
    $sets = []; $params = [':id'=>$id];
    foreach (['name'=>'name','color'=>'color','position'=>'position'] as $k=>$col) {
        if (!array_key_exists($k,$in)) continue;
        $v = $k==='position' ? (int)$in[$k] : $in[$k];
        $sets[] = "$col = :$k"; $params[":$k"] = $v;
    }
    if (!$sets) fail('Aucun champ', 422);
    $db->prepare('UPDATE extraneterp_lead_stages SET '.implode(', ',$sets).' WHERE id = :id')->execute($params);
    ok(['message' => 'Étape mise à jour']);
}

if ($method === 'DELETE') {
    require_auth(['Administrateur']);
    $id = $_GET['id'] ?? '';
    if (!$id) fail('id requis', 422);
    $s = $db->prepare('DELETE FROM extraneterp_lead_stages WHERE id = :id');
    $s->execute([':id'=>$id]);
    ok(['deleted' => $s->rowCount()]);
}

fail('Method not allowed', 405);
