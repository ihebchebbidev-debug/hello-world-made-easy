import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfirm } from "@/components/ConfirmDialog";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api, apiUrl, getToken, API_ENABLED } from "@/lib/api";
import { toast } from "sonner";
import { useErp } from "@/lib/erpStore";
import { RecipientField, isValidEmail, type Contact } from "@/components/RecipientField";
import {
  Mail, Inbox, Send, RefreshCw, Trash2, PenSquare, Settings as SettingsIcon,
  Search, Paperclip, Star, Reply, ReplyAll, Forward, Printer, MailOpen,
  ChevronLeft, Archive, Folder as FolderIcon, FilePen, ShieldAlert, Filter,
  Bold, Italic, Underline, List, ListOrdered, Link2, Eraser, Quote, PenLine,
} from "lucide-react";

export const Route = createFileRoute("/emails")({
  head: () => ({
    meta: [
      { title: "Emails — Protection ERP" },
      {
        name: "description",
        content:
          "Boîte mail OVH intégrée: lisez, répondez, transférez et organisez vos emails directement dans l'application.",
      },
    ],
  }),
  component: EmailsPage,
});

// ----- Types ----------------------------------------------------------
type Folder = { name: string; total: number; unseen: number };
type MessageSummary = {
  uid: number;
  from: string;
  fromAddr: string;
  to: string[];
  cc?: string[];
  subject: string;
  date: string | null;
  seen: boolean;
  flagged: boolean;
  size: number;
  messageId?: string;
};
type Attachment = {
  filename: string; size: number; mime: string; part: string;
  encoding: number; cid?: string; inline?: boolean;
};
type FullMessage = MessageSummary & {
  textPlain: string; textHtml: string; attachments: Attachment[]; cc?: string[];
};
type AccountConfig = {
  emailAddress: string; displayName: string | null;
  imapHost: string; imapPort: number; imapEncryption: string;
  smtpHost: string; smtpPort: number; smtpEncryption: string;
  signatureHtml?: string | null; signatureText?: string | null;
};
type ComposeMode = "new" | "reply" | "replyAll" | "forward";
type ComposeInitial = {
  to?: string[]; cc?: string[]; bcc?: string[];
  subject?: string; body?: string;
  inReplyTo?: string; references?: string;
};

// ----- Helpers --------------------------------------------------------
function folderMeta(name: string) {
  const lower = name.toLowerCase();
  if (lower === "inbox" || lower === "inbox.")
    return { label: "Boîte de réception", icon: Inbox, order: 0, key: "inbox" };
  if (lower.includes("sent") || lower.includes("envoy"))
    return { label: "Envoyés", icon: Send, order: 1, key: "sent" };
  if (lower.includes("draft") || lower.includes("brouillon"))
    return { label: "Brouillons", icon: FilePen, order: 2, key: "drafts" };
  if (lower.includes("spam") || lower.includes("junk") || lower.includes("indésir"))
    return { label: "Indésirables", icon: ShieldAlert, order: 3, key: "spam" };
  if (lower.includes("trash") || lower.includes("corbeille") || lower.includes("supprim"))
    return { label: "Corbeille", icon: Trash2, order: 4, key: "trash" };
  if (lower.includes("archiv"))
    return { label: "Archives", icon: Archive, order: 5, key: "archive" };
  const cleaned = name.replace(/^INBOX[./]/i, "");
  return { label: cleaned || name, icon: FolderIcon, order: 99, key: name };
}

