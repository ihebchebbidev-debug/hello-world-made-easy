<?php
/**
 * migrate_phones.php — One-time script to normalize all phone numbers in the DB.
 *
 * Run once from CLI or via a protected URL after deploying the new clean_phone() logic:
 *   php migrate_phones.php
 *
 * What it does:
 *   - Strips spaces, dots, dashes, parentheses from stored numbers.
 *   - Removes a leading zero.
 *   - If the result is exactly 9 digits: saves the clean value.
 *   - If not: leaves the original value untouched (manual review needed).
 */

require_once __DIR__ . '/config.php';
$db = (new Database())->getConnection();

$tables = [
    // [table, column1, column2, ...]
    ['extraneterp_prospects',   'phone',     'mobile'],
    ['extraneterp_contracts',   'phone',     'mobile'],
    ['extraneterp_reclamations','tel_adsl',  'gsm_client'],
];

$cleaned = 0;
$skipped = 0;

foreach ($tables as [$table, ...$cols]) {
    foreach ($cols as $col) {
        $rows = $db->query("SELECT id, `$col` FROM `$table` WHERE `$col` IS NOT NULL AND `$col` != ''")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $row) {
            $raw = (string)$row[$col];
            $normalized = clean_phone($raw);
            if ($normalized !== null && $normalized !== $raw) {
                $db->prepare("UPDATE `$table` SET `$col` = :v WHERE id = :id")
                   ->execute([':v' => $normalized, ':id' => $row['id']]);
                echo "[$table.$col] id={$row['id']} : '$raw' → '$normalized'\n";
                $cleaned++;
            } else {
                $skipped++;
            }
        }
    }
}

echo "\nDone — $cleaned record(s) updated, $skipped left unchanged.\n";
