<?php
/**
 * /gestion.php — CRUD de la Gestion (Protection ERP)
 *
 *   GET    /gestion.php?...filtres          → {gestions:[...], total:N}
 *   GET    /gestion.php?id=NN               → {gestion: {...}}
 *   POST   /gestion.php                     → création (id auto, GEST-AAAAMM-XXXX)
 *   PATCH  /gestion.php?id=NN               → MAJ partielle
 *   DELETE /gestion.php?id=NN               → suppression (Admin/Manager)
 */

require_once __DIR__ . '/config.php';

$me     = require_auth();
$db     = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/* ---------------------------------------------------- bootstrap (idempotent) */
function ensure_gestion_tables(PDO $db): void {
    $db->exec("CREATE TABLE IF NOT EXISTS extraneterp_gestion (
        id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        reference       VARCHAR(32)  NOT NULL,
        prospect_id     VARCHAR(64)  NULL,
        contract_id     VARCHAR(64)  NULL,
        subject         VARCHAR(160) NULL,
        description     TEXT         NULL,
        status          ENUM('ouvert','en_cours','termine','annule') NOT NULL DEFAULT 'ouvert',
        priority        ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
        date_creation   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        date_closed     DATETIME     NULL,
        mois            TINYINT  UNSIGNED GENERATED ALWAYS AS (MONTH(date_creation)) STORED,
        annee           SMALLINT UNSIGNED GENERATED ALWAYS AS (YEAR(date_creation))  STORED,
        assigned_to     VARCHAR(80)  NULL,
        created_by      VARCHAR(80)  NULL,
        created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_gest_ref (reference),
        KEY idx_gest_prospect (prospect_id),
        KEY idx_gest_contract (contract_id),
        KEY idx_gest_status (status),
        KEY idx_gest_priority (priority),
        KEY idx_gest_assigned (assigned_to),
        KEY idx_gest_period   (annee, mois),
        KEY idx_gest_created  (date_creation)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $db->exec("CREATE TABLE IF NOT EXISTS extraneterp_gestion_counter (
        period   CHAR(6)      NOT NULL,
        last_seq INT UNSIGNED NOT NULL DEFAULT 0,
        PRIMARY KEY (period)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}
ensure_gestion_tables($db);

/* ------------------------------------------------------------------ helpers */
const GEST_STATUS   = ['ouvert','en_cours','termine','annule'];
const GEST_PRIORITY = ['low','normal','high','urgent'];

function gest_can_manage(array $me): bool { return in_array($me['role'] ?? '', ['Administrateur','Manager'], true); }
function gest_clean_str($v, int $max = 255): ?string { if ($v===null) return null; $s=trim((string)$v); if ($s==='') return null; return mb_substr($s,0,$max); }
function gest_status($v): string { $v=strtolower((string)$v); return in_array($v, GEST_STATUS, true) ? $v : 'ouvert'; }
function gest_priority($v): string { $v=strtolower((string)$v); return in_array($v, GEST_PRIORITY, true) ? $v : 'normal'; }
function gest_datetime($v): ?string { if ($v===null||$v==='') return null; $t=strtotime((string)$v); return $t?date('Y-m-d H:i:s',$t):null; }
function gest_generate_reference(PDO $db, ?string $createdAt=null): string {
    $period = date('Ym', $createdAt ? strtotime($createdAt) : time());
    $db->prepare('INSERT INTO extraneterp_gestion_counter (period, last_seq) VALUES (:p,1) ON DUPLICATE KEY UPDATE last_seq = last_seq + 1')
        ->execute([':p'=>$period]);
    $s=$db->prepare('SELECT last_seq FROM extraneterp_gestion_counter WHERE period = :p');
    $s->execute([':p'=>$period]);
    $seq = (int)$s->fetchColumn();
    return sprintf('GEST-%s-%04d',$period,$seq);
}
function gest_row(array $r): array {
    return [
        'id'           => (int)$r['id'],
        'reference'    => $r['reference'],
        'prospect_id'  => $r['prospect_id'],
        'contract_id'  => $r['contract_id'],
        'subject'      => $r['subject'],
        'description'  => $r['description'],
        'status'       => $r['status'],
        'priority'     => $r['priority'],
        'date_creation'=> $r['date_creation'],
        'date_closed'  => $r['date_closed'],
        'mois'         => isset($r['mois'])?(int)$r['mois']:null,
        'annee'        => isset($r['annee'])?(int)$r['annee']:null,
        'assigned_to'  => $r['assigned_to'],
        'created_by'   => $r['created_by'],
        'created_at'   => $r['created_at'],
        'updated_at'   => $r['updated_at'],
    ];
}
function gest_payload(array $in, bool $forUpdate = false): array {
    $map = [
        'subject'     => 'subject',
        'description' => 'description',
        'status'      => 'status',
        'priority'    => 'priority',
        'dateCreation'=> 'date_creation',
        'dateClosed'  => 'date_closed',
        'prospectId'  => 'prospect_id',
        'contractId'  => 'contract_id',
        'assignedTo'  => 'assigned_to',
    ];
    foreach ($map as $camel=>$snake) { if (array_key_exists($camel,$in) && !array_key_exists($snake,$in)) $in[$snake]=$in[$camel]; }
    $p=[];
    $cols = [
        'prospect_id'=>64,'contract_id'=>64,'subject'=>160,'description'=>65535,
        'status'=>20,'priority'=>10,'date_creation'=>20,'date_closed'=>20,'assigned_to'=>80
    ];
    foreach ($cols as $k=>$max) { if (array_key_exists($k,$in)) $p[$k]=gest_clean_str($in[$k],$max); }
    if (array_key_exists('status',$in))   $p['status']   = gest_status($in['status']);
    if (array_key_exists('priority',$in)) $p['priority'] = gest_priority($in['priority']);
    if (array_key_exists('date_creation',$in)) {$d=gest_datetime($in['date_creation']); if($d) $p['date_creation']=$d;}
    if (array_key_exists('date_closed',$in)) {$d=gest_datetime($in['date_closed']); if($d) $p['date_closed']=$d;}
    return $p;
}
function gest_fetch(PDO $db, int $id): ?array { $s=$db->prepare('SELECT * FROM extraneterp_gestion WHERE id = :id LIMIT 1'); $s->execute([':id'=>$id]); $r=$s->fetch(); return $r?gest_row($r):null; }

/* ------------------------------------------------------------------ GET */
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $r = gest_fetch($db,(int)$_GET['id']);
        if (!$r) fail('Gestion introuvable',404);
        ok(['gestion'=>$r]);
    }
    $where=[];$args=[];
    foreach (['prospect_id'=>'prospect_id','contract_id'=>'contract_id','status'=>'status','priority'=>'priority'] as $param=>$col){
        if (!empty($_GET[$param])){ $where[]="$col = :$param"; $args[":$param"] = trim($_GET[$param]); }
    }
    if (!empty($_GET['date_from'])){ $where[]='date_creation >= :df'; $args[':df']=gest_datetime($_GET['date_from']); }
    if (!empty($_GET['date_to'])){ $where[]='date_creation <= :dt'; $args[':dt']=gest_datetime($_GET['date_to']); }
    if (!gest_can_manage($me)) { $where[]='(assigned_to = :me OR created_by = :me2)'; $args[':me']=$me['username']; $args[':me2']=$me['username']; }
    $whereSql = $where?('WHERE '.implode(' AND ',$where)):'';
    $limit  = max(1, min(500, (int)($_GET['limit']??200)));
    $offset = max(0, (int)($_GET['offset']??0));
    $cnt = $db->prepare("SELECT COUNT(*) FROM extraneterp_gestion $whereSql"); $cnt->execute($args); $total=(int)$cnt->fetchColumn();
    $sql = "SELECT * FROM extraneterp_gestion $whereSql ORDER BY date_creation DESC, id DESC LIMIT $limit OFFSET $offset";
    $s = $db->prepare($sql); $s->execute($args);
    $rows = array_map('gest_row',$s->fetchAll());
    ok(['gestions'=>$rows,'total'=>$total]);
}

