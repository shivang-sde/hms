import { HoldingForm } from "@/components/holdings/holding-form";
import { PageHeader } from "@/components/shared/page-header";
import { getHolding } from "@/actions/holdings";
import { getCities, getHoldingTypes, getHsnCodes } from "@/actions/master-data";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { serializePrisma } from "@/lib/utils";

interface EditHoldingPageProps {
    params: {
        id: string;
    };
}

export default async function EditHoldingPage({ params }: EditHoldingPageProps) {
    const { id } = await params;
    const [rawHolding, rawCities, rawTypes, rawHsnCodes] = await Promise.all([
        getHolding(id),
        getCities(),
        getHoldingTypes(),
        getHsnCodes(),
    ]);

    if (!rawHolding) {
        notFound();
    }

    const holding = serializePrisma(rawHolding);
    const cities = serializePrisma(rawCities);
    const types = serializePrisma(rawTypes);
    const hsnCodes = serializePrisma(rawHsnCodes);

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <PageHeader
                title="Edit Holding"
                description="Update holding details."
                icon={Pencil}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <HoldingForm
                    initialData={holding}
                    cities={cities}
                    types={types}
                    hsnCodes={hsnCodes}
                />
            </div>
        </div>
    );
}
