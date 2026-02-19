import { SuggestionForm } from "@/components/suggestions/suggestion-form";
import { PageHeader } from "@/components/shared/page-header";
import { getSuggestion } from "@/actions/suggestions";
import { getCities } from "@/actions/master-data";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { serializePrisma } from "@/lib/utils";

interface EditSuggestionPageProps {
    params: {
        id: string;
    };
}

export default async function EditSuggestionPage({ params }: EditSuggestionPageProps) {
    const { id } = await params;
    const [rawSuggestion, rawCities] = await Promise.all([
        getSuggestion(id),
        getCities(),
    ]);

    if (!rawSuggestion) {
        notFound();
    }

    const suggestion = serializePrisma(rawSuggestion);
    const cities = serializePrisma(rawCities);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Edit Suggestion"
                description="Update location or contact details."
                icon={Pencil}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <SuggestionForm
                    initialData={suggestion}
                    cities={cities}
                />
            </div>
        </div>
    );
}
