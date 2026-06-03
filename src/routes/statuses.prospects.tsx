import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusManagerSimple } from "@/components/StatusManagerSimple";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/statuses/prospects")({
  head: () => ({
    meta: [
      { title: "Statuts prospects — Protection ERP" },
      { name: "description", content: "Gérez les statuts des prospects utilisés dans toute l'application." },
    ],
  }),
  component: ProspectStatusesPage,
});

function ProspectStatusesPage() {
  const { user } = useAuth();
  const allowed = !user || user.role === "Administrateur";

  return allowed ? (
    <AppLayout>
      <PageHeader
        icon={<ClipboardList className="h-5 w-5" />}
        title="Statuts prospects"
        description="Ajoutez, renommez ou réorganisez les statuts. Ils apparaîtront automatiquement dans tous les menus."
      />
      <div className="mt-4 max-w-2xl">
        <StatusManagerSimple entity="prospect" />
      </div>
    </AppLayout>
  ) : (
    <Navigate to="/" />
  );
}