/* ------------------------------------------------------------------ POST */
if ($method === 'POST') {
    $in = json_input();
    $payload = gest_payload($in,false);
    if (empty($payload['date_creation'])) $payload['date_creation']=date('Y-m-d H:i:s');
    $payload['status']   = $payload['status']   ?? 'ouvert';
    $payload['priority'] = $payload['priority'] ?? 'normal';
    $payload['created_by']= $me['username'];
    $payload['reference'] = gest_generate_reference($db,$payload['date_creation']);
    $cols=array_keys($payload);
    $placeholders=array_map(fn($c)=>":$c",$cols);
    $sql='INSERT INTO extraneterp_gestion ('.implode(',',$cols).') VALUES ('.implode(',',$placeholders).')';
    $st=$db->prepare($sql);
    $args=[]; foreach($payload as $k=>$v) $args[':'.$k]=$v;
    $st->execute($args);
    $id=(int)$db->lastInsertId();
    // cross‑link similar to reclamations
    if (!empty($payload['contract_id']) && empty($payload['prospect_id'])) {
        $cStmt=$db->prepare('SELECT prospect_id FROM extraneterp_contracts WHERE id = :cid LIMIT 1');
        $cStmt->execute([':cid'=>$payload['contract_id']]);
        $cRow=$cStmt->fetch();
        if ($cRow && !empty($cRow['prospect_id'])) {
            $db->prepare('UPDATE extraneterp_gestion SET prospect_id = :pid WHERE id = :id')
                ->execute([':pid'=>$cRow['prospect_id'], ':id'=>$id]);
        }
    }
        // Log creation into activity histories
    if (!empty($payload['contract_id'])) {
        log_action($db, 'contract', (string)$payload['contract_id'], 'gestion_created', '', $payload['reference'] . ' — ' . ($payload['subject'] ?? ''), $me['username'] ?? '');
    }
    if (!empty($payload['prospect_id'])) {
        log_action($db, 'prospect', (string)$payload['prospect_id'], 'gestion_created', '', $payload['reference'] . ' — ' . ($payload['subject'] ?? ''), $me['username'] ?? '');
    }

}

