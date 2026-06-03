<?php
require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$ENTITIES = ['prospect','contract','user'];
$TYPES = ['text','textarea','number','date','boolean','select'];

function row_to_field(array $r): array {
    return [
        'id'       => $r['id'],
        'entity'   => $r['entity'],
        'key'      => $r['field_key'],
        'label'    => $r['label'],
        'type'     => $r['type'],
        'options'  => $r['options'] ? json_decode($r['options'], true) : [],
        'required' => (bool)$r['required'],
        'position' => (int)$r['position'],
    ];
}

if ($method === 'GET') {
    $entity = $_GET['entity'] ?? null;
    if ($entity && !in_array($entity, $ENTITIES, true)) fail('entity invalide', 422);
    if ($entity) {
        $s = $db->prepare('SELECT * FROM extraneterp_custom_fields WHERE entity = :e ORDER BY position, id');
        $s->execute([':e' => $entity]);
    } else {
        $s = $db->query('SELECT * FROM extraneterp_custom_fields ORDER BY entity, position, id');
    }
    ok(['fields' => array_map('row_to_field', $s->fetchAll())]);
}

if ($method === 'POST') {
    require_auth(['Administrateur','Manager']);
    $in = json_input();
    $entity = $in['entity'] ?? '';
    $label  = trim($in['label'] ?? '');
    $type   = $in['type'] ?? 'text';
    if (!in_array($entity, $ENTITIES, true)) fail('entity invalide', 422);
    if ($label === '') fail('label requis', 422);
    if (!in_array($type, $TYPES, true)) fail('type invalide', 422);
    $key = $in['key'] ?? preg_replace('/[^a-z0-9_]/', '_', strtolower($label));
    $key = trim($key, '_');
    if ($key === '') fail('key invalide', 422);
    $opts = isset($in['options']) && is_array($in['options']) ? json_encode(array_values($in['options'])) : null;
    $req  = !empty($in['required']) ? 1 : 0;
    $pos  = (int)($in['position'] ?? 0);
    $id   = 'F-' . substr(bin2hex(random_bytes(6)), 0, 10);
    try {
        $s = $db->prepare('INSERT INTO extraneterp_custom_fields (id,entity,field_key,label,type,options,required,position)
                           VALUES (:id,:e,:k,:l,:t,:o,:r,:p)');
        $s->execute([':id'=>$id, ':e'=>$entity, ':k'=>$key, ':l'=>$label, ':t'=>$type,
                     ':o'=>$opts, ':r'=>$req, ':p'=>$pos]);
        ok(['field' => ['id'=>$id,'entity'=>$entity,'key'=>$key,'label'=>$label,'type'=>$type,
                        'options'=>$opts?json_decode($opts,true):[],'required'=>(bool)$req,'position'=>$pos]], 201);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') fail('Une clé identique existe déjà pour cette entité', 409);
        fail('Erreur: ' . $e->getMessage(), 500);
    }
}

if ($method === 'PUT' || $method === 'PATCH') {
    require_auth(['Administrateur','Manager']);
    $in = json_input();
    $id = $in['id'] ?? ($_GET['id'] ?? '');
    if (!$id) fail('id requis', 422);
    $sets = []; $params = [':id' => $id];
    foreach (['label'=>'label','required'=>'required','position'=>'position','type'=>'type','options'=>'options'] as $k=>$col) {
        if (!array_key_exists($k, $in)) continue;
        $v = $in[$k];
        if ($k === 'type' && !in_array($v, $TYPES, true)) continue;
        if ($k === 'required') $v = $v ? 1 : 0;
        if ($k === 'options')  $v = is_array($v) ? json_encode(array_values($v)) : null;
        if ($k === 'position') $v = (int)$v;
        $sets[] = "$col = :$k"; $params[":$k"] = $v;
    }
    if (!$sets) fail('Aucun champ à mettre à jour', 422);
    $sql = 'UPDATE extraneterp_custom_fields SET ' . implode(', ', $sets) . ' WHERE id = :id';
    $db->prepare($sql)->execute($params);
    ok(['message' => 'Champ mis à jour']);
}

if ($method === 'DELETE') {
    require_auth(['Administrateur']);
    $id = $_GET['id'] ?? '';
    if (!$id) fail('id requis', 422);
    $db->beginTransaction();
    try {
        // also drop stored values for that key
        $f = $db->prepare('SELECT entity, field_key FROM extraneterp_custom_fields WHERE id = :id');
        $f->execute([':id'=>$id]);
        $row = $f->fetch();
        if ($row) {
            $del = $db->prepare('DELETE FROM extraneterp_custom_field_values WHERE entity = :e AND field_key = :k');
            $del->execute([':e'=>$row['entity'], ':k'=>$row['field_key']]);
        }
        $d = $db->prepare('DELETE FROM extraneterp_custom_fields WHERE id = :id');
        $d->execute([':id'=>$id]);
        $db->commit();
        ok(['deleted' => $d->rowCount()]);
    } catch (Throwable $e) {
        $db->rollBack();
        fail('Erreur: ' . $e->getMessage(), 500);
    }
}

fail('Method not allowed', 405);
