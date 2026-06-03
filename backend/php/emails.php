<?php
// =====================================================================
// Protection ERP — OVH Emails (IMAP read + SMTP send)
//
// Endpoints (all authenticated):
//   GET    emails.php?action=config          -> returns whether mailbox is configured for current user
//   GET    emails.php?action=folders         -> list IMAP folders/mailboxes
//   GET    emails.php?action=list&folder=INBOX&limit=50&offset=0&search=...
//                                            -> list messages (newest first)
//   GET    emails.php?action=get&folder=INBOX&uid=123
//                                            -> full message (headers, body text/html, attachments meta)
//   POST   emails.php  (action=send)         -> send mail via OVH SMTP (json body)
//   PATCH  emails.php  (action=flag)         -> mark seen / unseen / flagged
//   DELETE emails.php?folder=INBOX&uid=123   -> move to Trash (or expunge)
//
// Mailbox credentials are stored per-user in extraneterp_user_email_accounts
// (see schema.sql block at the bottom of this file). They MUST be configured
// before this endpoint can talk to OVH. The frontend exposes a small
// "Connecter ma boîte OVH" form that POSTs to action=save_account.
//
// OVH defaults (https://help.ovhcloud.com/csm/...):
//   IMAP : ssl0.ovh.net : 993 (SSL)
//   SMTP : ssl0.ovh.net : 465 (SSL) or 587 (STARTTLS)
// =====================================================================

require_once __DIR__ . '/config.php';
$me = require_auth();
$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ($method === 'POST' || $method === 'PATCH' ? (json_input()['action'] ?? '') : '');

// ---------- Account storage ------------------------------------------
function ensure_table(PDO $db): void {
    $db->exec("CREATE TABLE IF NOT EXISTS extraneterp_user_email_accounts (
        username       VARCHAR(64)  NOT NULL PRIMARY KEY,
        email_address  VARCHAR(255) NOT NULL,
        display_name   VARCHAR(255) DEFAULT NULL,
        imap_host      VARCHAR(255) NOT NULL DEFAULT 'ssl0.ovh.net',
        imap_port      INT          NOT NULL DEFAULT 993,
        imap_encryption VARCHAR(16) NOT NULL DEFAULT 'ssl',
        smtp_host      VARCHAR(255) NOT NULL DEFAULT 'ssl0.ovh.net',
        smtp_port      INT          NOT NULL DEFAULT 465,
        smtp_encryption VARCHAR(16) NOT NULL DEFAULT 'ssl',
        password_enc   TEXT         NOT NULL,
        signature_html MEDIUMTEXT   NULL,
        signature_text TEXT         NULL,
        updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) DEFAULT CHARSET=utf8mb4");
    // Self-heal for existing installs missing the signature columns.
    try { $db->exec("ALTER TABLE extraneterp_user_email_accounts ADD COLUMN signature_html MEDIUMTEXT NULL"); } catch (\Throwable $e) { /* already there */ }
    try { $db->exec("ALTER TABLE extraneterp_user_email_accounts ADD COLUMN signature_text TEXT NULL"); } catch (\Throwable $e) { /* already there */ }
}
ensure_table($db);

function enc_key(): string {
    // Derived from DB creds — replace with a real KMS secret in production.
    return hash('sha256', 'protection-erp-emails-v1', true);
}
function enc(string $plain): string {
    $iv = random_bytes(16);
    $ct = openssl_encrypt($plain, 'aes-256-cbc', enc_key(), OPENSSL_RAW_DATA, $iv);
    return base64_encode($iv . $ct);
}
function dec(string $b64): string {
    $raw = base64_decode($b64, true) ?: '';
    if (strlen($raw) < 17) return '';
    $iv = substr($raw, 0, 16);
    $ct = substr($raw, 16);
    return openssl_decrypt($ct, 'aes-256-cbc', enc_key(), OPENSSL_RAW_DATA, $iv) ?: '';
}

function load_account(PDO $db, string $username): ?array {
    $s = $db->prepare('SELECT * FROM extraneterp_user_email_accounts WHERE username = :u');
    $s->execute([':u' => $username]);
    $row = $s->fetch();
    return $row ?: null;
}

function require_account(PDO $db, array $me): array {
    $a = load_account($db, $me['username']);
    if (!$a) fail('Boîte mail non configurée', 412);
    return $a;
}

