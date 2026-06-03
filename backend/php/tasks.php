<?php
require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

function task_to_arr(array $r): array {
    return [
        'id'            => $r['id'],
        'title'         => $r['title'],
        'description'   => $r['description'],
        'assignedTo'    => $r['assigned_to'],
        'relatedEntity' => $r['related_entity'],
        'relatedId'     => $r['related_id'],
        'dueDate'       => $r['due_date'],
        'priority'      => $r['priority'],
        'status'        => $r['status'],
        'createdBy'     => $r['created_by'],
        'createdAt'     => $r['created_at'],
        'completedAt'   => $r['completed_at'],
    ];
}

if ($method === 'GET') {
    $mine = isset($_GET['mine']) && $_GET['mine'] === '1';
    $status = $_GET['status'] ?? null;
    $role = $me['role'] ?? '';
    $isPrivileged = in_array($role, ['Admin','Administrateur','Manager','Superviseur','Backoffice'], true);
    $sql = 'SELECT * FROM extraneterp_tasks WHERE 1=1';
    $params = [];
    // Non-privileged users only see tasks assigned to them or created by them.
    if (!$isPrivileged) {
        $sql .= ' AND (assigned_to = :me OR created_by = :me)';
        $params[':me'] = $me['username'] ?? '';
    } elseif ($mine) {
        $sql .= ' AND assigned_to = :u';
        $params[':u'] = $me['username'] ?? '';
    }
    if ($status) { $sql .= ' AND status = :s'; $params[':s'] = $status; }
    $sql .= ' ORDER BY (status="done") ASC, due_date IS NULL, due_date ASC, priority DESC';
    $s = $db->prepare($sql);
    $s->execute($params);
    $tasks = array_map('task_to_arr', $s->fetchAll());
    ok(['tasks' => $tasks]);
}

if ($method === 'POST') {
    $in = json_input();
    $title = trim($in['title'] ?? '');
    if ($title === '') fail('title requis', 422);
    $id = 'T-' . substr(bin2hex(random_bytes(6)), 0, 10);
    $assigned = $in['assignedTo'] ?? $me['username'];
    $priority = in_array($in['priority']??'normal', ['low','normal','high'], true) ? ($in['priority'] ?? 'normal') : 'normal';
    $s = $db->prepare('INSERT INTO extraneterp_tasks (id,title,description,assigned_to,related_entity,related_id,due_date,priority,status,created_by)
                       VALUES (:id,:t,:d,:a,:re,:ri,:du,:p,:st,:cb)');
    $s->execute([
        ':id'=>$id, ':t'=>$title, ':d'=>$in['description']??null,
        ':a'=>$assigned, ':re'=>$in['relatedEntity']??null, ':ri'=>$in['relatedId']??null,
        ':du'=>$in['dueDate']??null, ':p'=>$priority,
        ':st'=>in_array($in['status']??'todo',['todo','in_progress','done','cancelled'],true)?($in['status']??'todo'):'todo',
        ':cb'=>$me['username'],
    ]);
    // Notify the assignee if someone else created it
    if ($assigned !== $me['username']) {
        $n = $db->prepare('INSERT INTO extraneterp_notifications (id,user_username,title,body) VALUES (:id,:u,:t,:b)');
        $n->execute([':id'=>'N-'.substr(bin2hex(random_bytes(6)),0,10), ':u'=>$assigned,
                     ':t'=>'Nouvelle tâche: '.$title, ':b'=>'Assignée par '.$me['username']]);
    }
    ok(['id'=>$id], 201);
}

if ($method === 'PATCH' || $method === 'PUT') {
    $in = json_input();
    $id = $in['id'] ?? ($_GET['id'] ?? '');
    if (!$id) fail('id requis', 422);
    // Authorization: only the creator, the assignee, or a Manager/Admin may edit.
    $cur = $db->prepare('SELECT created_by, assigned_to FROM extraneterp_tasks WHERE id = :id');
    $cur->execute([':id' => $id]);
    $row = $cur->fetch();
    if (!$row) fail('Tâche introuvable', 404);
    $role = $me['role'] ?? '';
    $isPrivileged = in_array($role, ['Admin','Administrateur','Manager','Superviseur','Backoffice'], true);
    if (!$isPrivileged
        && ($row['created_by'] ?? '') !== ($me['username'] ?? '')
        && ($row['assigned_to'] ?? '') !== ($me['username'] ?? '')) {
        fail('Accès refusé', 403);
    }
    $sets = []; $params = [':id'=>$id];
    $map = ['title'=>'title','description'=>'description','assignedTo'=>'assigned_to',
            'relatedEntity'=>'related_entity','relatedId'=>'related_id','dueDate'=>'due_date',
            'priority'=>'priority','status'=>'status'];
    // Agents may not reassign tasks to another user.
    if (!$isPrivileged && array_key_exists('assignedTo', $in)
        && $in['assignedTo'] !== ($row['assigned_to'] ?? '')
        && $in['assignedTo'] !== ($me['username'] ?? '')) {
        fail('Accès refusé', 403);
    }
    foreach ($map as $k=>$col) {
        if (!array_key_exists($k,$in)) continue;
        $v = $in[$k];
        if ($k==='priority' && !in_array($v,['low','normal','high'],true)) continue;
        if ($k==='status'   && !in_array($v,['todo','in_progress','done','cancelled'],true)) continue;
        $sets[] = "$col = :$k"; $params[":$k"] = $v;
        if ($k === 'status' && $v === 'done') {
            $sets[] = 'completed_at = NOW()';
        }
    }
    if (!$sets) fail('Aucun champ', 422);
    $db->prepare('UPDATE extraneterp_tasks SET '.implode(', ',$sets).' WHERE id=:id')->execute($params);
    ok(['message'=>'Tâche mise à jour']);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) fail('id requis', 422);
    // Only the creator or a Manager/Admin may delete.
    $cur = $db->prepare('SELECT created_by FROM extraneterp_tasks WHERE id = :id');
    $cur->execute([':id' => $id]);
    $row = $cur->fetch();
    if (!$row) fail('Tâche introuvable', 404);
    $role = $me['role'] ?? '';
    if (!in_array($role, ['Admin','Administrateur','Manager','Superviseur','Backoffice'], true)
        && ($row['created_by'] ?? '') !== ($me['username'] ?? '')) {
        fail('Accès refusé', 403);
    }
    $s = $db->prepare('DELETE FROM extraneterp_tasks WHERE id = :id');
    $s->execute([':id'=>$id]);
    ok(['deleted' => $s->rowCount()]);
}

fail('Method not allowed', 405);
