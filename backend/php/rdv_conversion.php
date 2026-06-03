<?php
// =====================================================================
// RDV → Vente conversion stats per vendor.
// GET /rdv_conversion.php?ym=YYYY-MM
//
// "RDV pris" = prospects whose status changed to 'RDV' in the month
//              (sourced from extraneterp_activity_log).
// "Vente issue RDV" = of those RDV-tagged prospects, ones that have a
//              contract in extraneterp_contracts (joined via prospect_id)
//              with signature_date in the same month and
//              billing_status <> 'Annuler la confirmation'.
// Vendor = prospect.assigned_to (the rep that holds the file).
// Non-privileged users only see their own row.
// =====================================================================
require_once __DIR__ . '/config.php';
$payload = require_auth();
require_method('GET');

$db = (new Database())->getConnection();

$ym = $_GET['ym'] ?? date('Y-m');
if (!preg_match('/^\d{4}-\d{2}$/', $ym)) fail('ym invalide', 422);
$monthStart = $ym . '-01';
$monthEnd   = date('Y-m-t', strtotime($monthStart));

$role     = $payload['role'] ?? '';
$username = $payload['username'] ?? '';
$isPriv   = in_array($role, ['Administrateur', 'Manager', 'Présentation'], true);

function _has_col(PDO $db, string $table, string $col): bool {
    try { return (bool)$db->query("SHOW COLUMNS FROM $table LIKE " . $db->quote($col))->fetch(); }
    catch (Throwable $e) { return false; }
}
function rdvc_norm_text(string $s): string {
    $s = strtolower(trim($s));
    $ascii = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
    if ($ascii !== false) $s = $ascii;
    $s = preg_replace('/[^a-z0-9]+/', ' ', $s);
    return trim(preg_replace('/\s+/', ' ', $s));
}
function rdvc_identity_tokens(string $s): array {
    $stop = array_flip(['rdv','rendez','vous','rappel','signature','appel','tel','telephone','phone','mobile','client','prospect','test','devis','mutuelle','sante','mr','mme','mlle','monsieur','madame']);
    $out = [];
    foreach (explode(' ', rdvc_norm_text($s)) as $t) {
        if ($t === '' || strlen($t) < 3 || isset($stop[$t]) || preg_match('/^\d+$/', $t)) continue;
        $out[$t] = true;
    }
    return array_keys($out);
}
function rdvc_name_keys(?string $first, ?string $last): array {
    $fn = rdvc_norm_text((string)$first); $ln = rdvc_norm_text((string)$last);
    $keys = [];
    foreach ([trim("$fn $ln"), trim("$ln $fn")] as $k) if ($k !== '') $keys[$k] = true;
    $tokens = array_values(array_unique(array_filter(array_merge(explode(' ', $fn), explode(' ', $ln)))));
    sort($tokens);
    if (!empty($tokens)) $keys[implode(' ', $tokens)] = true;
    return array_keys($keys);
}
function rdvc_event_identity(string $title): array {
    $clean = $title;
    foreach ([' — ', ' – ', ' - ', ' : ', ' | ', '—', '–', ':', '|'] as $sep) {
        $pos = strpos($clean, $sep);
        if ($pos !== false) { $clean = substr($clean, $pos + strlen($sep)); break; }
    }
    $nameKeys = [];
    $key = rdvc_norm_text($clean);
    if ($key !== '') {
        $nameKeys[$key] = true;
        $toks = array_values(array_filter(explode(' ', $key)));
        if (count($toks) >= 2) { $nameKeys[implode(' ', array_reverse($toks))] = true; $sorted = $toks; sort($sorted); $nameKeys[implode(' ', $sorted)] = true; }
    }
    $phones = [];
    $digits = preg_replace('/\D+/', '', $title);
    if (strlen($digits) >= 9) $phones[substr($digits, -9)] = true;
    return ['name_keys'=>array_keys($nameKeys), 'tokens'=>rdvc_identity_tokens($title), 'phones'=>array_keys($phones)];
}
function rdvc_tokens_cover(array $haystack, array $needles): bool {
    if (count($needles) < 2) return false;
    $set = array_flip($haystack);
    foreach ($needles as $t) if (!isset($set[$t])) return false;
    return true;
}
$hasEventProspectLink = _has_col($db, 'extraneterp_calendar_events', 'prospect_id');