/* ------------------------------------------------------------------ PATCH */
if ($method === 'PATCH') {
    $id = (int)($_GET['id']??0);
    if ($id<=0) fail('id requis',422);
    $existing = gest_fetch($db,$id);
    if (!$existing) fail('Gestion introuvable',404);
    $isOwner = ($existing['assigned_to']===($me['username']??'')||$existing['created_by']===$me['username']);
    if (!gest_can_manage($me) && !$isOwner) fail('Accès refusé',403);
    $payload = gest_payload(json_input(),true);
    if (!$payload) fail('Aucune modification',422);
    if (!empty($payload['status']) && $payload['status']==='termine' && empty($payload['date_closed'])) {
        $payload['date_closed']=date('Y-m-d H:i:s');
    }
    $sets=[];$args=[':id'=>$id];
    foreach($payload as $k=>$v){ $sets[]="$k = :$k"; $args[':'.$k]=$v; }
    $sql='UPDATE extraneterp_gestion SET '.implode(',',$sets).' WHERE id = :id';
    $db->prepare($sql)->execute($args);
    // log field changes
    foreach($payload as $field=>$newVal){
        $oldVal = $existing[$field] ?? null;
        if ($oldVal===$newVal) continue;
        $ref = $existing['reference'] ?? ('GEST-'.$id);
        if (!empty($existing['contract_id'])) log_action($db,'contract',(string)$existing['contract_id'],$field,$oldVal,$newVal,$me['username']??'');
        if (!empty($existing['prospect_id'])) log_action($db,'prospect',(string)$existing['prospect_id'],$field,$oldVal,$newVal,$me['username']??'');
    }
    ok(['gestion'=>gest_fetch($db,$id)]);
}

/* ------------------------------------------------------------------ DELETE */
if ($method === 'DELETE') {
    if (!gest_can_manage($me)) fail('Accès refusé',403);
    $id = (int)($_GET['id']??0);
    if ($id<=0) fail('id requis',422);
    $s=$db->prepare('DELETE FROM extraneterp_gestion WHERE id = :id');
    $s->execute([':id'=>$id]);
    ok(['deleted'=>$s->rowCount()]);
}

fail('Method not allowed',405);
?>