// ---------- IMAP helpers ---------------------------------------------
function imap_mbox(array $a, string $folder = 'INBOX') {
    if (!function_exists('imap_open')) fail("Extension PHP 'imap' non disponible sur le serveur", 500);
    $enc = strtolower($a['imap_encryption'] ?? 'ssl');
    $flag = $enc === 'ssl' ? '/imap/ssl' : ($enc === 'tls' ? '/imap/tls' : '/imap/notls');
    // Folder names may contain non-ASCII (e.g. "Éléments envoyés") — IMAP requires UTF-7
    $folderEncoded = function_exists('mb_convert_encoding')
        ? @mb_convert_encoding($folder, 'UTF7-IMAP', 'UTF-8')
        : $folder;
    if (!is_string($folderEncoded) || $folderEncoded === '') $folderEncoded = $folder;
    $mbox = '{' . $a['imap_host'] . ':' . (int)$a['imap_port'] . $flag . '/novalidate-cert}' . $folderEncoded;
    $stream = @imap_open($mbox, $a['email_address'], dec($a['password_enc']), 0, 1);
    if (!$stream) fail('IMAP: ' . (imap_last_error() ?: 'connexion impossible'), 502);
    return $stream;
}

function header_to_arr($h): array {
    $from = $h->from[0] ?? null;
    $to   = $h->to ?? [];
    $cc   = $h->cc ?? [];
    $dateRaw = isset($h->date) ? strtotime($h->date) : false;
    return [
        'from'    => $from ? trim(($from->personal ?? '') . ' <' . ($from->mailbox ?? '') . '@' . ($from->host ?? '') . '>') : '',
        'fromAddr' => $from ? ($from->mailbox . '@' . $from->host) : '',
        'to'      => array_map(fn($x) => $x->mailbox . '@' . $x->host, $to),
        'cc'      => array_map(fn($x) => $x->mailbox . '@' . $x->host, $cc),
        'subject' => isset($h->subject) ? imap_utf8($h->subject) : '(sans objet)',
        'date'    => $dateRaw ? date('c', $dateRaw) : null,
        'messageId' => $h->message_id ?? null,
    ];
}

// Decode MIME-encoded-words ("=?UTF-8?B?...?=" / "=?ISO-8859-1?Q?...?=") to UTF-8.
// Used for attachment filenames which IMAP returns raw.
function decode_mime_word(?string $s): string {
    if (!is_string($s) || $s === '') return (string)$s;
    if (function_exists('imap_mime_header_decode')) {
        $parts = imap_mime_header_decode($s);
        $out = '';
        foreach ($parts as $p) {
            $cs = strtoupper((string)($p->charset ?? 'default'));
            $txt = (string)($p->text ?? '');
            if ($cs !== 'DEFAULT' && $cs !== 'UTF-8' && function_exists('mb_convert_encoding')) {
                $conv = @mb_convert_encoding($txt, 'UTF-8', $cs);
                if (is_string($conv) && $conv !== '') $txt = $conv;
            }
            $out .= $txt;
        }
        return $out;
    }
    return $s;
}

// ---------- Routing ---------------------------------------------------
if ($action === 'config' && $method === 'GET') {
    $a = load_account($db, $me['username']);
    ok([
        'configured' => (bool)$a,
        'account'    => $a ? [
            'emailAddress' => $a['email_address'],
            'displayName'  => $a['display_name'],
            'imapHost'     => $a['imap_host'],
            'imapPort'     => (int)$a['imap_port'],
            'imapEncryption' => $a['imap_encryption'],
            'smtpHost'     => $a['smtp_host'],
            'smtpPort'     => (int)$a['smtp_port'],
            'smtpEncryption' => $a['smtp_encryption'],
            'signatureHtml'  => $a['signature_html'] ?? null,
            'signatureText'  => $a['signature_text'] ?? null,
        ] : null,
    ]);
}

