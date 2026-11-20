import { i as __toESM } from "../_runtime.mjs";
import { a as apiUrl, i as apiUpload, r as api } from "./api-2UuWgcOn.mjs";
import { n as Button, r as Input, s as formatDateTime } from "./input-IbC7Hkfd.mjs";
import { B as AlertDialogTitle, F as AlertDialogCancel, I as AlertDialogContent, L as AlertDialogDescription, N as AlertDialog, P as AlertDialogAction, R as AlertDialogFooter, z as AlertDialogHeader } from "./router-Dkp91uPV.mjs";
import { t as DatePicker } from "./date-picker-BVRMSMeD.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-B65-f30T.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { At as Image, Ht as File, Mt as History, Qt as FileArchive, V as Search, Wt as FileText, b as Trash2, in as Download, l as UserRound, n as X, nt as Paperclip, p as Upload, q as RefreshCw, vt as LoaderCircle, zt as Funnel } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/ProspectActivityCard-B2EIw-7j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function categoryOf(mime) {
	const m = (mime || "").toLowerCase();
	if (m.startsWith("image/")) return "image";
	if (m === "application/pdf") return "pdf";
	if (m.includes("word") || m.includes("msword") || m.includes("officedocument.wordprocessing") || m === "text/plain") return "doc";
	if (m.includes("sheet") || m.includes("excel") || m === "text/csv") return "sheet";
	if (m.includes("zip") || m.includes("compressed") || m.includes("rar") || m.includes("tar")) return "archive";
	return "other";
}
function fmtSize(b) {
	if (b < 1024) return `${b} o`;
	if (b < 1048576) return `${(b / 1024).toFixed(1)} Ko`;
	return `${(b / 1024 / 1024).toFixed(2)} Mo`;
}
function FileTypeIcon({ mime }) {
	if (mime?.startsWith("image/")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-4 w-4" });
	if (mime === "application/pdf") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" });
	if (mime?.includes("zip") || mime?.includes("compressed")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileArchive, { className: "h-4 w-4" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(File, { className: "h-4 w-4" });
}
function AttachmentsCard({ entity, entityId, onAdded, onRemoved }) {
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [deletingId, setDeletingId] = (0, import_react.useState)(null);
	const [confirmDel, setConfirmDel] = (0, import_react.useState)(null);
	const inputRef = (0, import_react.useRef)(null);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const [search, setSearch] = (0, import_react.useState)("");
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("all");
	const [sizeFilter, setSizeFilter] = (0, import_react.useState)("all");
	const [dateFrom, setDateFrom] = (0, import_react.useState)("");
	const [dateTo, setDateTo] = (0, import_react.useState)("");
	const load = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const r = await api("/attachments.php", { query: {
				entity,
				entity_id: entityId
			} });
			setItems(r.attachments ?? []);
		} catch (e) {
			toast.error("Chargement des pièces jointes impossible", { description: e?.message });
		} finally {
			setLoading(false);
		}
	}, [entity, entityId]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const handleFiles = async (files) => {
		if (!files || false) return;
		const list = Array.from(files);
		if (!list.length) return;
		setUploading(true);
		try {
			for (const f of list) {
				if (f.size > 20971520) {
					toast.error(`${f.name}: fichier trop volumineux (>20 Mo)`);
					continue;
				}
				await apiUpload("/attachments.php", {
					entity,
					entity_id: entityId,
					file: f
				});
				onAdded?.({
					filename: f.name,
					sizeBytes: f.size
				});
			}
			toast.success(`${list.length} fichier(s) téléversé(s)`);
			await load();
		} catch (e) {
			toast.error("Échec de l'envoi", { description: e?.message });
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	};
	const remove = async (a) => {
		setDeletingId(a.id);
		try {
			await api(`/attachments.php?id=${encodeURIComponent(a.id)}`, { method: "DELETE" });
			setItems((prev) => prev.filter((x) => x.id !== a.id));
			onRemoved?.({
				filename: a.filename,
				sizeBytes: a.sizeBytes
			});
			toast.success("Pièce jointe supprimée", { description: a.filename });
		} catch (e) {
			toast.error("Suppression impossible", { description: e?.message });
		} finally {
			setDeletingId(null);
			setConfirmDel(null);
		}
	};
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		const fromTs = dateFrom ? (/* @__PURE__ */ new Date(dateFrom + "T00:00:00")).getTime() : null;
		const toTs = dateTo ? (/* @__PURE__ */ new Date(dateTo + "T23:59:59")).getTime() : null;
		return items.filter((a) => {
			if (q && !a.filename.toLowerCase().includes(q) && !a.uploadedBy?.toLowerCase().includes(q)) return false;
			if (typeFilter !== "all" && categoryOf(a.mimeType) !== typeFilter) return false;
			if (sizeFilter !== "all") {
				const mb = a.sizeBytes / 1048576;
				if (sizeFilter === "small" && mb >= 1) return false;
				if (sizeFilter === "medium" && (mb < 1 || mb > 5)) return false;
				if (sizeFilter === "large" && mb <= 5) return false;
			}
			const ts = new Date(a.createdAt).getTime();
			if (fromTs !== null && ts < fromTs) return false;
			if (toTs !== null && ts > toTs) return false;
			return true;
		});
	}, [
		items,
		search,
		typeFilter,
		sizeFilter,
		dateFrom,
		dateTo
	]);
	const hasActiveFilter = search !== "" || typeFilter !== "all" || sizeFilter !== "all" || dateFrom !== "" || dateTo !== "";
	const resetFilters = () => {
		setSearch("");
		setTypeFilter("all");
		setSizeFilter("all");
		setDateFrom("");
		setDateTo("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-elegant",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-base flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-4 w-4" }), " Pièces jointes"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Documents liés à cette fiche (max 20 Mo / fichier)" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "bg-primary/5",
						children: hasActiveFilter ? `${filtered.length}/${items.length}` : items.length
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onDragOver: (e) => {
							e.preventDefault();
							setDragOver(true);
						},
						onDragLeave: () => setDragOver(false),
						onDrop: (e) => {
							e.preventDefault();
							setDragOver(false);
							handleFiles(e.dataTransfer.files);
						},
						className: `rounded-lg border-2 border-dashed p-4 text-center transition-base cursor-pointer ${dragOver ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`,
						onClick: () => inputRef.current?.click(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: inputRef,
							type: "file",
							multiple: true,
							className: "hidden",
							onChange: (e) => void handleFiles(e.target.files),
							disabled: uploading
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-1.5 text-sm",
							children: [
								uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-5 w-5 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: uploading ? "Envoi en cours…" : "Glissez vos fichiers ici ou cliquez"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "PDF, images, documents — jusqu'à 20 Mo"
								})
							]
						})]
					}),
					false,
					items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 rounded-lg border border-border bg-muted/20 p-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: search,
									onChange: (e) => setSearch(e.target.value),
									placeholder: "Rechercher par nom ou auteur…",
									className: "pl-8 h-9"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 sm:grid-cols-4 gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: typeFilter,
										onValueChange: (v) => setTypeFilter(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-9",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Type" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "all",
												children: "Tous types"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "image",
												children: "Images"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "pdf",
												children: "PDF"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "doc",
												children: "Documents"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "sheet",
												children: "Tableurs"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "archive",
												children: "Archives"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "other",
												children: "Autres"
											})
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: sizeFilter,
										onValueChange: (v) => setSizeFilter(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-9",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Taille" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "all",
												children: "Toutes tailles"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "small",
												children: "< 1 Mo"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "medium",
												children: "1 – 5 Mo"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "large",
												children: "> 5 Mo"
											})
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
										value: dateFrom,
										onChange: setDateFrom,
										placeholder: "Date début"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
										value: dateTo,
										onChange: setDateTo,
										placeholder: "Date fin"
									})
								]
							}),
							hasActiveFilter && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									className: "h-7 text-xs",
									onClick: resetFilters,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3 mr-1" }), " Réinitialiser"]
								})
							})
						]
					}),
					loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm text-muted-foreground text-center py-6 flex items-center justify-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Chargement…"]
					}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted-foreground text-center py-6",
						children: "Aucun document pour le moment."
					}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted-foreground text-center py-6",
						children: "Aucun document ne correspond aux filtres."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border rounded-lg border border-border overflow-hidden",
						children: filtered.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-8 w-8 rounded-md bg-accent/40 flex items-center justify-center shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileTypeIcon, { mime: a.mimeType })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-medium truncate",
										children: a.filename
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px] text-muted-foreground truncate",
										children: [
											fmtSize(a.sizeBytes),
											" · @",
											a.uploadedBy,
											" · ",
											new Date(a.createdAt).toLocaleString("fr-FR")
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: apiUrl(a.url),
									target: "_blank",
									rel: "noreferrer",
									className: "inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground",
									"aria-label": `Télécharger ${a.filename}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									className: "h-8 w-8 text-destructive hover:bg-destructive/10",
									onClick: () => setConfirmDel(a),
									disabled: deletingId === a.id,
									"aria-label": `Supprimer ${a.filename}`,
									children: deletingId === a.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})
							]
						}, a.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!confirmDel,
				onOpenChange: (o) => {
					if (!o) setConfirmDel(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Supprimer cette pièce jointe ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: confirmDel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"Le fichier ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground",
						children: confirmDel.filename
					}),
					" (",
					fmtSize(confirmDel.sizeBytes),
					") sera définitivement supprimé. Cette action est irréversible."
				] }) : null })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
					disabled: !!deletingId,
					children: "Annuler"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					disabled: !!deletingId,
					onClick: (e) => {
						e.preventDefault();
						if (confirmDel) remove(confirmDel);
					},
					children: deletingId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-1.5 animate-spin" }), "Suppression…"] }) : "Supprimer"
				})] })] })
			})
		]
	});
}
var FIELD_LABELS = {
	created: "Création",
	claim: "Attribution du lead",
	assignedTo: "Agent assigné",
	status: "Statut d'appel",
	outcome: "Résultat",
	lostReason: "Motif de perte",
	mark_won: "Marqué Vente",
	comment: "Commentaire",
	checkValeur: "Check valeur",
	city: "Ville",
	phone: "Téléphone",
	mobile: "Mobile",
	email: "Email",
	source: "Source",
	civility: "Civilité",
	lastName: "Nom",
	firstName: "Prénom",
	age: "Âge",
	spouseAge: "Âge conjoint",
	currentMutuelle: "Mutuelle actuelle",
	cotisation: "Cotisation",
	address: "Adresse",
	postalCode: "Code postal",
	demande: "Demande",
	delete: "Suppression",
	rdv_created: "RDV / Rappel créé",
	rdv_cancelled: "RDV / Rappel annulé",
	rdv_date: "Date du RDV",
	rdv_time: "Heure du RDV",
	rdv_agent: "Agent du RDV",
	rdv_type: "Type d'événement",
	rdv_title: "Titre du RDV",
	claim_created: "Réclamation client (Claim)",
	claim_status: "Statut réclamation",
	claim_resolved: "Réclamation résolue",
	billingStatus: "Statut facturation",
	premium: "Cotisation",
	attachment_added: "Pièce jointe ajoutée",
	attachment_removed: "Pièce jointe supprimée",
	created_from_prospect: "Contrat créé depuis prospect",
	partner: "Partenaire",
	cabinet: "Cabinet",
	signatureDate: "Date de signature",
	effectiveDate: "Date d'effet",
	validationDate: "Date de validation",
	commercialComment: "Commentaire commercial",
	product: "Produit",
	productOptions: "Options produit",
	iban: "IBAN",
	bic: "BIC",
	adhesionNumber: "N° d'adhésion",
	ssn: "Sécurité sociale"
};
function fieldLabel(f) {
	return FIELD_LABELS[f] ?? f;
}
function fieldTone(f) {
	if (f === "created" || f === "mark_won" || f === "rdv_created" || f === "claim_resolved") return "bg-success";
	if (f === "delete" || f === "lostReason" || f === "outcome" || f === "rdv_cancelled") return "bg-destructive";
	if (f.startsWith("claim_")) return "bg-amber-500";
	if (f === "assignedTo" || f === "status" || f.startsWith("rdv_")) return "bg-info";
	return "bg-primary/70";
}
function ProspectActivityCard({ prospectId, contractId }) {
	const [entries, setEntries] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [search, setSearch] = (0, import_react.useState)("");
	const [fieldFilter, setFieldFilter] = (0, import_react.useState)("all");
	const load = async () => {
		if (!prospectId && !contractId) return;
		setLoading(true);
		setError(null);
		try {
			const queryParams = { limit: "500" };
			if (contractId) queryParams.contractId = contractId;
			else if (prospectId) {
				queryParams.entity = "prospect";
				queryParams.entity_id = prospectId;
			}
			const r = await api("/activity.php", { query: queryParams });
			setEntries(r.activity ?? []);
		} catch (e) {
			setError(e?.message ?? "Erreur de chargement");
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		load();
	}, [prospectId, contractId]);
	const fieldsPresent = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		(entries ?? []).forEach((e) => set.add(e.field));
		return Array.from(set).sort();
	}, [entries]);
	const filtered = (0, import_react.useMemo)(() => {
		return (entries ?? []).filter((e) => {
			if (fieldFilter !== "all" && e.field !== fieldFilter) return false;
			if (search) {
				const q = search.toLowerCase();
				if (!`${e.previousValue} ${e.newValue} ${e.user} ${fieldLabel(e.field)}`.toLowerCase().includes(q)) return false;
			}
			return true;
		});
	}, [
		entries,
		fieldFilter,
		search
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border bg-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 px-4 py-3 border-b",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-4 w-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold",
							children: "Historique complet"
						}),
						entries && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [
								"· ",
								filtered.length,
								"/",
								entries.length,
								" entrée(s)"
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: load,
					disabled: loading,
					className: "h-7",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-2 px-4 py-3 border-b bg-muted/30",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "md:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Rechercher (utilisateur, valeur, champ)…",
						className: "h-8 text-xs"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: fieldFilter,
					onValueChange: setFieldFilter,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
						className: "h-8 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-3.5 w-3.5 mr-1 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "Tous les champs"
					}), fieldsPresent.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: f,
						children: fieldLabel(f)
					}, f))] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4",
				children: loading && !entries ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Chargement de l'historique…"]
				}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-destructive py-4 text-center",
					children: error
				}) : !entries || entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted-foreground py-6 text-center",
					children: "Aucune activité enregistrée pour cette fiche."
				}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted-foreground py-6 text-center",
					children: "Aucune entrée ne correspond à ces filtres."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "relative border-s border-border ms-2 space-y-4",
					children: filtered.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "ms-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full ring-4 ring-background ${fieldTone(e.field)}`,
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: fieldLabel(e.field)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: formatDateTime(e.timestamp) ?? e.timestamp
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-xs text-muted-foreground flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono",
									children: e.user || "—"
								})]
							}),
							(e.previousValue || e.newValue) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1.5 text-xs",
								children: [
									e.previousValue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "line-through text-muted-foreground/80",
										children: e.previousValue
									}) : null,
									e.previousValue && e.newValue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mx-1.5 text-muted-foreground",
										children: "→"
									}) : null,
									e.newValue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-foreground",
										children: e.newValue
									}) : null
								]
							})
						]
					}, e.id))
				})
			})
		]
	});
}
export { ProspectActivityCard as n, AttachmentsCard as t };
