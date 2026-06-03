import { createFileRoute, Navigate } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusManagerSimple } from "@/components/StatusManagerSimple";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/statuses/contracts")({
  head: () => ({
    meta: [
      { title: "Statuts contrats — Protection ERP" },
      { name: "description", content: "Gérez les statuts de facturation des contrats." },
    ],
  }),
  component: ContractStatusesPage,
});

function ContractStatusesPage() {
  const { user } = useAuth();
  const allowed = !user || user.role === "Administrateur";

  return allowed ? (
    <AppLayout>
      <PageHeader
        icon={<FileText className="h-5 w-5" />}
        title="Statuts contrats"
        description="Ajoutez, renommez ou réorganisez les statuts de facturation. Ils apparaîtront automatiquement dans tous les menus."
      />
      <div className="mt-4 max-w-2xl">
        <StatusManagerSimple entity="contract" />
      </div>
    </AppLayout>
  ) : (
    <Navigate to="/" />
  );
}
