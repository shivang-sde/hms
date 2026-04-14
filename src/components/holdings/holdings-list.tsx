"use client";

import { FilterableDataTable } from "@/components/shared/filterable-data-table";
import { HoldingListColumns } from "@/components/holdings/columns";

const STATUS_OPTIONS = [
    { value: "ALL", label: "All Statuses" },
    { value: "AVAILABLE", label: "Available" },
    { value: "BOOKED", label: "Booked" },
    { value: "UNDER_MAINTENANCE", label: "Under Maintenance" },
    { value: "INACTIVE", label: "Inactive" },
];

interface HoldingsListProps {
    holdings: any[];
}

export function HoldingsList({ holdings }: HoldingsListProps) {
    return (
        <FilterableDataTable
            columns={HoldingListColumns}
            data={holdings}
            emptyMessage="No holdings found."
            filteredEmptyMessage="No holdings match your search criteria."
            searchPlaceholder="Search by code, name, type, or city..."
            searchFields={[
                { path: "code" },
                { path: "name" },
                { path: "holdingType.name" },
                { path: "city.name" },
            ]}
            filters={[
                {
                    key: "status",
                    label: "Status",
                    options: STATUS_OPTIONS,
                    accessor: (row: any) => row.status,
                },
            ]}
        />
    );
}
