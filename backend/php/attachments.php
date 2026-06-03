<?php
require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$ENTITIES = ['prospect','contract'];

$UPLOAD_DIR = __DIR__ . '/uploads';
if (!is_dir($UPLOAD_DIR)) @mkdir($UPLOAD_DIR, 0775, true);

/**
 * Check whether the current user is allowed to access the given entity.
 * Agents may only touch records they own (assigned_to = their username).
 * Manager / Admin / Backoffice see everything. Returns true on access OK.
 */
function entity_access_ok(PDO $db, array $me, string $entity, string $entityId): bool {
    $role = $me['role'] ?? '';
    // Field roles (Agent/Vendeur/Qualificateur) are scoped to entities assigned to them.
    // Admin/Manager/Superviseur/Backoffice → unrestricted.
    if (!in_array($role, ['Agent', 'Vendeur', 'Qualificateur'], true)) return true;
    $table = $entity === 'contract' ? 'extraneterp_contracts' : 'extraneterp_prospects';
    $s = $db->prepare("SELECT assigned_to FROM $table WHERE id = :id");
    $s->execute([':id' => $entityId]);
    $owner = $s->fetchColumn();
    if ($owner === false) return false;
    return $owner === ($me['username'] ?? '');
}

function att_to_arr(array $r): array {
    return [
        'id'         => $r['id'],
        'entity'     => $r['entity'],
        'entityId'   => $r['entity_id'],
        'filename'   => $r['filename'],
        'mimeType'   => $r['mime_type'],
        'sizeBytes'  => (int)$r['size_bytes'],
        'url'        => 'attachments.php?download=' . urlencode($r['id']),
        'uploadedBy' => $r['uploaded_by'],
        'createdAt'  => $r['created_at'],
    ];
}

if ($method === 'GET') {
    if (isset($_GET['download'])) {
        $s = $db->prepare('SELECT * FROM extraneterp_attachments WHERE id = :id');
        $s->execute([':id' => $_GET['download']]);
        $r = $s->fetch();
        if (!$r || !is_file($r['storage_path'])) fail('Fichier introuvable', 404);
        // Authorization: only owners (or non-agents) may download.
        if (!entity_access_ok($db, $me, $r['entity'], $r['entity_id'])) fail('Accès refusé', 403);
        header('Content-Type: ' . $r['mime_type']);
        header('Content-Length: ' . filesize($r['storage_path']));
        // RFC 5987 / RFC 6266 — preserve unicode filenames safely.
        $asciiFallback = preg_replace('/[^A-Za-z0-9._\- ]/', '_', $r['filename']) ?: 'attachment';
        $asciiFallback = str_replace(['"', '\\', "\r", "\n"], '_', $asciiFallback);
        $utf8 = rawurlencode($r['filename']);
        header('Content-Disposition: attachment; filename="' . $asciiFallback . '"; filename*=UTF-8\'\'' . $utf8);
        header('X-Content-Type-Options: nosniff');
        readfile($r['storage_path']);
        exit;
    }
    $entity = $_GET['entity'] ?? '';
    $eid    = $_GET['entity_id'] ?? '';
    if (!in_array($entity, $ENTITIES, true) || !$eid) fail('entity & entity_id requis', 422);
    if (!entity_access_ok($db, $me, $entity, $eid)) fail('Accès refusé', 403);
    $s = $db->prepare('SELECT * FROM extraneterp_attachments WHERE entity=:e AND entity_id=:id ORDER BY created_at DESC');
    $s->execute([':e'=>$entity, ':id'=>$eid]);
    $attachments = array_map('att_to_arr', $s->fetchAll());
    ok(['attachments' => $attachments, 'extraneterp_attachments' => $attachments]);
}

if ($method === 'POST') {
    $entity = $_POST['entity'] ?? '';
    $eid    = $_POST['entity_id'] ?? '';
    if (!in_array($entity, $ENTITIES, true) || !$eid) fail('entity & entity_id requis', 422);
    if (!entity_access_ok($db, $me, $entity, $eid)) fail('Accès refusé', 403);
    if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) fail('Fichier requis', 422);
    $f = $_FILES['file'];
    if ($f['size'] > 20 * 1024 * 1024) fail('Fichier trop volumineux (>20MB)', 413);

    $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $f['name']);
    $id = 'AT-' . substr(bin2hex(random_bytes(6)), 0, 10);
    $sub = $GLOBALS['UPLOAD_DIR'] . '/' . $entity;
    if (!is_dir($sub)) @mkdir($sub, 0775, true);
    $dest = $sub . '/' . $id . '_' . $safeName;
    if (!move_uploaded_file($f['tmp_name'], $dest)) fail('Échec écriture fichier', 500);

    $mime = mime_content_type($dest) ?: ($f['type'] ?? 'application/octet-stream');
    $s = $db->prepare('INSERT INTO extraneterp_attachments (id,entity,entity_id,filename,mime_type,size_bytes,storage_path,uploaded_by)
                       VALUES (:id,:e,:ei,:fn,:mt,:sz,:sp,:u)');
    $s->execute([
        ':id'=>$id, ':e'=>$entity, ':ei'=>$eid, ':fn'=>$safeName, ':mt'=>$mime,
        ':sz'=>$f['size'], ':sp'=>$dest, ':u'=>$me['username'],
    ]);
    ok(['id'=>$id,'filename'=>$safeName,'sizeBytes'=>$f['size'],'mimeType'=>$mime,
        'url'=>'attachments.php?download='.urlencode($id)], 201);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) fail('id requis', 422);
    $s = $db->prepare('SELECT storage_path, entity, entity_id, uploaded_by FROM extraneterp_attachments WHERE id = :id');
    $s->execute([':id'=>$id]);
    $row = $s->fetch();
    if (!$row) fail('Introuvable', 404);
    // Agents can only delete attachments they uploaded on records they still own.
    $role = $me['role'] ?? '';
    if ($role === 'Agent') {
        if (($row['uploaded_by'] ?? '') !== ($me['username'] ?? '')
            || !entity_access_ok($db, $me, $row['entity'], $row['entity_id'])) {
            fail('Accès refusé', 403);
        }
    }
    @unlink($row['storage_path']);
    $d = $db->prepare('DELETE FROM extraneterp_attachments WHERE id = :id');
    $d->execute([':id'=>$id]);
    ok(['deleted' => $d->rowCount()]);
}

fail('Method not allowed', 405);