// 1) Prospects that hit an RDV status or have a linked calendar RDV in the month.
//    We dedupe so a prospect is counted as ONE RDV even when toggled multiple times.
//    This includes the newer labels "RDV planifié" and "RDV à chaud".
$eventUnion = $hasEventProspectLink ? "
  UNION ALL
  SELECT ce.prospect_id AS prospect_id,
         CONCAT(ce.date, ' ', COALESCE(NULLIF(ce.time, ''), '00:00:00')) AS rdv_at
  FROM extraneterp_calendar_events ce
  WHERE ce.type = 'rdv'
    AND ce.prospect_id IS NOT NULL AND ce.prospect_id <> ''
    AND ce.date BETWEEN :df AND :dt
" : "";

$sql = "
  SELECT src.prospect_id,
         MIN(src.rdv_at) AS rdv_at,
         p.assigned_to AS vendor,
         p.first_name, p.last_name, p.phone, p.mobile, p.email
  FROM (
    SELECT al.entity_id AS prospect_id,
           al.created_at AS rdv_at
    FROM extraneterp_activity_log al
    WHERE al.entity_type = 'prospect'
      AND al.field = 'status'
      AND (
        UPPER(TRIM(al.new_value)) = 'RDV'
        OR UPPER(TRIM(al.new_value)) LIKE 'RDV PLANIFI%'
        OR UPPER(TRIM(al.new_value)) LIKE 'RDV À CHAUD%'
        OR UPPER(TRIM(al.new_value)) LIKE 'RDV A CHAUD%'
      )
      AND al.created_at >= :f
      AND al.created_at <= :t
    $eventUnion
  ) src
  JOIN extraneterp_prospects p ON p.id = src.prospect_id
  WHERE 1=1
    AND p.assigned_to IS NOT NULL
    AND p.assigned_to <> ''
";
$params = [':f' => $monthStart . ' 00:00:00', ':t' => $monthEnd . ' 23:59:59'];
if ($hasEventProspectLink) { $params[':df'] = $monthStart; $params[':dt'] = $monthEnd; }
if (!$isPriv) {
    $sql .= " AND LOWER(p.assigned_to) = LOWER(:me) ";
    $params[':me'] = $username;
}
$sql .= " GROUP BY src.prospect_id, p.assigned_to, p.first_name, p.last_name, p.phone, p.mobile, p.email";

$s = $db->prepare($sql);
$s->execute($params);
$rdvRows = $s->fetchAll();

// Index prospects by id for cheap lookup, build vendor -> set of prospect_ids.
// We canonicalize vendor on lowercase to collapse case variants ("Felix.NOGHA"
// vs "felix.nogha") into a single row, but keep a display label.
$prospectIds = [];
$prospectVendor = []; // prospect_id => canonical vendor (lowercase)
$prospectRdvDate = []; // prospect_id => first RDV date used for conversion timing
$prospectIdentity = []; // prospect_id => normalized name/phone/email keys for fallback matching
$vendorRdv     = []; // canonical vendor => count
$vendorLabel   = []; // canonical => first-seen original casing for display
foreach ($rdvRows as $r) {
    $pid = $r['prospect_id'];
    $vOrig = (string)$r['vendor'];
    $v = strtolower(trim($vOrig));
    if ($v === '') continue;
    $prospectIds[] = $pid;
    $prospectVendor[$pid] = $v;
    $prospectRdvDate[$pid] = substr((string)($r['rdv_at'] ?? ''), 0, 10);
    $tails = [];
    foreach ([$r['phone'] ?? '', $r['mobile'] ?? ''] as $ph) {
        $digits = preg_replace('/\D+/', '', (string)$ph);
        if (strlen($digits) >= 9) $tails[] = substr($digits, -9);
    }
    $prospectIdentity[$pid] = [
        'vendor' => $v,
        'rdv_date' => $prospectRdvDate[$pid],
        'name_keys' => rdvc_name_keys($r['first_name'] ?? '', $r['last_name'] ?? ''),
        'tokens' => rdvc_identity_tokens(($r['first_name'] ?? '') . ' ' . ($r['last_name'] ?? '')),
        'phones' => array_values(array_unique($tails)),
        'email' => strtolower(trim((string)($r['email'] ?? ''))),
    ];
    $vendorRdv[$v] = ($vendorRdv[$v] ?? 0) + 1;
    if (!isset($vendorLabel[$v])) $vendorLabel[$v] = $vOrig;
}

