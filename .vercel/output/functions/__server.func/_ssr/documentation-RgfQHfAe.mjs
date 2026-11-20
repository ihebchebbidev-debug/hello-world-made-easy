import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { a as cn, c as useAuth, r as Input } from "./input-IbC7Hkfd.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-Cb1NE_Xq.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Navigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Trigger2, i as Root2, n as Header, r as Item, t as Content2, v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { C as Target, Cn as ChevronDown, En as ChartColumn, Et as KeyRound, Fn as BookOpen, I as ShieldCheck, Kt as FileQuestionMark, Ln as Bell, Lt as Globe, M as Shuffle, Mn as Bug, O as SquareCheckBig, R as Settings, Rt as GitMerge, Tt as Layers, Un as ArrowRight, V as Search, W as Rocket, Wt as FileText, Yt as FileCog, a as Users, an as Database, gt as Lock, i as Workflow, in as Download, k as Sparkles, kn as CalendarDays, p as Upload, r as Wrench, s as User, t as Zap, tn as ExternalLink, un as ClipboardList, wt as LayoutDashboard } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/documentation-RgfQHfAe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Accordion = Root2;
var AccordionItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
	ref,
	className: cn("border-b", className),
	...props
}));
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
	className: "flex",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger2, {
		ref,
		className: cn("flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })]
	})
}));
AccordionTrigger.displayName = Trigger2.displayName;
var AccordionContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("pb-4 pt-0", className),
		children
	})
}));
AccordionContent.displayName = Content2.displayName;
var SCREENSHOTS = {
	"/": "/assets/01-dashboard-CpNWUgWH.png",
	"/prospects": "/assets/02-prospects-D2b37mao.png",
	"/contracts": "/assets/03-contracts-Cy3fG4GZ.png",
	"/calendar": "/assets/04-calendar-CrNjY4--.png",
	"/tasks": "/assets/05-tasks-Ioy73OO3.png",
	"/notifications": "/assets/06-notifications-DHLjRdPT.png",
	"/stages": "/assets/07-stages-BlAc9ZVG.png",
	"/objectives": "/assets/08-objectives-RCee7F86.png",
	"/reports": "/assets/09-reports-BEXjM-us.png",
	"/reconciliation": "/assets/10-reconciliation-D6BTqSxm.png",
	"/dispatch": "/assets/11-dispatch-Do2QNgRl.png",
	"/users": "/assets/12-users-DSAwuYlm.png",
	"/roles": "/assets/13-roles-Cul0JPs6.png",
	"/backoffice": "/assets/14-backoffice-SoxGM4JT.png",
	"/configuration": "/assets/15-configuration-CRFTnfpE.png",
	"/profile": "/assets/16-profile-B2bOmoT3.png"
};
var SECTIONS = [
	{
		path: "/",
		title: "Tableau de bord",
		icon: LayoutDashboard,
		roles: "Tous",
		description: "Vue synthétique de l'activité commerciale : KPIs, tendances et accès rapides aux modules opérationnels.",
		features: [
			"5 KPIs en temps réel : leads traités, gagnés, perdus, taux de conversion, revenu signé",
			"Sparklines (7/30/60 jours) sur leads, won, lost et conversion",
			"Comparaison à la période précédente (delta % et flèche directionnelle)",
			"Cartes raccourcis vers prospects en attente, contrats à valider, calendrier du jour",
			"Données rafraîchies à chaque visite + cache court côté client",
			"Adapté aux Agents (vue scoped sur leurs propres leads) et aux Managers (vue globale)"
		],
		workflows: [{
			title: "Lecture quotidienne d'un agent",
			steps: [
				"À l'ouverture du tableau de bord, l'agent voit ses chiffres du jour",
				"Les sparklines indiquent la tendance vs semaine précédente",
				"Un clic sur le KPI 'Leads en attente' ouvre la liste filtrée"
			]
		}],
		apis: ["GET /dashboard.php", "GET /dashboard.php?series=leads&days=7"]
	},
	{
		path: "/prospects",
		title: "Prospects (Leads)",
		icon: ClipboardList,
		roles: "Tous (vue scoped pour Agent)",
		description: "Gestion complète du cycle de vie d'un lead : création, qualification, attribution, suivi et conversion en contrat.",
		features: [
			"Création via dialog avec champs standards + champs personnalisés",
			"Recherche full-text (nom, prénom, téléphone, email, ville)",
			"Filtres : statut, agent assigné, source, check valeur, plage de dates",
			"Vues sauvegardées par utilisateur (filtres + tri + colonnes)",
			"Colonnes personnalisées (toggle via picker) issues des champs admin",
			"Filtres sur valeurs de champs personnalisés",
			"Tri colonnes ascendant/descendant",
			"Pagination 25 lignes / page",
			"Sélection multiple + actions en masse : réassignation, archivage statut",
			"Import CSV/Excel avec mapping intelligent + déduplication par id/téléphone/email",
			"Historique des imports (qui, quand, combien)",
			"Export CSV/JSON enrichi : chaque champ personnalisé devient une colonne (label)",
			"Page détail : édition complète, claim, mark won/lost, journal, pièces jointes (≤20 Mo)",
			"Convertir un prospect 'gagné' crée automatiquement un contrat lié + notification à l'agent"
		],
		workflows: [{
			title: "Convertir un lead gagné",
			steps: [
				"Ouvrir la fiche prospect",
				"Cliquer 'Marquer gagné' et saisir la cotisation + le partenaire",
				"Le backend crée transactionnellement le contrat + l'entrée d'activité + la notification",
				"Le contrat apparaît immédiatement dans Contrats avec assignedTo identique"
			]
		}, {
			title: "Réassignation en masse (Manager)",
			steps: [
				"Filtrer les prospects à réattribuer",
				"Cocher la sélection (case d'en-tête sélectionne la page)",
				"Choisir le nouvel agent dans le dropdown 'Réassigner à…'",
				"Confirmation toast + rafraîchissement automatique"
			]
		}],
		apis: [
			"GET /prospects.php (liste, scope agent)",
			"POST /prospects.php (création + customValues)",
			"PATCH /prospects.php?id=… (édition)",
			"POST /prospects.php?action=claim (atomique)",
			"POST /prospects.php?action=mark_won (transactionnel)",
			"POST /prospects.php?action=bulk (op: assign|status)",
			"DELETE /prospects.php?id=…"
		],
		tips: ["L'agent ne voit et n'édite que ses propres prospects (filtre SQL backend)", "Le claim est atomique : un même lead ne peut être pris deux fois"]
	},
	{
		path: "/contracts",
		title: "Contrats",
		icon: FileText,
		roles: "Tous (vue scoped pour Agent)",
		description: "Gestion des contrats signés : suivi de la facturation, validation backoffice, journal d'activité et pièces jointes.",
		features: [
			"Création via dialog (avec champs personnalisés)",
			"Filtres riches : date signature/effet/validation, partenaire, cabinet, source, statut facturation",
			"4 statuts facturation : Validé Confirmation, En attente, Annuler, Pré-validé",
			"Vues sauvegardées + colonnes personnalisées + filtres CF",
			"Sélection + actions en masse : changement de statut facturation",
			"Calcul automatique CA filtré (badge dans le header)",
			"Import CSV/Excel + export CSV/Excel/JSON avec champs personnalisés",
			"Page détail : édition, journal d'activité (changements de statut/cotisation), pièces jointes",
			"Date de validation auto-renseignée quand le statut passe à 'Validé Confirmation'",
			"Notification automatique à l'agent assigné lors d'une modification"
		],
		workflows: [{
			title: "Validation backoffice",
			steps: [
				"Backoffice ouvre le contrat depuis la page /backoffice ou /contracts",
				"Modifie le statut → 'Validé Confirmation'",
				"validation_date est automatiquement positionnée à NOW()",
				"Une entrée d'activité est ajoutée et l'agent est notifié"
			]
		}],
		apis: [
			"GET /contracts.php (liste, scope agent)",
			"POST /contracts.php (création + customValues)",
			"PATCH /contracts.php?id=… (édition + journal)",
			"POST /contracts.php?action=bulk",
			"DELETE /contracts.php?id=…"
		]
	},
	{
		path: "/calendar",
		title: "Calendrier",
		icon: CalendarDays,
		roles: "Tous",
		description: "Planning des rendez-vous, rappels et signatures avec gestion CRUD des événements.",
		features: [
			"3 types : RDV client, rappel, signature",
			"Création/édition via dialog",
			"Vue mensuelle + liste",
			"Lié à un agent (visibilité scoped)",
			"Champs requis validés côté serveur (titre, date, heure, type)"
		],
		apis: ["GET/POST/PUT/DELETE /calendar.php"]
	},
	{
		path: "/tasks",
		title: "Tâches",
		icon: SquareCheckBig,
		roles: "Tous",
		description: "To-do list personnelle avec priorités, échéances et marquage 'fait' horodaté.",
		features: [
			"Création de tâches assignées à soi ou à un autre utilisateur",
			"Priorités : basse, normale, haute, urgente",
			"Marquage 'fait' → completed_at automatique",
			"Tri par priorité puis date"
		],
		apis: ["GET/POST/PATCH/DELETE /tasks.php"]
	},
	{
		path: "/notifications",
		title: "Notifications",
		icon: Bell,
		roles: "Tous",
		description: "Centre des notifications : nouveaux leads, contrats validés, mentions, etc.",
		features: [
			"Liste read/unread avec badge compteur dans le header",
			"Polling automatique toutes les ~30 s",
			"Marquer lu / tout marquer lu",
			"Création cross-user restreinte aux Admin/Manager"
		],
		apis: [
			"GET /notifications.php",
			"POST /notifications.php",
			"PATCH /notifications.php?id=…"
		]
	},
	{
		path: "/stages",
		title: "Étapes pipeline",
		icon: Layers,
		roles: "Admin / Manager",
		description: "Configuration des étapes du pipeline commercial appliquées aux prospects.",
		features: [
			"CRUD des étapes",
			"Ordonnancement par drag/handle",
			"Application immédiate aux dialogs prospects"
		],
		apis: ["GET/POST/PUT/DELETE /stages.php"]
	},
	{
		path: "/objectives",
		title: "Objectifs",
		icon: Target,
		roles: "Tous",
		description: "Définition et suivi des objectifs commerciaux par agent et par période.",
		features: [
			"Objectifs mensuels et trimestriels",
			"Progression visuelle (barre + %) vs réalisé",
			"Vue agent et vue équipe"
		]
	},
	{
		path: "/reports",
		title: "Rapports & analytique",
		icon: ChartColumn,
		roles: "Tous",
		description: "Performance par agent, entonnoir de conversion, revenus mensuels, comparaison période et exports complets.",
		features: [
			"KPIs par agent : leads traités, gagnés, perdus, contrats, revenu, conversion",
			"Entonnoir de conversion (pending → won/lost)",
			"Revenus mensuels (12 derniers mois)",
			"Performance par source",
			"6 plages préconfigurées (today, 7j, 30j, MTD, YTD, mois précédent) + plage custom",
			"Comparaison à la période précédente (toggle)",
			"Export CSV agents (généré côté backend)",
			"Export Excel multi-onglets (Agents, Mensuel, Sources, Entonnoir, + comparaison)",
			"Export CSV prospects (avec champs personnalisés)",
			"Export Excel prospects (avec champs personnalisés)",
			"Export CSV contrats (avec champs personnalisés)",
			"Export Excel contrats (avec champs personnalisés)"
		],
		apis: ["GET /reports.php?from=&to=", "GET /reports.php?format=csv&from=&to="]
	},
	{
		path: "/reconciliation",
		title: "Réconciliation",
		icon: GitMerge,
		roles: "Backoffice / Admin",
		description: "Rapprochement entre prospects gagnés et contrats créés pour détecter les écarts.",
		features: [
			"Écarts : prospects 'won' sans contrat, contrats sans prospect source",
			"Validation manuelle ligne à ligne",
			"Export des anomalies"
		]
	},
	{
		path: "/dispatch",
		title: "Dispatch",
		icon: Shuffle,
		roles: "Admin / Manager",
		description: "Distribution des leads non assignés aux agents disponibles, en manuel ou en lot.",
		features: [
			"Vue charge de travail par agent (leads en cours)",
			"Attribution unitaire ou en masse",
			"Filtres source / date pour cibler les bons leads"
		]
	},
	{
		path: "/users",
		title: "Utilisateurs",
		icon: Users,
		roles: "Administrateur",
		description: "Gestion complète des comptes : création, édition, désactivation et stats par agent.",
		features: [
			"Création via dialog (rôle, équipe, mot de passe, champs personnalisés)",
			"Mot de passe hashé bcrypt côté backend, jamais retourné par l'API",
			"KPIs par agent affichés dans la liste (leads traités, contrats, conversion)",
			"Édition profil, rôle, équipe, statut actif/inactif, mot de passe",
			"Désactivation (soft) ou suppression (cascade contrôlée)",
			"Page détail dédiée par utilisateur (/users/$username)"
		],
		apis: [
			"GET /users.php (avec stats)",
			"POST /users.php",
			"PATCH /users.php?id=…",
			"DELETE /users.php?id=…"
		]
	},
	{
		path: "/roles",
		title: "Rôles & permissions",
		icon: ShieldCheck,
		roles: "Administrateur",
		description: "Configuration de la matrice rôles × permissions appliquée côté frontend ET côté backend.",
		features: [
			"Matrice à cocher (rôle × module)",
			"Modules : dashboard, prospect, contract, calendar, dispatch, users, role, backoffice",
			"Application immédiate (Frontend cache la nav, Backend rejette via require_role)",
			"4 rôles par défaut : Administrateur, Manager, Agent, Backoffice",
			"Mise à jour transactionnelle (DELETE + INSERT en une transaction)"
		],
		apis: ["GET /roles.php", "PUT /roles.php"]
	},
	{
		path: "/backoffice",
		title: "Backoffice",
		icon: Wrench,
		roles: "Backoffice / Admin",
		description: "Espace dédié à la validation des contrats et au suivi opérationnel de la facturation.",
		features: [
			"File de contrats à valider",
			"Changement de statut + date validation auto",
			"Filtres par partenaire, cabinet, période"
		]
	},
	{
		path: "/configuration",
		title: "Configuration",
		icon: Settings,
		roles: "Administrateur",
		description: "Paramètres globaux de l'application + administration des champs personnalisés (prospect/contract/user).",
		features: [
			"Paramètres globaux : devise, format date, etc.",
			"Création/édition/suppression des champs personnalisés",
			"6 types : texte, textarea, nombre, date, booléen, select (avec options)",
			"Drapeau 'requis' validé dans les dialogs de création",
			"Position (ordre d'affichage)",
			"Suppression cascade : supprime aussi toutes les valeurs stockées (transactionnel)",
			"Application immédiate dans : NewProspectDialog, NewContractDialog, NewUserDialog, pages détail, listes (colonnes/filtres), exports"
		],
		apis: ["GET/POST/PUT/DELETE /custom_fields.php", "GET/POST/DELETE /custom_field_values.php"]
	},
	{
		path: "/profile",
		title: "Profil",
		icon: User,
		roles: "Tous",
		description: "Profil personnel : informations, changement de mot de passe.",
		features: [
			"Édition email, équipe (selon droits)",
			"Changement de mot de passe (re-vérification de l'ancien)",
			"Affichage du rôle et des permissions actives"
		],
		apis: ["GET /auth_me.php", "POST /auth_change_password.php"]
	}
];
var TRANSVERSAL = [
	{
		title: "Champs personnalisés (dynamic fields)",
		icon: Sparkles,
		body: "Configurez librement des champs métier (texte, nombre, date, booléen, select…) sur 3 entités : prospect, contract, user. Définition côté Configuration → propagation immédiate dans les dialogs de création (avec validation requis), les pages détail (CustomFieldsCard), les listes (colonnes optionnelles via picker + filtres dédiés) et tous les exports CSV/Excel/JSON (colonne nommée par le label du champ)."
	},
	{
		title: "Onboarding interactif (Joyride)",
		icon: BookOpen,
		body: "Tour guidé en 24 étapes filtrées par rôle, couvrant l'intégralité des routes. Démarre automatiquement au premier login et est relançable à tout moment via le bouton d'aide du header. La progression est sauvegardée par utilisateur et par rôle."
	},
	{
		title: "Imports CSV / Excel",
		icon: Upload,
		body: "Module d'import disponible sur Prospects et Contrats avec : sélection du fichier, mapping intelligent des colonnes, prévisualisation, validation des champs requis, déduplication par id/téléphone/email, et historique d'import."
	},
	{
		title: "Exports unifiés",
		icon: Download,
		body: "CSV, Excel et JSON disponibles sur Prospects, Contrats et Reports. Les champs personnalisés sont automatiquement injectés en colonnes (label du champ, fallback cf_<key> en cas de collision). Cohérent partout grâce au helper withCustomFields()."
	},
	{
		title: "Permissions & rôles (defense in depth)",
		icon: Lock,
		body: "Frontend : permissionForPath() masque les liens et bloque les routes interdites. Backend : chaque endpoint sensible appelle require_role(['Administrateur', …]). La matrice est éditable depuis /roles et appliquée immédiatement sans redéploiement."
	},
	{
		title: "Pièces jointes",
		icon: FileCog,
		body: "Upload multipart sécurisé (≤20 Mo) sur prospects, contrats et utilisateurs. Stockage hashé hors webroot, téléchargement signé via token, suppression journalisée dans l'activité."
	},
	{
		title: "Vues sauvegardées",
		icon: Workflow,
		body: "Sur Prospects et Contrats : sauvegarde par utilisateur des combinaisons filtres + tri + colonnes visibles. Réutilisables en un clic depuis le header de la liste."
	},
	{
		title: "Notifications & journal d'activité",
		icon: Zap,
		body: "Polling client toutes les ~30 s pour les notifications. Journal d'activité automatique sur les contrats (changement statut, cotisation, ajout/retrait pièce jointe) avec auteur et horodatage."
	}
];
var API_ENDPOINTS = [
	{
		path: "auth_login.php",
		method: "POST",
		desc: "Authentification username/email + mot de passe → JWT (Bearer)",
		auth: "Public"
	},
	{
		path: "auth_me.php",
		method: "GET",
		desc: "Profil utilisateur courant + permissions effectives",
		auth: "Auth"
	},
	{
		path: "auth_logout.php",
		method: "POST",
		desc: "Invalidation token côté client (stateless)",
		auth: "Auth"
	},
	{
		path: "auth_change_password.php",
		method: "POST",
		desc: "Changement mot de passe avec ré-authentification",
		auth: "Auth"
	},
	{
		path: "auth_signup.php",
		method: "POST",
		desc: "Création de compte interne (route cachée)",
		auth: "Public restreint"
	},
	{
		path: "prospects.php",
		method: "GET/POST/PATCH/DELETE",
		desc: "CRUD prospects + claim atomique + mark_won transactionnel + bulk + customValues",
		auth: "Auth (scope agent)"
	},
	{
		path: "contracts.php",
		method: "GET/POST/PATCH/DELETE",
		desc: "CRUD contrats + bulk + journal d'activité + notifications + customValues",
		auth: "Auth (scope agent)"
	},
	{
		path: "users.php",
		method: "GET/POST/PATCH/DELETE",
		desc: "CRUD utilisateurs + KPIs joints (leads, contrats, conversion)",
		auth: "Admin pour POST/DELETE"
	},
	{
		path: "roles.php",
		method: "GET/PUT",
		desc: "Matrice rôles × permissions, mise à jour transactionnelle",
		auth: "Admin"
	},
	{
		path: "stages.php",
		method: "GET/POST/PUT/DELETE",
		desc: "Étapes du pipeline commercial",
		auth: "Admin/Manager"
	},
	{
		path: "tasks.php",
		method: "GET/POST/PATCH/DELETE",
		desc: "Tâches utilisateurs avec horodatage completed_at auto",
		auth: "Auth"
	},
	{
		path: "calendar.php",
		method: "GET/POST/PUT/DELETE",
		desc: "Événements (RDV/rappel/signature) avec validation type",
		auth: "Auth"
	},
	{
		path: "notifications.php",
		method: "GET/POST/PATCH",
		desc: "Notifications scoped utilisateur, création cross-user restreinte",
		auth: "Auth"
	},
	{
		path: "attachments.php",
		method: "GET/POST/DELETE",
		desc: "Pièces jointes multipart (≤20 Mo), stockage hashé, download token",
		auth: "Auth"
	},
	{
		path: "activity.php",
		method: "GET",
		desc: "Journal d'activité (filtrable par entité)",
		auth: "Auth"
	},
	{
		path: "dashboard.php",
		method: "GET",
		desc: "KPIs + 6 séries (leads/won/lost/conversion/revenue), days clamp 1-60",
		auth: "Auth"
	},
	{
		path: "reports.php",
		method: "GET (json|csv)",
		desc: "KPIs agents + entonnoir + mensuel + sources, export CSV agents",
		auth: "Auth"
	},
	{
		path: "settings.php",
		method: "GET/PUT",
		desc: "Paramètres globaux clé/valeur (scope global ou user)",
		auth: "Auth"
	},
	{
		path: "custom_fields.php",
		method: "GET/POST/PUT/DELETE",
		desc: "Définitions champs personnalisés (entity/type/options/required/position)",
		auth: "Admin/Manager pour mutations"
	},
	{
		path: "custom_field_values.php",
		method: "GET/POST/DELETE",
		desc: "Valeurs CF, GET supporte ?all=1 (bulk par entité), upsert idempotent",
		auth: "Auth"
	},
	{
		path: "health.php",
		method: "GET",
		desc: "Healthcheck uptime + version",
		auth: "Public"
	}
];
var FAQ = [
	{
		q: "Comment ajouter un nouveau champ personnalisé ?",
		a: "Aller dans Configuration → onglet Champs personnalisés → Nouveau champ. Choisir l'entité (prospect/contract/user), le type, le libellé, marquer 'requis' si besoin et sauvegarder. Le champ apparaît immédiatement dans le dialog de création de l'entité, sur la page détail, en option de colonne dans les listes et dans tous les exports."
	},
	{
		q: "Comment relancer le tour guidé ?",
		a: "Cliquer sur le bouton d'aide (?) en haut à droite du header. Le tour redémarre depuis l'étape filtrée par votre rôle."
	},
	{
		q: "Pourquoi mon agent ne voit pas certains prospects ?",
		a: "Le scoping est appliqué côté SQL : un Agent ne voit que les prospects dont assigned_to = son username. Pour partager, réassigner via /dispatch ou la sélection en masse sur /prospects."
	},
	{
		q: "Que se passe-t-il quand je supprime un champ personnalisé ?",
		a: "La suppression est transactionnelle : la définition ET toutes les valeurs stockées pour ce champ sur toutes les entités sont supprimées. Action irréversible."
	},
	{
		q: "Les exports incluent-ils les champs personnalisés ?",
		a: "Oui. Les exports CSV/Excel/JSON sur Prospects, Contrats et Reports passent tous par withCustomFields() qui injecte une colonne par champ (label)."
	},
	{
		q: "Comment changer la devise affichée ?",
		a: "Configuration → Paramètres globaux → currency. Modification immédiatement reflétée dans tous les formatAmount() de l'app."
	}
];
var CHANGELOG = [
	{
		date: "2026-05",
		title: "Documentation admin",
		desc: "Page /documentation détaillant chaque module, workflow, endpoint API et FAQ."
	},
	{
		date: "2026-05",
		title: "Exports Excel Reports",
		desc: "Ajout des exports XLSX prospects/contrats avec champs personnalisés depuis la page Rapports."
	},
	{
		date: "2026-05",
		title: "Champs personnalisés end-to-end",
		desc: "Définitions, valeurs (single + bulk), dialogs, détails, colonnes, filtres et exports."
	},
	{
		date: "2026-05",
		title: "Onboarding 24 étapes",
		desc: "Tour Joyride couvrant toutes les routes, filtré par rôle, relançable."
	}
];
function DocumentationPage() {
	const { user } = useAuth();
	const [q, setQ] = (0, import_react.useState)("");
	if (!user) return null;
	if (user.role !== "Administrateur") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/",
		replace: true
	});
	const filtered = (0, import_react.useMemo)(() => {
		const t = q.trim().toLowerCase();
		if (!t) return SECTIONS;
		return SECTIONS.filter((s) => s.title.toLowerCase().includes(t) || s.description.toLowerCase().includes(t) || s.features.some((f) => f.toLowerCase().includes(t)) || (s.apis ?? []).some((a) => a.toLowerCase().includes(t)));
	}, [q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Documentation",
			description: "Référentiel complet de l'application : modules, fonctionnalités, workflows, endpoints API, sécurité et FAQ.",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-5 w-5" })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-4 mt-6 shadow-elegant",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Rechercher une page, une fonctionnalité, un endpoint…",
					value: q,
					onChange: (e) => setQ(e.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 text-xs text-muted-foreground",
				children: [filtered.length, " page(s) — accès réservé aux Administrateurs."]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "pages",
			className: "mt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "flex-wrap h-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "pages",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-3.5 w-3.5 mr-1.5" }),
								"Pages (",
								SECTIONS.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "features",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 mr-1.5" }), "Fonctionnalités transverses"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "api",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "h-3.5 w-3.5 mr-1.5" }),
								"API (",
								API_ENDPOINTS.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "security",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-3.5 w-3.5 mr-1.5" }), "Sécurité"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "faq",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileQuestionMark, { className: "h-3.5 w-3.5 mr-1.5" }), "FAQ"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "changelog",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "h-3.5 w-3.5 mr-1.5" }), "Changelog"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "pages",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 lg:grid-cols-2 gap-3",
						children: filtered.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4 hover:shadow-elegant hover:border-primary/40 transition-all",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: s.path,
										className: "flex items-center gap-3 group flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "h-5 w-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "font-semibold flex items-center gap-1.5",
												children: [s.title, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
												className: "text-[11px] text-muted-foreground",
												children: s.path
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "text-[10px] shrink-0",
										children: s.roles
									})]
								}),
								SCREENSHOTS[s.path] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: SCREENSHOTS[s.path],
									target: "_blank",
									rel: "noreferrer",
									className: "mt-3 block overflow-hidden rounded-md border bg-muted/30 hover:border-primary/40 transition",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: SCREENSHOTS[s.path],
										alt: `Aperçu — ${s.title}`,
										loading: "lazy",
										className: "w-full h-40 object-cover object-top"
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 h-40 rounded-md border border-dashed bg-gradient-to-br from-muted/50 to-muted/20 flex flex-col items-center justify-center text-center px-4",
									"aria-label": `Aperçu indisponible — ${s.title}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "h-5 w-5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-medium",
											children: s.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-muted-foreground mt-0.5",
											children: "Aperçu visuel à venir"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-muted-foreground",
									children: s.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Accordion, {
									type: "multiple",
									className: "mt-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
											value: "features",
											className: "border-none",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionTrigger, {
												className: "py-2 text-xs uppercase tracking-wider text-muted-foreground hover:no-underline",
												children: [
													"Fonctionnalités (",
													s.features.length,
													")"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "space-y-1 text-sm text-muted-foreground list-disc list-inside",
												children: s.features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: f }, f))
											}) })]
										}),
										s.workflows && s.workflows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
											value: "workflows",
											className: "border-none",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionTrigger, {
												className: "py-2 text-xs uppercase tracking-wider text-muted-foreground hover:no-underline",
												children: [
													"Workflows (",
													s.workflows.length,
													")"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "space-y-3",
												children: s.workflows.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-sm font-medium mb-1",
													children: w.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
													className: "space-y-1 text-sm text-muted-foreground list-decimal list-inside",
													children: w.steps.map((st, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: st }, i))
												})] }, w.title))
											}) })]
										}),
										s.apis && s.apis.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
											value: "apis",
											className: "border-none",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionTrigger, {
												className: "py-2 text-xs uppercase tracking-wider text-muted-foreground hover:no-underline",
												children: [
													"Endpoints API (",
													s.apis.length,
													")"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "space-y-1",
												children: s.apis.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
													className: "text-xs bg-muted px-1.5 py-0.5 rounded",
													children: a
												}) }, a))
											}) })]
										}),
										s.tips && s.tips.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
											value: "tips",
											className: "border-none",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, {
												className: "py-2 text-xs uppercase tracking-wider text-muted-foreground hover:no-underline",
												children: "Bonnes pratiques"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "space-y-1 text-sm text-muted-foreground list-disc list-inside",
												children: s.tips.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t }, t))
											}) })]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: s.path,
									className: "mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline",
									children: ["Ouvrir la page ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })]
								})
							]
						}, s.path))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "features",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-3",
						children: TRANSVERSAL.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: t.title
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground leading-relaxed",
								children: t.body
							})]
						}, t.title))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "api",
					className: "mt-4 space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold",
								children: "Conventions API"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "text-sm text-muted-foreground space-y-1 list-disc list-inside",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									"Toutes les requêtes répondent en JSON avec enveloppe ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "{ success, data?, message? }" }),
									"."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									"Authentification : ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "Authorization: Bearer <jwt>" }),
									" (et ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "X-Auth-Token" }),
									" en fallback)."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Erreurs 401 → le client purge le token et redirige vers /login automatiquement." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									"Préparation PDO partout, ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "EMULATE_PREPARES=false" }),
									", ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "display_errors=0" }),
									"."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "CORS reflète l'origine appelante et autorise les credentials." })
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-2",
										children: "Endpoint"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-2",
										children: "Méthodes"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-2",
										children: "Auth"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-2",
										children: "Description"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: API_ENDPOINTS.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t hover:bg-muted/20",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "text-xs",
											children: e.path
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "text-[10px]",
											children: e.method
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											className: "text-[10px]",
											children: e.auth
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2 text-muted-foreground",
										children: e.desc
									})
								]
							}, e.path)) })]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "security",
					className: "mt-4 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: "Authentification"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "text-sm text-muted-foreground space-y-1 list-disc list-inside",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"JWT signé HS256 (sub / username / role) émis par ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "auth_login.php" }),
										"."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"Token stocké côté client + injecté en ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "Authorization: Bearer" }),
										"."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"Mots de passe hashés bcrypt via ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "password_hash()" }),
										" ; jamais retournés."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Sur 401 le client purge le token et redirige vers /login." })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: "Autorisation (defense in depth)"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "text-sm text-muted-foreground space-y-1 list-disc list-inside",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"Frontend : ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "permissionForPath()" }),
										" filtre la nav et les pages protégées."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"Backend : chaque endpoint sensible appelle ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "require_role([…])" }),
										"."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"Matrice configurable depuis ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/roles",
											className: "text-primary underline",
											children: "Rôles & permissions"
										}),
										"."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Scoping SQL agent : un Agent ne voit que ses propres prospects/contrats." })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bug, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: "Hygiène & robustesse"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "text-sm text-muted-foreground space-y-1 list-disc list-inside",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"PDO préparé partout (",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "EMULATE_PREPARES=false" }),
										") → anti-injection."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Validation enum (civility, outcome, type événement, statut facturation…)." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Transactions sur les opérations critiques (mark_won, suppression CF, mise à jour matrice rôles)." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"Upsert idempotent ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "ON DUPLICATE KEY UPDATE" }),
										" pour les valeurs CF."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "display_errors=0" }), " en production, réponses JSON uniquement."] })
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "faq",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accordion, {
						type: "single",
						collapsible: true,
						className: "space-y-2",
						children: FAQ.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "px-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
								value: `f-${i}`,
								className: "border-none",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, {
									className: "hover:no-underline",
									children: f.q
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, {
									className: "text-sm text-muted-foreground",
									children: f.a
								})]
							})
						}, i))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "changelog",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: CHANGELOG.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4 flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "shrink-0",
								children: c.date
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold text-sm",
								children: c.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground",
								children: c.desc
							})] })]
						}, i))
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 mb-12 text-xs text-muted-foreground",
			children: "Documentation interne — Protection ERP. Mise à jour automatique au fil des évolutions."
		})
	] });
}
export { DocumentationPage as component };
