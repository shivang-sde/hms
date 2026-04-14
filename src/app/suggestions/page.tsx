export const dynamic = 'force-dynamic';
import { apiFetch } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import Link from "next/link";
import { SuggestionsListClient } from "@/components/suggestions/suggestions-list";

export default async function SuggestionsPage() {
    const suggestions = await apiFetch<any[]>("/api/location-suggestions");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Location Suggestions"
                    description="Proposals for new sites, terraces, and opportunities."
                    icon={MapPin}
                />
                <Button asChild>
                    <Link href="/suggestions/new">
                        <Plus className="mr-2 h-4 w-4" /> Propose New Location
                    </Link>
                </Button>
            </div>
            <SuggestionsListClient suggestions={suggestions} />
        </div>
    );
}
