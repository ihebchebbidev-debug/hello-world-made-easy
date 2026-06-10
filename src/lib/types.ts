// Shared domain types for the Protection ERP frontend.
// Pure TypeScript — no runtime data, no seeds. This file is safe to import
// from anywhere without bloating the production bundle.

export type Outcome = "pending" | "won" | "lost";

export type Prospect = {
  id: string;
  civility: "M" | "Mme";
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  city: string;
  outcome: Outcome;
  lostReason?: string;
  comment?: string;
  checkValeur: "valid" | "invalid" | "pending";
  age?: number | null;
  birthDate?: string | null;
  currentMutuelle?: string | null;
  regime?: string | null;
  cotisation?: number | null;
  // Extra fields supported via import / API
  mobile?: string | null;
  address?: string | null;
  postalCode?: string | null;
  spouseAge?: number | null;
  spouseBirthDate?: string | null;
  childrenCount?: number | null;
  /** Comma-separated ages of the children, e.g. "5,8,12" */
  childrenAges?: string | null;
  demande?: string | null;
};

export type Contract = {
  id: string;
  /** Source prospect id when the contract was created from a "Vente" mark. */
  prospectId?: string | null;
  lastName: string;
  firstName: string;
  city: string;
  partner: string;
  cabinet: string;
  signatureDate: string;
  effectiveDate: string;
  validationDate: string | null;
  premium: number;
  billingStatus: string;
  source: string;
  assignedTo: string;
  // ---- Extended (all optional / nullable) ----
  // Détail Client
  civility?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  birthDate?: string | null;
  // Adresse
  address?: string | null;
  postalCode?: string | null;
  // Mutuelle Actuelle
  currentMutuelle?: string | null;
  ssn?: string | null;
  adhesionNumber?: string | null;
  principalMember?: string | null;
  previousPremium?: number | null;
  currentExpiryDate?: string | null;
  // Produit Proposé
  product?: string | null;
  productOptions?: string | null;
  complementaryProduct?: string | null;
  complementaryPremium?: number | null;
  complementaryEffectiveDate?: string | null;
  // Conjoint
  spouseCivility?: string | null;
  spouseLastName?: string | null;
  spouseFirstName?: string | null;
  spouseBirthDate?: string | null;
  // Coordonnées Bancaires
  bankHolderLastName?: string | null;
  bankHolderFirstName?: string | null;
  iban?: string | null;
  bic?: string | null;
  debitDate?: string | null;
  debitType?: string | null;
  // Résiliation
  terminationType?: string | null;
  // Régime social
  regime?: string | null;
  // Enfants
  childrenCount?: number | null;
  childrenAges?: string | null;
  // Commentaires
  commercialComment?: string | null;
};

export type AppUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role:
    | "Administrateur"
    | "Manager"
    | "Superviseur"
    | "Agent"
    | "Vendeur"
    | "Qualificateur"
    | "Backoffice"
    | "Présentation";
  team: string;
  active: boolean;
  contractsWon: number;
  leadsHandled: number;
  conversionRate: number;
};

export type CalEvent = {
  id: string;
  title: string;
  date: string; // ISO YYYY-MM-DD
  time: string;
  type: "rdv" | "rappel" | "signature";
  agent: string;
  prospectId?: string | null;
  rdvStatus?: "pending" | "nrp" | "lost" | "won";
};
