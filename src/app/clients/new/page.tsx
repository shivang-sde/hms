import { ClientForm } from "@/components/clients/client-form";
import { PageHeader } from "@/components/shared/page-header";
import { getCities } from "@/actions/master-data";
import { UserPlus } from "lucide-react";
import { serializePrisma } from "@/lib/utils";

export default async function NewClientPage() {
    const rawCities = await getCities();
    const cities = serializePrisma(rawCities);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Add New Client"
                description="Register a new advertiser or agency."
                icon={UserPlus}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <ClientForm cities={cities} />
            </div>
        </div>
    );
}
