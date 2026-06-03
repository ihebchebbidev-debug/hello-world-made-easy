import { isFieldRole } from "@/lib/permissions";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Download, FileSpreadsheet, FileJson } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { exportCSV, exportJSON, withCustomFields, toProspectExportRows } from "@/lib/exportUtils";
import { useCustomFieldsTable } from "@/lib/useCustomFields";

export const Route = createFileRoute("/prospects/export")({
  head: () => ({
    meta: [
      { title: "Exporter les prospects — Protection ERP" },
      { name: "description", content: "Exportez la liste des prospects au format CSV ou JSON, avec ou sans champs personnalisés." },
    ],
  }),
  component: ProspectsExportPage,
});

function ProspectsExportPage() {
  const navigate = useNavigate();
  const { prospects } = useErp();
  const { user } = useAuth();
  const isAgent = isFieldRole(user?.role);
  const myUsername = user?.username ?? "";
  const scope = isAgent ? prospects.filter((p) => p.assignedTo === myUsername) : prospects;

  const { defs, valuesById } = useCustomFieldsTable("prospect");
  const [includeCustom, setIncludeCustom] = useState(true);

  const buildRows = () => {
    const enriched = includeCustom ? withCustomFields(scope, defs, valuesById) : scope;
    return toProspectExportRows(enriched as Record<string, unknown>[]);
  };

  const onCSV = () => { exportCSV("prospects.csv", buildRows() as any); toast.success("Export CSV généré"); };
  const onJSON = () => { exportJSON("prospects.json", buildRows()); toast.success("Export JSON généré"); };

  return (
    <AppLayout skeleton="form">
      <PageHeader
        title="Exporter les prospects"
        description={`${scope.length.toLocaleString("fr-FR")} prospect(s) à exporter`}
        icon={<Download className="h-5 w-5" />}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/prospects"><ArrowLeft className="h-4 w-4 mr-1.5" />Retour</Link>
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 max-w-2xl">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Options</CardTitle>
            <CardDescription>Configurez le contenu de votre export.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={includeCustom} onCheckedChange={(v) => setIncludeCustom(!!v)} />
              <span>Inclure les champs personnalisés ({defs.length})</span>
            </label>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Choisir un format</CardTitle>
            <CardDescription>Le téléchargement démarre immédiatement.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 justify-start" onClick={onCSV}>
              <FileSpreadsheet className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">CSV</div>
                <div className="text-xs text-muted-foreground">Tableur (Excel, Numbers, Google Sheets)</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 justify-start" onClick={onJSON}>
              <FileJson className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">JSON</div>
                <div className="text-xs text-muted-foreground">Intégration / sauvegarde</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => navigate({ to: "/prospects" })}>Terminer</Button>
        </div>
      </div>
    </AppLayout>
  );
}
