<?php
// =====================================================================
// Prospect creations per Qualificateur per day for a given month.
// GET /qualifier_creations.php?ym=YYYY-MM
//
// Two data sources (merged, never double-counted):
//   1. extraneterp_activity_log   (entity_type='prospect', field='created')
//      → exact creator captured by prospects.php since logging was added.
//   2. extraneterp_prospects table fallback for prospects WITHOUT a
//      'created' log row. Attribution = assigned_to IF that user is
//      currently a Qualificateur, dated by prospects.created_at.
//
// The response also includes a `coverage` block so the UI can show how
// much of the historical data is attributable.
// =====================================================================
require_once __DIR__ . '/config.php';
$payload = require_auth();
require_method('GET');

$db = (new Database())->getConnection();

$ym = $_GET['ym'] ?? date('Y-m');
if (!preg_match('/^\d{4}-\d{2}$/', $ym)) fail('ym invalide', 422);
$monthStart = $ym . '-01';
$monthEnd   = date('Y-m-t', strtotime($monthStart));
$daysInMonth = (int)date('t', strtotime($monthStart));

$role     = $payload['role'] ?? '';
$username = $payload['username'] ?? '';
$isPriv   = in_array($role, ['Administrateur', 'Manager', 'Superviseur', 'Backoffice', 'Présentation'], true);

// Pull Qualificateurs (current roster)
$qStmt = $db->query("SELECT username, full_name FROM extraneterp_users WHERE role = 'Qualificateur'");
$quals = $qStmt->fetchAll();
$qualByLower = [];
foreach ($quals as $u) {
    $qualByLower[strtolower($u['username'])] = $u['full_name'] ?: $u['username'];
}

if (!$isPriv) {
    $lower = strtolower($username);
    if (isset($qualByLower[$lower])) {
        $qualByLower = [$lower => $qualByLower[$lower]];
    } else {
        $qualByLower = [];
    }
}

// Day axis YYYY-MM-DD
$axis = [];
for ($d = 1; $d <= $daysInMonth; $d++) {
    $axis[] = sprintf('%s-%02d', $ym, $d);
}

// counts[lowerUsername][YYYY-MM-DD] = int
$counts = [];
foreach ($qualByLower as $lower => $_) {
    $counts[$lower] = array_fill_keys($axis, 0);
}