// 1b) Unlinked calendar RDVs (no prospect_id, or linked to a missing prospect).
//     We still want them to appear in the "RDV pris" count, attributed to the
//     event's `agent` column (treated as the vendor key). This catches the
//     common case where a rep schedules a RDV directly in the calendar
//     without first creating / linking a prospect record.
//     Identity tokens are extracted from the event title so the contract
//     fallback below can still try to match a sale.
$orphanEvents = [];
try {
    $orphanSql = "SELECT id, title, date, agent, " . ($hasEventProspectLink ? "prospect_id" : "'' AS prospect_id") . "
                  FROM extraneterp_calendar_events
                  WHERE type = 'rdv' AND date BETWEEN :df AND :dt";
    $orphanParams = [':df' => $monthStart, ':dt' => $monthEnd];
    if (!$isPriv) {
        $orphanSql .= " AND LOWER(agent) = LOWER(:me2)";
        $orphanParams[':me2'] = $username;
    }
    $os = $db->prepare($orphanSql);
    $os->execute($orphanParams);
    foreach ($os->fetchAll() as $ev) {
        $pid = trim((string)($ev['prospect_id'] ?? ''));
        // Skip events already accounted for via prospect_id in step 1.
        if ($pid !== '' && isset($prospectVendor[$pid])) continue;
        $vOrig = (string)($ev['agent'] ?? '');
        $v = strtolower(trim($vOrig));
        if ($v === '') continue;
        $vendorRdv[$v] = ($vendorRdv[$v] ?? 0) + 1;
        if (!isset($vendorLabel[$v])) $vendorLabel[$v] = $vOrig;
        // Capture identity from the event title for the contract fallback.
        $ident = rdvc_event_identity((string)($ev['title'] ?? ''));
        $orphanEvents[] = [
            'vendor'    => $v,
            'date'      => substr((string)($ev['date'] ?? ''), 0, 10),
            'name_keys' => $ident['name_keys'],
            'tokens'    => $ident['tokens'],
            'phones'    => $ident['phones'],
        ];
    }
} catch (Throwable $e) { /* calendar table may not exist */ }

// 2) Contracts in the same month linked to those prospects.
$contractsByVendor = []; // vendor => [ partner => ['count'=>n, 'revenue'=>x] ]
$cancelledByVendor = []; // vendor => ['count'=>n, 'revenue'=>x]
$countedContractIds = [];

