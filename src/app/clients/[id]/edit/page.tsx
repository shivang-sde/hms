import { ClientForm } from "@/components/clients/client-form";
import { PageHeader } from "@/components/shared/page-header";
import { getClient } from "@/actions/clients";
import { getCities } from "@/actions/master-data";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { serializePrisma } from "@/lib/utils";

interface EditClientPageProps {
    params: {
        id: string;
    }
}

export default async function EditClientPage({ params }: EditClientPageProps) {
    const { id } = await params;
    const [rawClient, rawCities] = await Promise.all([
        getClient(id),
        getCities(),
    ]);

    if (!rawClient) {
        notFound();
    }

    const client = serializePrisma(rawClient);
    const cities = serializePrisma(rawCities);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Edit Client"
                description="Update client contact or business details."
                icon={Pencil}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <ClientForm
                    initialData={client}
                    cities={cities}
                />
            </div>
        </div>
    );
}
