import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { HoldingListColumns } from "@/components/holdings/columns";
import { getHoldings } from "@/actions/holdings";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import Link from "next/link";
import { serializePrisma } from "@/lib/utils";

export default async function HoldingsPage() {
    const rawHoldings = await getHoldings();
    const holdings = serializePrisma(rawHoldings);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Holdings"
                    description="Manage your billboards, hoardings, and inventory."
                    icon={MapPin}
                />
                <Button asChild>
                    <Link href="/holdings/new">
                        <Plus className="mr-2 h-4 w-4" /> New Holding
                    </Link>
                </Button>
            </div>
            <div className="bg-card">
                <DataTable
                    columns={HoldingListColumns}
                    data={holdings}
                    emptyMessage="No holdings found."
                />
            </div>
        </div>
    );
}
