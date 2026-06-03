<?php
require_once __DIR__ . '/config.php';
require_auth();
require_method('GET');
$db = (new Database())->getConnection();

$series = $_GET['series'] ?? null;
$days   = max(1, min(60, (int)($_GET['days'] ?? 7)));

if ($series) {
    // Build a date axis covering the last N days (inclusive) ending today.
    $axis = [];
    for ($i = $days - 1; $i >= 0; $i--) {
        $axis[] = date('Y-m-d', strtotime("-$i days"));
    }
    $from = $axis[0];

    // ---- daily aggregates pulled from the DB
    if ($series === 'leads') {
        $s = $db->prepare("SELECT created_at d, COUNT(*) c
                           FROM extraneterp_prospects WHERE created_at >= :f GROUP BY created_at");
    } elseif ($series === 'won') {
        $s = $db->prepare("SELECT created_at d, COUNT(*) c
                           FROM extraneterp_prospects
                           WHERE outcome='won' AND created_at >= :f GROUP BY created_at");
    } elseif ($series === 'lost') {
        $s = $db->prepare("SELECT created_at d, COUNT(*) c
                           FROM extraneterp_prospects
                           WHERE outcome='lost' AND created_at >= :f GROUP BY created_at");
    } elseif ($series === 'contracts') {
        $s = $db->prepare("SELECT signature_date d, COUNT(*) c
                           FROM extraneterp_contracts
                           WHERE signature_date >= :f GROUP BY signature_date");
    } elseif ($series === 'revenue') {
        $s = $db->prepare("SELECT signature_date d, COALESCE(SUM(premium),0) c
                           FROM extraneterp_contracts
                           WHERE signature_date >= :f GROUP BY signature_date");
    } elseif ($series === 'conversion') {
        // Per-day conversion rate (won / total) on prospects created that day
        $s = $db->prepare("SELECT created_at d,
                              ROUND(SUM(CASE WHEN outcome='won' THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0) * 100, 1) c
                           FROM extraneterp_prospects WHERE created_at >= :f GROUP BY created_at");
    } else {
        fail('series invalide', 422);
    }
    $s->execute([':f' => $from]);
    $byDay = [];
    foreach ($s->fetchAll() as $r) { $byDay[$r['d']] = (float)$r['c']; }

    $points = array_map(fn($d) => ['date' => $d, 'value' => $byDay[$d] ?? 0], $axis);
    ok(['series' => $series, 'days' => $days, 'points' => $points]);
}

// ---- admin breakdown: per-company + cancellations (current month by default)
$breakdown = $_GET['breakdown'] ?? null;
if ($breakdown === 'admin') {
    $from = $_GET['from'] ?? date('Y-m-01');
    $to   = $_GET['to']   ?? date('Y-m-d');

    // Per-company (partner) — contrats actifs (non annulés)
    $perCompany = $db->prepare("
        SELECT COALESCE(NULLIF(partner,''),'(Inconnu)') AS company,
               COUNT(*) AS contracts_count,
               COALESCE(SUM(premium),0) AS revenue
        FROM extraneterp_contracts
        WHERE signature_date BETWEEN :f AND :t
          AND billing_status <> 'Annuler la confirmation'
        GROUP BY company
        ORDER BY revenue DESC
    ");
    $perCompany->execute([':f'=>$from, ':t'=>$to]);
    $companies = array_map(fn($r)=>[
        'company'   => $r['company'],
        'contracts' => (int)$r['contracts_count'],
        'revenue'   => (float)$r['revenue'],
    ], $perCompany->fetchAll());

    // Totals (actifs)
    $totals = $db->prepare("
        SELECT COUNT(*) AS contracts_count, COALESCE(SUM(premium),0) AS revenue
        FROM extraneterp_contracts
        WHERE signature_date BETWEEN :f AND :t
          AND billing_status <> 'Annuler la confirmation'
    ");
    $totals->execute([':f'=>$from, ':t'=>$to]);
    $tot = $totals->fetch();

    // Annulés
    $cancelled = $db->prepare("
        SELECT COUNT(*) AS contracts_count, COALESCE(SUM(premium),0) AS revenue
        FROM extraneterp_contracts
        WHERE signature_date BETWEEN :f AND :t
          AND billing_status = 'Annuler la confirmation'
    ");
    $cancelled->execute([':f'=>$from, ':t'=>$to]);
    $can = $cancelled->fetch();

    // Per-company cancelled
    $perCompanyCancelled = $db->prepare("
        SELECT COALESCE(NULLIF(partner,''),'(Inconnu)') AS company,
               COUNT(*) AS contracts_count,
               COALESCE(SUM(premium),0) AS revenue
        FROM extraneterp_contracts
        WHERE signature_date BETWEEN :f AND :t
          AND billing_status = 'Annuler la confirmation'
        GROUP BY company
        ORDER BY revenue DESC
    ");
    $perCompanyCancelled->execute([':f'=>$from, ':t'=>$to]);
    $companiesCancelled = array_map(fn($r)=>[
        'company'   => $r['company'],
        'contracts' => (int)$r['contracts_count'],
        'revenue'   => (float)$r['revenue'],
    ], $perCompanyCancelled->fetchAll());

    ok([
        'period'    => ['from'=>$from, 'to'=>$to],
        'totals'    => ['contracts'=>(int)$tot['contracts_count'], 'revenue'=>(float)$tot['revenue']],
        'cancelled' => ['contracts'=>(int)$can['contracts_count'], 'revenue'=>(float)$can['revenue']],
        'companies' => $companies,
        'companiesCancelled' => $companiesCancelled,
    ]);
}

// ---- default: aggregate stats card payload
$today = date('Y-m-d');
$monthStart = date('Y-m-01');

$prospectsAgg = $db->query("
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN outcome='won'  THEN 1 ELSE 0 END) AS won,
      SUM(CASE WHEN outcome='lost' THEN 1 ELSE 0 END) AS lost,
      SUM(CASE WHEN outcome='pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN assigned_to IS NULL THEN 1 ELSE 0 END) AS unclaimed
    FROM extraneterp_prospects
")->fetch();

$contractsAgg = $db->prepare("
    SELECT
      SUM(CASE WHEN signature_date >= :ms2 THEN 1 ELSE 0 END) AS total,
      SUM(CASE WHEN signature_date = :today THEN 1 ELSE 0 END) AS today_count,
      COALESCE(SUM(CASE WHEN signature_date >= :ms THEN premium ELSE 0 END), 0) AS month_revenue
    FROM extraneterp_contracts
");
$contractsAgg->execute([':today' => $today, ':ms' => $monthStart, ':ms2' => $monthStart]);
$c = $contractsAgg->fetch();

$total = (int)$prospectsAgg['total'];
$won   = (int)$prospectsAgg['won'];
$conv  = $total > 0 ? round(($won / $total) * 100, 1) : 0.0;

ok([
    'stats' => [
        'totalLeads'         => $total,
        'newLeadsToday'      => (int)$prospectsAgg['unclaimed'],
        'wonLeads'           => $won,
        'lostLeads'          => (int)$prospectsAgg['lost'],
        'pendingLeads'       => (int)$prospectsAgg['pending'],
        'contractsThisMonth' => (int)$c['total'],
        'contractsToday'     => (int)$c['today_count'],
        'conversionRate'     => $conv,
        'revenueThisMonth'   => (float)$c['month_revenue'],
    ],
]);
