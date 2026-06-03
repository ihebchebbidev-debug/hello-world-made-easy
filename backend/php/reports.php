<?php
require_once __DIR__ . '/config.php';
require_auth();
require_method('GET');
$db = (new Database())->getConnection();

$from = $_GET['from'] ?? date('Y-m-01');
$to   = $_GET['to']   ?? date('Y-m-d');
$format = $_GET['format'] ?? 'json';

// Per-agent KPIs
$agentSql = "
  SELECT u.username, u.full_name,
    COALESCE(SUM(p.cnt),0)  AS handled,
    COALESCE(SUM(p.won),0)  AS won,
    COALESCE(SUM(p.lost),0) AS lost,
    COALESCE(c.contracts_count,0) AS contracts_count,
    COALESCE(c.revenue,0)   AS revenue
  FROM extraneterp_users u
  LEFT JOIN (
    SELECT assigned_to,
      COUNT(*) cnt,
      SUM(CASE WHEN outcome='won' THEN 1 ELSE 0 END) won,
      SUM(CASE WHEN outcome='lost' THEN 1 ELSE 0 END) lost
    FROM extraneterp_prospects
    WHERE created_at BETWEEN :from1 AND :to1
    GROUP BY assigned_to
  ) p ON p.assigned_to = u.username
  LEFT JOIN (
    SELECT assigned_to,
      COUNT(*) contracts_count,
      SUM(premium) revenue
    FROM extraneterp_contracts
    WHERE signature_date BETWEEN :from2 AND :to2
    GROUP BY assigned_to
  ) c ON c.assigned_to = u.username
  WHERE u.role IN ('Agent','Vendeur','Qualificateur','Manager','Superviseur') AND u.active = 1
  GROUP BY u.id
  ORDER BY revenue DESC
";
$s = $db->prepare($agentSql);
$s->execute([':from1'=>$from, ':to1'=>$to, ':from2'=>$from, ':to2'=>$to]);
$agents = array_map(function($r){
    $h = (int)$r['handled'];
    return [
        'username'  => $r['username'],
        'fullName'  => $r['full_name'],
        'handled'   => $h,
        'won'       => (int)$r['won'],
        'lost'      => (int)$r['lost'],
        'contracts' => (int)$r['contracts_count'],
        'revenue'   => (float)$r['revenue'],
        'conversion' => $h > 0 ? round(((int)$r['won'] / $h) * 100, 1) : 0.0,
    ];
}, $s->fetchAll());

// Funnel
$funnel = $db->prepare("
  SELECT
    SUM(CASE WHEN outcome='pending' THEN 1 ELSE 0 END) pending,
    SUM(CASE WHEN outcome='won'     THEN 1 ELSE 0 END) won,
    SUM(CASE WHEN outcome='lost'    THEN 1 ELSE 0 END) lost,
    COUNT(*) total
  FROM extraneterp_prospects WHERE created_at BETWEEN :f AND :t
");
$funnel->execute([':f'=>$from, ':t'=>$to]);
$f = $funnel->fetch();

// Monthly revenue (12 buckets back from `to`)
$monthly = $db->prepare("
  SELECT DATE_FORMAT(signature_date,'%Y-%m') ym, COUNT(*) cnt, SUM(premium) rev
  FROM extraneterp_contracts
  WHERE signature_date >= DATE_SUB(:t, INTERVAL 12 MONTH)
  GROUP BY ym ORDER BY ym
");
$monthly->execute([':t'=>$to]);
$months = array_map(fn($r)=>['month'=>$r['ym'],'contracts'=>(int)$r['cnt'],'revenue'=>(float)$r['rev']], $monthly->fetchAll());

// Per source
$src = $db->prepare("
  SELECT source, COUNT(*) total,
    SUM(CASE WHEN outcome='won' THEN 1 ELSE 0 END) won
  FROM extraneterp_prospects WHERE created_at BETWEEN :f AND :t
  GROUP BY source ORDER BY total DESC
");
$src->execute([':f'=>$from, ':t'=>$to]);
$sources = array_map(fn($r)=>[
    'source'=>$r['source'], 'total'=>(int)$r['total'], 'won'=>(int)$r['won'],
    'conversion'=> (int)$r['total']>0 ? round((int)$r['won']/(int)$r['total']*100,1) : 0.0,
], $src->fetchAll());

if ($format === 'csv') {
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="report_agents_'.$from.'_'.$to.'.csv"');
    $out = fopen('php://output','w');
    fputcsv($out, ['Agent','Username','Leads traités','Gagnés','Perdus','Contrats','Revenue','Conversion %']);
    foreach ($agents as $a) {
        fputcsv($out, [$a['fullName'],$a['username'],$a['handled'],$a['won'],$a['lost'],$a['contracts'],$a['revenue'],$a['conversion']]);
    }
    fclose($out);
    exit;
}

ok([
    'period'  => ['from'=>$from,'to'=>$to],
    'agents'  => $agents,
    'funnel'  => ['pending'=>(int)$f['pending'],'won'=>(int)$f['won'],'lost'=>(int)$f['lost'],'total'=>(int)$f['total']],
    'monthly' => $months,
    'sources' => $sources,
]);
