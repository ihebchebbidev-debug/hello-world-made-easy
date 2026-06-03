import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Upload } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ImportFlow } from "@/components/ImportFlow";
import { useErp } from "@/lib/erpStore";
import { useCustomFieldsTable } from "@/lib/useCustomFields";
import { PROSPECT_IMPORT_FIELDS } from "@/lib/importFields";

export const Route = createFileRoute("/prospects/import")({
  head: () => ({
    meta: [
      { title: "Importer des prospects — Protection ERP" },
      { name: "description", content: "Migrez vos leads depuis un CSV ou Excel — mappage assisté, détection des doublons et fusion." },
    ],
  }),
  component: ProspectImportPage,
});

function ProspectImportPage() {
  const navigate = useNavigate();
  const { prospects, users, importProspects } = useErp();
  const { defs: customDefs } = useCustomFieldsTable("prospect");

  return (
    <AppLayout skeleton="form">
      <PageHeader
        title="Importer des prospects"
        description="Mappez les colonnes (y compris vos champs personnalisés) puis validez. Imports massifs envoyés par lots de 500 lignes."
        icon={<Upload className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/prospects" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour
          </Button>
        }
      />
      <div className="mt-6">
        <ImportFlow
          title="Importer des prospects"
          description="CSV ou Excel — mappage automatique sur les colonnes reconnues."
          fields={PROSPECT_IMPORT_FIELDS}
          customFields={customDefs.map((d) => ({ key: d.key, label: d.label, type: d.type }))}
          templateFileName="modele-prospects.csv"
          existingIds={prospects.map((p) => p.id)}
          existingRecords={prospects.map((p) => ({
            id: p.id,
            label: `${p.lastName} ${p.firstName} — ${p.phone || p.mobile || p.email || p.id}`,
            phone: p.phone,
            mobile: p.mobile ?? undefined,
            email: p.email,
          }))}
          dedupeOn={["phone"]}

          entity="prospect"
          batchSize={500}
          knownUsers={users.filter((u) => u.active !== false).map((u) => ({ username: u.username, fullName: u.fullName }))}
          onImport={(rows) => importProspects(rows)}
          onDone={() => navigate({ to: "/prospects" })}
          onCancel={() => navigate({ to: "/prospects" })}
        />
      </div>
    </AppLayout>
  );
}
