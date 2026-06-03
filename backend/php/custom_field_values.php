<?php
require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$ENTITIES = ['prospect','contract','user'];

if ($method === 'GET') {
    $entity = $_GET['entity'] ?? '';
    if (!in_array($entity, $ENTITIES, true)) fail('entity invalide', 422);

    // Bulk mode: ?entity=prospect&all=1 -> { values: { entityId: {key:val,...} } }
    if (!empty($_GET['all'])) {
        $s = $db->prepare('SELECT entity_id, field_key, value FROM extraneterp_custom_field_values WHERE entity=:e');
        $s->execute([':e'=>$entity]);
        $out = [];
        foreach ($s->fetchAll() as $r) {
            $eid = $r['entity_id'];
            if (!isset($out[$eid])) $out[$eid] = [];
            $out[$eid][$r['field_key']] = $r['value'];
        }
        ok(['values' => $out]);
    }

    $eid = $_GET['entity_id'] ?? '';
    if (!$eid) fail('entity_id requis', 422);
    $s = $db->prepare('SELECT field_key, value FROM extraneterp_custom_field_values WHERE entity=:e AND entity_id=:id');
    $s->execute([':e'=>$entity, ':id'=>$eid]);
    $out = [];
    foreach ($s->fetchAll() as $r) $out[$r['field_key']] = $r['value'];
    ok(['values' => $out]);
}

if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
    $in = json_input();
    $entity = $in['entity'] ?? '';
    $eid    = $in['entity_id'] ?? '';
    $values = $in['values'] ?? null;
    if (!in_array($entity, $ENTITIES, true) || !$eid) fail('entity & entity_id requis', 422);
    if (!is_array($values)) fail('values invalide', 422);
    $up = $db->prepare('INSERT INTO extraneterp_custom_field_values (entity, entity_id, field_key, value)
                        VALUES (:e,:id,:k,:v)
                        ON DUPLICATE KEY UPDATE value = VALUES(value)');
    foreach ($values as $k => $v) {
        $up->execute([':e'=>$entity, ':id'=>$eid, ':k'=>(string)$k, ':v'=>is_scalar($v)?(string)$v:json_encode($v)]);
    }
    ok(['saved' => count($values)]);
}

if ($method === 'DELETE') {
    $entity = $_GET['entity'] ?? '';
    $eid    = $_GET['entity_id'] ?? '';
    $key    = $_GET['key'] ?? null;
    if (!in_array($entity, $ENTITIES, true) || !$eid) fail('entity & entity_id requis', 422);
    if ($key) {
        $s = $db->prepare('DELETE FROM extraneterp_custom_field_values WHERE entity=:e AND entity_id=:id AND field_key=:k');
        $s->execute([':e'=>$entity, ':id'=>$eid, ':k'=>$key]);
    } else {
        $s = $db->prepare('DELETE FROM extraneterp_custom_field_values WHERE entity=:e AND entity_id=:id');
        $s->execute([':e'=>$entity, ':id'=>$eid]);
    }
    ok(['deleted' => $s->rowCount()]);
}

fail('Method not allowed', 405);