// ---------- SOURCE 1: activity_log 'created' events ----------
$logCount = 0;
$loggedProspectIds = []; // pid => true (any user, used to skip in fallback)
if (!empty($qualByLower)) {
    // (a) Get full set of prospect IDs that have a 'created' log row in the month
    //     (regardless of which user), to avoid double counting in fallback.
    $stAll = $db->prepare("SELECT DISTINCT entity_id
                           FROM extraneterp_activity_log
                           WHERE entity_type = 'prospect' AND field = 'created'
                             AND created_at BETWEEN ? AND ?");
    $stAll->execute([$monthStart . ' 00:00:00', $monthEnd . ' 23:59:59']);
    foreach ($stAll->fetchAll() as $r) $loggedProspectIds[$r['entity_id']] = true;

    // (b) Per-qualificateur, per-day counts from log
    $placeholders = implode(',', array_fill(0, count($qualByLower), '?'));
    $sql = "SELECT LOWER(user_username) AS u, DATE(created_at) AS d, COUNT(*) AS c
            FROM extraneterp_activity_log
            WHERE entity_type = 'prospect'
              AND field = 'created'
              AND created_at BETWEEN ? AND ?
              AND LOWER(user_username) IN ($placeholders)
            GROUP BY u, d";
    $args = array_merge([$monthStart . ' 00:00:00', $monthEnd . ' 23:59:59'], array_keys($qualByLower));
    $st = $db->prepare($sql);
    $st->execute($args);
    foreach ($st->fetchAll() as $r) {
        $u = $r['u']; $d = $r['d']; $c = (int)$r['c'];
        if (isset($counts[$u][$d])) {
            $counts[$u][$d] += $c;
            $logCount += $c;
        }
    }
}

// ---------- SOURCE 2: prospects table fallback ----------
// Prospects in the month with no matching 'created' log row.
// Attribute to assigned_to if that user is a current Qualificateur.
$fallbackCount        = 0;  // counted into a qualificateur series
$unattributedCount    = 0;  // exists but assigned_to is not a qualificateur (or empty)
$totalProspectsMonth  = 0;

$pst = $db->query("SELECT id, assigned_to, created_at
                   FROM extraneterp_prospects
                   WHERE created_at BETWEEN " . $db->quote($monthStart) . "
                                       AND " . $db->quote($monthEnd));
foreach ($pst->fetchAll() as $p) {
    $totalProspectsMonth++;
    $pid = $p['id'];
    if (isset($loggedProspectIds[$pid])) continue; // already counted by log
    $assigned = strtolower(trim((string)($p['assigned_to'] ?? '')));
    $d = $p['created_at'];
    if ($assigned !== '' && isset($counts[$assigned][$d])) {
        $counts[$assigned][$d] += 1;
        $fallbackCount++;
    } else {
        $unattributedCount++;
    }
}

// Build series
$series = [];
$totalsByUser = [];
foreach ($qualByLower as $lower => $display) {
    $points = [];
    $tot = 0;
    foreach ($axis as $d) {
        $v = $counts[$lower][$d] ?? 0;
        $points[] = ['date' => $d, 'value' => $v];
        $tot += $v;
    }
    $series[] = ['username' => $lower, 'name' => $display, 'total' => $tot, 'points' => $points];
    $totalsByUser[$lower] = $tot;
}

usort($series, function ($a, $b) {
    if ($b['total'] !== $a['total']) return $b['total'] - $a['total'];
    return strcmp($a['name'], $b['name']);
});

// Daily totals
$daily = [];
foreach ($axis as $d) {
    $sum = 0;
    foreach ($qualByLower as $lower => $_) $sum += $counts[$lower][$d];
    $daily[] = ['date' => $d, 'value' => $sum];
}

// ---------- ALL-TIME COVERAGE (independent of selected month) ----------
// Cards in the UI use these totals so they remain stable when the user
// flips through months. Only the chart series & daily totals are per-month.
$allTotalProspects = 0;
$allFromLog        = 0;
$allFromFallback   = 0;
$allUnattributed   = 0;
try {
    $allTotalProspects = (int)$db->query("SELECT COUNT(*) FROM extraneterp_prospects")->fetchColumn();

    $loggedAllIds = [];
    $r = $db->query("SELECT DISTINCT entity_id FROM extraneterp_activity_log
                      WHERE entity_type = 'prospect' AND field = 'created'");
    foreach ($r->fetchAll() as $row) $loggedAllIds[$row['entity_id']] = true;

    if (!empty($qualByLower)) {
        $placeholders = implode(',', array_fill(0, count($qualByLower), '?'));
        $sql = "SELECT COUNT(*) FROM extraneterp_activity_log
                 WHERE entity_type = 'prospect' AND field = 'created'
                   AND LOWER(user_username) IN ($placeholders)";
        $st = $db->prepare($sql);
        $st->execute(array_keys($qualByLower));
        $allFromLog = (int)$st->fetchColumn();
    }

    $ps = $db->query("SELECT id, assigned_to FROM extraneterp_prospects");
    foreach ($ps->fetchAll() as $p) {
        if (isset($loggedAllIds[$p['id']])) continue;
        $assigned = strtolower(trim((string)($p['assigned_to'] ?? '')));
        if ($assigned !== '' && isset($qualByLower[$assigned])) $allFromFallback++;
        else $allUnattributed++;
    }
} catch (Throwable $e) { /* keep zeros on failure */ }

ok([
    'month'      => $ym,
    'axis'       => $axis,
    'series'     => $series,
    'daily'      => $daily,
    'grandTotal' => array_sum($totalsByUser),
    'coverage'   => [
        // Stable, all-time totals — used by the summary cards in the UI.
        'totalProspectsInMonth' => $allTotalProspects,
        'fromActivityLog'       => $allFromLog,
        'fromAssigneeFallback'  => $allFromFallback,
        'unattributed'          => $allUnattributed,
    ],
    'monthCoverage' => [
        'totalProspectsInMonth' => $totalProspectsMonth,
        'fromActivityLog'       => $logCount,
        'fromAssigneeFallback'  => $fallbackCount,
        'unattributed'          => $unattributedCount,
    ],
]);