if ($action === 'save_account' && $method === 'POST') {
    $in = json_input();
    $email = trim($in['emailAddress'] ?? '');
    $pass  = (string)($in['password'] ?? '');
    if ($email === '') fail('Email requis', 422);
    $existing = load_account($db, $me['username']);
    // Allow empty password ONLY when updating an existing account (keep stored cipher).
    if ($pass === '' && !$existing) fail('Mot de passe requis', 422);
    $passEnc = $pass !== '' ? enc($pass) : $existing['password_enc'];

    // Signature: HTML is sanitized (strip <script>/<style>/event handlers) to
    // avoid injecting active content into outgoing mail. Plain-text is taken
    // as-is but capped. Either field may be omitted to keep the existing value.
    $sigHtmlIn = array_key_exists('signatureHtml', $in) ? (string)$in['signatureHtml'] : null;
    $sigTextIn = array_key_exists('signatureText', $in) ? (string)$in['signatureText'] : null;
    if ($sigHtmlIn !== null) {
        if (mb_strlen($sigHtmlIn) > 20000) fail('Signature HTML trop longue (max 20000)', 422);
        // Strip dangerous tags/attrs while keeping basic formatting.
        $sigHtmlIn = preg_replace('#<\s*(script|style|iframe|object|embed)[^>]*>.*?<\s*/\s*\1\s*>#is', '', $sigHtmlIn);
        $sigHtmlIn = preg_replace('#\s(on\w+|srcdoc|formaction)\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)#i', '', $sigHtmlIn);
        $sigHtmlIn = preg_replace('#javascript:\s*#i', '', $sigHtmlIn);
    }
    if ($sigTextIn !== null) {
        if (mb_strlen($sigTextIn) > 5000) fail('Signature texte trop longue (max 5000)', 422);
    }
    $sigHtml = $sigHtmlIn !== null ? $sigHtmlIn : ($existing['signature_html'] ?? null);
    $sigText = $sigTextIn !== null ? $sigTextIn : ($existing['signature_text'] ?? null);

    $stmt = $db->prepare('REPLACE INTO extraneterp_user_email_accounts
        (username, email_address, display_name, imap_host, imap_port, imap_encryption, smtp_host, smtp_port, smtp_encryption, password_enc, signature_html, signature_text)
        VALUES (:u, :e, :n, :ih, :ip, :ie, :sh, :sp, :se, :pw, :sh2, :st2)');
    $stmt->execute([
        ':u'  => $me['username'],
        ':e'  => $email,
        ':n'  => $in['displayName'] ?? ($me['fullName'] ?? $me['username']),
        ':ih' => $in['imapHost'] ?? 'ssl0.ovh.net',
        ':ip' => (int)($in['imapPort'] ?? 993),
        ':ie' => $in['imapEncryption'] ?? 'ssl',
        ':sh' => $in['smtpHost'] ?? 'ssl0.ovh.net',
        ':sp' => (int)($in['smtpPort'] ?? 465),
        ':se' => $in['smtpEncryption'] ?? 'ssl',
        ':pw' => $passEnc,
        ':sh2'=> $sigHtml,
        ':st2'=> $sigText,
    ]);
    ok(['saved' => true]);
}

if ($action === 'delete_account' && $method === 'DELETE') {
    $db->prepare('DELETE FROM extraneterp_user_email_accounts WHERE username=:u')
       ->execute([':u' => $me['username']]);
    ok(['deleted' => true]);
}

if ($action === 'folders' && $method === 'GET') {
    $a = require_account($db, $me);
    $stream = imap_mbox($a);
    // imap_list returns names prefixed with the EXACT spec used to open the mailbox,
    // which includes /imap/ssl/novalidate-cert — must strip that, not just host:port.
    $enc  = strtolower($a['imap_encryption'] ?? 'ssl');
    $flag = $enc === 'ssl' ? '/imap/ssl' : ($enc === 'tls' ? '/imap/tls' : '/imap/notls');
    $ref  = '{' . $a['imap_host'] . ':' . (int)$a['imap_port'] . $flag . '/novalidate-cert}';
    $list = imap_list($stream, $ref, '*') ?: [];
    $folders = [];
    foreach ($list as $f) {
        $rawName = str_replace($ref, '', $f);
        // Convert UTF7-IMAP folder names back to UTF-8 for the UI.
        $name = function_exists('mb_convert_encoding')
            ? (@mb_convert_encoding($rawName, 'UTF-8', 'UTF7-IMAP') ?: $rawName)
            : $rawName;
        $st = @imap_status($stream, $f, SA_MESSAGES | SA_UNSEEN);
        $folders[] = [
            'name'   => $name,
            'total'  => $st ? (int)$st->messages : 0,
            'unseen' => $st ? (int)$st->unseen : 0,
        ];
    }
    imap_close($stream);
    ok(['folders' => $folders]);
}

if ($action === 'list' && $method === 'GET') {
    $a = require_account($db, $me);
    $folder = $_GET['folder'] ?? 'INBOX';
    $limit  = max(1, min(200, (int)($_GET['limit'] ?? 50)));
    $offset = max(0, (int)($_GET['offset'] ?? 0));
    $search = trim($_GET['search'] ?? '');
    $stream = imap_mbox($a, $folder);
    $criteria = $search !== '' ? 'TEXT "' . str_replace('"', '', $search) . '"' : 'ALL';
    $uids = imap_search($stream, $criteria, SE_UID) ?: [];
    rsort($uids, SORT_NUMERIC);
    $total = count($uids);
    $page = array_slice($uids, $offset, $limit);
    $items = [];
    foreach ($page as $uid) {
        $h = imap_rfc822_parse_headers(imap_fetchheader($stream, $uid, FT_UID));
        $info = imap_fetch_overview($stream, $uid, FT_UID)[0] ?? null;
        $arr = header_to_arr($h);
        $arr['uid'] = (int)$uid;
        $arr['seen'] = $info ? (bool)$info->seen : true;
        $arr['flagged'] = $info ? (bool)$info->flagged : false;
        $arr['size'] = $info ? (int)$info->size : 0;
        $items[] = $arr;
    }
    imap_close($stream);
    ok(['messages' => $items, 'total' => $total, 'limit' => $limit, 'offset' => $offset]);
}

if ($action === 'get' && $method === 'GET') {
    $a = require_account($db, $me);
    $folder = $_GET['folder'] ?? 'INBOX';
    $uid = (int)($_GET['uid'] ?? 0);
    if (!$uid) fail('uid requis', 422);
    $stream = imap_mbox($a, $folder);
    $h = imap_rfc822_parse_headers(imap_fetchheader($stream, $uid, FT_UID));
    $arr = header_to_arr($h);
    $arr['uid'] = $uid;

    $structure = imap_fetchstructure($stream, $uid, FT_UID);
    $textPlain = '';
    $textHtml = '';
    $attachments = [];

    $walk = function ($struct, $partNum) use (&$walk, &$textPlain, &$textHtml, &$attachments, $stream, $uid) {
        $isAttachment = false; $filename = null;
        if (!empty($struct->dparameters)) {
            foreach ($struct->dparameters as $p) {
                if (strtolower($p->attribute) === 'filename') { $isAttachment = true; $filename = $p->value; }
            }
        }
        if (!empty($struct->parameters)) {
            foreach ($struct->parameters as $p) {
                if (strtolower($p->attribute) === 'name') { $isAttachment = true; $filename = $p->value; }
            }
        }
        $disposition = isset($struct->disposition) ? strtolower($struct->disposition) : '';
        if ($disposition === 'attachment') $isAttachment = true;
        $cid = isset($struct->id) ? trim((string)$struct->id, " <>") : '';
        $isInline = $disposition === 'inline' || $cid !== '';
        // Inline images with a cid are still treated as attachments (so the UI can fetch them),
        // but flagged as inline so the body HTML can rewrite cid: refs to blob URLs.
        if ($isInline && ((int)($struct->type ?? 0) === 5 /* image */ || $cid !== '')) $isAttachment = true;
        $subtype = strtolower($struct->subtype ?? '');
        static $typeMap = [0 => 'text', 1 => 'multipart', 2 => 'message', 3 => 'application',
                           4 => 'audio', 5 => 'image', 6 => 'video', 7 => 'other'];
        $primary = $typeMap[(int)($struct->type ?? 0)] ?? 'application';
        $mime = $primary . '/' . ($subtype ?: 'octet-stream');
        if ($isAttachment) {
            $decodedName = decode_mime_word($filename) ?: ('part-' . $partNum);
            $attachments[] = [
                'filename' => $decodedName,
                'size' => (int)($struct->bytes ?? 0),
                'mime' => $mime,
                'part' => $partNum ?: '1',
                'encoding' => (int)($struct->encoding ?? 0),
                'cid' => $cid,
                'inline' => $isInline,
            ];
            return;
        }
        $body = imap_fetchbody($stream, $uid, $partNum ?: '1', FT_UID);
        // Encodings: 0=7BIT 1=8BIT 2=BINARY 3=BASE64 4=QUOTED-PRINTABLE
        $encId = (int)($struct->encoding ?? 0);
        if ($encId === 3) $body = base64_decode($body);
        elseif ($encId === 4) $body = quoted_printable_decode($body);
        // 7bit/8bit/binary: leave as-is
        // Charset → UTF-8
        if (!empty($struct->parameters)) {
            foreach ($struct->parameters as $p) {
                if (strtolower($p->attribute) === 'charset') {
                    $cs = strtoupper($p->value);
                    if ($cs && $cs !== 'UTF-8' && function_exists('mb_convert_encoding')) {
                        $conv = @mb_convert_encoding($body, 'UTF-8', $cs);
                        if (is_string($conv) && $conv !== '') $body = $conv;
                    }
                }
            }
        }
        if ((int)$struct->type === 0) {
            if ($subtype === 'plain') $textPlain .= $body;
            elseif ($subtype === 'html') $textHtml .= $body;
        }
        if (!empty($struct->parts)) {
            foreach ($struct->parts as $i => $sub) {
                $next = $partNum === '' ? (string)($i + 1) : $partNum . '.' . ($i + 1);
                $walk($sub, $next);
            }
        }
    };
    if (isset($structure->parts) && count($structure->parts) > 0) {
        foreach ($structure->parts as $i => $sub) {
            $walk($sub, (string)($i + 1));
        }
    } else {
        $walk($structure, '1');
    }

    @imap_setflag_full($stream, (string)$uid, '\\Seen', ST_UID);
    imap_close($stream);

    $arr['textPlain'] = $textPlain;
    $arr['textHtml']  = $textHtml;
    $arr['attachments'] = $attachments;
    ok(['message' => $arr]);
}

if ($action === 'attachment' && $method === 'GET') {
    $a = require_account($db, $me);
    $folder = $_GET['folder'] ?? 'INBOX';
    $uid = (int)($_GET['uid'] ?? 0);
    $part = $_GET['part'] ?? '';
    $encoding = (int)($_GET['encoding'] ?? 0);
    $filename = $_GET['filename'] ?? ('attachment-' . $uid);
    $mime = $_GET['mime'] ?? 'application/octet-stream';
    $inline = !empty($_GET['inline']);
    if (!$uid || $part === '') fail('uid & part requis', 422);
    $stream = imap_mbox($a, $folder);
    $body = imap_fetchbody($stream, $uid, $part, FT_UID);
    imap_close($stream);
    if ($encoding === 3) $body = base64_decode($body);
    elseif ($encoding === 4) $body = quoted_printable_decode($body);
    // 7bit/8bit/binary: pass through as-is
    // RFC 5987 / RFC 6266 — preserve unicode filenames safely.
    // ASCII fallback for legacy clients, plus filename* with UTF-8 percent-encoding.
    $asciiFallback = preg_replace('/[^A-Za-z0-9._\- ]/', '_', $filename) ?: 'attachment';
    $asciiFallback = str_replace(['"', '\\', "\r", "\n"], '_', $asciiFallback);
    $utf8 = rawurlencode($filename);
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . strlen($body));
    header('Content-Disposition: ' . ($inline ? 'inline' : 'attachment')
        . '; filename="' . $asciiFallback . '"'
        . '; filename*=UTF-8\'\'' . $utf8);
    header('Cache-Control: private, max-age=0');
    echo $body;
    exit;
}

