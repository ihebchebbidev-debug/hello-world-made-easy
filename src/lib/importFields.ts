// Shared CSV/XLSX import field configurations consumed by both list pages
// (for inline-import flows) and the dedicated import pages.

import type { ImportField } from "@/components/ImportFlow";

export function parseDateLoose(v: unknown): unknown {
  if (v == null) return v;
  const s = String(v).trim();
  if (!s) return s;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy8 = s.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (dmy8) return `${dmy8[3]}-${dmy8[2]}-${dmy8[1]}`;
  const dmy = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
  if (dmy) {
    const y = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
    return `${y}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  return s;
}

const parseInteger = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const n = parseInt(String(v).replace(/[^\d-]/g, ""), 10);
  if (!Number.isFinite(n)) return null;
  // Reject obviously-non-age values (e.g. a packed birthdate "05041940")
  if (n < 0 || n > 130) return null;
  return n;
};

const parseMoney = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(String(v).replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

export const PROSPECT_IMPORT_FIELDS: ImportField[] = [
  { key: "id", label: "Identifiant (Numero)", aliases: ["numero", "numéro", "num", "id", "n", "no", "ref", "reference"], sample: "P-000123" },
  { key: "lastName", label: "Nom", required: true, aliases: ["nom", "lastname", "last name", "name", "famille"], sample: "DUPONT" },
  { key: "firstName", label: "Prénom", required: true, aliases: ["prenom", "prénom", "firstname", "first name"], sample: "Marie" },
  { key: "civility", label: "Civilité (M/Mme)", aliases: ["civilite", "civilité", "civility", "title", "titre"], sample: "Mme" },
  { key: "phone", label: "Téléphone (fixe)", aliases: ["telephone", "téléphone", "tel", "tél", "phone", "fixe", "ligne fixe"], sample: "0147710141" },
  { key: "mobile", label: "Mobile / GSM", aliases: ["gsm", "mobile", "portable", "cellulaire", "tel mobile", "tél mobile", "telmobile"], sample: "0612345678" },
  { key: "email", label: "Email", aliases: ["mail", "courriel", "e-mail", "e mail"], sample: "marie@example.com" },
  { key: "city", label: "Ville", aliases: ["ville", "city", "town", "commune"], sample: "PARIS" },
  { key: "address", label: "Adresse", aliases: ["adresse", "address", "rue", "addr", "voie"], sample: "12 Rue de Paris" },
  { key: "postalCode", label: "Code Postal", aliases: ["codepostal", "code postal", "cp", "postalcode", "zip", "zipcode"], sample: "75001" },
  { key: "source", label: "Source", aliases: ["sourceprospect", "source prospect", "origine", "provenance"], sample: "Web" },
  { key: "status", label: "Statut", aliases: ["statut", "statutappel", "statut appel", "etat", "état"], sample: "RDV" },
  { key: "assignedTo", label: "Assigné à (username)", aliases: ["assigne", "assigné", "assignea", "assigné à", "assigne a", "assignedto", "assigned to", "agent", "commercial", "owner"], sample: "REDISSI.SONIA" },
  { key: "createdAt", label: "Date d'ajout", aliases: ["datedecreation", "date de creation", "date de création", "datecreation", "createdat", "created at", "date", "date ajout", "dateajout"], sample: "2026-04-28", transform: parseDateLoose },
  { key: "comment", label: "Commentaire", aliases: ["commentaire", "comment", "notes", "note", "remarque", "remarques"] },
  { key: "demande", label: "Demande", aliases: ["demande", "request", "besoin", "objet"] },
  { key: "age", label: "Âge", aliases: ["age", "âge", "age client", "ageclient"], sample: "62", transform: parseInteger },
  { key: "spouseAge", label: "Âge conjoint", aliases: ["ageconjoint", "age conjoint", "âge conjoint", "spouseage", "spouse age", "conjoint"], sample: "60", transform: parseInteger },
  { key: "currentMutuelle", label: "Mutuelle actuelle", aliases: ["mutuelle", "mutuelle actuelle", "mutuelleactuelle", "currentmutuelle", "current mutuelle", "complementaire", "complémentaire"], sample: "Harmonie" },
  { key: "cotisation", label: "Cotisation (€)", aliases: ["cotisation", "prime", "premium", "montant", "tarif", "cotisationmensuelle", "cotisation mensuelle"], sample: "89.50", transform: parseMoney },
];

export function buildContractImportFields(currencySymbol: string): ImportField[] {
  return [
    { key: "id", label: "Identifiant (Numero)", aliases: ["numero", "numéro", "num", "id", "n", "no", "ref", "reference"], sample: "C-000123" },
    { key: "lastName", label: "Nom", required: true, aliases: ["nom", "lastname", "last name", "name", "famille"], sample: "DUPONT" },
    { key: "firstName", label: "Prénom", required: true, aliases: ["prenom", "prénom", "firstname", "first name"], sample: "Marie" },
    { key: "civility", label: "Civilité (M/Mme)", aliases: ["civilite", "civilité", "civility", "title", "titre"], sample: "Mme" },
    { key: "phone", label: "Téléphone (fixe)", aliases: ["telephone", "téléphone", "tel", "tél", "phone", "fixe", "ligne fixe"], sample: "0147710141" },
    { key: "mobile", label: "Mobile / GSM", aliases: ["gsm", "mobile", "portable", "cellulaire", "tel mobile", "tél mobile", "telmobile"], sample: "0612345678" },
    { key: "email", label: "Email", aliases: ["mail", "courriel", "e-mail", "e mail", "emailclient", "email_client", "email client"], sample: "marie@example.com" },
    { key: "birthDate", label: "Date de naissance (AAAA-MM-JJ)", aliases: ["datenaissance", "date naissance", "date de naissance", "birthdate", "naissance", "datenaissanceclient", "datenaissance_client"], sample: "1957-01-05", transform: parseDateLoose },
    { key: "address", label: "Adresse", aliases: ["adresse", "address", "rue", "addr", "voie", "adresseclient", "adresse_client"], sample: "12 Rue de Paris" },
    { key: "postalCode", label: "Code Postal", aliases: ["codepostal", "code postal", "cp", "postalcode", "zip", "zipcode", "codepostalclient", "codepostal_client"], sample: "75001" },
    { key: "city", label: "Ville", aliases: ["ville", "city", "town", "commune"], sample: "PARIS" },
    { key: "partner", label: "Partenaire", aliases: ["partenaire", "partner", "compagnie", "assureur"], sample: "NEOLIANE" },
    { key: "cabinet", label: "Cabinet", aliases: ["cabinet", "agence", "bureau"], sample: "Cabinet Paris 1" },
    { key: "premium", label: `Cotisation (${currencySymbol})`, required: true, aliases: ["cotisation", "premium", "prime", "montant", "tarif", "cotisationmensuelle", "cotisation mensuelle"], sample: "950", transform: parseMoney },
    { key: "currentMutuelle", label: "Mutuelle actuelle", aliases: ["mutuelle", "mutuelle actuelle", "mutuelleactuelle", "currentmutuelle", "current mutuelle", "complementaire", "complémentaire", "ancienne mutuelle"], sample: "Harmonie" },
    { key: "ssn", label: "N° Sécurité Sociale", aliases: ["ssn", "secu", "sécu", "numerosecsocial", "numero secu", "numerosecsocial_client", "n secu", "n° secu", "securitesociale"], sample: "257017821001551" },
    { key: "previousPremium", label: `Ancienne cotisation (${currencySymbol})`, aliases: ["anciennecotisation", "ancienne cotisation", "previouspremium", "previous premium", "ancien tarif"], transform: parseMoney },
    { key: "spouseLastName", label: "Nom conjoint", aliases: ["nomconjoint", "nom conjoint", "nom_conjoint_client", "spouselastname"], sample: "DUPONT" },
    { key: "spouseFirstName", label: "Prénom conjoint", aliases: ["prenomconjoint", "prénom conjoint", "prenom_conjoint_client", "spousefirstname"], sample: "Jean" },
    { key: "spouseBirthDate", label: "Date de naissance conjoint", aliases: ["datenaissanceconjoint", "datenaissance_conjoint_client", "spousebirthdate", "naissance conjoint"], sample: "1960-03-12", transform: parseDateLoose },
    { key: "billingStatus", label: "Statut facturation", aliases: ["statutfacturation", "statut facturation", "billing", "facturation"], sample: "Pré-validé" },
    { key: "signatureDate", label: "Date signature (AAAA-MM-JJ)", aliases: ["datesignature", "date signature", "date de signature", "signaturedate", "signature"], sample: "2026-04-28", transform: parseDateLoose },
    { key: "effectiveDate", label: "Date d'effet", aliases: ["dateeffet", "date effet", "date d'effet", "effectivedate", "effet"], sample: "2026-05-01", transform: parseDateLoose },
    { key: "validationDate", label: "Date validation", aliases: ["datevalidation", "date validation", "validationdate"], transform: parseDateLoose },
    { key: "source", label: "Source", aliases: ["source", "origine", "provenance", "sourceprospect", "source_prospect", "source prospect"], sample: "Web" },
    { key: "assignedTo", label: "Assigné à (username)", aliases: ["assigne", "assigné", "assignea", "assigné à", "assigne a", "assignedto", "assigned to", "agent", "commercial", "owner"], sample: "REDISSI.SONIA" },
    { key: "commercialComment", label: "Commentaire commercial", aliases: ["commentaire", "comment", "notes", "commentaires_commercial_client", "commentaires commercial", "commentaire commercial"] },
  ];
}

export const USER_IMPORT_FIELDS: ImportField[] = [
  { key: "username", label: "Nom d'utilisateur", required: true, sample: "marie.dupont" },
  { key: "fullName", label: "Nom complet", required: true, sample: "Marie Dupont" },
  { key: "email", label: "Email", sample: "marie@protection.fr" },
  { key: "role", label: "Rôle (Administrateur/Manager/Agent/Backoffice)", sample: "Agent" },
  { key: "team", label: "Équipe", sample: "Lead-Actifs" },
  { key: "active", label: "Actif (true/false)", sample: "true" },
];
