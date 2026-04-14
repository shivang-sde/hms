"use client";

import { FilterableDataTable } from "@/components/shared/filterable-data-table";
import { AdvertisementListColumns } from "@/components/advertisements/columns";

const AD_STATUS_OPTIONS = [
    { value: "ALL", label: "All Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "INSTALLED", label: "Installed" },
    { value: "ACTIVE", label: "Active" },
    { value: "REMOVED", label: "Removed" },
    { value: "COMPLETED", label: "Completed" },
];

interface AdvertisementsListClientProps {
    advertisements: any[];
}

export function AdvertisementsListClient({ advertisements }: AdvertisementsListClientProps) {
    return (
        <FilterableDataTable
            columns={AdvertisementListColumns}
            data={advertisements}
            emptyMessage="No advertisements found."
            filteredEmptyMessage="No advertisements match your filters."
            searchPlaceholder="Search by campaign, brand, booking #, or client..."
            searchFields={[
                { path: "campaignName" },
                { path: "brandName" },
                { path: "booking.bookingNumber" },
                { path: "booking.client.name" },
                { path: "booking.holding.code" },
            ]}
            filters={[
                {
                    key: "status",
                    label: "Status",
                    options: AD_STATUS_OPTIONS,
                    accessor: (row: any) => row.status,
                },
            ]}
        />
    );
}
