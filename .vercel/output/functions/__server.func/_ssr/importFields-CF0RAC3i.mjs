import { i as __toESM } from "../_runtime.mjs";
import { c as useAuth, n as Button } from "./input-IbC7Hkfd.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { i as parseSpreadsheet, t as exportCSV } from "./exportUtils-D82gKDXZ.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { t as Progress } from "./progress-5aBggaNR.mjs";
import { n as recordImportRun } from "./importHistory-DY8ex3tY.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Gt as FileSpreadsheet, Q as Plus, Un as ArrowRight, Ut as FileXCorner, Wn as ArrowLeft, _n as CircleCheck, c as UserX, in as Download, n as X, p as Upload, q as RefreshCw, sn as Copy, vn as CircleAlert } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/importFields-CF0RAC3i.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SKIP = "__skip__";
function normalizePhone(v) {
	if (v == null) return "";
	let s = String(v).replace(/\D+/g, "");
	if (!s) return "";
	if (s.startsWith("0033")) s = s.slice(4);
	else if (s.startsWith("33") && s.length === 11) s = s.slice(2);
	else if (s.startsWith("0")) s = s.slice(1);
	return s;
}
function normalizeEmail(v) {
	if (v == null) return "";
	return String(v).trim().toLowerCase();
}
var UNASSIGNED = "__unassigned__";
var normName = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");
function ImportFlow({ title, description, fields, customFields = [], onImport, existingIds = [], idField = "id", existingRecords = [], templateFileName, entity, batchSize = 500, knownUsers = [], dedupeOn = ["phone", "email"], onDone, onCancel }) {
	const auth = (() => {
		try {
			return useAuth();
		} catch {
			return null;
		}
	})();
	const [step, setStep] = (0, import_react.useState)("upload");
	const [file, setFile] = (0, import_react.useState)(null);
	const [rawRows, setRawRows] = (0, import_react.useState)([]);
	const [headers, setHeaders] = (0, import_react.useState)([]);
	const [mapping, setMapping] = (0, import_react.useState)({});
	const [customMapping, setCustomMapping] = (0, import_react.useState)({});
	const [parsing, setParsing] = (0, import_react.useState)(false);
	const [importing, setImporting] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)({
		done: 0,
		total: 0,
		batch: 0,
		batches: 0,
		added: 0,
		updated: 0,
		skipped: 0
	});
	const [resolutions, setResolutions] = (0, import_react.useState)({});
	/** Maps normalized unknown agent value -> override (UNASSIGNED or username). */
	const [assigneeOverrides, setAssigneeOverrides] = (0, import_react.useState)({});
	const inputRef = (0, import_react.useRef)(null);
	const reset = () => {
		setFile(null);
		setRawRows([]);
		setHeaders([]);
		setMapping({});
		setCustomMapping({});
		setStep("upload");
		setResolutions({});
		setAssigneeOverrides({});
		setProgress({
			done: 0,
			total: 0,
			batch: 0,
			batches: 0,
			added: 0,
			updated: 0,
			skipped: 0
		});
		if (inputRef.current) inputRef.current.value = "";
	};
	const handleFile = async (f) => {
		setParsing(true);
		try {
			const rows = await parseSpreadsheet(f);
			if (rows.length === 0) {
				toast.error("Fichier vide ou illisible");
				return;
			}
			const cols = Object.keys(rows[0]);
			setRawRows(rows);
			setHeaders(cols);
			const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "").trim();
			const colNorm = cols.map((c) => ({
				raw: c,
				n: norm(c)
			}));
			const findFor = (candidates) => {
				const cands = candidates.map(norm).filter(Boolean);
				for (const c of cands) {
					const hit = colNorm.find((cn) => cn.n === c);
					if (hit) return hit.raw;
				}
				for (const c of cands) {
					const hit = colNorm.find((cn) => cn.n.includes(c) || c.includes(cn.n));
					if (hit) return hit.raw;
				}
			};
			const used = /* @__PURE__ */ new Set();
			const auto = {};
			for (const fld of fields) {
				const found = findFor([
					fld.key,
					fld.label,
					...fld.aliases ?? []
				]);
				if (found && !used.has(found)) {
					auto[fld.key] = found;
					used.add(found);
				} else auto[fld.key] = SKIP;
			}
			const autoCustom = {};
			for (const cf of customFields) {
				const found = findFor([
					cf.key,
					cf.label,
					...cf.aliases ?? []
				]);
				if (found && !used.has(found)) {
					autoCustom[cf.key] = found;
					used.add(found);
				} else autoCustom[cf.key] = SKIP;
			}
			setMapping(auto);
			setCustomMapping(autoCustom);
			setFile(f);
			setStep("map");
			toast.success(`${rows.length} ligne(s) détectée(s)`);
		} catch (e) {
			console.error(e);
			toast.error("Impossible de lire le fichier");
		} finally {
			setParsing(false);
		}
	};
	const missingRequired = fields.filter((f) => f.required && (!mapping[f.key] || mapping[f.key] === SKIP));
	const mappedCount = fields.filter((f) => mapping[f.key] && mapping[f.key] !== SKIP).length + customFields.filter((f) => customMapping[f.key] && customMapping[f.key] !== SKIP).length;
	const totalFieldCount = fields.length + customFields.length;
	const dupPhoneEnabled = dedupeOn.includes("phone");
	const dupEmailEnabled = dedupeOn.includes("email");
	const dupIndex = (0, import_react.useMemo)(() => {
		const byPhone = /* @__PURE__ */ new Map();
		const byEmail = /* @__PURE__ */ new Map();
		for (const r of existingRecords) {
			if (dupPhoneEnabled) {
				const p = normalizePhone(r.phone);
				if (p && !byPhone.has(p)) byPhone.set(p, r);
				const m = normalizePhone(r.mobile);
				if (m && !byPhone.has(m)) byPhone.set(m, r);
			}
			if (dupEmailEnabled) {
				const e = normalizeEmail(r.email);
				if (e && !byEmail.has(e)) byEmail.set(e, r);
			}
		}
		return {
			byPhone,
			byEmail
		};
	}, [
		existingRecords,
		dupPhoneEnabled,
		dupEmailEnabled
	]);
	/** Fuzzy matcher: returns a known username or null. */
	const matchAssignee = (0, import_react.useMemo)(() => {
		const byKey = /* @__PURE__ */ new Map();
		const add = (key, username) => {
			if (!key) return;
			if (!byKey.has(key)) byKey.set(key, username);
		};
		for (const u of knownUsers) {
			const un = u.username;
			if (!un) continue;
			add(normName(un), un);
			const head = String(un).split(/[.\s_@-]/)[0];
			if (head) add(normName(head), un);
			if (u.fullName) {
				const full = String(u.fullName);
				add(normName(full), un);
				const parts = full.split(/\s+/).filter(Boolean);
				if (parts.length >= 2) {
					add(normName(parts.join("")), un);
					add(normName([...parts].reverse().join("")), un);
				}
			}
		}
		return (raw) => {
			const n = normName(raw);
			if (!n) return null;
			if (byKey.has(n)) return byKey.get(n);
			const head = normName(String(raw).split(/[.\s_@-]/)[0]);
			if (head && byKey.has(head)) return byKey.get(head);
			for (const [k, v] of byKey) if (k.length >= 3 && (n.startsWith(k) || k.startsWith(n))) return v;
			return null;
		};
	}, [knownUsers]);
	const validated = (0, import_react.useMemo)(() => {
		if (step !== "review") return [];
		const existingSet = new Set(existingIds);
		return rawRows.map((r, i) => {
			const values = {};
			const errors = [];
			for (const fld of fields) {
				const src = mapping[fld.key];
				if (!src || src === SKIP) {
					if (fld.required) errors.push({
						field: fld.label,
						message: "champ requis non mappé"
					});
					continue;
				}
				const raw = r[src];
				let v = typeof raw === "string" ? raw.trim() : raw;
				if (fld.transform) try {
					v = fld.transform(v);
				} catch {}
				values[fld.key] = v;
				if (fld.required && (v === void 0 || v === null || v === "")) errors.push({
					field: fld.label,
					message: "valeur vide"
				});
				if (fld.validate) {
					const msg = fld.validate(v);
					if (msg) errors.push({
						field: fld.label,
						message: msg
					});
				}
			}
			const cv = {};
			for (const cf of customFields) {
				const src = customMapping[cf.key];
				if (!src || src === SKIP) continue;
				const raw = r[src];
				if (raw === void 0 || raw === null) continue;
				const s = typeof raw === "string" ? raw.trim() : String(raw);
				if (s === "") continue;
				cv[cf.key] = s;
			}
			if (Object.keys(cv).length) values.customValues = cv;
			const matchKey = values[idField] != null && String(values[idField]).trim() !== "" ? String(values[idField]).trim() : null;
			const isUpdate = matchKey ? existingSet.has(matchKey) : false;
			let duplicate = null;
			let duplicateReason = null;
			if (!isUpdate) {
				if (dupPhoneEnabled) {
					const np = normalizePhone(values["phone"]);
					const nm = normalizePhone(values["mobile"]);
					if (np && dupIndex.byPhone.has(np)) {
						duplicate = dupIndex.byPhone.get(np);
						duplicateReason = "phone";
					} else if (nm && dupIndex.byPhone.has(nm)) {
						duplicate = dupIndex.byPhone.get(nm);
						duplicateReason = "phone";
					}
				}
				if (!duplicate && dupEmailEnabled) {
					const ne = normalizeEmail(values["email"]);
					if (ne && dupIndex.byEmail.has(ne)) {
						duplicate = dupIndex.byEmail.get(ne);
						duplicateReason = "email";
					}
				}
			}
			const assigneeRawRaw = values["assignedTo"];
			const assigneeRaw = assigneeRawRaw != null && String(assigneeRawRaw).trim() !== "" ? String(assigneeRawRaw).trim() : null;
			const assigneeMatched = assigneeRaw && knownUsers.length > 0 ? matchAssignee(assigneeRaw) : null;
			return {
				index: i + 1,
				values,
				errors,
				matchKey,
				isUpdate,
				duplicate,
				duplicateReason,
				assigneeRaw,
				assigneeMatched
			};
		});
	}, [
		step,
		rawRows,
		mapping,
		customMapping,
		fields,
		customFields,
		existingIds,
		idField,
		dupIndex,
		dupPhoneEnabled,
		dupEmailEnabled,
		knownUsers,
		matchAssignee
	]);
	/** Unique unresolved agents grouped by normalized key. */
	const unresolvedAgents = (0, import_react.useMemo)(() => {
		if (knownUsers.length === 0) return [];
		const map = /* @__PURE__ */ new Map();
		for (const v of validated) {
			if (!v.assigneeRaw || v.assigneeMatched) continue;
			const k = normName(v.assigneeRaw);
			if (!k) continue;
			const cur = map.get(k);
			if (cur) cur.count++;
			else map.set(k, {
				key: k,
				sample: v.assigneeRaw,
				count: 1
			});
		}
		return Array.from(map.values()).sort((a, b) => b.count - a.count);
	}, [validated, knownUsers]);
	const unresolvedCount = (0, import_react.useMemo)(() => validated.filter((v) => v.assigneeRaw && !v.assigneeMatched).length, [validated]);
	(0, import_react.useEffect)(() => {
		if (step !== "review") return;
		setResolutions((prev) => {
			const next = { ...prev };
			for (const v of validated) if (v.duplicate && next[v.index] === void 0) next[v.index] = "merge";
			return next;
		});
	}, [step, validated]);
	const summary = (0, import_react.useMemo)(() => {
		const valid = validated.filter((v) => v.errors.length === 0);
		const invalid = validated.length - valid.length;
		let willUpdate = 0, willAdd = 0, willSkip = 0, dupCount = 0;
		for (const v of valid) if (v.duplicate) {
			dupCount++;
			const r = resolutions[v.index] ?? "merge";
			if (r === "merge") willUpdate++;
			else if (r === "add") willAdd++;
			else willSkip++;
		} else if (v.isUpdate) willUpdate++;
		else willAdd++;
		return {
			total: validated.length,
			valid: valid.length,
			invalid,
			willAdd,
			willUpdate,
			willSkip,
			dupCount
		};
	}, [validated, resolutions]);
	const handleConfirm = async () => {
		const okRows = [];
		const resolveAssignee = (v) => {
			if (!v.assigneeRaw) return {
				changed: false,
				value: null
			};
			if (v.assigneeMatched) return {
				changed: v.assigneeMatched !== v.assigneeRaw,
				value: v.assigneeMatched
			};
			const ov = assigneeOverrides[normName(v.assigneeRaw)];
			if (ov === UNASSIGNED) return {
				changed: true,
				value: null
			};
			if (ov) return {
				changed: true,
				value: ov
			};
			return {
				changed: true,
				value: null
			};
		};
		for (const v of validated) {
			if (v.errors.length > 0) continue;
			const a = resolveAssignee(v);
			const applyAssignee = (obj) => {
				if (!v.assigneeRaw) return obj;
				return {
					...obj,
					assignedTo: a.value
				};
			};
			if (v.duplicate) {
				const r = resolutions[v.index] ?? "merge";
				if (r === "skip") continue;
				if (r === "merge") okRows.push(applyAssignee({
					...v.values,
					[idField]: v.duplicate.id
				}));
				else {
					const cloned = { ...v.values };
					if (String(cloned[idField] ?? "") === v.duplicate.id) delete cloned[idField];
					okRows.push(applyAssignee(cloned));
				}
			} else okRows.push(applyAssignee({ ...v.values }));
		}
		if (okRows.length === 0) {
			toast.error("Aucune ligne valide à importer");
			return;
		}
		setImporting(true);
		const size = Math.max(50, batchSize);
		const batches = Math.ceil(okRows.length / size);
		setProgress({
			done: 0,
			total: okRows.length,
			batch: 0,
			batches,
			added: 0,
			updated: 0,
			skipped: 0
		});
		let added = 0, updated = 0, skipped = 0;
		try {
			for (let i = 0; i < okRows.length; i += size) {
				const slice = okRows.slice(i, i + size);
				const batchIdx = Math.floor(i / size) + 1;
				setProgress((p) => ({
					...p,
					batch: batchIdx
				}));
				const r = await onImport(slice);
				added += r.added;
				updated += r.updated;
				skipped += r.skipped;
				setProgress({
					done: Math.min(i + size, okRows.length),
					total: okRows.length,
					batch: batchIdx,
					batches,
					added,
					updated,
					skipped
				});
			}
			const result = {
				added,
				updated,
				skipped
			};
			if (entity) recordImportRun({
				entity,
				title,
				fileName: file?.name ?? null,
				user: auth?.user?.username ?? null,
				totals: {
					added: result.added,
					updated: result.updated,
					skipped: result.skipped
				},
				rowsRead: validated.length,
				rowsValid: summary.valid,
				rowsInvalid: summary.invalid,
				duplicates: summary.dupCount,
				mapping: [...fields.map((f) => ({
					fieldKey: f.key,
					fieldLabel: f.label,
					sourceColumn: mapping[f.key] && mapping[f.key] !== SKIP ? mapping[f.key] : null,
					required: !!f.required
				})), ...customFields.map((f) => ({
					fieldKey: `cf:${f.key}`,
					fieldLabel: f.label,
					sourceColumn: customMapping[f.key] && customMapping[f.key] !== SKIP ? customMapping[f.key] : null,
					required: false
				}))]
			});
			toast.success(`${result.added} ajoutée(s) • ${result.updated} mise(s) à jour`, { description: result.skipped ? `${result.skipped} ignorée(s)` : file?.name });
			reset();
			onDone?.();
		} catch (e) {
			toast.error("Échec de l'import", { description: e instanceof Error ? e.message : "Erreur inconnue" });
		} finally {
			setImporting(false);
		}
	};
	const downloadTemplate = () => {
		const headerRow = {};
		for (const f of fields) headerRow[f.key] = f.sample ?? "";
		exportCSV(templateFileName ?? "modele-import.csv", [headerRow]);
		toast.success("Modèle CSV téléchargé");
	};
	const downloadInvalid = () => {
		const bad = validated.filter((v) => v.errors.length > 0);
		if (bad.length === 0) return;
		const out = bad.map((v) => ({
			ligne: v.index,
			erreurs: v.errors.map((e) => `${e.field}: ${e.message}`).join(" | "),
			...v.values
		}));
		exportCSV("lignes-invalides.csv", out);
		toast.success(`${bad.length} ligne(s) invalide(s) exportée(s)`);
	};
	const Steps = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center gap-1.5 text-[11px] text-muted-foreground",
		children: [
			"upload",
			"map",
			"review"
		].map((s, i) => {
			const active = step === s;
			const done = [
				"upload",
				"map",
				"review"
			].indexOf(step) > i;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `px-2 py-0.5 rounded-full border ${active ? "bg-primary text-primary-foreground border-primary" : done ? "bg-success/15 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}`,
					children: {
						upload: "1. Fichier",
						map: "2. Mappage",
						review: "3. Aperçu"
					}[s]
				}), i < 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })]
			}, s);
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-4 space-y-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3 flex-wrap",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-base font-semibold",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-0.5",
						children: description
					})] }), Steps]
				})
			}),
			step === "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-dashed border-2 p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors",
						onClick: () => inputRef.current?.click(),
						onDragOver: (e) => e.preventDefault(),
						onDrop: (e) => {
							e.preventDefault();
							const f = e.dataTransfer.files[0];
							if (f) handleFile(f);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: "Glissez un fichier ou cliquez pour parcourir"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground mt-1",
								children: "Formats acceptés : .csv, .xlsx, .xls"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: inputRef,
								type: "file",
								accept: ".csv,.xlsx,.xls",
								className: "hidden",
								onChange: (e) => {
									const f = e.target.files?.[0];
									if (f) handleFile(f);
								}
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Besoin d'un modèle ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: downloadTemplate,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), "Télécharger le modèle CSV"]
						})]
					}),
					parsing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "Lecture en cours…"
					}),
					onCancel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: onCancel,
							children: "Annuler"
						})
					})
				]
			}),
			step === "map" && file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between p-3 rounded-md border border-border bg-muted/30",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium truncate",
									children: file.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [
										rawRows.length,
										" ligne(s) • ",
										headers.length,
										" colonne(s) • ",
										mappedCount,
										"/",
										totalFieldCount,
										" champ(s) mappé(s)"
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: reset,
							"aria-label": "Retirer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs uppercase tracking-wider text-muted-foreground",
						children: "Mappage des colonnes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 border border-border rounded-md divide-y divide-border max-h-[28rem] overflow-y-auto",
						children: [
							fields.map((f) => {
								const v = mapping[f.key] ?? SKIP;
								const isMapped = v !== SKIP;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3 p-2.5 items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-sm min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium truncate",
												children: f.label
											}),
											f.required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[10px] py-0 bg-destructive/10 text-destructive border-destructive/20",
												children: "requis"
											}),
											isMapped && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-success shrink-0" })
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: v,
										onValueChange: (nv) => setMapping((m) => ({
											...m,
											[f.key]: nv
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: SKIP,
											children: "— Ignorer —"
										}), headers.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: h,
											children: h
										}, h))] })]
									})]
								}, f.key);
							}),
							customFields.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-2.5 py-1.5 bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground",
								children: "Champs personnalisés"
							}),
							customFields.map((f) => {
								const v = customMapping[f.key] ?? SKIP;
								const isMapped = v !== SKIP;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3 p-2.5 items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-sm min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium truncate",
												children: f.label
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[10px] py-0",
												children: "perso"
											}),
											isMapped && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-success shrink-0" })
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: v,
										onValueChange: (nv) => setCustomMapping((m) => ({
											...m,
											[f.key]: nv
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: SKIP,
											children: "— Ignorer —"
										}), headers.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: h,
											children: h
										}, h))] })]
									})]
								}, `cf-${f.key}`);
							})
						]
					})] }),
					missingRequired.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: "Champs requis manquants"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs mt-0.5",
							children: missingRequired.map((f) => f.label).join(", ")
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => setStep("upload"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: missingRequired.length > 0,
							onClick: () => setStep("review"),
							children: ["Aperçu", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 ml-1.5" })]
						})]
					})
				]
			}),
			step === "review" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 md:grid-cols-5 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
								label: "Lignes lues",
								value: summary.total
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
								label: "À ajouter",
								value: summary.willAdd,
								tone: "info",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
								label: "À mettre à jour",
								value: summary.willUpdate,
								tone: "success",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
								label: "Doublons détectés",
								value: summary.dupCount,
								tone: summary.dupCount > 0 ? "warning" : "muted",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3.5 w-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
								label: "Invalides",
								value: summary.invalid,
								tone: summary.invalid > 0 ? "destructive" : "muted",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileXCorner, { className: "h-3.5 w-3.5" })
							})
						]
					}),
					summary.dupCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 p-3 rounded-md bg-warning/10 border border-warning/20 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4 mt-0.5 shrink-0 text-warning-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: "Fusion assistée"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: [
										summary.dupCount,
										" ligne(s) correspondent à un enregistrement existant (",
										dedupeOn.includes("email") ? "téléphone, GSM ou email" : "téléphone ou GSM",
										" normalisé). Choisissez l'action par ligne ci-dessous."
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1.5 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => {
										setResolutions((prev) => {
											const n = { ...prev };
											for (const v of validated) if (v.duplicate) n[v.index] = "merge";
											return n;
										});
									},
									children: "Tout fusionner"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => {
										setResolutions((prev) => {
											const n = { ...prev };
											for (const v of validated) if (v.duplicate) n[v.index] = "skip";
											return n;
										});
									},
									children: "Tout ignorer"
								})]
							})
						]
					}),
					unresolvedAgents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-warning/30 bg-warning/5 p-3 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { className: "h-4 w-4 mt-0.5 shrink-0 text-warning-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm font-medium",
										children: [
											unresolvedAgents.length,
											" agent(s) non reconnu(s) — ",
											unresolvedCount,
											" ligne(s) concernée(s)"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: "Choisissez l'utilisateur correspondant, ou laissez « Non assigné ». Sans choix, ces lignes seront importées sans agent."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-1.5 shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => {
											setAssigneeOverrides((prev) => {
												const n = { ...prev };
												for (const a of unresolvedAgents) n[a.key] = UNASSIGNED;
												return n;
											});
										},
										children: "Tout laisser non assigné"
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-2 md:grid-cols-2",
							children: unresolvedAgents.map((a) => {
								const cur = assigneeOverrides[a.key] ?? UNASSIGNED;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 rounded-md border border-border bg-background/60 p-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-medium truncate",
											title: a.sample,
											children: a.sample
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] text-muted-foreground",
											children: [a.count, " ligne(s)"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: cur,
										onValueChange: (nv) => setAssigneeOverrides((p) => ({
											...p,
											[a.key]: nv
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 w-[200px] text-xs",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: UNASSIGNED,
											children: "— Non assigné —"
										}), knownUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: u.username,
											children: u.fullName ? `${u.fullName} (${u.username})` : u.username
										}, u.username))] })]
									})]
								}, a.key);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border border-border rounded-md p-3 bg-muted/20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-2",
							children: "Mappage appliqué"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: fields.filter((f) => mapping[f.key] && mapping[f.key] !== SKIP).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "font-normal",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: mapping[f.key]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3 mx-1 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: f.label
									})
								]
							}, f.key))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							className: "text-xs uppercase tracking-wider text-muted-foreground",
							children: [
								"Aperçu détaillé (",
								Math.min(validated.length, 50),
								" sur ",
								validated.length,
								")"
							]
						}), summary.invalid > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: downloadInvalid,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), "Télécharger les lignes invalides"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border border-border rounded-md overflow-x-auto max-h-96",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-muted/40 sticky top-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-1.5 text-left font-medium w-12",
										children: "Ligne"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-1.5 text-left font-medium w-24",
										children: "Action"
									}),
									fields.filter((f) => mapping[f.key] && mapping[f.key] !== SKIP).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-1.5 text-left font-medium",
										children: f.label
									}, f.key)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-1.5 text-left font-medium",
										children: "Erreurs"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: validated.slice(0, 50).map((v) => {
								const bad = v.errors.length > 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: `border-t border-border ${bad ? "bg-destructive/5" : v.duplicate ? "bg-warning/5" : ""}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-1.5 text-muted-foreground align-top",
											children: v.index
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-1.5 align-top",
											children: bad ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[10px] py-0 bg-destructive/10 text-destructive border-destructive/20",
												children: "Ignorée"
											}) : v.duplicate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "outline",
														className: "text-[10px] py-0 bg-warning/15 text-warning-foreground border-warning/30",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-2.5 w-2.5 mr-1" }),
															"Doublon (",
															v.duplicateReason === "phone" ? "tél" : "email",
															")"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: resolutions[v.index] ?? "merge",
														onValueChange: (nv) => setResolutions((p) => ({
															...p,
															[v.index]: nv
														})),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-7 text-[11px] w-[120px]",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "merge",
																children: "Fusionner"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "add",
																children: "Ajouter quand même"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "skip",
																children: "Ignorer"
															})
														] })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[10px] text-muted-foreground truncate max-w-[140px]",
														title: v.duplicate.label,
														children: ["↳ ", v.duplicate.label]
													})
												]
											}) : v.isUpdate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "outline",
												className: "text-[10px] py-0 bg-success/10 text-success border-success/20",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-2.5 w-2.5 mr-1" }), "Maj"]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "outline",
												className: "text-[10px] py-0 bg-info/10 text-info border-info/20",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-2.5 w-2.5 mr-1" }), "Ajout"]
											})
										}),
										fields.filter((f) => mapping[f.key] && mapping[f.key] !== SKIP).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-1.5 truncate max-w-[160px] align-top",
											children: String(v.values[f.key] ?? "")
										}, f.key)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-1.5 text-destructive align-top",
											children: v.errors.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												title: v.errors.map((e) => `${e.field}: ${e.message}`).join("\n"),
												children: v.errors.map((e) => e.field).join(", ")
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "—"
											})
										})
									]
								}, v.index);
							}) })]
						})
					})] }),
					summary.valid === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aucune ligne valide. Corrigez le fichier ou le mappage avant de poursuivre." })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 p-3 rounded-md bg-success/10 text-success text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Prêt à importer : ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: summary.willAdd }),
							" ajout(s) et",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: summary.willUpdate }),
							" mise(s) à jour",
							summary.invalid > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								" — ",
								summary.invalid,
								" ligne(s) seront ignorée(s)"
							] })
						] })]
					}),
					importing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border bg-muted/40 p-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-medium",
									children: [
										"Import en cours — lot ",
										progress.batch,
										"/",
										progress.batches
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums text-muted-foreground",
									children: [
										progress.done.toLocaleString(),
										" / ",
										progress.total.toLocaleString(),
										" lignes",
										progress.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											" · ",
											Math.round(progress.done / progress.total * 100),
											"%"
										] })
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: progress.total > 0 ? progress.done / progress.total * 100 : 0 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 tabular-nums",
										children: ["Ajoutées : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: progress.added.toLocaleString() })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 tabular-nums",
										children: ["Mises à jour : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: progress.updated.toLocaleString() })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 tabular-nums",
										children: ["Ignorées : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: progress.skipped.toLocaleString() })]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => setStep("map"),
							disabled: importing,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Modifier le mappage"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: handleConfirm,
							disabled: summary.valid === 0 || importing,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4 mr-1.5" }), importing ? `Import… ${progress.done}/${progress.total}` : `Confirmer l'import (${summary.valid})`]
						})]
					})
				]
			})
		]
	});
}
function SummaryCard({ label, value, tone = "muted", icon }) {
	const toneClass = {
		muted: "border-border bg-muted/30 text-foreground",
		info: "border-info/20 bg-info/10 text-info",
		success: "border-success/20 bg-success/10 text-success",
		destructive: "border-destructive/20 bg-destructive/10 text-destructive",
		warning: "border-warning/20 bg-warning/10 text-warning-foreground"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-md border p-3 ${toneClass}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-[10px] uppercase tracking-wider opacity-80 flex items-center gap-1",
			children: [icon, label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-2xl font-semibold tabular-nums",
			children: value
		})]
	});
}
function parseDateLoose(v) {
	if (v == null) return v;
	const s = String(v).trim();
	if (!s) return s;
	const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
	const dmy8 = s.match(/^(\d{2})(\d{2})(\d{4})$/);
	if (dmy8) return `${dmy8[3]}-${dmy8[2]}-${dmy8[1]}`;
	const dmy = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
	if (dmy) return `${dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
	return s;
}
var parseInteger = (v) => {
	if (v === null || v === void 0 || v === "") return null;
	const n = parseInt(String(v).replace(/[^\d-]/g, ""), 10);
	if (!Number.isFinite(n)) return null;
	if (n < 0 || n > 130) return null;
	return n;
};
var parseMoney = (v) => {
	if (v === null || v === void 0 || v === "") return null;
	const n = parseFloat(String(v).replace(/[^\d.,-]/g, "").replace(",", "."));
	return Number.isFinite(n) ? n : null;
};
var PROSPECT_IMPORT_FIELDS = [
	{
		key: "id",
		label: "Identifiant (Numero)",
		aliases: [
			"numero",
			"numéro",
			"num",
			"id",
			"n",
			"no",
			"ref",
			"reference"
		],
		sample: "P-000123"
	},
	{
		key: "lastName",
		label: "Nom",
		required: true,
		aliases: [
			"nom",
			"lastname",
			"last name",
			"name",
			"famille"
		],
		sample: "DUPONT"
	},
	{
		key: "firstName",
		label: "Prénom",
		required: true,
		aliases: [
			"prenom",
			"prénom",
			"firstname",
			"first name"
		],
		sample: "Marie"
	},
	{
		key: "civility",
		label: "Civilité (M/Mme)",
		aliases: [
			"civilite",
			"civilité",
			"civility",
			"title",
			"titre"
		],
		sample: "Mme"
	},
	{
		key: "phone",
		label: "Téléphone (fixe)",
		aliases: [
			"telephone",
			"téléphone",
			"tel",
			"tél",
			"phone",
			"fixe",
			"ligne fixe"
		],
		sample: "0147710141"
	},
	{
		key: "mobile",
		label: "Mobile / GSM",
		aliases: [
			"gsm",
			"mobile",
			"portable",
			"cellulaire",
			"tel mobile",
			"tél mobile",
			"telmobile"
		],
		sample: "0612345678"
	},
	{
		key: "email",
		label: "Email",
		aliases: [
			"mail",
			"courriel",
			"e-mail",
			"e mail"
		],
		sample: "marie@example.com"
	},
	{
		key: "city",
		label: "Ville",
		aliases: [
			"ville",
			"city",
			"town",
			"commune"
		],
		sample: "PARIS"
	},
	{
		key: "address",
		label: "Adresse",
		aliases: [
			"adresse",
			"address",
			"rue",
			"addr",
			"voie"
		],
		sample: "12 Rue de Paris"
	},
	{
		key: "postalCode",
		label: "Code Postal",
		aliases: [
			"codepostal",
			"code postal",
			"cp",
			"postalcode",
			"zip",
			"zipcode"
		],
		sample: "75001"
	},
	{
		key: "source",
		label: "Source",
		aliases: [
			"sourceprospect",
			"source prospect",
			"origine",
			"provenance"
		],
		sample: "Web"
	},
	{
		key: "status",
		label: "Statut",
		aliases: [
			"statut",
			"statutappel",
			"statut appel",
			"etat",
			"état"
		],
		sample: "RDV"
	},
	{
		key: "assignedTo",
		label: "Assigné à (username)",
		aliases: [
			"assigne",
			"assigné",
			"assignea",
			"assigné à",
			"assigne a",
			"assignedto",
			"assigned to",
			"agent",
			"commercial",
			"owner"
		],
		sample: "REDISSI.SONIA"
	},
	{
		key: "createdAt",
		label: "Date d'ajout",
		aliases: [
			"datedecreation",
			"date de creation",
			"date de création",
			"datecreation",
			"createdat",
			"created at",
			"date",
			"date ajout",
			"dateajout"
		],
		sample: "2026-04-28",
		transform: parseDateLoose
	},
	{
		key: "comment",
		label: "Commentaire",
		aliases: [
			"commentaire",
			"comment",
			"notes",
			"note",
			"remarque",
			"remarques"
		]
	},
	{
		key: "demande",
		label: "Demande",
		aliases: [
			"demande",
			"request",
			"besoin",
			"objet"
		]
	},
	{
		key: "age",
		label: "Âge",
		aliases: [
			"age",
			"âge",
			"age client",
			"ageclient"
		],
		sample: "62",
		transform: parseInteger
	},
	{
		key: "spouseAge",
		label: "Âge conjoint",
		aliases: [
			"ageconjoint",
			"age conjoint",
			"âge conjoint",
			"spouseage",
			"spouse age",
			"conjoint"
		],
		sample: "60",
		transform: parseInteger
	},
	{
		key: "currentMutuelle",
		label: "Mutuelle actuelle",
		aliases: [
			"mutuelle",
			"mutuelle actuelle",
			"mutuelleactuelle",
			"currentmutuelle",
			"current mutuelle",
			"complementaire",
			"complémentaire"
		],
		sample: "Harmonie"
	},
	{
		key: "cotisation",
		label: "Cotisation (€)",
		aliases: [
			"cotisation",
			"prime",
			"premium",
			"montant",
			"tarif",
			"cotisationmensuelle",
			"cotisation mensuelle"
		],
		sample: "89.50",
		transform: parseMoney
	}
];
function buildContractImportFields(currencySymbol) {
	return [
		{
			key: "id",
			label: "Identifiant (Numero)",
			aliases: [
				"numero",
				"numéro",
				"num",
				"id",
				"n",
				"no",
				"ref",
				"reference"
			],
			sample: "C-000123"
		},
		{
			key: "lastName",
			label: "Nom",
			required: true,
			aliases: [
				"nom",
				"lastname",
				"last name",
				"name",
				"famille"
			],
			sample: "DUPONT"
		},
		{
			key: "firstName",
			label: "Prénom",
			required: true,
			aliases: [
				"prenom",
				"prénom",
				"firstname",
				"first name"
			],
			sample: "Marie"
		},
		{
			key: "civility",
			label: "Civilité (M/Mme)",
			aliases: [
				"civilite",
				"civilité",
				"civility",
				"title",
				"titre"
			],
			sample: "Mme"
		},
		{
			key: "phone",
			label: "Téléphone (fixe)",
			aliases: [
				"telephone",
				"téléphone",
				"tel",
				"tél",
				"phone",
				"fixe",
				"ligne fixe"
			],
			sample: "0147710141"
		},
		{
			key: "mobile",
			label: "Mobile / GSM",
			aliases: [
				"gsm",
				"mobile",
				"portable",
				"cellulaire",
				"tel mobile",
				"tél mobile",
				"telmobile"
			],
			sample: "0612345678"
		},
		{
			key: "email",
			label: "Email",
			aliases: [
				"mail",
				"courriel",
				"e-mail",
				"e mail",
				"emailclient",
				"email_client",
				"email client"
			],
			sample: "marie@example.com"
		},
		{
			key: "birthDate",
			label: "Date de naissance (AAAA-MM-JJ)",
			aliases: [
				"datenaissance",
				"date naissance",
				"date de naissance",
				"birthdate",
				"naissance",
				"datenaissanceclient",
				"datenaissance_client"
			],
			sample: "1957-01-05",
			transform: parseDateLoose
		},
		{
			key: "address",
			label: "Adresse",
			aliases: [
				"adresse",
				"address",
				"rue",
				"addr",
				"voie",
				"adresseclient",
				"adresse_client"
			],
			sample: "12 Rue de Paris"
		},
		{
			key: "postalCode",
			label: "Code Postal",
			aliases: [
				"codepostal",
				"code postal",
				"cp",
				"postalcode",
				"zip",
				"zipcode",
				"codepostalclient",
				"codepostal_client"
			],
			sample: "75001"
		},
		{
			key: "city",
			label: "Ville",
			aliases: [
				"ville",
				"city",
				"town",
				"commune"
			],
			sample: "PARIS"
		},
		{
			key: "partner",
			label: "Partenaire",
			aliases: [
				"partenaire",
				"partner",
				"compagnie",
				"assureur"
			],
			sample: "NEOLIANE"
		},
		{
			key: "cabinet",
			label: "Cabinet",
			aliases: [
				"cabinet",
				"agence",
				"bureau"
			],
			sample: "Cabinet Paris 1"
		},
		{
			key: "premium",
			label: `Cotisation (${currencySymbol})`,
			required: true,
			aliases: [
				"cotisation",
				"premium",
				"prime",
				"montant",
				"tarif",
				"cotisationmensuelle",
				"cotisation mensuelle"
			],
			sample: "950",
			transform: parseMoney
		},
		{
			key: "currentMutuelle",
			label: "Mutuelle actuelle",
			aliases: [
				"mutuelle",
				"mutuelle actuelle",
				"mutuelleactuelle",
				"currentmutuelle",
				"current mutuelle",
				"complementaire",
				"complémentaire",
				"ancienne mutuelle"
			],
			sample: "Harmonie"
		},
		{
			key: "ssn",
			label: "N° Sécurité Sociale",
			aliases: [
				"ssn",
				"secu",
				"sécu",
				"numerosecsocial",
				"numero secu",
				"numerosecsocial_client",
				"n secu",
				"n° secu",
				"securitesociale"
			],
			sample: "257017821001551"
		},
		{
			key: "previousPremium",
			label: `Ancienne cotisation (${currencySymbol})`,
			aliases: [
				"anciennecotisation",
				"ancienne cotisation",
				"previouspremium",
				"previous premium",
				"ancien tarif"
			],
			transform: parseMoney
		},
		{
			key: "spouseLastName",
			label: "Nom conjoint",
			aliases: [
				"nomconjoint",
				"nom conjoint",
				"nom_conjoint_client",
				"spouselastname"
			],
			sample: "DUPONT"
		},
		{
			key: "spouseFirstName",
			label: "Prénom conjoint",
			aliases: [
				"prenomconjoint",
				"prénom conjoint",
				"prenom_conjoint_client",
				"spousefirstname"
			],
			sample: "Jean"
		},
		{
			key: "spouseBirthDate",
			label: "Date de naissance conjoint",
			aliases: [
				"datenaissanceconjoint",
				"datenaissance_conjoint_client",
				"spousebirthdate",
				"naissance conjoint"
			],
			sample: "1960-03-12",
			transform: parseDateLoose
		},
		{
			key: "billingStatus",
			label: "Statut facturation",
			aliases: [
				"statutfacturation",
				"statut facturation",
				"billing",
				"facturation"
			],
			sample: "Pré-validé"
		},
		{
			key: "signatureDate",
			label: "Date signature (AAAA-MM-JJ)",
			aliases: [
				"datesignature",
				"date signature",
				"date de signature",
				"signaturedate",
				"signature"
			],
			sample: "2026-04-28",
			transform: parseDateLoose
		},
		{
			key: "effectiveDate",
			label: "Date d'effet",
			aliases: [
				"dateeffet",
				"date effet",
				"date d'effet",
				"effectivedate",
				"effet"
			],
			sample: "2026-05-01",
			transform: parseDateLoose
		},
		{
			key: "validationDate",
			label: "Date validation",
			aliases: [
				"datevalidation",
				"date validation",
				"validationdate"
			],
			transform: parseDateLoose
		},
		{
			key: "source",
			label: "Source",
			aliases: [
				"source",
				"origine",
				"provenance",
				"sourceprospect",
				"source_prospect",
				"source prospect"
			],
			sample: "Web"
		},
		{
			key: "assignedTo",
			label: "Assigné à (username)",
			aliases: [
				"assigne",
				"assigné",
				"assignea",
				"assigné à",
				"assigne a",
				"assignedto",
				"assigned to",
				"agent",
				"commercial",
				"owner"
			],
			sample: "REDISSI.SONIA"
		},
		{
			key: "commercialComment",
			label: "Commentaire commercial",
			aliases: [
				"commentaire",
				"comment",
				"notes",
				"commentaires_commercial_client",
				"commentaires commercial",
				"commentaire commercial"
			]
		}
	];
}
var USER_IMPORT_FIELDS = [
	{
		key: "username",
		label: "Nom d'utilisateur",
		required: true,
		sample: "marie.dupont"
	},
	{
		key: "fullName",
		label: "Nom complet",
		required: true,
		sample: "Marie Dupont"
	},
	{
		key: "email",
		label: "Email",
		sample: "marie@protection.fr"
	},
	{
		key: "role",
		label: "Rôle (Administrateur/Manager/Agent/Backoffice)",
		sample: "Agent"
	},
	{
		key: "team",
		label: "Équipe",
		sample: "Lead-Actifs"
	},
	{
		key: "active",
		label: "Actif (true/false)",
		sample: "true"
	}
];
export { buildContractImportFields as i, PROSPECT_IMPORT_FIELDS as n, USER_IMPORT_FIELDS as r, ImportFlow as t };
