"use client";

import { FilterableDataTable } from "@/components/shared/filterable-data-table";
import { ClientListColumns } from "@/components/clients/columns";

const CLIENT_STATUS_OPTIONS = [
    { value: "ALL", label: "All Statuses" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
];

interface ClientsListClientProps {
    clients: any[];
}

export function ClientsListClient({ clients }: ClientsListClientProps) {
    return (
        <FilterableDataTable
            columns={ClientListColumns}
            data={clients}
            emptyMessage="No clients found. Add one to get started."
            filteredEmptyMessage="No clients match your filters."
            searchPlaceholder="Search by name, contact person, phone, or city..."
            searchFields={[
                { path: "name" },
                { path: "contactPerson" },
                { path: "phone" },
                { path: "city.name" },
            ]}
            filters={[
                {
                    key: "status",
                    label: "Status",
                    options: CLIENT_STATUS_OPTIONS,
                    accessor: (row: any) => row.isActive ? "ACTIVE" : "INACTIVE",
                },
            ]}
        />
    );
}