if ($action === 'flag' && $method === 'PATCH') {
    $in = json_input();
    $a = require_account($db, $me);
    $folder = $in['folder'] ?? 'INBOX';
    $uid = (int)($in['uid'] ?? 0);
    $flag = $in['flag'] ?? 'seen';
    $set  = (bool)($in['set'] ?? true);
    if (!$uid) fail('uid requis', 422);
    $stream = imap_mbox($a, $folder);
    $tag = $flag === 'flagged' ? '\\Flagged' : '\\Seen';
    if ($set) imap_setflag_full($stream, (string)$uid, $tag, ST_UID);
    else imap_clearflag_full($stream, (string)$uid, $tag, ST_UID);
    imap_close($stream);
    ok(['ok' => true]);
}

if ($method === 'DELETE') {
    $a = require_account($db, $me);
    $folder = $_GET['folder'] ?? 'INBOX';
    $uid = (int)($_GET['uid'] ?? 0);
    if (!$uid) fail('uid requis', 422);
    $stream = imap_mbox($a, $folder);
    // Try common Trash folder paths used by OVH/Dovecot/Cyrus/Gmail
    $trashCandidates = ['INBOX.Trash', 'Trash', 'INBOX/Trash', '[Gmail]/Corbeille', '[Gmail]/Trash'];
    $moved = false;
    foreach ($trashCandidates as $t) {
        if (@imap_mail_move($stream, (string)$uid, $t, CP_UID)) { $moved = true; break; }
    }
    if (!$moved) {
        // Fallback: flag as deleted in current folder
        @imap_delete($stream, (string)$uid, FT_UID);
    }
    @imap_expunge($stream);
    imap_close($stream);
    ok(['deleted' => true]);
}

