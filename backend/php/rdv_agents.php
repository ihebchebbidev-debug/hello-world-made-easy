<?php
// =====================================================================
// RDV pris per Agent per day for a given month, plus won / failed totals.
// GET /rdv_agents.php?ym=YYYY-MM
//
// Sources of truth:
//   - extraneterp_calendar_events (type='rdv')  → daily "RDV pris" series
//   - rdv_status                                 → 'won','nrp','lost','pending'
//   - extraneterp_contracts.prospect_id          → auto-derive "won" when a
//     non-cancelled contract exists for the linked prospect.
//
// Only users whose role is 'Agent' appear as series.
// Non-privileged users only see their own series.
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

// --- column detection (reuse logic from calendar.php) ---
function _has_col(PDO $db, string $table, string $col): bool {
    try { return (bool)$db->query("SHOW COLUMNS FROM $table LIKE " . $db->quote($col))->fetch(); }
    catch (Throwable $e) { return false; }
}
$hasLink   = _has_col($db, 'extraneterp_calendar_events', 'prospect_id');
$hasStatus = _has_col($db, 'extraneterp_calendar_events', 'rdv_status');
$hasOrig   = _has_col($db, 'extraneterp_calendar_events', 'original_agent');
$hasProspectPhone2 = _has_col($db, 'extraneterp_prospects', 'phone2');
$hasProspectConverted = _has_col($db, 'extraneterp_prospects', 'converted');
$hasProspectConvertedAt = _has_col($db, 'extraneterp_prospects', 'converted_at');
$hasProspectOpportunity = _has_col($db, 'extraneterp_prospects', 'opportunity_id');
// Lazily create + backfill the immutable original_agent column so RDV credit
// survives prospect reassignments / event edits even on installs that have
// never hit calendar.php since the migration was added.
if (!$hasOrig) {
    try {
        $db->exec("ALTER TABLE extraneterp_calendar_events
                   ADD COLUMN original_agent VARCHAR(80) NULL AFTER agent");
        $db->exec("UPDATE extraneterp_calendar_events
                      SET original_agent = agent
                    WHERE original_agent IS NULL OR original_agent = ''");
        $hasOrig = true;
    } catch (Throwable $e) { /* best-effort */ }
} else {
    // Heal any rows where the original_agent was never populated (e.g. legacy
    // inserts before the INSERT path stamped it).
    try {
        $db->exec("UPDATE extraneterp_calendar_events
                      SET original_agent = agent
                    WHERE (original_agent IS NULL OR original_agent = '')
                      AND agent IS NOT NULL AND agent <> ''");
    } catch (Throwable $e) { /* ignore */ }
}

function rdv_norm_text(string $s): string {
    $s = strtolower(trim($s));
    $ascii = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
    if ($ascii !== false) $s = $ascii;
    $s = preg_replace('/[^a-z0-9]+/', ' ', $s);
    return trim(preg_replace('/\s+/', ' ', $s));
}
function rdv_extract_name_parts(string $fullName, string $username): array {
    $parts = preg_split('/\s+/', trim($fullName), -1, PREG_SPLIT_NO_EMPTY);
    if (count($parts) >= 2) {
        $last = array_pop($parts);
        $first = implode(' ', $parts);
        return ['first_name' => $first, 'last_name' => $last];
    }
    // single-word full_name — fallback: username = last_name, full_name = first_name
    return ['first_name' => $fullName ?: $username, 'last_name' => $username];
}

function rdv_add_agent_alias(array &$aliases, ?string $value, string $canonical): void {
    $raw = strtolower(trim((string)$value));
    if ($raw !== '') $aliases[$raw] = $canonical;
    $norm = rdv_norm_text((string)$value);
    if ($norm !== '') $aliases[$norm] = $canonical;
}
function rdv_canonical_agent_key(?string $value, array $aliases): string {
    $raw = strtolower(trim((string)$value));
    if ($raw === '') return '';
    if (isset($aliases[$raw])) return $aliases[$raw];
    $norm = rdv_norm_text($raw);
    if ($norm !== '' && isset($aliases[$norm])) return $aliases[$norm];
    return $raw;
}
function rdv_is_prospect_rdv_marker(?string $status, ?string $source): bool {
    $statusNorm = rdv_norm_text((string)$status);
    if ($statusNorm === 'rdv' || substr($statusNorm, 0, 4) === 'rdv ') return true;

    $sourceNorm = rdv_norm_text((string)$source);
    return $sourceNorm === 'rdv'
        || ($sourceNorm !== '' && substr($sourceNorm, 0, 3) === 'rdv' && strpos($sourceNorm, 'chaud') !== false);
}
function rdv_phone_tails_from_values(array $values): array {
    $tails = [];
    foreach ($values as $ph) {
        $digits = preg_replace('/\D+/', '', (string)$ph);
        if (strlen($digits) >= 9) $tails[] = substr($digits, -9);
    }
    return array_values(array_unique($tails));
}

// Agents list — primary: users currently with role 'Agent' AND who belong
// to a group whose name matches 'rdv' (case-insensitive, e.g. "RDV",
// "Groupe RDV", "Equipe RDV"). Aliases are still built over ALL users so
// that an RDV stays credited to its ORIGINAL taker even if that user's role
// or group later changed, and so that legacy events whose `agent` field
// stored a display name resolve to the correct username.
$qStmt = $db->query("SELECT id, username, full_name, role FROM extraneterp_users");
$allUsers = $qStmt->fetchAll();

// Build set of user_ids whose memberships include a group matching 'rdv'.
// If the join table is missing/empty, we fall back to "no group filter"
// (keeps legacy behaviour rather than emptying the chart).
$rdvUserIds = [];
try {
    $gStmt = $db->query(
        "SELECT DISTINCT user_id FROM extraneterp_user_groups
          WHERE LOWER(group_name) LIKE '%rdv%'"
    );
    foreach ($gStmt->fetchAll() as $r) {
        $rdvUserIds[(string)$r['user_id']] = true;
    }
} catch (Throwable $e) { /* table missing -> no filter */ }
$applyRdvGroupFilter = !empty($rdvUserIds);

$currentAgents = [];     // role = Agent today AND in 'rdv' group
$rdvUserLower = [];      // username keys that are explicitly in an RDV group
$userDisplayByLower = []; // every user, for original-taker resolution
$userFullNameByLower = []; // every user, full_name as stored (post-edit safe)
$agentAliases = [];
$agentTokenAliases = [];
foreach ($allUsers as $u) {
    $lower = strtolower(trim((string)$u['username']));
    if ($lower === '') continue;
    $nameParts = rdv_extract_name_parts($u['full_name'] ?: $u['username'], $u['username']);
    $display = $nameParts['last_name'];
    $userDisplayByLower[$lower] = $display;
    $userFullNameByLower[$lower] = trim((string)($u['full_name'] ?? '')) !== ''
        ? trim((string)$u['full_name'])
        : (string)$u['username'];
    $userFirstNameByLower[$lower] = $nameParts['first_name'];
    $isAgent = strtolower(trim((string)($u['role'] ?? ''))) === 'agent';
    $inRdvGroup = $applyRdvGroupFilter ? isset($rdvUserIds[(string)$u['id']]) : true;
    if ($inRdvGroup) {
        $rdvUserLower[$lower] = true;
    }
    if ($isAgent && $inRdvGroup) {
        $currentAgents[$lower] = $display;
    }
    rdv_add_agent_alias($agentAliases, $u['username'] ?? '', $lower);
    rdv_add_agent_alias($agentAliases, $u['full_name'] ?? '', $lower);
    foreach (explode(' ', rdv_norm_text((string)($u['full_name'] ?? ''))) as $token) {
        if (strlen($token) >= 3) $agentTokenAliases[$token][$lower] = true;
    }
}

foreach ($agentTokenAliases as $token => $owners) {
    if (count($owners) === 1) $agentAliases[$token] = array_key_first($owners);
}
$agentByLower = $currentAgents;
if (!$isPriv) {
    $lower = rdv_canonical_agent_key($username, $agentAliases);
    $allowedForRdvStats = $lower !== '' && (!$applyRdvGroupFilter || isset($rdvUserLower[$lower]));
    if ($allowedForRdvStats && (isset($currentAgents[$lower]) || isset($userDisplayByLower[$lower]))) {
        $agentByLower = [$lower => $userDisplayByLower[$lower] ?? $currentAgents[$lower] ?? $username];
    } else {
        $agentByLower = [];
    }
}

// Day axis
$axis = [];
for ($d = 1; $d <= $daysInMonth; $d++) {
    $axis[] = sprintf('%s-%02d', $ym, $d);
}

// counts[lowerAgent][YYYY-MM-DD] = number of RDV taken
$counts = [];
$wonByAgent  = [];
$lostByAgent = [];
$nrpByAgent  = [];
$pendingByAgent = [];
$uniqueByAgent = []; // unique prospects with at least one RDV in the month
foreach ($agentByLower as $lower => $_) {
    $counts[$lower] = array_fill_keys($axis, 0);
    $wonByAgent[$lower] = 0;
    $lostByAgent[$lower] = 0;
    $nrpByAgent[$lower] = 0;
    $pendingByAgent[$lower] = 0;
    $uniqueByAgent[$lower] = [];
}

function rdv_name_keys(?string $first, ?string $last): array {
    $fn = rdv_norm_text((string)$first);
    $ln = rdv_norm_text((string)$last);
    $keys = [];
    foreach ([trim("$fn $ln"), trim("$ln $fn")] as $k) {
        if ($k !== '') $keys[$k] = true;
    }
    $tokens = array_values(array_unique(array_filter(array_merge(explode(' ', $fn), explode(' ', $ln)))));
    sort($tokens);
    if (!empty($tokens)) $keys[implode(' ', $tokens)] = true;
    return array_keys($keys);
}
function rdv_swap_name_order(string $fullName): string {
    $parts = preg_split('/\s+/', trim($fullName), -1, PREG_SPLIT_NO_EMPTY);
    if (count($parts) < 2) return $fullName;
    return implode(' ', array_reverse($parts));
}
function rdv_identity_tokens(string $s): array {
    $stop = array_flip([
        'rdv','rendez','vous','rappel','signature','appel','tel','telephone','phone','mobile',
        'client','prospect','test','devis','mutuelle','sante','mr','mme','mlle','monsieur','madame',
    ]);
    $tokens = [];
    foreach (explode(' ', rdv_norm_text($s)) as $t) {
        if ($t === '' || strlen($t) < 3 || isset($stop[$t]) || preg_match('/^\d+$/', $t)) continue;
        $tokens[$t] = true;
    }
    return array_keys($tokens);
}
function rdv_tokens_cover(array $haystack, array $needles): bool {
    if (count($needles) < 2) return false;
    $set = array_flip($haystack);
    foreach ($needles as $t) if (!isset($set[$t])) return false;
    return true;
}
function rdv_resolve_event_prospect(array $e, bool $hasLink, array $prospectsById, array $exactNameToProspect, array $prospectTokens): ?string {
    $linked = $hasLink ? trim((string)($e['prospect_id'] ?? '')) : '';
    if ($linked !== '' && isset($prospectsById[$linked])) return $linked;

    $title = trim((string)($e['title'] ?? ''));
    if ($title === '') return $linked !== '' ? $linked : null;

    if (preg_match('/\bP-[A-Z0-9-]+\b/i', $title, $m)) {
        $candidate = strtoupper($m[0]);
        if (isset($prospectsById[$candidate])) return $candidate;
    }

    $candidates = [$title];
    foreach ([' — ', ' – ', ' - ', ' : ', ' | ', '—', '–', ':', '|'] as $sep) {
        $pos = strpos($title, $sep);
        if ($pos !== false) $candidates[] = substr($title, $pos + strlen($sep));
    }

    foreach ($candidates as $c) {
        $key = rdv_norm_text($c);
        if ($key !== '' && isset($exactNameToProspect[$key])) return $exactNameToProspect[$key];
        $tokens = array_values(array_filter(explode(' ', $key)));
        if (count($tokens) < 2) continue;
        $set = array_flip($tokens);
        $best = null; $bestScore = 0;
        foreach ($prospectTokens as $pid => $ptokens) {
            if (count($ptokens) < 2) continue;
            $covered = 0;
            foreach ($ptokens as $t) if (isset($set[$t])) $covered++;
            if ($covered === count($ptokens) && $covered > $bestScore) {
                $best = $pid; $bestScore = $covered;
            }
        }
        if ($best) return $best;
    }
    return $linked !== '' ? $linked : null;
}

// Map prospect_id => earliest non-cancelled contract / outcome date.
// An RDV is considered "won" only when that date is on or after the RDV date.
// IMPORTANT: we no longer fall back to "today" when no real won/lost date is
// known — that produced false positives by projecting the prospect's current
// outcome onto past RDVs. We require either:
//   - a non-cancelled contract signature_date (won), or
//   - an activity_log row field=outcome new_value in ('won','lost').
// If neither exists, the RDV stays "pending" unless explicitly set via rdv_status.
$wonProspectDate = [];
$lostProspectDate = [];
$prospectCurrentOutcome = [];
$prospectLostKind = [];
$prospectsById = [];
$exactNameToProspect = [];
$prospectTokens = [];
$prospectPhoneTails = []; // pid => [tail9digits, ...]
$prospectAgentKey = []; // pid => canonical username
try {
    $prospectCols = "id, first_name, last_name, phone, mobile, email, assigned_to, outcome, lost_reason, status, source";
    if ($hasProspectPhone2) $prospectCols .= ", phone2";
    if ($hasProspectConverted) $prospectCols .= ", converted";
    if ($hasProspectConvertedAt) $prospectCols .= ", converted_at";
    if ($hasProspectOpportunity) $prospectCols .= ", opportunity_id";
    $s = $db->query("SELECT $prospectCols FROM extraneterp_prospects");
    foreach ($s->fetchAll() as $r) {
        $pid = $r['id'] ?? '';
        if (!$pid) continue;
        $prospectsById[$pid] = $r;
        $prospectAgentKey[$pid] = rdv_canonical_agent_key($r['assigned_to'] ?? '', $agentAliases);
        $outcome = strtolower(trim((string)($r['outcome'] ?? 'pending')));
        if (in_array($outcome, ['won', 'lost'], true)) $prospectCurrentOutcome[$pid] = $outcome;
        $convertedAt = substr((string)($r['converted_at'] ?? ''), 0, 10);
        $convertedFlag = strtolower(trim((string)($r['converted'] ?? '')));
        if ($convertedAt !== '' || in_array($convertedFlag, ['1', 'true', 'yes', 'oui'], true)) {
            $wonProspectDate[$pid] = preg_match('/^\d{4}-\d{2}-\d{2}$/', $convertedAt) ? $convertedAt : ($wonProspectDate[$pid] ?? date('Y-m-d'));
        }
        foreach (rdv_name_keys($r['first_name'] ?? '', $r['last_name'] ?? '') as $key) {
            if ($key !== '' && !isset($exactNameToProspect[$key])) $exactNameToProspect[$key] = $pid;
        }
        $tokens = array_values(array_unique(array_filter(explode(' ', rdv_norm_text(($r['first_name'] ?? '') . ' ' . ($r['last_name'] ?? ''))))));
        $prospectTokens[$pid] = $tokens;
        $prospectPhoneTails[$pid] = rdv_phone_tails_from_values([$r['phone'] ?? '', $r['mobile'] ?? '', $r['phone2'] ?? '']);
        $reason = strtolower((string)($r['lost_reason'] ?? '') . ' ' . (string)($r['status'] ?? ''));
        if (($r['outcome'] ?? '') === 'lost') {
            $prospectLostKind[$pid] = preg_match('/nrp|injoign|pas\s*de\s*r[ée]p|ne\s*r[ée]p|sans\s*r[ée]p/i', $reason) ? 'nrp' : 'lost';
        }
    }
} catch (Throwable $e) { /* ignore */ }

// ---------------------------------------------------------------
// AGENT-SCOPED CONTRACT LOOKUPS (fallback when prospect_id missing
// on contract OR on RDV). Match by:
//   - lower(assigned_to) + name_key
//   - lower(assigned_to) + last-9-digits of phone/mobile
//   - lower(assigned_to) + email
// Stores EARLIEST signature_date so we only count "won" when the
// signature happened on/after the RDV date.
// ---------------------------------------------------------------
$contractsByAgentName  = [];
$contractsByAgentPhone = [];
$contractsByAgentEmail = [];
$contractsByAgent      = [];
$contractsByName       = [];
$contractsByPhone      = [];
$contractsByEmail      = [];
$contractsById         = [];
$contractsAll          = [];
try {
    $s = $db->query("SELECT id, assigned_to, first_name, last_name, phone, mobile, email, signature_date
                     FROM extraneterp_contracts
                     WHERE signature_date IS NOT NULL
                       AND (billing_status IS NULL OR billing_status <> 'Annuler la confirmation')");
    foreach ($s->fetchAll() as $r) {
        $agent = rdv_canonical_agent_key($r['assigned_to'] ?? '', $agentAliases);
        $d = $r['signature_date'] ?? '';
        if (!$d) continue;
        $contractId = trim((string)($r['id'] ?? ''));
        if ($contractId !== '' && (!isset($contractsById[$contractId]) || $d < $contractsById[$contractId])) {
            $contractsById[$contractId] = $d;
        }
        $contractNameKeys = rdv_name_keys($r['first_name'] ?? '', $r['last_name'] ?? '');
        $contractNameTokens = rdv_identity_tokens(($r['first_name'] ?? '') . ' ' . ($r['last_name'] ?? ''));
        $contractPhoneTails = [];
        foreach ([$r['phone'] ?? '', $r['mobile'] ?? ''] as $ph) {
            $digits = preg_replace('/\D+/', '', (string)$ph);
            if (strlen($digits) < 9) continue;
            $tail = substr($digits, -9);
            $contractPhoneTails[$tail] = true;
        }
        $email = strtolower(trim((string)($r['email'] ?? '')));
        $record = [
            'id' => $r['id'] ?? '',
            'signature_date' => $d,
            'name_keys' => $contractNameKeys,
            'name_tokens' => $contractNameTokens,
            'phone_tails' => array_keys($contractPhoneTails),
            'email' => $email,
        ];
        $contractsAll[] = $record;
        foreach ($contractNameKeys as $key) {
            if ($key === '') continue;
            if (!isset($contractsByName[$key]) || $d < $contractsByName[$key]) $contractsByName[$key] = $d;
            if ($agent && isset($agentByLower[$agent]) && (!isset($contractsByAgentName[$agent][$key]) || $d < $contractsByAgentName[$agent][$key])) {
                $contractsByAgentName[$agent][$key] = $d;
            }
        }
        foreach (array_keys($contractPhoneTails) as $tail) {
            if (!isset($contractsByPhone[$tail]) || $d < $contractsByPhone[$tail]) $contractsByPhone[$tail] = $d;
            if ($agent && isset($agentByLower[$agent]) && (!isset($contractsByAgentPhone[$agent][$tail]) || $d < $contractsByAgentPhone[$agent][$tail])) {
                $contractsByAgentPhone[$agent][$tail] = $d;
            }
        }
        if ($email !== '') {
            if (!isset($contractsByEmail[$email]) || $d < $contractsByEmail[$email]) $contractsByEmail[$email] = $d;
            if ($agent && isset($agentByLower[$agent]) && (!isset($contractsByAgentEmail[$agent][$email]) || $d < $contractsByAgentEmail[$agent][$email])) {
                $contractsByAgentEmail[$agent][$email] = $d;
            }
        }
        if ($agent && isset($agentByLower[$agent])) $contractsByAgent[$agent][] = $record;
    }
} catch (Throwable $e) { /* ignore */ }

try {
    $s = $db->query("SELECT prospect_id, MIN(signature_date) AS d
                     FROM extraneterp_contracts
                     WHERE prospect_id IS NOT NULL AND prospect_id <> ''
                       AND signature_date IS NOT NULL
                       AND (billing_status IS NULL OR billing_status <> 'Annuler la confirmation')
                     GROUP BY prospect_id");
    foreach ($s->fetchAll() as $r) {
        if (!empty($r['d']) && !empty($r['prospect_id'])) {
            $pid = $r['prospect_id'];
            if (!isset($wonProspectDate[$pid]) || $r['d'] < $wonProspectDate[$pid]) {
                $wonProspectDate[$pid] = $r['d'];
            }
        }
    }
} catch (Throwable $e) { /* contracts may not have prospect_id yet */ }

try {
    $s = $db->query("SELECT first_name, last_name, MIN(signature_date) AS d
                     FROM extraneterp_contracts
                     WHERE signature_date IS NOT NULL
                       AND (billing_status IS NULL OR billing_status <> 'Annuler la confirmation')
                     GROUP BY first_name, last_name");
    foreach ($s->fetchAll() as $r) {
        $d = $r['d'] ?? '';
        if (!$d) continue;
        foreach (rdv_name_keys($r['first_name'] ?? '', $r['last_name'] ?? '') as $key) {
            $pid = $exactNameToProspect[$key] ?? null;
            if ($pid && (!isset($wonProspectDate[$pid]) || $d < $wonProspectDate[$pid])) $wonProspectDate[$pid] = $d;
        }
    }
} catch (Throwable $e) { /* ignore */ }

// Backfill won evidence for prospect-only RDVs when contracts were imported
// without prospect_id. Match by the prospect's own name / phone / email so
// PASS 2 receives the same conversion credit as calendar RDVs.
foreach ($prospectsById as $pid => $p) {
    $candidateDates = [];
    $opportunityId = trim((string)($p['opportunity_id'] ?? ''));
    if ($opportunityId !== '' && isset($contractsById[$opportunityId])) $candidateDates[] = $contractsById[$opportunityId];
    foreach (rdv_name_keys($p['first_name'] ?? '', $p['last_name'] ?? '') as $key) {
        if (isset($contractsByName[$key])) $candidateDates[] = $contractsByName[$key];
    }
    foreach ($prospectPhoneTails[$pid] ?? [] as $tail) {
        if (isset($contractsByPhone[$tail])) $candidateDates[] = $contractsByPhone[$tail];
    }
    $email = strtolower(trim((string)($p['email'] ?? '')));
    if ($email !== '' && isset($contractsByEmail[$email])) $candidateDates[] = $contractsByEmail[$email];
    if (!$candidateDates) continue;
    sort($candidateDates);
    $d = $candidateDates[0];
    if (!isset($wonProspectDate[$pid]) || $d < $wonProspectDate[$pid]) $wonProspectDate[$pid] = $d;
}

try {
    $s = $db->query("SELECT entity_id AS prospect_id, LOWER(new_value) AS outcome, MIN(DATE(created_at)) AS d
                     FROM extraneterp_activity_log
                     WHERE entity_type = 'prospect'
                       AND field = 'outcome'
                       AND LOWER(new_value) IN ('won','lost')
                     GROUP BY entity_id, LOWER(new_value)");
    foreach ($s->fetchAll() as $r) {
        $pid = $r['prospect_id'] ?? '';
        $d = $r['d'] ?? '';
        if (!$pid || !$d) continue;
        if ($r['outcome'] === 'won' && (!isset($wonProspectDate[$pid]) || $d < $wonProspectDate[$pid])) $wonProspectDate[$pid] = $d;
        if ($r['outcome'] === 'lost' && (!isset($lostProspectDate[$pid]) || $d < $lostProspectDate[$pid])) $lostProspectDate[$pid] = $d;
    }
} catch (Throwable $e) { /* ignore */ }

if (!empty($agentByLower)) {
    $cols = "id, title, date, agent, type" . ($hasOrig ? ", original_agent" : "") . ($hasLink ? ", prospect_id" : "") . ($hasStatus ? ", rdv_status" : "");
    $sql = "SELECT $cols FROM extraneterp_calendar_events
            WHERE type = 'rdv' AND date BETWEEN ? AND ?
            ORDER BY date ASC, time ASC";
    $args = [$monthStart, $monthEnd];
    $st = $db->prepare($sql);
    $st->execute($args);

    // Dedup: count won / lost only once per (agent, prospect) within the month
    // so 3 RDVs for the same prospect don't inflate the score.
    $countedWon = [];   // key = lower|pid
    $countedLost = [];
    $countedNrp = [];
    $countedPending = [];
    $calendarRdvProspectIds = []; // pid => true when PASS 1 already covers that prospect this month

    foreach ($st->fetchAll() as $e) {
        $d = $e['date'] ?? '';
        $pid = rdv_resolve_event_prospect($e, $hasLink, $prospectsById, $exactNameToProspect, $prospectTokens);
        if ($pid) $calendarRdvProspectIds[$pid] = true;
        // Primary attribution = the IMMUTABLE `original_agent` stamped at
        // event creation. Falls back to `agent` for rows that predate the
        // column. Never silently move an RDV onto the prospect's current
        // `assigned_to` just because the prospect was reassigned afterwards
        // or because the taker's role changed.
        $rawOrig  = $hasOrig ? trim((string)($e['original_agent'] ?? '')) : '';
        $rawAgent = trim((string)($e['agent'] ?? ''));
        $effective = $rawOrig !== '' ? $rawOrig : $rawAgent;
        $lower = rdv_canonical_agent_key($effective, $agentAliases);
        // Fallback to prospect's assignee ONLY when the event has no agent at
        // all (legacy / imported rows). Reassignments after the fact must
        // never rewrite history.
        if ($lower === '' && $effective === '' && $pid && !empty($prospectAgentKey[$pid])) {
            $lower = $prospectAgentKey[$pid];
        }
        if ($lower === '') continue;
        // If the original taker is a known RDV-group user but not in the
        // current role=Agent list (e.g. role changed), still credit them.
        // Never re-add non-RDV-group users here: the chart must only display
        // RDV-group members when the group filter is available.
        if (!isset($agentByLower[$lower])) {
            $allowedForRdvStats = !$applyRdvGroupFilter || isset($rdvUserLower[$lower]);
            if ($isPriv && $allowedForRdvStats && isset($userDisplayByLower[$lower])) {
                $agentByLower[$lower] = $userDisplayByLower[$lower];
                $counts[$lower]         = array_fill_keys($axis, 0);
                $wonByAgent[$lower]     = 0;
                $lostByAgent[$lower]    = 0;
                $nrpByAgent[$lower]     = 0;
                $pendingByAgent[$lower] = 0;
                $uniqueByAgent[$lower]  = [];
            } else {
                continue;
            }
        }
        if (!isset($counts[$lower][$d])) continue;
        $counts[$lower][$d] += 1;
        $matchedContractId = null;
        $manual = $hasStatus ? ($e['rdv_status'] ?? 'pending') : 'pending';

        // Auto-derive outcomes. Prefer dated evidence (contract signature or
        // activity log) so a future status is not projected onto older RDVs.
        // If legacy rows have no dated evidence, fall back to the current
        // linked prospect outcome; this keeps historical RDV stats complete
        // after prospect_id backfill on old data.
        $autoWon = false;
        // Rule: a prospect that has an RDV in the month AND a linked
        // (non-cancelled) contract counts as WON for the agent — regardless
        // of whether the signature happened before or after the RDV date.
        if ($pid && isset($wonProspectDate[$pid])) {
            $autoWon = true;
        } elseif ($pid && ($prospectCurrentOutcome[$pid] ?? '') === 'won') {
            $autoWon = true;
        }
        $autoLost = false;
        if ($pid && isset($lostProspectDate[$pid])) {
            $autoLost = true;
        } elseif ($pid && ($prospectCurrentOutcome[$pid] ?? '') === 'lost') {
            $autoLost = true;
        }

        // ---------------------------------------------------------
        // FALLBACK: even if no contract is linked via prospect_id,
        // try to find one signed by the same agent for the same
        // person (matched by name / phone / email). This catches
        // the very common case where contracts are imported without
        // prospect_id and would otherwise count as 0 won.
        // ---------------------------------------------------------
        if (!$autoWon) {
            $candidatesName  = [];
            $candidatesPhone = [];
            $candidatesEmail = [];

            // From linked prospect (if any)
            if ($pid && isset($prospectsById[$pid])) {
                $p = $prospectsById[$pid];
                foreach (rdv_name_keys($p['first_name'] ?? '', $p['last_name'] ?? '') as $k) {
                    if ($k !== '') $candidatesName[$k] = true;
                }
                foreach ($prospectPhoneTails[$pid] ?? [] as $t) $candidatesPhone[$t] = true;
                $em = strtolower(trim((string)($p['email'] ?? '')));
                if ($em !== '') $candidatesEmail[$em] = true;
            }

            // From RDV title — strip common prefixes
            $title = (string)($e['title'] ?? '');
            $titleClean = $title;
            foreach ([' — ', ' – ', ' - ', ' : ', ' | ', '—', '–', ':', '|'] as $sep) {
                $pos = strpos($titleClean, $sep);
                if ($pos !== false) { $titleClean = substr($titleClean, $pos + strlen($sep)); break; }
            }
            $titleKey = rdv_norm_text($titleClean);
            if ($titleKey !== '') {
                $candidatesName[$titleKey] = true;
                $toks = array_values(array_filter(explode(' ', $titleKey)));
                if (count($toks) >= 2) {
                    $candidatesName[implode(' ', array_reverse($toks))] = true;
                    $sorted = $toks; sort($sorted);
                    $candidatesName[implode(' ', $sorted)] = true;
                }
            }
            // Phone digits inside the title
            $titleDigits = preg_replace('/\D+/', '', $title);
            if (strlen($titleDigits) >= 9) $candidatesPhone[substr($titleDigits, -9)] = true;

            $titleTokens = rdv_identity_tokens($title);

            foreach (array_keys($candidatesName) as $k) {
                $sig = $contractsByAgentName[$lower][$k] ?? null;
                if (!$sig && $pid) $sig = $contractsByName[$k] ?? null;
                if ($sig) { $autoWon = true; break; }
            }
            if (!$autoWon) {
                foreach (array_keys($candidatesPhone) as $t) {
                    $sig = $contractsByAgentPhone[$lower][$t] ?? null;
                    if (!$sig && $pid) $sig = $contractsByPhone[$t] ?? null;
                    if ($sig) { $autoWon = true; break; }
                }
            }
            if (!$autoWon) {
                foreach (array_keys($candidatesEmail) as $em) {
                    $sig = $contractsByAgentEmail[$lower][$em] ?? null;
                    if (!$sig && $pid) $sig = $contractsByEmail[$em] ?? null;
                    if ($sig) { $autoWon = true; break; }
                }
            }
            if (!$autoWon || !$matchedContractId) {
                $bestContract = null;
                $contractPool = $contractsByAgent[$lower] ?? [];
                if ($pid) $contractPool = array_merge($contractPool, $contractsAll);
                foreach ($contractPool as $c) {
                    $strong = false;
                    foreach ($c['phone_tails'] as $t) if (isset($candidatesPhone[$t])) { $strong = true; break; }
                    if (!$strong && $c['email'] !== '' && isset($candidatesEmail[$c['email']])) $strong = true;
                    if (!$strong) {
                        foreach ($c['name_keys'] as $k) if (isset($candidatesName[$k])) { $strong = true; break; }
                    }
                    if (!$strong && rdv_tokens_cover($titleTokens, $c['name_tokens'])) $strong = true;

                    if (!$strong) continue;
                    if (!$bestContract || $c['signature_date'] < $bestContract['signature_date']) $bestContract = $c;
                }
                if ($bestContract) {
                    $autoWon = true;
                    $matchedContractId = $bestContract['id'] ?: null;
                }
            }
        }

        // Manual status takes precedence; otherwise use auto-derivation
        $status = $manual !== 'pending' ? $manual : ($autoWon ? 'won' : ($autoLost ? ($prospectLostKind[$pid] ?? 'lost') : 'pending'));

        $uniqKey = $pid ?: ($matchedContractId ? ('contract:' . $matchedContractId) : ('evt:' . $e['id']));
        $uniqueByAgent[$lower][$uniqKey] = true;
        $dedupKey = $lower . '|' . $uniqKey;
        if ($status === 'won') {
            if (!isset($countedWon[$dedupKey])) { $wonByAgent[$lower]++; $countedWon[$dedupKey] = true; }
        } elseif ($status === 'lost') {
            if (!isset($countedLost[$dedupKey])) { $lostByAgent[$lower]++; $countedLost[$dedupKey] = true; }
        } elseif ($status === 'nrp') {
            if (!isset($countedNrp[$dedupKey])) { $nrpByAgent[$lower]++; $countedNrp[$dedupKey] = true; }
        } else {
            // dedup pending per (agent, prospect) for consistency with won/lost/nrp
            if (!isset($countedPending[$dedupKey])) { $pendingByAgent[$lower]++; $countedPending[$dedupKey] = true; }
        }
    }

    // =================================================================
    // PASS 2 — Prospects marqués RDV par statut OU source sans événement calendrier.
    // Certains agents créent simplement le prospect avec un statut RDV*
    // ou une source "RDV" / "RDV CHAUD" sans
    // planifier l'événement (date de rappel laissée vide). Sans ce
    // second passage, ces RDV ne seraient jamais comptés.
    // Attribution: créateur d'origine dans activity_log si c'est un agent RDV
    // éligible, sinon assigned_to en fallback. Date: created_at du prospect. Déduplication par
    // (agent, prospect) — si un événement calendrier a déjà été compté
    // pour ce prospect, on ne le recompte pas ici.
    // =================================================================
    // Récupère le CRÉATEUR d'origine de chaque prospect depuis l'activity_log
    // (entity_type='prospect', field='created'). On préfère ce créateur à
    // assigned_to pour ne pas perdre le crédit après une réassignation.
    // Source de vérité: la date du prospect (et non celle du log) — sinon
    // un log écrit juste après minuit ferait sortir le créateur du mois.
    // On prend la PREMIÈRE entrée 'created' (MIN created_at) par prospect
    // pour rester immuable même si quelqu'un réécrit le log plus tard.
    $prospectCreator = [];
    try {
        $cs = $db->prepare("SELECT al.entity_id AS pid, al.user_username, al.created_at AS ts
                              FROM extraneterp_activity_log al
                              JOIN extraneterp_prospects p ON p.id = al.entity_id
                             WHERE al.entity_type = 'prospect'
                               AND al.field = 'created'
                               AND DATE(p.created_at) BETWEEN ? AND ?
                             ORDER BY al.created_at ASC");
        $cs->execute([$monthStart, $monthEnd]);
        foreach ($cs->fetchAll() as $r) {
            $pp = $r['pid'] ?? '';
            $uu = trim((string)($r['user_username'] ?? ''));
            // first writer wins (ORDER BY ASC + isset guard)
            if ($pp !== '' && $uu !== '' && !isset($prospectCreator[$pp])) {
                $prospectCreator[$pp] = $uu;
            }
        }
    } catch (Throwable $e) { /* ignore */ }

    try {
        $ps = $db->prepare("SELECT id, assigned_to, status, source, outcome, lost_reason,
                                   DATE(created_at) AS d
                              FROM extraneterp_prospects
                              WHERE (LOWER(TRIM(status)) LIKE 'rdv%'
                                     OR LOWER(TRIM(source)) = 'rdv'
                                     OR LOWER(TRIM(source)) LIKE 'rdv%chaud%')
                               AND DATE(created_at) BETWEEN ? AND ?");
        $ps->execute([$monthStart, $monthEnd]);
        foreach ($ps->fetchAll() as $p) {
            $pid = $p['id'] ?? '';
            $d   = $p['d']  ?? '';
            if (!$pid || !$d) continue;
            if (!rdv_is_prospect_rdv_marker($p['status'] ?? '', $p['source'] ?? '')) continue;
            // Priorité : créateur RDV éligible (activity_log) → sinon
            // assigned_to (fallback pour imports/admin/backoffice ou anciens logs).
            $candidateOwners = [];
            foreach ([$prospectCreator[$pid] ?? '', $p['assigned_to'] ?? ''] as $ownerCandidate) {
                $ownerCandidate = trim((string)$ownerCandidate);
                if ($ownerCandidate !== '' && !in_array($ownerCandidate, $candidateOwners, true)) {
                    $candidateOwners[] = $ownerCandidate;
                }
            }
            $lower = '';
            foreach ($candidateOwners as $ownerCandidate) {
                $candidateLower = rdv_canonical_agent_key($ownerCandidate, $agentAliases);
                if ($candidateLower === '') continue;
                $candidateAllowed = !$applyRdvGroupFilter || isset($rdvUserLower[$candidateLower]);
                if (isset($agentByLower[$candidateLower]) || ($isPriv && $candidateAllowed && isset($userDisplayByLower[$candidateLower]))) {
                    $lower = $candidateLower;
                    break;
                }
            }
            if ($lower === '') continue;

            // Inclure l'agent même s'il n'est plus dans le rôle Agent / groupe
            // RDV courant — uniquement pour vues privilégiées (cohérent avec
            // le passage 1).
            if (!isset($agentByLower[$lower])) {
                $allowed = !$applyRdvGroupFilter || isset($rdvUserLower[$lower]);
                if ($isPriv && $allowed && isset($userDisplayByLower[$lower])) {
                    $agentByLower[$lower]   = $userDisplayByLower[$lower];
                    $counts[$lower]         = array_fill_keys($axis, 0);
                    $wonByAgent[$lower]     = 0;
                    $lostByAgent[$lower]    = 0;
                    $nrpByAgent[$lower]     = 0;
                    $pendingByAgent[$lower] = 0;
                    $uniqueByAgent[$lower]  = [];
                } else {
                    continue;
                }
            }
            if (!isset($counts[$lower][$d])) continue;
            // Déjà couvert par un événement calendrier du mois ? on saute,
            // même si l'événement a été attribué à un autre agent, pour éviter
            // de compter deux fois le même RDV/prospect.
            if (isset($calendarRdvProspectIds[$pid])) continue;

            $counts[$lower][$d] += 1;
            $uniqueByAgent[$lower][$pid] = true;
            $dedupKey = $lower . '|' . $pid;

            // Statut: priorité au contrat / outcome connu.
            $autoWon = isset($wonProspectDate[$pid])
                    || (($prospectCurrentOutcome[$pid] ?? '') === 'won');
            $autoLost = isset($lostProspectDate[$pid])
                    || (($prospectCurrentOutcome[$pid] ?? '') === 'lost');

            if ($autoWon) {
                if (!isset($countedWon[$dedupKey])) { $wonByAgent[$lower]++; $countedWon[$dedupKey] = true; }
            } elseif ($autoLost) {
                $kind = $prospectLostKind[$pid] ?? 'lost';
                if ($kind === 'nrp') {
                    if (!isset($countedNrp[$dedupKey])) { $nrpByAgent[$lower]++; $countedNrp[$dedupKey] = true; }
                } else {
                    if (!isset($countedLost[$dedupKey])) { $lostByAgent[$lower]++; $countedLost[$dedupKey] = true; }
                }
            } else {
                if (!isset($countedPending[$dedupKey])) { $pendingByAgent[$lower]++; $countedPending[$dedupKey] = true; }
            }
        }
    } catch (Throwable $e) { /* best-effort */ }
}


// Build series + summary
$series = [];
foreach ($agentByLower as $lower => $display) {
    $points = [];
    $tot = 0;
    foreach ($axis as $d) {
        $v = $counts[$lower][$d] ?? 0;
        $points[] = ['date' => $d, 'value' => $v];
        $tot += $v;
    }
    $failed = $lostByAgent[$lower] + $nrpByAgent[$lower];
    $uniq = count($uniqueByAgent[$lower] ?? []);
    $series[] = [
        'username'   => $lower,
        'name'       => $display,
        'full_name'  => $userFullNameByLower[$lower] ?? $display,
        'first_name' => $userFirstNameByLower[$lower] ?? $lower,
        'total'      => $tot,
        'unique'     => $uniq,
        'won'        => $wonByAgent[$lower],
        'lost'       => $lostByAgent[$lower],
        'nrp'        => $nrpByAgent[$lower],
        'failed'     => $failed,
        'pending'    => $pendingByAgent[$lower],
        // Conversion = won (unique prospects) / unique prospects with RDV in month.
        // Using unique prospects (not raw RDV count) keeps it consistent with the
        // deduped won/lost/nrp counters.
        'conversion' => $uniq > 0 ? round(($wonByAgent[$lower] / $uniq) * 100, 1) : 0,
        'points'     => $points,
    ];
}

usort($series, function ($a, $b) {
    if ($b['total'] !== $a['total']) return $b['total'] - $a['total'];
    return strcmp($a['name'], $b['name']);
});

// Daily grand totals
$daily = [];
foreach ($axis as $d) {
    $sum = 0;
    foreach ($agentByLower as $lower => $_) $sum += $counts[$lower][$d];
    $daily[] = ['date' => $d, 'value' => $sum];
}

$grandTotal = 0; $grandWon = 0; $grandFailed = 0;
foreach ($series as $r) { $grandTotal += $r['total']; $grandWon += $r['won']; $grandFailed += $r['failed']; }

ok([
    'month'      => $ym,
    'axis'       => $axis,
    'series'     => $series,
    'daily'      => $daily,
    'grandTotal' => $grandTotal,
    'grandWon'   => $grandWon,
    'grandFailed'=> $grandFailed,
]);
