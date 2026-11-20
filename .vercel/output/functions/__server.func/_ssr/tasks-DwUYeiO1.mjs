import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as DatePicker } from "./date-picker-BVRMSMeD.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { M as useConfirm, O as Textarea } from "./router-Dkp91uPV.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { O as SquareCheckBig, Q as Plus, b as Trash2, q as RefreshCw } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/tasks-DwUYeiO1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PRIO_BADGE = {
	low: "bg-muted text-muted-foreground",
	normal: "bg-info/15 text-info",
	high: "bg-destructive/15 text-destructive"
};
function TasksPage() {
	const auth = useAuth();
	const { users } = useErp();
	const confirmDialog = useConfirm();
	const [tasks, setTasks] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [desc, setDesc] = (0, import_react.useState)("");
	const [assignee, setAssignee] = (0, import_react.useState)(auth.user?.username ?? "");
	const [due, setDue] = (0, import_react.useState)("");
	const [priority, setPriority] = (0, import_react.useState)("normal");
	const load = async () => {
		setLoading(true);
		try {
			const r = await api("/tasks.php");
			setTasks(r.tasks);
		} catch (e) {
			toast.error("Erreur", { description: e?.message });
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const create = async () => {
		if (!title.trim()) {
			toast.error("Titre requis");
			return;
		}
		try {
			await api("/tasks.php", {
				method: "POST",
				body: {
					title: title.trim(),
					description: desc.trim() || null,
					assignedTo: assignee || auth.user?.username,
					dueDate: due || null,
					priority
				}
			});
			toast.success("Tâche créée");
			setTitle("");
			setDesc("");
			setDue("");
			await load();
		} catch (e) {
			toast.error(e?.message);
		}
	};
	const setStatus = async (id, status) => {
		try {
			await api("/tasks.php", {
				method: "PATCH",
				body: {
					id,
					status
				}
			});
			await load();
		} catch (e) {
			toast.error(e?.message);
		}
	};
	const remove = async (id) => {
		if (!await confirmDialog({
			title: "Supprimer la tâche",
			description: "Voulez-vous supprimer cette tâche ?",
			destructive: true
		})) return;
		try {
			await api(`/tasks.php?id=${id}`, { method: "DELETE" });
			await load();
		} catch (e) {
			toast.error(e?.message);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "table",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Tâches",
				description: "Suivi des tâches: échéances, priorités et assignations.",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "h-5 w-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4 mt-6 shadow-elegant",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold text-sm mb-3",
						children: "Nouvelle tâche"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Titre" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: title,
									onChange: (e) => setTitle(e.target.value),
									placeholder: "ex: Rappeler M. Dupont"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assigné à" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: assignee,
									onValueChange: setAssignee,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: users.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: u.username,
										children: [
											u.fullName,
											" (",
											u.username,
											")"
										]
									}, u.username)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Échéance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
									value: due,
									onChange: setDue,
									placeholder: "Choisir une échéance"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Priorité" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: priority,
									onValueChange: (v) => setPriority(v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "low",
											children: "Basse"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "normal",
											children: "Normale"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "high",
											children: "Haute"
										})
									] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "md:col-span-2 space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: desc,
									onChange: (e) => setDesc(e.target.value),
									rows: 2
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: create,
							className: "bg-primary text-primary-foreground hover:bg-primary/90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1.5" }), "Créer"]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6 shadow-elegant",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-3 border-b flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-semibold text-sm",
						children: [tasks.length, " tâche(s)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: load,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "divide-y divide-border",
					children: [tasks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 py-3 flex items-center gap-3 hover:bg-muted/20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 flex-wrap",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `font-medium text-sm ${t.status === "done" ? "line-through text-muted-foreground" : ""}`,
											children: t.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: PRIO_BADGE[t.priority],
											variant: "secondary",
											children: t.priority
										}),
										t.dueDate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: ["échéance: ", t.dueDate]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground truncate",
									children: [
										t.assignedTo,
										" · créé par ",
										t.createdBy,
										" ",
										t.description ? `· ${t.description}` : ""
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: t.status,
								onValueChange: (v) => setStatus(t.id, v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "w-[140px] h-8",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "todo",
										children: "À faire"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "in_progress",
										children: "En cours"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "done",
										children: "Terminée"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "cancelled",
										children: "Annulée"
									})
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: () => remove(t.id),
								className: "text-destructive hover:bg-destructive/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})
						]
					}, t.id)), tasks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-4 py-10 text-center text-sm text-muted-foreground",
						children: "Aucune tâche pour le moment"
					})]
				})]
			})
		]
	});
}
export { TasksPage as component };