// ---------- SMTP send -------------------------------------------------
function smtp_send(array $a, array $msg): void {
    $host = $a['smtp_host'];
    $port = (int)$a['smtp_port'];
    $enc  = strtolower($a['smtp_encryption'] ?? 'ssl');
    $user = $a['email_address'];
    $pass = dec($a['password_enc']);

    $remote = ($enc === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
    $errno = 0; $errstr = '';
    $fp = @stream_socket_client($remote, $errno, $errstr, 20);
    if (!$fp) fail("SMTP connect: $errstr", 502);
    stream_set_timeout($fp, 20);

    $read = function () use ($fp) {
        $data = '';
        while (($line = fgets($fp, 1024)) !== false) {
            $data .= $line;
            if (preg_match('/^\d{3} /', $line)) break;
        }
        return $data;
    };
    $cmd = function ($s, $expect = null) use ($fp, $read) {
        fwrite($fp, $s . "\r\n");
        $r = $read();
        if ($expect !== null && strpos($r, (string)$expect) !== 0) {
            fail('SMTP error: ' . trim($r), 502);
        }
        return $r;
    };

    $read(); // banner
    // Use a FQDN-ish HELO hostname — strict servers (Postfix smtpd_helo_required) reject bare names
    $heloHost = $_SERVER['SERVER_NAME'] ?? gethostname() ?: 'protection-erp.local';
    if (strpos($heloHost, '.') === false) $heloHost .= '.local';
    $cmd('EHLO ' . $heloHost, '250');
    if ($enc === 'tls') {
        $cmd('STARTTLS', '220');
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fail('SMTP STARTTLS échoué', 502);
        }
        $cmd('EHLO ' . $heloHost, '250');
    }
    $cmd('AUTH LOGIN', '334');
    $cmd(base64_encode($user), '334');
    $cmd(base64_encode($pass), '235');
    $cmd('MAIL FROM:<' . $user . '>', '250');
    foreach ($msg['rcpts'] as $r) $cmd('RCPT TO:<' . $r . '>', '250');
    $cmd('DATA', '354');

    $boundary = 'b_' . bin2hex(random_bytes(8));
    // RFC 2047 encode display name when it contains non-ASCII; otherwise quoted-string (escape \ and ").
    $dn = (string)($a['display_name'] ?? '');
    if ($dn !== '') {
        if (preg_match('/[^\x20-\x7E]/', $dn)) {
            $fromName = '=?UTF-8?B?' . base64_encode($dn) . '?= ';
        } else {
            $fromName = '"' . addcslashes($dn, "\"\\") . '" ';
        }
    } else {
        $fromName = '';
    }
    $headers  = "From: {$fromName}<{$user}>\r\n";
    $headers .= 'To: ' . implode(', ', $msg['to']) . "\r\n";
    if (!empty($msg['cc'])) $headers .= 'Cc: ' . implode(', ', $msg['cc']) . "\r\n";
    $headers .= 'Subject: =?UTF-8?B?' . base64_encode($msg['subject']) . "?=\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= 'Date: ' . date('r') . "\r\n";
    $msgIdDomain = substr(strrchr($user, '@') ?: '@localhost', 1);
    $headers .= 'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $msgIdDomain . ">\r\n";
    // Threading headers — link replies to the original conversation in any IMAP client.
    if (!empty($msg['inReplyTo'])) {
        $mid = trim((string)$msg['inReplyTo']);
        if ($mid !== '' && !preg_match('/[\r\n]/', $mid)) {
            if ($mid[0] !== '<') $mid = '<' . $mid . '>';
            $headers .= 'In-Reply-To: ' . $mid . "\r\n";
            $refs = trim((string)($msg['references'] ?? ''));
            if ($refs !== '' && !preg_match('/[\r\n]/', $refs)) {
                $headers .= 'References: ' . $refs . ' ' . $mid . "\r\n";
            } else {
                $headers .= 'References: ' . $mid . "\r\n";
            }
        }
    }
    $headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";

    // --- Auto-append per-user signature (dynamic, from account settings) ---
    // Skip if the caller has already embedded the signature marker, to avoid
    // duplicate signatures on resends / drafts that were saved with one.
    $sigMarker = '<!-- erp-signature -->';
    $textOut = (string)$msg['text'];
    $htmlOut = (string)($msg['html'] ?? '');
    $sigText = trim((string)($a['signature_text'] ?? ''));
    $sigHtml = trim((string)($a['signature_html'] ?? ''));
    if ($sigText !== '' && strpos($textOut, $sigText) === false) {
        $textOut = rtrim($textOut) . "\r\n\r\n-- \r\n" . $sigText . "\r\n";
    }
    if ($htmlOut !== '' && $sigHtml !== '' && strpos($htmlOut, $sigMarker) === false) {
        $htmlOut .= "\r\n<br><br>{$sigMarker}\r\n"
            . '<div style="color:#666;font-size:13px;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:12px;">'
            . $sigHtml . '</div>';
    } elseif ($htmlOut === '' && $sigHtml !== '') {
        // Caller sent text-only — still produce an HTML alternative carrying
        // the signature so rich-mail clients render it.
        $htmlOut = '<pre style="font:14px/1.5 sans-serif;white-space:pre-wrap;margin:0;">'
            . htmlspecialchars($textOut, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            . "</pre>\r\n<br>{$sigMarker}\r\n"
            . '<div style="color:#666;font-size:13px;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:12px;">'
            . $sigHtml . '</div>';
    }

    $body  = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($textOut)) . "\r\n";
    if ($htmlOut !== '') {
        $body .= "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($htmlOut)) . "\r\n";
    }
    $body .= "--$boundary--\r\n";

    fwrite($fp, $headers . "\r\n" . $body . "\r\n.\r\n");
    $r = $read();
    if (strpos($r, '250') !== 0) fail('SMTP send: ' . trim($r), 502);
    $cmd('QUIT');
    fclose($fp);

    // Save a copy to the Sent folder via IMAP APPEND — OVH SMTP does NOT
    // mirror sent mail, so without this the user can never see what they sent.
    if (function_exists('imap_open') && function_exists('imap_append')) {
        $imapEnc  = strtolower($a['imap_encryption'] ?? 'ssl');
        $imapFlag = $imapEnc === 'ssl' ? '/imap/ssl' : ($imapEnc === 'tls' ? '/imap/tls' : '/imap/notls');
        $imapRef  = '{' . $a['imap_host'] . ':' . (int)$a['imap_port'] . $imapFlag . '/novalidate-cert}';
        $stream = @imap_open($imapRef . 'INBOX', $a['email_address'], dec($a['password_enc']), 0, 1);
        if ($stream) {
            $rfc822 = $headers . "\r\n" . $body;
            // 1) Auto-discover the real Sent folder via IMAP LIST attributes.
            //    Many servers localise the name (Éléments envoyés, Gesendete…),
            //    so probing fixed strings is unreliable. We list every mailbox
            //    and pick the first selectable one whose UTF-8 name matches
            //    /sent|envoy|gesend|inviati|enviado/i.
            $picked = null;
            $boxes = @imap_getmailboxes($stream, $imapRef, '*') ?: [];
            foreach ($boxes as $b) {
                if (($b->attributes & LATT_NOSELECT) !== 0) continue;
                $raw = str_replace($imapRef, '', $b->name);
                $utf8 = function_exists('mb_convert_encoding')
                    ? (@mb_convert_encoding($raw, 'UTF-8', 'UTF7-IMAP') ?: $raw)
                    : $raw;
                if (preg_match('/sent|envoy|gesend|inviati|enviado/i', $utf8)) {
                    $picked = $raw; break;
                }
            }
            // 2) Fallback to the usual hard-coded names if discovery failed.
            $candidates = $picked
                ? [$picked]
                : ['INBOX.Sent', 'Sent', 'INBOX/Sent', 'INBOX.Sent Messages',
                   'Sent Messages', 'INBOX.Éléments envoyés', 'Éléments envoyés'];
            foreach ($candidates as $sentFolder) {
                $sentEncoded = ($picked === $sentFolder)
                    ? $sentFolder // already raw IMAP-encoded
                    : (function_exists('mb_convert_encoding')
                        ? (@mb_convert_encoding($sentFolder, 'UTF7-IMAP', 'UTF-8') ?: $sentFolder)
                        : $sentFolder);
                if (@imap_append($stream, $imapRef . $sentEncoded, $rfc822, '\\Seen')) break;
            }
            @imap_close($stream);
        }
    }
}

