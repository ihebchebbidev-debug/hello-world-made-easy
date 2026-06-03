# Refonte de l'onglet « Vendeurs »

## Problème actuel
L'onglet `Vendeurs` (composant `AgentSalesMatrix`) affiche **tous les contrats** d'un mois, ventilés par compagnie × vendeur. Le client ne veut plus cette vue : il veut suivre **les RDV transformés en vente**, c-à-d les prospects qui sont passés par le statut `RDV` puis ont été vendus.

## Source de vérité retenue
On exploite `extraneterp_activity_log` (déjà rempli) :
- `entity_type = 'prospect'`, `field = 'status'`, `new_value = 'RDV'` → le prospect a été marqué RDV (= « RDV pris »)
- `field = 'status'`, `new_value = 'Vente'` → vente confirmée
- jointure avec `extraneterp_contracts.prospect_id` pour récupérer le contrat (primes, compagnie, date signature)

Le vendeur affiché = `assignedTo` du contrat (celui qui a closé), pas l'agent qui a pris le RDV.

## Backend — nouvel endpoint
`backend/php/rdv_conversion.php` (lecture seule, GET `?ym=YYYY-MM`)

Retourne :
```json
{
  "month": "2026-05",
  "rows": [
    {
      "vendor": "leila",
      "rdv_taken": 42,           // prospects assignés à leila passés par RDV
      "sales_from_rdv": 18,      // de ces RDV, combien ont contract.signature_date dans le mois
      "revenue_from_rdv": 12450.00,
      "by_partner": {            // ventilation des ventes issues de RDV
        "NEOLIANE": { "count": 7, "revenue": 4900 },
        "SPVIE":    { "count": 5, "revenue": 3200 },
        ...
      }
    }
  ],
  "totals": { "rdv_taken": 312, "sales_from_rdv": 121, "revenue_from_rdv": 89400, "by_partner": {...} }
}
```

SQL principal (côté `rdv_conversion.php`) :
```sql
-- Prospects passés par RDV dans le mois (assignés à un vendeur)
WITH rdv_prospects AS (
  SELECT DISTINCT al.entity_id AS prospect_id, p.assigned_to AS vendor
  FROM extraneterp_activity_log al
  JOIN extraneterp_prospects p ON p.id = al.entity_id
  WHERE al.entity_type = 'prospect'
    AND al.field = 'status'
    AND al.new_value = 'RDV'
    AND DATE_FORMAT(al.created_at, '%Y-%m') = :ym
)
SELECT rp.vendor, rp.prospect_id,
       c.id AS contract_id, c.partner, c.premium,
       c.billing_status, c.signature_date
FROM rdv_prospects rp
LEFT JOIN extraneterp_contracts c
  ON c.prospect_id = rp.prospect_id
 AND DATE_FORMAT(c.signature_date, '%Y-%m') = :ym
 AND c.billing_status <> 'Annuler la confirmation';
```
PHP agrège ensuite par `vendor` + `partner`. Index existant sur `activity_log(entity_type, entity_id)` suffit; ajouter au besoin un index `(field, new_value, created_at)`.

## Frontend
1. Nouveau hook `src/lib/useRdvConversion.ts` (TanStack Query, key `['rdv-conversion', ym]`).
2. Nouveau composant `src/components/VendeurConversionMatrix.tsx` qui remplace `AgentSalesMatrix` dans le tab `Vendeurs` :
   - Sélecteur de mois (12 derniers mois) identique
   - Tableau : **lignes = compagnies (NEOLIANE, SPVIE, …) + ligne « Annulé »**, **colonnes = vendeurs**
   - Cellule = `nb ventes (RDV→vente) / CA`
   - 3 lignes supplémentaires fixes en haut : **RDV pris**, **Ventes issues RDV**, **Taux conversion %**
   - Graphique : barres groupées par vendeur — RDV pris vs Ventes RDV, + ligne taux %
3. `AgentsPerformanceSwitch` : remplacer `<AgentSalesMatrix … />` par `<VendeurConversionMatrix … />` dans la branche `vendeurs`.
4. `AgentSalesMatrix.tsx` reste en vie (utilisé nulle part ailleurs) — on le laisse pour rollback rapide, on le supprimera plus tard.

## Migration / index
Fichier `backend/sql/2026_05_19_activity_status_index.sql` :
```sql
CREATE INDEX IF NOT EXISTS idx_activity_status_lookup
  ON extraneterp_activity_log (entity_type, field, new_value, created_at);
```

## Permissions
- Endpoint exige un user connecté ; vendeurs non-privilégiés voient uniquement leur propre ligne (filtre côté PHP via `auth_me`).
- Admin/Manager voient tout, comme aujourd'hui.

## Tests manuels après build
1. Choisir un mois où `leila` a un prospect passé RDV puis vendu → doit apparaître dans `Ventes issues RDV` et compté dans la bonne compagnie.
2. Prospect passé RDV mais pas vendu → compté dans `RDV pris`, pas dans ventes.
3. Contrat sans `prospect_id` (import direct) → exclu du tableau.
4. Contrat annulé (`billing_status = 'Annuler la confirmation'`) → exclu.
5. Vendeur connecté non-admin → ne voit que sa colonne.

## Hors scope (à confirmer si besoin)
- Historique des réassignations (si le prospect a changé de vendeur entre le RDV et la vente, on prend le `assigned_to` actuel du prospect — pas l'historique).
- Affichage côté onglet `Agents` / `Qualificateurs` : inchangé.
