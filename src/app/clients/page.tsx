import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ClientListColumns } from "@/components/clients/columns";
import { getClients } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { serializePrisma } from "@/lib/utils";

export default async function ClientsPage() {
    const rawClients = await getClients();
    const clients = serializePrisma(rawClients);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Clients"
                    description="Manage your advertisers and agencies."
                    icon={Users}
                />
                <Button asChild>
                    <Link href="/clients/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Client
                    </Link>
                </Button>
            </div>
            <div className="bg-card">
                <DataTable
                    columns={ClientListColumns}
                    data={clients}
                    emptyMessage="No clients found. Add one to get started."
                />
            </div>
        </div>
    );
}
