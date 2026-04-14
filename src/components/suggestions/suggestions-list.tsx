"use client";

import { FilterableDataTable } from "@/components/shared/filterable-data-table";
import { SuggestionListColumns } from "@/components/suggestions/columns";

const SUGGESTION_STATUS_OPTIONS = [
    { value: "ALL", label: "All Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "UNDER_REVIEW", label: "Under Review" },
];

interface SuggestionsListClientProps {
    suggestions: any[];
}

export function SuggestionsListClient({ suggestions }: SuggestionsListClientProps) {
    return (
        <FilterableDataTable
            columns={SuggestionListColumns}
            data={suggestions}
            emptyMessage="No suggestions pending review."
            filteredEmptyMessage="No suggestions match your filters."
            searchPlaceholder="Search by address, city, or landmark..."
            searchFields={[
                { path: "address" },
                { path: "city.name" },
                { path: "landmark" },
            ]}
            filters={[
                {
                    key: "status",
                    label: "Status",
                    options: SUGGESTION_STATUS_OPTIONS,
                    accessor: (row: any) => row.status,
                },
            ]}
        />
    );
}
