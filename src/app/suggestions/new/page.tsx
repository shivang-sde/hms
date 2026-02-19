import { SuggestionForm } from "@/components/suggestions/suggestion-form";
import { PageHeader } from "@/components/shared/page-header";
import { getCities } from "@/actions/master-data";
import { Lightbulb } from "lucide-react";

export default async function NewSuggestionPage() {
    const cities = await getCities();

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Propose Location"
                description="Suggest a new site or terrace for billboard installation."
                icon={Lightbulb}
            />
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                <SuggestionForm cities={cities} />
            </div>
        </div>
    );
}
