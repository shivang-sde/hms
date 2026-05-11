"use client";

import { FilterableDataTable } from "@/components/shared/filterable-data-table";
import { HoldingListColumns } from "@/components/holdings/columns";
import { ExportButton } from "@/components/shared/export-button";

const STATUS_OPTIONS = [
    { value: "ALL", label: "All Statuses" },
    { value: "AVAILABLE", label: "Available" },
    { value: "BOOKED", label: "Booked" },
    { value: "UNDER_MAINTENANCE", label: "Under Maintenance" },
    { value: "INACTIVE", label: "Inactive" },
];

interface HoldingsListProps {
    holdings: any[];
    vendors?: any[];
}

export function HoldingsList({ holdings, vendors = [] }: HoldingsListProps) {
    const vendorOptions = [
        { value: "ALL", label: "All Vendors" },
        ...vendors.map((v) => ({ value: v.id, label: v.name })),
    ];

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
                { path: "vendor.name" },
                { path: "assetType" },
                { path: "vendor.vendorType" }
            ]}
            filters={[
                {
                    key: "status",
                    label: "Status",
                    options: STATUS_OPTIONS,
                    accessor: (row: any) => row.status,
                },
                {
                    key: "vendor",
                    label: "Vendor",
                    options: vendorOptions,
                    accessor: (row: any) => row.vendorId,
                },
            ]}
            renderActions={(filteredData) => (
                <ExportButton
                    title="Holdings List"
                    data={filteredData}
                    columns={[
                        { header: "Code", key: "code" },
                        { header: "Name", key: "name" },
                        { header: "Type", key: "holdingType.name" },
                        { header: "City", key: "city.name" },
                        { header: "Vendor", key: "vendor.name" },
                        { header: "Asset Type", key: "assetType" },
                        { header: "Rent", key: "rentAmount", format: "currency" },
                        { header: "Status", key: "status" },
                    ]}
                />
            )}
        />
    );
}