if (!empty($prospectIds)) {
    // chunked IN clause to stay under MySQL limits
    $chunks = array_chunk($prospectIds, 500);
    foreach ($chunks as $chunk) {
        $place = implode(',', array_fill(0, count($chunk), '?'));
        $sqlC = "
          SELECT id, prospect_id, partner, premium, billing_status, signature_date, assigned_to
          FROM extraneterp_contracts
          WHERE prospect_id IN ($place)
            AND signature_date BETWEEN ? AND ?
        ";
        $bind = array_merge($chunk, [$monthStart, $monthEnd]);
        if (!$isPriv) {
            // Hard isolation: non-privileged users only ever see contracts
            // where THEY are the closing agent, even if the prospect is theirs.
            $sqlC .= " AND LOWER(assigned_to) = LOWER(?)";
            $bind[] = $username;
        }
        $cs = $db->prepare($sqlC);
        $cs->execute($bind);
        foreach ($cs->fetchAll() as $c) {
            $pid = $c['prospect_id'];
            if (!empty($c['id'])) $countedContractIds[$c['id']] = true;
            // canonical (lowercase) vendor key — set when we recorded the RDV
            $vendor = $prospectVendor[$pid] ?? null;
            if (!$vendor) continue;
            $partner = trim((string)($c['partner'] ?? '')) ?: '(Inconnu)';
            $prem    = (float)$c['premium'];
            if ($c['billing_status'] === 'Annuler la confirmation') {
                if (!isset($cancelledByVendor[$vendor])) $cancelledByVendor[$vendor] = ['count'=>0,'revenue'=>0.0];
                $cancelledByVendor[$vendor]['count']   += 1;
                $cancelledByVendor[$vendor]['revenue'] += $prem;
            } else {
                if (!isset($contractsByVendor[$vendor])) $contractsByVendor[$vendor] = [];
                if (!isset($contractsByVendor[$vendor][$partner])) $contractsByVendor[$vendor][$partner] = ['count'=>0,'revenue'=>0.0];
                $contractsByVendor[$vendor][$partner]['count']   += 1;
                $contractsByVendor[$vendor][$partner]['revenue'] += $prem;
            }
        }
    }
}

// Fallback: contracts can be valid sales from RDV even when contract.prospect_id
// was never written. Match only inside the same vendor and month using strong
// identity keys from the RDV prospect: phone/email/name tokens.
if (!empty($prospectIdentity) || !empty($orphanEvents)) {
    $sqlC = "SELECT id, first_name, last_name, phone, mobile, email, partner, premium, billing_status, signature_date, assigned_to
             FROM extraneterp_contracts
             WHERE signature_date BETWEEN ? AND ?";
    $bind = [$monthStart, $monthEnd];
    if (!$isPriv) { $sqlC .= " AND LOWER(assigned_to) = LOWER(?)"; $bind[] = $username; }
    $cs = $db->prepare($sqlC);
    $cs->execute($bind);
    foreach ($cs->fetchAll() as $c) {
        $cid = $c['id'] ?? '';
        if ($cid !== '' && isset($countedContractIds[$cid])) continue;
        $vendor = strtolower(trim((string)($c['assigned_to'] ?? '')));
        if ($vendor === '') continue;
        $contractTails = [];
        foreach ([$c['phone'] ?? '', $c['mobile'] ?? ''] as $ph) {
            $digits = preg_replace('/\D+/', '', (string)$ph);
            if (strlen($digits) >= 9) $contractTails[substr($digits, -9)] = true;
        }
        $contractEmail = strtolower(trim((string)($c['email'] ?? '')));
        $contractNameKeys = array_flip(rdvc_name_keys($c['first_name'] ?? '', $c['last_name'] ?? ''));
        $contractTokens = rdvc_identity_tokens(($c['first_name'] ?? '') . ' ' . ($c['last_name'] ?? ''));
        $matched = false;
        foreach ($prospectIdentity as $ident) {
            if (($ident['vendor'] ?? '') !== $vendor) continue;
            foreach ($ident['phones'] as $t) if (isset($contractTails[$t])) { $matched = true; break 2; }
            if ($contractEmail !== '' && $contractEmail === ($ident['email'] ?? '')) { $matched = true; break; }
            foreach ($ident['name_keys'] as $k) if (isset($contractNameKeys[$k])) { $matched = true; break 2; }
            if (rdvc_tokens_cover($ident['tokens'] ?? [], $contractTokens) || rdvc_tokens_cover($contractTokens, $ident['tokens'] ?? [])) { $matched = true; break; }
        }
        if (!$matched) {
            // Try the orphan calendar RDVs (no prospect_id) — match by the
            // identity extracted from the event title.
            foreach ($orphanEvents as $oev) {
                if (($oev['vendor'] ?? '') !== $vendor) continue;
                foreach ($oev['phones'] as $t) if (isset($contractTails[$t])) { $matched = true; break 2; }
                foreach ($oev['name_keys'] as $k) if (isset($contractNameKeys[$k])) { $matched = true; break 2; }
                if (rdvc_tokens_cover($oev['tokens'] ?? [], $contractTokens) || rdvc_tokens_cover($contractTokens, $oev['tokens'] ?? [])) { $matched = true; break; }
            }
        }
        if (!$matched) continue;
        if ($cid !== '') $countedContractIds[$cid] = true;
        $partner = trim((string)($c['partner'] ?? '')) ?: '(Inconnu)';
        $prem = (float)$c['premium'];
        if ($c['billing_status'] === 'Annuler la confirmation') {
            if (!isset($cancelledByVendor[$vendor])) $cancelledByVendor[$vendor] = ['count'=>0,'revenue'=>0.0];
            $cancelledByVendor[$vendor]['count'] += 1; $cancelledByVendor[$vendor]['revenue'] += $prem;
        } else {
            if (!isset($contractsByVendor[$vendor])) $contractsByVendor[$vendor] = [];
            if (!isset($contractsByVendor[$vendor][$partner])) $contractsByVendor[$vendor][$partner] = ['count'=>0,'revenue'=>0.0];
            $contractsByVendor[$vendor][$partner]['count'] += 1; $contractsByVendor[$vendor][$partner]['revenue'] += $prem;
        }
    }
}

