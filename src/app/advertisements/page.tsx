import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { AdvertisementListColumns } from "@/components/advertisements/columns";
import { getAdvertisements } from "@/actions/advertisements";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";
import Link from "next/link";
import { serializePrisma } from "@/lib/utils";

export default async function AdvertisementsPage() {
    const rawAdvertisements = await getAdvertisements();
    const advertisements = serializePrisma(rawAdvertisements);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Advertisements"
                    description="Manage campaigns, artwork, and creative assets."
                    icon={Megaphone}
                />
                <Button asChild>
                    <Link href="/advertisements/new">
                        <Plus className="mr-2 h-4 w-4" /> New Advertisement
                    </Link>
                </Button>
            </div>
            <div className="bg-card">
                <DataTable
                    columns={AdvertisementListColumns}
                    data={advertisements}
                    emptyMessage="No advertisements found."
                />
            </div>
        </div>
    );
}
