import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Upload } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ImportFlow } from "@/components/ImportFlow";
import { useErp } from "@/lib/erpStore";
import { USER_IMPORT_FIELDS } from "@/lib/importFields";

export const Route = createFileRoute("/users/import")({
  head: () => ({
    meta: [
      { title: "Importer des utilisateurs — Protection ERP" },
      { name: "description", content: "Migrez vos comptes utilisateurs depuis un CSV ou Excel." },
    ],
  }),
  component: UserImportPage,
});

function UserImportPage() {
  const navigate = useNavigate();
  const { users, importUsers } = useErp();
  return (
    <AppLayout skeleton="form">
      <PageHeader
        title="Importer des utilisateurs"
        description="Mappez les colonnes puis validez."
        icon={<Upload className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/users" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour
          </Button>
        }
      />
      <div className="mt-6">
        <ImportFlow
          title="Importer des utilisateurs"
          description="CSV ou Excel — colonnes reconnues automatiquement."
          fields={USER_IMPORT_FIELDS}
          templateFileName="modele-utilisateurs.csv"
          existingIds={users.map((u) => u.username)}
          idField="username"
          entity="user"
          onImport={(rows) => importUsers(rows)}
          onDone={() => navigate({ to: "/users" })}
          onCancel={() => navigate({ to: "/users" })}
        />
      </div>
    </AppLayout>
  );
}