// 3) Build response rows
$vendors = array_unique(array_merge(array_keys($vendorRdv), array_keys($contractsByVendor)));
sort($vendors);

$rows = [];
$totRdv = 0;
$totSales = 0;
$totRev = 0.0;
$totByPartner = []; // partner => ['count'=>n,'revenue'=>x]
$totCancelled = ['count'=>0,'revenue'=>0.0];

foreach ($vendors as $v) {
    $byPartner = $contractsByVendor[$v] ?? [];
    $salesCount = 0; $salesRev = 0.0;
    foreach ($byPartner as $p => $agg) {
        $salesCount += $agg['count'];
        $salesRev   += $agg['revenue'];
        if (!isset($totByPartner[$p])) $totByPartner[$p] = ['count'=>0,'revenue'=>0.0];
        $totByPartner[$p]['count']   += $agg['count'];
        $totByPartner[$p]['revenue'] += $agg['revenue'];
    }
    $rdv = $vendorRdv[$v] ?? 0;
    $cancelled = $cancelledByVendor[$v] ?? ['count'=>0,'revenue'=>0.0];
    $totCancelled['count']   += $cancelled['count'];
    $totCancelled['revenue'] += $cancelled['revenue'];

    $rows[] = [
        // Original casing as stored on the prospect (so the frontend can
        // resolve fullName via the users map). Canonical key kept too.
        'vendor'           => $vendorLabel[$v] ?? $v,
        'vendor_key'       => $v,
        'rdv_taken'        => (int)$rdv,
        'sales_from_rdv'   => (int)$salesCount,
        'revenue_from_rdv' => (float)$salesRev,
        'conversion_rate'  => $rdv > 0 ? round(($salesCount / $rdv) * 100, 1) : 0.0,
        'by_partner'       => (object)$byPartner,
        'cancelled'        => $cancelled,
    ];

    $totRdv   += $rdv;
    $totSales += $salesCount;
    $totRev   += $salesRev;
}

ok([
    'month' => $ym,
    'rows'  => $rows,
    'totals' => [
        'rdv_taken'        => (int)$totRdv,
        'sales_from_rdv'   => (int)$totSales,
        'revenue_from_rdv' => (float)$totRev,
        'conversion_rate'  => $totRdv > 0 ? round(($totSales / $totRdv) * 100, 1) : 0.0,
        'by_partner'       => (object)$totByPartner,
        'cancelled'        => $totCancelled,
    ],
]);
