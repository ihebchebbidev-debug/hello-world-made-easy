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
import { exportCSV, exportJSON, exportXLSX, withCustomFields, toContractExportRows } from "@/lib/exportUtils";
import { useCustomFieldsTable } from "@/lib/useCustomFields";

export const Route = createFileRoute("/contracts/export")({
  head: () => ({
    meta: [
      { title: "Exporter les contrats — Protection ERP" },
      { name: "description", content: "Exportez la liste des contrats au format CSV, Excel ou JSON." },
    ],
  }),
  component: ContractsExportPage,
});

function ContractsExportPage() {
  const navigate = useNavigate();
  const { contracts } = useErp();
  const { user } = useAuth();
  const isAgent = isFieldRole(user?.role);
  const myUsername = user?.username ?? "";
  const scope = isAgent ? contracts.filter((c) => c.assignedTo === myUsername) : contracts;

  const { defs, valuesById } = useCustomFieldsTable("contract");
  const [includeCustom, setIncludeCustom] = useState(true);

  const buildRows = () => {
    const enriched = includeCustom ? withCustomFields(scope, defs, valuesById) : scope;
    return toContractExportRows(enriched as Record<string, unknown>[]);
  };

  const onCSV = () => { exportCSV("contrats.csv", buildRows() as any); toast.success("Export CSV généré"); };
  const onJSON = () => { exportJSON("contrats.json", buildRows()); toast.success("Export JSON généré"); };
  const onXLSX = async () => {
    try { await exportXLSX("contrats.xlsx", buildRows() as any, "Contrats"); toast.success("Export Excel généré"); }
    catch (e: any) { toast.error("Échec Excel", { description: e?.message }); }
  };

  return (
    <AppLayout skeleton="form">
      <PageHeader
        title="Exporter les contrats"
        description={`${scope.length.toLocaleString("fr-FR")} contrat(s) à exporter`}
        icon={<Download className="h-5 w-5" />}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/contracts"><ArrowLeft className="h-4 w-4 mr-1.5" />Retour</Link>
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
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="outline" className="h-auto py-4 justify-start" onClick={onCSV}>
              <FileSpreadsheet className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">CSV</div>
                <div className="text-xs text-muted-foreground">Tableur</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 justify-start" onClick={onXLSX}>
              <FileSpreadsheet className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Excel</div>
                <div className="text-xs text-muted-foreground">.xlsx</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 justify-start" onClick={onJSON}>
              <FileJson className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">JSON</div>
                <div className="text-xs text-muted-foreground">Intégration</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => navigate({ to: "/contracts" })}>Terminer</Button>
        </div>
      </div>
    </AppLayout>
  );
}
