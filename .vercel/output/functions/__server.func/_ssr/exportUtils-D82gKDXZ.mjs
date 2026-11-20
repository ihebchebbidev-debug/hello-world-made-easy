import { o as formatDate } from "./input-IbC7Hkfd.mjs";
// node_modules/.nitro/vite/services/ssr/assets/exportUtils-D82gKDXZ.js
function downloadBlob(filename, content, mime) {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
function escapeCsv(v) {
	if (v === null || v === void 0) return "";
	const s = String(v);
	if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, "\"\"")}"`;
	return s;
}
function toCSV(rows, columns) {
	if (rows.length === 0) return "";
	const cols = columns ?? Object.keys(rows[0]);
	return `${cols.map(escapeCsv).join(",")}\n${rows.map((r) => cols.map((c) => escapeCsv(r[c])).join(",")).join("\n")}`;
}
function exportCSV(filename, rows, columns) {
	downloadBlob(filename, toCSV(rows, columns), "text/csv;charset=utf-8");
}
function exportJSON(filename, data) {
	downloadBlob(filename, JSON.stringify(data, null, 2), "application/json");
}
function printPage() {
	if (typeof window !== "undefined") window.print();
}
async function exportXLSX(filename, rows, sheetName = "Données") {
	const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
	const ws = XLSX.utils.json_to_sheet(rows);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
	XLSX.writeFile(wb, filename);
}
function withCustomFields(rows, defs, valuesById, idField = "id") {
	if (defs.length === 0) return rows.map((r) => ({ ...r }));
	const baseKeys = new Set(rows[0] ? Object.keys(rows[0]) : []);
	const colName = /* @__PURE__ */ new Map();
	for (const d of defs) {
		const safe = baseKeys.has(d.label) || [...colName.values()].includes(d.label) ? `cf_${d.key}` : d.label;
		colName.set(d.key, safe);
	}
	return rows.map((r) => {
		const vals = valuesById[String(r[idField] ?? "")] ?? {};
		const out = { ...r };
		for (const d of defs) out[colName.get(d.key)] = vals[d.key] ?? "";
		return out;
	});
}
var outcomeFr = {
	won: "Gagné",
	lost: "Perdu",
	pending: "En cours"
};
var checkFr = {
	valid: "Validé",
	invalid: "Invalide",
	pending: "En attente"
};
var HIDDEN_KEYS = /* @__PURE__ */ new Set([
	"id",
	"prospectId",
	"contractId",
	"userId",
	"user_id",
	"createdById",
	"updatedById",
	"agentId",
	"ownerId",
	"customValues",
	"extra",
	"raw",
	"_raw"
]);
var PROSPECT_MAP = [
	["civility", "Civilité"],
	["lastName", "Nom"],
	["firstName", "Prénom"],
	["age", "Âge"],
	[
		"birthDate",
		"Date de naissance",
		(v) => formatDate(v) ?? ""
	],
	["spouseAge", "Âge conjoint"],
	[
		"spouseBirthDate",
		"Date de naissance conjoint",
		(v) => formatDate(v) ?? ""
	],
	["regime", "Régime"],
	["childrenCount", "Nombre d'enfants"],
	["childrenAges", "Âges des enfants"],
	["phone", "Téléphone fixe"],
	["mobile", "Mobile"],
	["email", "Email"],
	["postalCode", "Code postal"],
	["city", "Ville"],
	["source", "Source"],
	["status", "Statut"],
	[
		"outcome",
		"Résultat",
		(v) => outcomeFr[String(v)] ?? v ?? ""
	],
	["lostReason", "Motif de perte"],
	[
		"checkValeur",
		"Check valeur",
		(v) => checkFr[String(v)] ?? v ?? ""
	],
	["currentMutuelle", "Mutuelle actuelle"],
	["cotisation", "Cotisation actuelle"],
	["demande", "Demande"],
	["assignedTo", "Assigné à"],
	[
		"createdAt",
		"Date d'ajout",
		(v) => formatDate(v) ?? ""
	],
	["comment", "Commentaire"]
];
var CONTRACT_MAP = [
	["civility", "Civilité"],
	["lastName", "Nom"],
	["firstName", "Prénom"],
	[
		"birthDate",
		"Date de naissance",
		(v) => formatDate(v) ?? ""
	],
	["phone", "Téléphone fixe"],
	["mobile", "Mobile"],
	["email", "Email"],
	["address", "Adresse"],
	["postalCode", "Code postal"],
	["city", "Ville"],
	["partner", "Partenaire"],
	["cabinet", "Cabinet"],
	["product", "Produit"],
	["productOptions", "Options produit"],
	["complementaryProduct", "Produit complémentaire"],
	["complementaryPremium", "Cotisation complémentaire"],
	[
		"complementaryEffectiveDate",
		"Date d'effet complémentaire",
		(v) => formatDate(v) ?? ""
	],
	["premium", "Cotisation annuelle"],
	["previousPremium", "Cotisation précédente"],
	[
		"signatureDate",
		"Date de signature",
		(v) => formatDate(v) ?? ""
	],
	[
		"effectiveDate",
		"Date d'effet",
		(v) => formatDate(v) ?? ""
	],
	[
		"validationDate",
		"Date de validation",
		(v) => formatDate(v) ?? ""
	],
	[
		"currentExpiryDate",
		"Date d'échéance",
		(v) => formatDate(v) ?? ""
	],
	["billingStatus", "Statut facturation"],
	["currentMutuelle", "Mutuelle actuelle"],
	["ssn", "N° Sécurité sociale"],
	["adhesionNumber", "N° d'adhésion"],
	["principalMember", "Adhérent principal"],
	["spouseCivility", "Civilité conjoint"],
	["spouseLastName", "Nom conjoint"],
	["spouseFirstName", "Prénom conjoint"],
	[
		"spouseBirthDate",
		"Date de naissance conjoint",
		(v) => formatDate(v) ?? ""
	],
	["bankHolderLastName", "Nom titulaire bancaire"],
	["bankHolderFirstName", "Prénom titulaire bancaire"],
	["iban", "IBAN"],
	["bic", "BIC"],
	[
		"debitDate",
		"Date de prélèvement",
		(v) => formatDate(v) ?? ""
	],
	["debitType", "Type de prélèvement"],
	["terminationType", "Type de résiliation"],
	["regime", "Régime"],
	["childrenCount", "Nombre d'enfants"],
	["childrenAges", "Âges des enfants"],
	["source", "Source"],
	["assignedTo", "Assigné à"],
	["commercialComment", "Commentaire commercial"]
];
function applyMap(row, map) {
	const out = {};
	const seen = /* @__PURE__ */ new Set();
	for (const [key, label, fn] of map) {
		seen.add(key);
		const raw = row[key];
		out[label] = (fn ? fn(raw, row) : raw) ?? "";
	}
	for (const k of Object.keys(row)) {
		if (seen.has(k) || HIDDEN_KEYS.has(k)) continue;
		out[k] = row[k];
	}
	return out;
}
function toProspectExportRows(rows) {
	return rows.map((r) => applyMap(r, PROSPECT_MAP));
}
function toContractExportRows(rows) {
	return rows.map((r) => applyMap(r, CONTRACT_MAP));
}
async function parseSpreadsheet(file) {
	const ext = file.name.split(".").pop()?.toLowerCase();
	const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
	if (ext === "csv" || ext === "tsv" || ext === "txt") {
		const buf = await file.arrayBuffer();
		let text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
		if (text.includes("�")) try {
			text = new TextDecoder("windows-1252").decode(buf);
		} catch {
			text = new TextDecoder("iso-8859-1").decode(buf);
		}
		if (text.charCodeAt(0) === 65279) text = text.slice(1);
		const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";
		const counts = {
			",": 0,
			";": 0,
			"	": 0,
			"|": 0
		};
		let inQ = false;
		for (const ch of firstLine) if (ch === "\"") inQ = !inQ;
		else if (!inQ && ch in counts) counts[ch]++;
		const sep = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] || ",";
		const wb = XLSX.read(text, {
			type: "string",
			raw: false,
			FS: sep
		});
		const ws = wb.Sheets[wb.SheetNames[0]];
		if (!ws) return [];
		return unmergeSingleColumnSeparated(XLSX.utils.sheet_to_json(ws, { defval: "" }));
	}
	const buf = await file.arrayBuffer();
	const head = new Uint8Array(buf.slice(0, 4));
	const isOle = head[0] === 208 && head[1] === 207 && head[2] === 17 && head[3] === 224;
	const isZip = head[0] === 80 && head[1] === 75;
	if (!isOle && !isZip) {
		let text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
		if (text.includes("�")) try {
			text = new TextDecoder("windows-1252").decode(buf);
		} catch {
			text = new TextDecoder("iso-8859-1").decode(buf);
		}
		if (text.charCodeAt(0) === 65279) text = text.slice(1);
		const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";
		const counts = {
			",": 0,
			";": 0,
			"	": 0,
			"|": 0
		};
		let inQ = false;
		for (const ch of firstLine) if (ch === "\"") inQ = !inQ;
		else if (!inQ && ch in counts) counts[ch]++;
		const sep = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] || ",";
		const wb2 = XLSX.read(text, {
			type: "string",
			raw: false,
			FS: sep
		});
		const ws2 = wb2.Sheets[wb2.SheetNames[0]];
		if (!ws2) return [];
		return unmergeSingleColumnSeparated(XLSX.utils.sheet_to_json(ws2, { defval: "" }));
	}
	const wb = XLSX.read(buf, {
		type: "array",
		raw: false
	});
	const ws = wb.Sheets[wb.SheetNames[0]];
	if (!ws) return [];
	return unmergeSingleColumnSeparated(XLSX.utils.sheet_to_json(ws, { defval: "" }));
}
/**
* Some Excel exports stuff a full ;-separated row into a single cell (often
* happens when a CSV is "saved as .xlsx" without re-parsing the delimiter).
* Detect that case and explode the single column back into proper columns.
* Also stitches "continuation rows" (a wrapped long comment that produced an
* extra cell-only row) back onto the last column of the previous record.
*/
function unmergeSingleColumnSeparated(rows) {
	if (rows.length === 0) return rows;
	const allKeys = /* @__PURE__ */ new Set();
	for (const r of rows.slice(0, 20)) for (const k of Object.keys(r)) allKeys.add(k);
	const cols = Array.from(allKeys);
	const candidate = cols.find((c) => /[;|\t]/.test(c) && c.split(/[;|\t]/).length >= 3);
	if (!candidate) return rows;
	const headerKey = candidate;
	const extraKeys = cols.filter((c) => c !== headerKey && /^__EMPTY/.test(c));
	if (cols.filter((c) => c !== headerKey && !/^__EMPTY/.test(c)).length > 0) return rows;
	const seps = [
		";",
		"	",
		"|"
	];
	let bestSep = ";";
	let bestCount = 0;
	for (const s of seps) {
		const n = headerKey.split(s).length;
		if (n > bestCount) {
			bestCount = n;
			bestSep = s;
		}
	}
	if (bestCount < 3) return rows;
	const headerParts = headerKey.split(bestSep).map((s) => s.trim());
	const expected = headerParts.length;
	const minFields = Math.max(3, Math.ceil(expected / 2));
	const out = [];
	for (const r of rows) {
		const raw = r[headerKey];
		const cell = raw == null ? "" : String(raw);
		const continuations = [];
		for (const k of extraKeys) {
			const v = r[k];
			if (v == null) continue;
			const s = String(v).trim();
			if (s) continuations.push(s);
		}
		if (!cell.trim()) {
			if (continuations.length && out.length > 0) {
				const last = out[out.length - 1];
				const lastKey = headerParts[headerParts.length - 1];
				const prev = last[lastKey] == null ? "" : String(last[lastKey]);
				last[lastKey] = (prev ? prev + " " : "") + continuations.join(" ");
			}
			continue;
		}
		const parts = cell.split(bestSep);
		if (parts.length < minFields) {
			if (out.length > 0) {
				const last = out[out.length - 1];
				const lastKey = headerParts[headerParts.length - 1];
				const prev = last[lastKey] == null ? "" : String(last[lastKey]);
				last[lastKey] = (prev ? prev + " " : "") + [cell.trim(), ...continuations].join(" ");
			}
			continue;
		}
		const obj = {};
		for (let i = 0; i < expected; i++) {
			const key = headerParts[i] || `col_${i + 1}`;
			obj[key] = (parts[i] ?? "").trim();
		}
		if (continuations.length) {
			const lastKey = headerParts[headerParts.length - 1];
			const prev = obj[lastKey] == null ? "" : String(obj[lastKey]);
			obj[lastKey] = (prev ? prev + " " : "") + continuations.join(" ");
		}
		out.push(obj);
	}
	return out;
}
export { printPage as a, withCustomFields as c, parseSpreadsheet as i, exportJSON as n, toContractExportRows as o, exportXLSX as r, toProspectExportRows as s, exportCSV as t };