if ($action === 'send' && $method === 'POST') {
    $a = require_account($db, $me);
    $in = json_input();
    $to = array_filter(array_map('trim', is_array($in['to'] ?? null) ? $in['to'] : explode(',', (string)($in['to'] ?? ''))));
    $cc = array_filter(array_map('trim', is_array($in['cc'] ?? null) ? $in['cc'] : explode(',', (string)($in['cc'] ?? ''))));
    $bcc = array_filter(array_map('trim', is_array($in['bcc'] ?? null) ? $in['bcc'] : explode(',', (string)($in['bcc'] ?? ''))));
    $subject = trim($in['subject'] ?? '');
    $text = (string)($in['text'] ?? '');
    $html = (string)($in['html'] ?? '');
    $inReplyTo = (string)($in['inReplyTo'] ?? '');
    $references = (string)($in['references'] ?? '');
    if (!$to) fail('Destinataire requis', 422);
    if ($subject === '') fail('Objet requis', 422);
    if ($text === '' && $html === '') fail('Corps requis', 422);
    // Hard cap on recipients across To+Cc+Bcc to prevent abuse
    $totalRcpts = count($to) + count($cc) + count($bcc);
    if ($totalRcpts > 100) fail('Maximum 100 destinataires par envoi', 422);
    if (mb_strlen($subject) > 255) fail('Objet trop long (max 255)', 422);
    if (mb_strlen($text) > 200000 || mb_strlen($html) > 500000) fail('Corps trop long', 422);
    // Basic RFC-5321 address sanity (cheap, prevents header injection)
    $validate = function ($list) {
        foreach ($list as $addr) {
            if (!filter_var($addr, FILTER_VALIDATE_EMAIL)) fail("Adresse invalide: $addr", 422);
            if (preg_match('/[\r\n]/', $addr)) fail('Caractères interdits dans une adresse', 422);
        }
    };
    $validate($to); $validate($cc); $validate($bcc);
    if (preg_match('/[\r\n]/', $subject)) fail('Caractères interdits dans le sujet', 422);
    smtp_send($a, [
        'to' => $to, 'cc' => $cc,
        'rcpts' => array_values(array_unique(array_merge($to, $cc, $bcc))),
        'subject' => $subject, 'text' => $text, 'html' => $html,
        'inReplyTo' => $inReplyTo, 'references' => $references,
    ]);
    ok(['sent' => true]);
}

