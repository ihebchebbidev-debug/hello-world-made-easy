import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Upload, ShieldAlert } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImportFlow } from "@/components/ImportFlow";
import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";
import { useCustomFieldsTable } from "@/lib/useCustomFields";
import { buildContractImportFields } from "@/lib/importFields";
import { toast } from "sonner";

export const Route = createFileRoute("/contracts/import")({
  head: () => ({
    meta: [
      { title: "Importer des contrats — Protection ERP" },
      { name: "description", content: "Migrez vos contrats signés depuis un CSV ou Excel — mappage assisté." },
    ],
  }),
  component: ContractImportPage,
});

function ContractImportPage() {
  const navigate = useNavigate();
  const { contracts, users, importContracts } = useErp();
  const { user } = useAuth();
  const currency = useCurrency();
  const { defs: customDefs } = useCustomFieldsTable("contract");
  const isAdmin = user?.role === "Administrateur";

  useEffect(() => {
    if (user && !isAdmin) {
      toast.error("Import contrats réservé aux administrateurs");
    }
  }, [user, isAdmin]);

  if (user && !isAdmin) {
    return (
      <AppLayout skeleton="form">
        <PageHeader
          title="Importer des contrats"
          description="Action réservée aux administrateurs."
          icon={<ShieldAlert className="h-5 w-5" />}
          actions={
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/contracts" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour
            </Button>
          }
        />
        <Card className="mt-6 p-8 text-center">
          <ShieldAlert className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <div className="font-medium">Accès refusé</div>
          <p className="text-sm text-muted-foreground mt-1">
            Seul un compte Administrateur peut importer des contrats.
          </p>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout skeleton="form">
      <PageHeader
        title="Importer des contrats"
        description="Mappez les colonnes (y compris vos champs personnalisés) puis validez. Imports massifs envoyés par lots de 500 lignes."
        icon={<Upload className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/contracts" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour
          </Button>
        }
      />
      <div className="mt-6">
        <ImportFlow
          title="Importer des contrats"
          description="CSV ou Excel — mappage automatique sur les colonnes reconnues."
          fields={buildContractImportFields(currency.symbol)}
          customFields={customDefs.map((d) => ({ key: d.key, label: d.label, type: d.type }))}
          templateFileName="modele-contrats.csv"
          existingIds={contracts.map((c) => c.id)}
          existingRecords={contracts.map((c) => ({
            id: c.id,
            label: `${c.lastName} ${c.firstName} — ${c.phone || c.email || c.id}`,
            phone: c.phone ?? undefined,
            email: c.email ?? undefined,
          }))}
          entity="contract"
          batchSize={500}
          knownUsers={users.filter((u) => u.active !== false).map((u) => ({ username: u.username, fullName: u.fullName }))}
          onImport={(rows) => importContracts(rows)}
          onDone={() => navigate({ to: "/contracts" })}
          onCancel={() => navigate({ to: "/contracts" })}
        />
      </div>
    </AppLayout>
  );
}