function fmtListDate(d: string | null) {
  if (!d) return "";
  const date = new Date(d);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  if (date.getFullYear() === now.getFullYear())
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function initialsFor(name: string, email: string) {
  const seed = (name || email || "").trim();
  const parts = seed.split(/[\s<>"@.]+/).filter(Boolean).slice(0, 2);
  const out = parts.map((s) => s[0]?.toUpperCase() ?? "").join("");
  return out || "?";
}
function colorFor(email: string) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) % 360;
  return `hsl(${h} 55% 42%)`;
}

function SenderAvatar({ name, email, small = false }: { name?: string; email: string; small?: boolean }) {
  const initials = initialsFor(name || "", email);
  const sizeClass = small ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  return (
    <div
      style={{ background: colorFor(email) }}
      className={`${sizeClass} rounded-full text-white font-semibold flex items-center justify-center shrink-0`}
    >
      {initials}
    </div>
  );
}

function plainFromHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildReply(msg: FullMessage, mode: ComposeMode, myEmail: string): ComposeInitial {
  const dateStr = msg.date ? new Date(msg.date).toLocaleString("fr-FR") : "";
  const original = msg.textPlain?.trim() || plainFromHtml(msg.textHtml || "");
  const quoted = original
    .split("\n")
    .map((l) => "> " + l)
    .join("\n");

  if (mode === "forward") {
    const body =
      `\n\n---------- Message transféré ----------\n` +
      `De : ${msg.from}\nDate : ${dateStr}\nObjet : ${msg.subject}\nÀ : ${(msg.to || []).join(", ")}\n\n` +
      original;
    return {
      subject: /^fwd?:\s/i.test(msg.subject) ? msg.subject : `Fwd: ${msg.subject}`,
      body,
    };
  }

  const intro = `\n\nLe ${dateStr}, ${msg.from} a écrit :\n${quoted}\n`;
  const subject = /^re:\s/i.test(msg.subject) ? msg.subject : `Re: ${msg.subject}`;
  const me = myEmail.toLowerCase();

  const initial: ComposeInitial = {
    to: [msg.fromAddr].filter(Boolean),
    subject,
    body: intro,
    inReplyTo: msg.messageId,
    references: msg.messageId,
  };

  if (mode === "replyAll") {
    const everyone = [...(msg.to || []), ...(msg.cc || [])]
      .filter((a) => a && a.toLowerCase() !== me && a.toLowerCase() !== msg.fromAddr.toLowerCase());
    const dedup = Array.from(new Map(everyone.map((a) => [a.toLowerCase(), a])).values());
    initial.cc = dedup;
  }
  return initial;
}

// ----- Page -----------------------------------------------------------
function EmailsPage() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [account, setAccount] = useState<AccountConfig | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folder, setFolder] = useState<string>("INBOX");
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<FullMessage | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [resolvedHtml, setResolvedHtml] = useState<string>("");
  const blobUrlsRef = useRef<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeInitial, setComposeInitial] = useState<ComposeInitial>({});
  const [settingsOpen, setSettingsOpen] = useState(false);

  const PAGE = 50;

  // ---- Config load + auto-restore ------------------------------------
  const loadConfig = useCallback(async () => {
    if (!API_ENABLED) return;
    try {
      const r = await api<{ configured: boolean; account: AccountConfig | null }>(
        "/emails.php?action=config",
      );
      setConfigured(r.configured);
      setAccount(r.account);
      if (!r.configured) {
        const cached = localStorage.getItem("erp_email_session");
        if (cached) {
          try {
            const c = JSON.parse(cached);
            await api("/emails.php?action=save_account", { method: "POST", body: c });
            const r2 = await api<{ configured: boolean; account: AccountConfig | null }>(
              "/emails.php?action=config",
            );
            setConfigured(r2.configured);
            setAccount(r2.account);
            if (!r2.configured) setSettingsOpen(true);
            return;
          } catch {
            localStorage.removeItem("erp_email_session");
          }
        }
        setSettingsOpen(true);
      }
    } catch (e: any) {
      toast.error("Erreur", { description: e?.message });
    }
  }, []);

  const loadFolders = useCallback(async () => {
    try {
      const r = await api<{ folders: Folder[] }>("/emails.php?action=folders");
      setFolders(r.folders ?? []);
    } catch (e: any) {
      toast.error("IMAP", { description: e?.message });
    }
  }, []);

  const loadMessages = useCallback(
    async (opts: { append?: boolean; offset?: number } = {}) => {
      if (!configured) return;
      const offset = opts.offset ?? 0;
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          action: "list",
          folder,
          limit: String(PAGE),
          offset: String(offset),
        });
        if (search.trim()) qs.set("search", search.trim());
        const r = await api<{ messages: MessageSummary[]; total: number }>(
          `/emails.php?${qs.toString()}`,
        );
        setTotal(r.total ?? 0);
        setMessages((prev) =>
          opts.append ? [...prev, ...(r.messages ?? [])] : (r.messages ?? []),
        );
        if (!opts.append) setSelected(new Set());
      } catch (e: any) {
        toast.error("IMAP", { description: e?.message });
      } finally {
        setLoading(false);
      }
    },
    [configured, folder, search],
  );

  useEffect(() => { loadConfig(); }, [loadConfig]);
  useEffect(() => {
    if (configured) { loadFolders(); loadMessages(); }
  }, [configured, loadFolders, loadMessages]);

  // Reset reader on folder switch.
  useEffect(() => { setActive(null); }, [folder]);

  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => {
      const oa = folderMeta(a.name).order;
      const ob = folderMeta(b.name).order;
      if (oa !== ob) return oa - ob;
      return a.name.localeCompare(b.name);
    });
  }, [folders]);

  const visibleMessages = useMemo(
    () => (showOnlyUnread ? messages.filter((m) => !m.seen) : messages),
    [messages, showOnlyUnread],
  );

  // ---- Reader: cid rewrite + image previews --------------------------
  const fetchAttachmentBlob = useCallback(
    async (uid: number, a: Attachment, asInline: boolean): Promise<Blob> => {
      const token = getToken();
      const qs = new URLSearchParams({
        action: "attachment", folder, uid: String(uid), part: a.part,
        encoding: String(a.encoding), filename: a.filename, mime: a.mime,
      });
      if (asInline) qs.set("inline", "1");
      const url = apiUrl(`/emails.php?${qs.toString()}`);
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}`, "X-Auth-Token": token } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.blob();
    },
    [folder],
  );

  useEffect(() => {
    blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    blobUrlsRef.current = [];
    setImagePreviews({});
    setResolvedHtml(active?.textHtml ?? "");
    if (!active) return;
    let cancelled = false;
    (async () => {
      const inlineWithCid = active.attachments.filter((a) => a.cid && a.cid.length > 0);
      const imageAttachments = active.attachments.filter((a) => a.mime?.startsWith("image/"));
      const previews: Record<string, string> = {};
      let html = active.textHtml ?? "";
      for (const a of inlineWithCid) {
        try {
          const blob = await fetchAttachmentBlob(active.uid, a, true);
          const url = URL.createObjectURL(blob);
          blobUrlsRef.current.push(url);
          const escaped = a.cid!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          html = html.replace(new RegExp(`cid:${escaped}`, "gi"), url);
          if (a.mime?.startsWith("image/")) previews[a.part] = url;
        } catch { /* ignore */ }
      }
      for (const a of imageAttachments) {
        if (previews[a.part]) continue;
        if (a.size > 5 * 1024 * 1024) continue;
        try {
          const blob = await fetchAttachmentBlob(active.uid, a, true);
          const url = URL.createObjectURL(blob);
          blobUrlsRef.current.push(url);
          previews[a.part] = url;
        } catch { /* ignore */ }
      }
      if (cancelled) return;
      setResolvedHtml(html);
      setImagePreviews(previews);
    })();
    return () => { cancelled = true; };
  }, [active, fetchAttachmentBlob]);

  useEffect(() => () => {
    blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  // ---- Actions -------------------------------------------------------
  const openMessage = async (uid: number) => {
    try {
      const r = await api<{ message: FullMessage }>(
        `/emails.php?action=get&folder=${encodeURIComponent(folder)}&uid=${uid}`,
      );
      setActive(r.message);
      setMessages((ms) => ms.map((m) => (m.uid === uid ? { ...m, seen: true } : m)));
    } catch (e: any) {
      toast.error("Erreur", { description: e?.message });
    }
  };

  const setFlag = async (uid: number, flag: "seen" | "flagged", set: boolean) => {
    try {
      await api("/emails.php?action=flag", {
        method: "PATCH",
        body: { folder, uid, flag, set },
      });
      setMessages((ms) =>
        ms.map((m) => (m.uid === uid ? { ...m, [flag]: set } : m)),
      );
      if (active?.uid === uid) setActive({ ...active, [flag]: set } as FullMessage);
    } catch (e: any) {
      toast.error("Erreur", { description: e?.message });
    }
  };

  const deleteMessages = async (uids: number[]) => {
    if (uids.length === 0) return;
    try {
      await Promise.all(
        uids.map((uid) =>
          api(`/emails.php?folder=${encodeURIComponent(folder)}&uid=${uid}`, { method: "DELETE" }),
        ),
      );
      setMessages((ms) => ms.filter((m) => !uids.includes(m.uid)));
      setSelected(new Set());
      if (active && uids.includes(active.uid)) setActive(null);
      toast.success(uids.length === 1 ? "Déplacé dans la corbeille" : `${uids.length} messages supprimés`);
    } catch (e: any) {
      toast.error("Erreur", { description: e?.message });
    }
  };

  const bulkSetSeen = async (uids: number[], seen: boolean) => {
    try {
      await Promise.all(
        uids.map((uid) =>
          api("/emails.php?action=flag", {
            method: "PATCH",
            body: { folder, uid, flag: "seen", set: seen },
          }),
        ),
      );
      setMessages((ms) => ms.map((m) => (uids.includes(m.uid) ? { ...m, seen } : m)));
      setSelected(new Set());
    } catch (e: any) {
      toast.error("Erreur", { description: e?.message });
    }
  };

  const openCompose = (mode: ComposeMode = "new") => {
    if (mode === "new" || !active) {
      setComposeInitial({});
    } else {
      setComposeInitial(buildReply(active, mode, account?.emailAddress ?? ""));
    }
    setComposeOpen(true);
  };

  const printMessage = () => {
    if (!active) return;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    const dateStr = active.date ? new Date(active.date).toLocaleString("fr-FR") : "";
    const safeHtml =
      resolvedHtml ||
      active.textHtml ||
      `<pre style="white-space:pre-wrap;font-family:inherit">${
        (active.textPlain || "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] || c)
      }</pre>`;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${active.subject}</title>
      <style>body{font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;padding:24px;max-width:760px;margin:auto}
      h1{font-size:18px;margin:0 0 8px}.meta{color:#555;font-size:12px;margin-bottom:16px}hr{border:0;border-top:1px solid #ddd;margin:16px 0}</style>
      </head><body><h1>${active.subject}</h1><div class="meta">
      <b>De :</b> ${active.from}<br><b>À :</b> ${active.to.join(", ")}${
      active.cc?.length ? `<br><b>Cc :</b> ${active.cc.join(", ")}` : ""
    }<br><b>Date :</b> ${dateStr}</div><hr>${safeHtml}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 300);
  };

  // ---- Keyboard shortcuts --------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (composeOpen || settingsOpen) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;
      const list = visibleMessages;
      const idx = active ? list.findIndex((m) => m.uid === active.uid) : -1;
      if (e.key === "j" && list.length) {
        const next = list[Math.min(list.length - 1, idx + 1)];
        if (next) openMessage(next.uid);
      } else if (e.key === "k" && list.length) {
        const prev = list[Math.max(0, idx - 1)];
        if (prev) openMessage(prev.uid);
      } else if (e.key === "c") {
        e.preventDefault();
        openCompose("new");
      } else if (e.key === "r" && active) {
        e.preventDefault();
        openCompose("reply");
      } else if (e.key === "a" && active) {
        e.preventDefault();
        openCompose("replyAll");
      } else if (e.key === "f" && active) {
        e.preventDefault();
        openCompose("forward");
      } else if ((e.key === "Delete" || e.key === "Backspace") && active) {
        deleteMessages([active.uid]);
      } else if (e.key === "u" && active) {
        setFlag(active.uid, "seen", !active.seen);
      } else if (e.key === "s" && active) {
        setFlag(active.uid, "flagged", !active.flagged);
      } else if (e.key === "Escape" && active) {
        setActive(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, visibleMessages, composeOpen, settingsOpen]);

  const allChecked =
    visibleMessages.length > 0 && visibleMessages.every((m) => selected.has(m.uid));
  const someChecked = selected.size > 0 && !allChecked;

  const toggleAll = () => {
    if (allChecked) setSelected(new Set());
    else setSelected(new Set(visibleMessages.map((m) => m.uid)));
  };
  const toggleOne = (uid: number) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(uid)) n.delete(uid); else n.add(uid);
      return n;
    });
  };

  const totalUnread = useMemo(
    () => folders.find((f) => folderMeta(f.name).key === "inbox")?.unseen ?? 0,
    [folders],
  );

  return (
    <AppLayout skeleton="list">
      <PageHeader
        title="Emails"
        description={
          configured && account
            ? `${account.emailAddress}${totalUnread > 0 ? ` · ${totalUnread} non lu(s)` : ""}`
            : "Boîte mail OVH intégrée — IMAP & SMTP"
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadMessages()} disabled={!configured || loading}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon className="h-4 w-4 mr-1.5" /> Compte
            </Button>
            <Button size="sm" onClick={() => openCompose("new")} disabled={!configured}>
              <PenSquare className="h-4 w-4 mr-1.5" /> Nouveau
            </Button>
          </div>
        }
      />

      {configured === false && (
        <Card className="mb-4 border-warning/40 bg-warning/5">
          <CardContent className="p-4 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Aucune boîte OVH connectée. Connectez votre adresse pour commencer.
            </div>
            <Button size="sm" onClick={() => setSettingsOpen(true)}>Connecter</Button>
          </CardContent>
        </Card>
      )}

      <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-12 gap-4 min-h-[calc(100vh-220px)]">
        {/* ---- Folders ---- */}
        <Card className={`col-span-12 md:col-span-2 ${active ? "hidden md:block" : ""}`}>
          <CardContent className="p-2">
            <Button
              size="sm"
              className="w-full mb-2"
              onClick={() => openCompose("new")}
              disabled={!configured}
            >
              <PenSquare className="h-4 w-4 mr-1.5" /> Composer
            </Button>
            <ul className="space-y-0.5">
              {(sortedFolders.length ? sortedFolders : [{ name: "INBOX", total: 0, unseen: 0 }]).map((f) => {
                const meta = folderMeta(f.name);
                const Icon = meta.icon;
                const isActive = folder === f.name;
                return (
                  <li key={f.name}>
                    <button
                      onClick={() => setFolder(f.name)}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                        isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/60 text-foreground/80"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{meta.label}</span>
                      </span>
                      {f.unseen > 0 && (
                        <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] h-5 px-1.5">
                          {f.unseen}
                        </Badge>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 pt-3 border-t border-border/60 px-2 text-[10px] text-muted-foreground space-y-0.5">
              <div><kbd className="font-mono">c</kbd> composer · <kbd className="font-mono">r</kbd> répondre</div>
              <div><kbd className="font-mono">j/k</kbd> nav · <kbd className="font-mono">u</kbd> non lu</div>
              <div><kbd className="font-mono">s</kbd> étoile · <kbd className="font-mono">⌫</kbd> supprimer</div>
            </div>
          </CardContent>
        </Card>

        {/* ---- Message list ---- */}
        <Card className={`col-span-12 md:col-span-4 ${active ? "hidden md:block" : ""}`}>
          <CardContent className="p-0 flex flex-col h-full">
            {/* Toolbar */}
            <div className="p-2 border-b border-border space-y-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-9"
                  placeholder="Rechercher dans le dossier…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadMessages()}
                />
              </div>
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allChecked ? true : someChecked ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                    aria-label="Tout sélectionner"
                  />
                  {selected.size > 0 ? (
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7"
                            onClick={() => bulkSetSeen([...selected], true)}>
                            <MailOpen className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Marquer comme lu</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7"
                            onClick={() => bulkSetSeen([...selected], false)}>
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Marquer non lu</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                            onClick={() => deleteMessages([...selected])}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Supprimer</TooltipContent>
                      </Tooltip>
                      <span className="text-xs text-muted-foreground ml-1">{selected.size}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowOnlyUnread((v) => !v)}
                      className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded transition-colors ${
                        showOnlyUnread ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Filter className="h-3 w-3" />
                      {showOnlyUnread ? "Non lus" : "Tous"}
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {messages.length}/{total}
                </span>
              </div>
            </div>

            {/* List */}
            <ul className="divide-y divide-border flex-1 overflow-y-auto">
              {loading && messages.length === 0 && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <li key={i} className="p-3 flex gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </li>
                  ))}
                </>
              )}
              {!loading && visibleMessages.length === 0 && (
                <li className="p-10 text-sm text-muted-foreground text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  {showOnlyUnread ? "Aucun message non lu" : "Aucun message"}
                </li>
              )}
              {visibleMessages.map((m) => {
                const isActive = active?.uid === m.uid;
                const isSelected = selected.has(m.uid);
                return (
                  <li
                    key={m.uid}
                    onClick={() => openMessage(m.uid)}
                    className={`group relative pl-3 pr-2 py-2.5 cursor-pointer transition-colors ${
                      isActive ? "bg-primary/5" : "hover:bg-muted/50"
                    } ${!m.seen ? "" : ""}`}
                  >
                    {!m.seen && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                    )}
                    <div className="flex gap-2.5">
                      <div
                        className="pt-0.5 shrink-0"
                        onClick={(e) => { e.stopPropagation(); toggleOne(m.uid); }}
                      >
                        {isSelected ? (
                          <Checkbox checked onCheckedChange={() => toggleOne(m.uid)} />
                        ) : (
                          <div className="h-8 w-8 -m-0.5 flex items-center justify-center">
                            <div className="hidden group-hover:block">
                              <Checkbox checked={false} onCheckedChange={() => toggleOne(m.uid)} />
                            </div>
                            <div className="group-hover:hidden">
                              <SenderAvatar name={m.from} email={m.fromAddr} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${!m.seen ? "font-semibold" : "font-normal"}`}>
                            {m.from?.replace(/<.*>/, "").trim() || m.fromAddr}
                          </span>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {fmtListDate(m.date)}
                          </span>
                        </div>
                        <div className={`text-sm truncate ${!m.seen ? "font-medium text-foreground" : "text-foreground/80"}`}>
                          {m.subject || "(sans objet)"}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setFlag(m.uid, "flagged", !m.flagged); }}
                            className="text-muted-foreground hover:text-warning transition-colors"
                            aria-label={m.flagged ? "Retirer l'étoile" : "Mettre en étoile"}
                          >
                            <Star className={`h-3.5 w-3.5 ${m.flagged ? "fill-warning text-warning" : ""}`} />
                          </button>
                          <span className="text-[11px] text-muted-foreground">
                            {Math.max(1, Math.round(m.size / 1024))} KB
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
              {messages.length < total && (
                <li className="p-2">
                  <Button
                    variant="outline" size="sm" className="w-full"
                    disabled={loading}
                    onClick={() => loadMessages({ append: true, offset: messages.length })}
                  >
                    {loading ? "Chargement…" : `Charger plus (${total - messages.length} restants)`}
                  </Button>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* ---- Reader ---- */}
        <Card className={`col-span-12 md:col-span-6 ${!active ? "hidden md:block" : ""}`}>
          <CardContent className="p-0 flex flex-col h-full">
            {!active ? (
              <div className="p-12 text-center text-sm text-muted-foreground flex-1 flex flex-col items-center justify-center">
                <Mail className="h-12 w-12 mb-3 opacity-30" />
                <p>Sélectionnez un message pour le lire</p>
                <p className="text-xs mt-1 opacity-70">Astuce : <kbd>j</kbd>/<kbd>k</kbd> pour naviguer</p>
              </div>
            ) : (
              <>
                {/* Reader toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-border">
                  <Button size="sm" variant="ghost" className="md:hidden" onClick={() => setActive(null)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="ghost" onClick={() => openCompose("reply")}>
                        <Reply className="h-4 w-4 mr-1.5" /> Répondre
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><kbd>r</kbd></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="ghost" onClick={() => openCompose("replyAll")}>
                        <ReplyAll className="h-4 w-4 mr-1.5" /> Répondre à tous
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><kbd>a</kbd></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="ghost" onClick={() => openCompose("forward")}>
                        <Forward className="h-4 w-4 mr-1.5" /> Transférer
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><kbd>f</kbd></TooltipContent>
                  </Tooltip>
                  <div className="flex-1" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8"
                        onClick={() => setFlag(active.uid, "flagged", !active.flagged)}>
                        <Star className={`h-4 w-4 ${active.flagged ? "fill-warning text-warning" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{active.flagged ? "Retirer l'étoile" : "Marquer (s)"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8"
                        onClick={() => setFlag(active.uid, "seen", !active.seen)}>
                        {active.seen ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{active.seen ? "Marquer non lu (u)" : "Marquer lu"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={printMessage}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Imprimer</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                        onClick={() => deleteMessages([active.uid])}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Supprimer (⌫)</TooltipContent>
                  </Tooltip>
                </div>

                {/* Header */}
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold leading-tight mb-3">{active.subject || "(sans objet)"}</h2>
                  <div className="flex items-start gap-3">
                    <SenderAvatar name={active.from} email={active.fromAddr} />
                    <div className="flex-1 min-w-0 text-sm">
                      <div className="font-medium truncate">
                        {active.from?.replace(/<.*>/, "").trim() || active.fromAddr}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        &lt;{active.fromAddr}&gt;
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        À : {active.to.join(", ")}
                        {active.cc && active.cc.length > 0 && (
                          <span> · Cc : {active.cc.join(", ")}</span>
                        )}
                      </div>
                    </div>
                    {active.date && (
                      <div className="text-xs text-muted-foreground shrink-0">
                        {new Date(active.date).toLocaleString("fr-FR")}
                      </div>
                    )}
                  </div>

                  {active.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {active.attachments.map((a, i) => {
                        const handle = async (mode: "preview" | "download") => {
                          try {
                            const blob = await fetchAttachmentBlob(active.uid, a, mode === "preview");
                            const objUrl = URL.createObjectURL(blob);
                            if (mode === "preview") {
                              const w = window.open(objUrl, "_blank", "noopener");
                              if (!w) toast.error("Aperçu bloqué par le navigateur");
                            } else {
                              const a2 = document.createElement("a");
                              a2.href = objUrl;
                              a2.download = a.filename || "piece-jointe";
                              document.body.appendChild(a2);
                              a2.click();
                              a2.remove();
                            }
                            setTimeout(() => URL.revokeObjectURL(objUrl), 60_000);
                          } catch (e: any) {
                            toast.error("Téléchargement échoué", { description: e?.message });
                          }
                        };
                        const previewUrl = imagePreviews[a.part];
                        return (
                          <div key={i}
                            className="flex items-center gap-1.5 border border-border rounded-md p-1 bg-card/50">
                            {previewUrl ? (
                              <img src={previewUrl} alt={a.filename}
                                className="h-10 w-10 object-cover rounded cursor-pointer"
                                onClick={() => handle("preview")} />
                            ) : null}
                            <Badge variant="outline" className="gap-1 cursor-pointer max-w-[220px]"
                              onClick={() => handle("preview")} title={a.filename}>
                              <Paperclip className="h-3 w-3 shrink-0" />
                              <span className="truncate">{a.filename}</span>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                ({Math.max(1, Math.round(a.size / 1024))} KB)
                              </span>
                            </Badge>
                            <Button size="sm" variant="ghost" className="h-6 px-2"
                              onClick={() => handle("download")}>
                              Télécharger
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 bg-background">
                  {active.textHtml ? (
                    <iframe
                      title="email"
                      sandbox="allow-same-origin"
                      className="w-full min-h-[55vh] border border-border/50 rounded bg-white"
                      srcDoc={resolvedHtml || active.textHtml}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                      {active.textPlain || "(message vide)"}
                    </pre>
                  )}
                </div>

                {/* Quick reply footer */}
                <div className="border-t border-border p-3 bg-muted/30">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openCompose("reply")}>
                      <Reply className="h-3.5 w-3.5 mr-1.5" /> Répondre
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openCompose("replyAll")}>
                      <ReplyAll className="h-3.5 w-3.5 mr-1.5" /> Tous
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openCompose("forward")}>
                      <Forward className="h-3.5 w-3.5 mr-1.5" /> Transférer
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      </TooltipProvider>

      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        from={account?.emailAddress ?? ""}
        signatureHtml={account?.signatureHtml ?? ""}
        signatureText={account?.signatureText ?? ""}
        initial={composeInitial}
        onSent={() => loadMessages()}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        account={account}
        onSaved={() => { setSettingsOpen(false); loadConfig(); }}
      />
    </AppLayout>
  );
}

// ----- Compose Dialog -------------------------------------------------
function ToolbarBtn({
  onClick, title, children,
}: { onClick: () => void; title: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
    >
      {children}
    </button>
  );
}

function ComposeDialog({
  open, onOpenChange, from, signatureHtml, signatureText, initial, onSent,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  from: string;
  signatureHtml: string;
  signatureText: string;
  initial: ComposeInitial;
  onSent?: () => void;
}) {
  const { prospects, contracts } = useErp();
  const confirmDialog = useConfirm();
  const [to, setTo] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [inReplyTo, setInReplyTo] = useState<string | undefined>();
  const [references, setReferences] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const DRAFT_KEY = "erp_email_draft_v1";
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Convert plain text (replies/forwards) to safe HTML preserving line breaks
  const textToHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

  const sigBlockHtml = signatureHtml?.trim()
    ? `<br><br>--<br>${signatureHtml}`
    : signatureText?.trim()
      ? `<br><br>--<br>${textToHtml(signatureText)}`
      : "";

  // When opening with initial values (reply/forward), seed and skip draft restore.
  useEffect(() => {
    if (!open) { setDraftLoaded(false); return; }
    const hasInitial =
      (initial.to?.length ?? 0) > 0 ||
      (initial.subject ?? "") !== "" ||
      (initial.body ?? "") !== "";
    if (hasInitial) {
      setTo(initial.to ?? []);
      setCc(initial.cc ?? []);
      setBcc(initial.bcc ?? []);
      setShowCcBcc((initial.cc?.length ?? 0) > 0 || (initial.bcc?.length ?? 0) > 0);
      setSubject(initial.subject ?? "");
      setBodyHtml(
        (initial.body ? textToHtml(initial.body) : "") + sigBlockHtml,
      );
      setInReplyTo(initial.inReplyTo);
      setReferences(initial.references);
      setSavedAt(null);
      setDraftLoaded(true);
      return;
    }
    if (draftLoaded) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.to)) setTo(d.to);
        if (Array.isArray(d.cc)) setCc(d.cc);
        if (Array.isArray(d.bcc)) setBcc(d.bcc);
        if (typeof d.subject === "string") setSubject(d.subject);
        if (typeof d.bodyHtml === "string") setBodyHtml(d.bodyHtml);
        else if (typeof d.body === "string") setBodyHtml(textToHtml(d.body) + sigBlockHtml);
        else setBodyHtml(sigBlockHtml);
        if ((d.cc?.length ?? 0) > 0 || (d.bcc?.length ?? 0) > 0) setShowCcBcc(true);
        if (typeof d.savedAt === "number") setSavedAt(d.savedAt);
      } else {
        setBodyHtml(sigBlockHtml);
      }
    } catch { /* corrupted */ }
    setDraftLoaded(true);
  }, [open, initial, draftLoaded, sigBlockHtml]);

  // Sync editor DOM when content is seeded externally (open, signature load,
  // reply seeding, draft restore). Comparing innerHTML avoids cursor reset on typing.
  useEffect(() => {
    if (!open) return;
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== bodyHtml) {
      el.innerHTML = bodyHtml;
    }
  }, [open, draftLoaded, bodyHtml]);

  // If the signature loads (or changes) AFTER the dialog opened with an empty
  // body, inject it so the user always sees their signature on a new message.
  useEffect(() => {
    if (!open || !draftLoaded || inReplyTo) return;
    if (!sigBlockHtml) return;
    if (plainFromHtml(bodyHtml).trim() === "") {
      setBodyHtml(sigBlockHtml);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draftLoaded, sigBlockHtml]);

  // Auto-save draft (only for "new" messages, not replies/forwards).
  useEffect(() => {
    if (!draftLoaded || inReplyTo) return;
    const plain = plainFromHtml(bodyHtml);
    const isEmpty =
      to.length === 0 && cc.length === 0 && bcc.length === 0 &&
      subject.trim() === "" && plain.trim() === "";
    const t = window.setTimeout(() => {
      try {
        if (isEmpty) {
          localStorage.removeItem(DRAFT_KEY);
          setSavedAt(null);
        } else {
          const ts = Date.now();
          localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({ to, cc, bcc, subject, bodyHtml, savedAt: ts }),
          );
          setSavedAt(ts);
        }
      } catch { /* quota */ }
    }, 400);
    return () => window.clearTimeout(t);
  }, [to, cc, bcc, subject, bodyHtml, draftLoaded, inReplyTo]);

  const clearAll = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setTo([]); setCc([]); setBcc([]);
    setSubject(""); setBodyHtml("");
    if (editorRef.current) editorRef.current.innerHTML = "";
    setInReplyTo(undefined); setReferences(undefined);
    setShowCcBcc(false);
    setSavedAt(null);
  };

  const discardDraft = async () => {
    const ok = await confirmDialog({
      title: "Supprimer le brouillon",
      description: "Voulez-vous supprimer définitivement ce brouillon ?",
      destructive: true,
    });
    if (!ok) return;
    clearAll();
    toast.success("Brouillon supprimé");
    onOpenChange(false);
  };

  const contacts: Contact[] = useMemo(() => {
    const map = new Map<string, Contact>();
    for (const p of prospects) {
      const e = (p.email || "").trim();
      if (e) {
        const k = e.toLowerCase();
        if (!map.has(k)) map.set(k, {
          email: e,
          name: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || undefined,
          source: "Prospect",
        });
      }
    }
    for (const c of contracts) {
      const e = (c.email || "").trim();
      if (e) {
        const k = e.toLowerCase();
        if (!map.has(k)) map.set(k, {
          email: e,
          name: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || undefined,
          source: "Contrat",
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      (a.name ?? a.email).localeCompare(b.name ?? b.email, "fr"),
    );
  }, [prospects, contracts]);

  const send = async () => {
    const plain = plainFromHtml(bodyHtml);
    if (to.length === 0 || !subject.trim() || !plain.trim()) {
      toast.error("Destinataire, objet et corps requis");
      return;
    }
    const allRecipients = [...to, ...cc, ...bcc];
    const bad = allRecipients.find((a) => !isValidEmail(a));
    if (bad) { toast.error(`Adresse invalide: ${bad}`); return; }
    if (allRecipients.length > 100) { toast.error("Trop de destinataires (max 100)"); return; }
    setSending(true);
    try {
      await api("/emails.php?action=send", {
        method: "POST",
        body: {
          to, cc, bcc, subject,
          text: plain,
          html: bodyHtml,
          inReplyTo, references,
        },
      });
      toast.success(`Email envoyé à ${allRecipients.length} destinataire(s)`);
      onOpenChange(false);
      clearAll();
      onSent?.();
    } catch (e: any) {
      toast.error("Envoi échoué", { description: e?.message });
    } finally {
      setSending(false);
    }
  };

  const isReplyOrForward = !!inReplyTo || /^(re|fwd):/i.test(subject);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    try { document.execCommand(cmd, false, val); } catch { /* noop */ }
    if (editorRef.current) setBodyHtml(editorRef.current.innerHTML);
  };
  const insertLink = () => {
    const url = window.prompt("URL du lien", "https://");
    if (!url) return;
    exec("createLink", url);
  };
  const insertSignature = () => {
    if (!sigBlockHtml) {
      toast.info("Aucune signature configurée", { description: "Ajoutez-la dans les paramètres." });
      return;
    }
    editorRef.current?.focus();
    try { document.execCommand("insertHTML", false, sigBlockHtml); } catch { /* noop */ }
    if (editorRef.current) setBodyHtml(editorRef.current.innerHTML);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {inReplyTo ? "Répondre" : isReplyOrForward ? "Transférer" : "Nouveau message"}
          </DialogTitle>
          {savedAt && !inReplyTo && (
            <p className="text-xs text-muted-foreground">
              Brouillon enregistré · {new Date(savedAt).toLocaleTimeString()}
            </p>
          )}
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">De</Label>
            <Input value={from} disabled className="h-9" />
          </div>
          <RecipientField label="À" values={to} onChange={setTo} contacts={contacts}
            placeholder="email@exemple.com" />
          {!showCcBcc ? (
            <button type="button" onClick={() => setShowCcBcc(true)}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">
              Ajouter Cc / Cci
            </button>
          ) : (
            <>
              <RecipientField label="Cc" values={cc} onChange={setCc} contacts={contacts} />
              <RecipientField label="Cci" values={bcc} onChange={setBcc} contacts={contacts} />
            </>
          )}
          <div>
            <Label className="text-xs">Objet</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-9" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs">Message</Label>
              <button
                type="button"
                onClick={insertSignature}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                title="Insérer la signature"
              >
                <PenLine className="h-3.5 w-3.5" /> Signature
              </button>
            </div>
            <div className="border rounded-md overflow-hidden">
              <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-1 py-1">
                <ToolbarBtn onClick={() => exec("bold")} title="Gras (Ctrl+B)"><Bold className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => exec("italic")} title="Italique (Ctrl+I)"><Italic className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => exec("underline")} title="Souligné (Ctrl+U)"><Underline className="h-4 w-4" /></ToolbarBtn>
                <span className="mx-1 h-5 w-px bg-border" />
                <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Liste à puces"><List className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Liste numérotée"><ListOrdered className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => exec("formatBlock", "blockquote")} title="Citation"><Quote className="h-4 w-4" /></ToolbarBtn>
                <span className="mx-1 h-5 w-px bg-border" />
                <ToolbarBtn onClick={insertLink} title="Lien"><Link2 className="h-4 w-4" /></ToolbarBtn>
                <ToolbarBtn onClick={() => exec("removeFormat")} title="Effacer la mise en forme"><Eraser className="h-4 w-4" /></ToolbarBtn>
                <span className="mx-1 h-5 w-px bg-border" />
                <select
                  onChange={(e) => { exec("formatBlock", e.target.value); e.currentTarget.selectedIndex = 0; }}
                  className="text-xs bg-transparent border rounded px-1 py-0.5"
                  title="Style"
                  defaultValue=""
                >
                  <option value="" disabled>Style</option>
                  <option value="p">Paragraphe</option>
                  <option value="h1">Titre 1</option>
                  <option value="h2">Titre 2</option>
                  <option value="h3">Titre 3</option>
                  <option value="pre">Code</option>
                </select>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setBodyHtml((e.target as HTMLDivElement).innerHTML)}
                className="min-h-[260px] max-h-[420px] overflow-y-auto p-3 text-sm outline-none prose prose-sm max-w-none [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Formatage riche · envoi en HTML + texte brut
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex items-center gap-2">
            {savedAt && !inReplyTo && (
              <Button variant="ghost" size="sm" onClick={discardDraft} type="button">
                <Trash2 className="h-4 w-4 mr-1.5" /> Supprimer le brouillon
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button onClick={send} disabled={sending}>
              <Send className="h-4 w-4 mr-1.5" /> {sending ? "Envoi…" : "Envoyer"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ----- Settings Dialog ------------------------------------------------
function SettingsDialog({
  open, onOpenChange, account, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  account: AccountConfig | null;
  onSaved: () => void;
}) {
  const [emailAddress, setEmail] = useState(account?.emailAddress ?? "");
  const [displayName, setDisplayName] = useState(account?.displayName ?? "");
  const [password, setPassword] = useState("");
  const [imapHost, setImapHost] = useState(account?.imapHost ?? "ssl0.ovh.net");
  const [imapPort, setImapPort] = useState(String(account?.imapPort ?? 993));
  const [imapEncryption, setImapEnc] = useState(account?.imapEncryption ?? "ssl");
  const [smtpHost, setSmtpHost] = useState(account?.smtpHost ?? "ssl0.ovh.net");
  const [smtpPort, setSmtpPort] = useState(String(account?.smtpPort ?? 465));
  const [smtpEncryption, setSmtpEnc] = useState(account?.smtpEncryption ?? "ssl");
  const [signatureHtml, setSignatureHtml] = useState(account?.signatureHtml ?? "");
  const [signatureText, setSignatureText] = useState(account?.signatureText ?? "");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (open && account) {
      setEmail(account.emailAddress);
      setDisplayName(account.displayName ?? "");
      setImapHost(account.imapHost); setImapPort(String(account.imapPort)); setImapEnc(account.imapEncryption);
      setSmtpHost(account.smtpHost); setSmtpPort(String(account.smtpPort)); setSmtpEnc(account.smtpEncryption);
      setSignatureHtml(account.signatureHtml ?? "");
      setSignatureText(account.signatureText ?? "");
    }
  }, [open, account]);

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      emailAddress, displayName,
      imapHost, imapPort: Number(imapPort), imapEncryption,
      smtpHost, smtpPort: Number(smtpPort), smtpEncryption,
      signatureHtml, signatureText,
    };
    if (password) payload.password = password;
    return payload;
  };

  const save = async () => {
    if (!emailAddress.trim()) { toast.error("Email requis"); return; }
    if (!account && !password) { toast.error("Mot de passe requis"); return; }
    setSaving(true);
    try {
      const payload = buildPayload();
      await api("/emails.php?action=save_account", { method: "POST", body: payload });
      try {
        if (password) localStorage.setItem("erp_email_session", JSON.stringify({ ...payload, password }));
      } catch { /* ignore */ }
      toast.success("Boîte mail connectée");
      onSaved();
    } catch (e: any) {
      toast.error("Erreur", { description: e?.message });
    } finally { setSaving(false); }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      await api("/emails.php?action=save_account", { method: "POST", body: buildPayload() });
      const r = await api<{ allOk: boolean; test: { imap: { ok: boolean; error?: string }; smtp: { ok: boolean; error?: string } } }>(
        "/emails.php?action=test_connection", { method: "POST", body: {} },
      );
      if (r.allOk) toast.success("IMAP & SMTP OK ✓");
      else toast.error("Test échoué", {
        description: `IMAP: ${r.test.imap.ok ? "OK" : r.test.imap.error}\nSMTP: ${r.test.smtp.ok ? "OK" : r.test.smtp.error}`,
      });
    } catch (e: any) {
      toast.error("Test échoué", { description: e?.message });
    } finally { setTesting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Compte email OVH</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Adresse email</Label>
            <Input value={emailAddress} onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom@votredomaine.com" />
          </div>
          <div>
            <Label>Nom d'affichage</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <Label>Mot de passe</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={account ? "••••••••• (laissez vide pour ne pas changer)" : ""} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Label>Hôte IMAP</Label>
              <Input value={imapHost} onChange={(e) => setImapHost(e.target.value)} />
            </div>
            <div>
              <Label>Port</Label>
              <Input value={imapPort} onChange={(e) => setImapPort(e.target.value)} />
            </div>
            <div className="col-span-3">
              <Label>Chiffrement IMAP</Label>
              <Select value={imapEncryption} onValueChange={setImapEnc}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="none">Aucun</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Label>Hôte SMTP</Label>
              <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
            </div>
            <div>
              <Label>Port</Label>
              <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
            </div>
            <div className="col-span-3">
              <Label>Chiffrement SMTP</Label>
              <Select value={smtpEncryption} onValueChange={setSmtpEnc}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="tls">STARTTLS</SelectItem>
                  <SelectItem value="none">Aucun</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-2 border-t space-y-2">
            <Label className="text-base font-semibold">Signature email</Label>
            <p className="text-xs text-muted-foreground">
              Ajoutée automatiquement à la fin de chaque email envoyé (nouveau, réponse, transfert).
            </p>
            <div>
              <Label className="text-xs">Signature texte (clients sans HTML)</Label>
              <Textarea
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder={"Jean Dupont\nCommercial — Protection ERP\n+33 1 23 45 67 89"}
                rows={4}
                maxLength={5000}
              />
            </div>
            <div>
              <Label className="text-xs">Signature HTML (rendue dans les clients modernes)</Label>
              <Textarea
                value={signatureHtml}
                onChange={(e) => setSignatureHtml(e.target.value)}
                placeholder={'<strong>Jean Dupont</strong><br>Commercial — Protection ERP<br><a href="mailto:jean@exemple.com">jean@exemple.com</a>'}
                rows={5}
                className="font-mono text-xs"
                maxLength={20000}
              />
              {signatureHtml.trim() && (
                <div className="mt-2 p-3 border rounded bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Aperçu :</div>
                  <div
                    className="text-sm"
                    // Preview-only: same sanitizer runs server-side before storage/sending.
                    dangerouslySetInnerHTML={{ __html: signatureHtml }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
          <Button variant="secondary" onClick={testConnection} disabled={testing || saving || !emailAddress}>
            {testing ? "Test…" : "Tester la connexion"}
          </Button>
          <Button onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}