if ($action === 'test_connection' && $method === 'POST') {
    // Verify both IMAP login and SMTP auth with current stored creds.
    $a = require_account($db, $me);
    $report = ['imap' => null, 'smtp' => null];
    // ---- IMAP (inline — must not call imap_mbox() because it exits on failure) ----
    if (!function_exists('imap_open')) {
        $report['imap'] = ['ok' => false, 'error' => "Extension PHP 'imap' non disponible"];
    } else {
        $enc = strtolower($a['imap_encryption'] ?? 'ssl');
        $flag = $enc === 'ssl' ? '/imap/ssl' : ($enc === 'tls' ? '/imap/tls' : '/imap/notls');
        $mboxRef = '{' . $a['imap_host'] . ':' . (int)$a['imap_port'] . $flag . '/novalidate-cert}';
        $stream = @imap_open($mboxRef . 'INBOX', $a['email_address'], dec($a['password_enc']), 0, 1);
        if (!$stream) {
            $report['imap'] = ['ok' => false, 'error' => imap_last_error() ?: 'connexion impossible'];
        } else {
            $st = @imap_status($stream, '{' . $a['imap_host'] . ':' . (int)$a['imap_port'] . '}INBOX', SA_MESSAGES);
            $report['imap'] = ['ok' => true, 'inbox' => $st ? (int)$st->messages : 0];
            @imap_close($stream);
        }
    }
    // ---- SMTP (auth only, no MAIL FROM) ----
    $host = $a['smtp_host']; $port = (int)$a['smtp_port'];
    $enc  = strtolower($a['smtp_encryption'] ?? 'ssl');
    $remote = ($enc === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
    $errno = 0; $errstr = '';
    $fp = @stream_socket_client($remote, $errno, $errstr, 15);
    if (!$fp) {
        $report['smtp'] = ['ok' => false, 'error' => "connect: $errstr"];
    } else {
        stream_set_timeout($fp, 15);
        $read = function () use ($fp) { $d = ''; while (($l = fgets($fp, 1024)) !== false) { $d .= $l; if (preg_match('/^\d{3} /', $l)) break; } return $d; };
        try {
            $read();
            $heloHost = $_SERVER['SERVER_NAME'] ?? gethostname() ?: 'protection-erp.local';
            if (strpos($heloHost, '.') === false) $heloHost .= '.local';
            fwrite($fp, "EHLO $heloHost\r\n"); $r = $read();
            if (strpos($r, '250') !== 0) throw new RuntimeException('EHLO: ' . trim($r));
            if ($enc === 'tls') {
                fwrite($fp, "STARTTLS\r\n"); $r = $read();
                if (strpos($r, '220') !== 0) throw new RuntimeException('STARTTLS: ' . trim($r));
                if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('STARTTLS handshake failed');
                fwrite($fp, "EHLO $heloHost\r\n"); $read();
            }
            fwrite($fp, "AUTH LOGIN\r\n"); $r = $read();
            if (strpos($r, '334') !== 0) throw new RuntimeException('AUTH: ' . trim($r));
            fwrite($fp, base64_encode($a['email_address']) . "\r\n"); $read();
            fwrite($fp, base64_encode(dec($a['password_enc'])) . "\r\n"); $r = $read();
            if (strpos($r, '235') !== 0) throw new RuntimeException('Login: ' . trim($r));
            fwrite($fp, "QUIT\r\n");
            $report['smtp'] = ['ok' => true];
        } catch (Throwable $e) {
            $report['smtp'] = ['ok' => false, 'error' => $e->getMessage()];
        }
        @fclose($fp);
    }
    ok(['test' => $report, 'allOk' => ($report['imap']['ok'] ?? false) && ($report['smtp']['ok'] ?? false)]);
}

fail('Action inconnue', 404);
